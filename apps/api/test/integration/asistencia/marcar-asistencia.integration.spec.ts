/**
 * ============================================================================
 * INTEGRATION TESTS - POST /asistencia/clases/:claseId/estudiantes/:estudianteId
 * ============================================================================
 *
 * Tests para marcar asistencia individual de un estudiante en una clase.
 * Metodología: Black Box Testing (BBT)
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: cd apps/api && npx jest --config test/jest-e2e.json --testPathPattern="marcar-asistencia.integration" --runInBand
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/core/database/prisma.service';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import {
  createTestDocente,
  createTestTutor,
  createTestEstudiante,
  createTestClase,
  createTestSector,
  createTestInscripcionClase,
} from '../../fixtures/factories';
import { generateUniqueIP, FRONTEND_ORIGIN } from '../../helpers/auth.helpers';

describe('[INTEGRATION] POST /asistencia/clases/:claseId/estudiantes/:estudianteId', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // ============================================================================
  // SETUP
  // ============================================================================
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());

    const expressApp = app
      .getHttpAdapter()
      .getInstance() as express.Application;
    expressApp.set('trust proxy', true);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  }, 60000);

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  }, 30000);

  beforeEach(async () => {
    await cleanAllTestTables(prisma);
  });

  // ============================================================================
  // HELPER: Login docente
  // ============================================================================
  async function loginDocente(
    email: string,
    password: string,
  ): Promise<string[]> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('Origin', FRONTEND_ORIGIN)
      .set('X-Forwarded-For', generateUniqueIP())
      .send({ email, password });

    if (response.status !== 200) {
      throw new Error(
        `Login failed: ${response.status} - ${JSON.stringify(response.body)}`,
      );
    }

    const cookies = response.headers['set-cookie'];
    if (!cookies || !Array.isArray(cookies)) {
      throw new Error('No cookies returned from login');
    }

    return cookies;
  }

  // ============================================================================
  // HELPER: Login tutor
  // ============================================================================
  async function loginTutor(
    email: string,
    password: string,
  ): Promise<string[]> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('Origin', FRONTEND_ORIGIN)
      .set('X-Forwarded-For', generateUniqueIP())
      .send({ email, password });

    if (response.status !== 200) {
      throw new Error(
        `Login failed: ${response.status} - ${JSON.stringify(response.body)}`,
      );
    }

    return response.headers['set-cookie'] as string[];
  }

  // ============================================================================
  // HELPER: Login estudiante
  // ============================================================================
  async function loginEstudianteHelper(
    username: string,
    password: string,
  ): Promise<string[]> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/estudiante/login')
      .set('Origin', FRONTEND_ORIGIN)
      .set('X-Forwarded-For', generateUniqueIP())
      .send({ username, password });

    if (response.status !== 200) {
      throw new Error(
        `Login failed: ${response.status} - ${JSON.stringify(response.body)}`,
      );
    }

    return response.headers['set-cookie'] as string[];
  }

  // ============================================================================
  // HELPER: Setup con docente, clase y estudiante inscrito
  // ============================================================================
  async function createClaseWithStudent(_prisma: PrismaService) {
    const { docente, password: docentePassword } =
      await createTestDocente(_prisma);
    const { tutor } = await createTestTutor(_prisma);
    const { estudiante, password: studentPassword } =
      await createTestEstudiante(_prisma, { tutorId: tutor.id });
    const sector = await createTestSector(_prisma);
    const clase = await createTestClase(_prisma, {
      docenteId: docente.id,
      sectorId: sector.id,
    });

    // Inscribir estudiante en la clase (requerido por asistencia.service)
    await createTestInscripcionClase(
      _prisma,
      estudiante.id,
      clase.id,
      tutor.id,
    );

    return {
      docente,
      docentePassword,
      tutor,
      estudiante,
      studentPassword,
      clase,
    };
  }

  // ============================================================================
  // CATEGORÍA 1: AUTENTICACIÓN Y AUTORIZACIÓN
  // ============================================================================
  describe('Autenticación y Autorización', () => {
    it('debe retornar 401 si no hay token', async () => {
      // ACT
      const response = await request(app.getHttpServer()).post(
        '/api/asistencia/clases/some-id/estudiantes/some-estudiante-id',
      );

      // ASSERT
      expect(response.status).toBe(401);
    });

    it('debe retornar 401 con token malformado', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/asistencia/clases/some-id/estudiantes/some-estudiante-id')
        .set('Cookie', ['auth-token=invalid-token']);

      // ASSERT
      expect(response.status).toBe(401);
    });

    it('debe retornar 403 si el rol es TUTOR', async () => {
      // ARRANGE
      const { tutor, password } = await createTestTutor(prisma);
      const cookies = await loginTutor(tutor.email, password);

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/asistencia/clases/some-id/estudiantes/some-estudiante-id')
        .set('Cookie', cookies)
        .send({ estado: 'Presente' });

      // ASSERT
      expect(response.status).toBe(403);
    });

    it('debe retornar 403 si el rol es ESTUDIANTE', async () => {
      // ARRANGE
      const { estudiante, password } = await createTestEstudiante(prisma);
      const cookies = await loginEstudianteHelper(
        estudiante.username,
        password,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/asistencia/clases/some-id/estudiantes/some-estudiante-id')
        .set('Cookie', cookies)
        .send({ estado: 'Presente' });

      // ASSERT
      expect(response.status).toBe(403);
    });

    it('debe permitir acceso con rol DOCENTE válido', async () => {
      // ARRANGE
      const setup = await createClaseWithStudent(prisma);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${setup.clase.id}/estudiantes/${setup.estudiante.id}`,
        )
        .set('Cookie', cookies)
        .send({ estado: 'Presente' });

      // ASSERT
      // Esperamos 201 (creado) o 200 (actualizado)
      expect([200, 201]).toContain(response.status);
    });
  });

  // ============================================================================
  // CATEGORÍA 2: VALIDACIÓN DE PARÁMETROS (Equivalence Partitioning)
  // ============================================================================
  describe('Validación de Parámetros', () => {
    it('debe retornar 404 si la clase no existe', async () => {
      // ARRANGE
      const { docente, password } = await createTestDocente(prisma);
      const cookies = await loginDocente(docente.email, password);
      const fakeClaseId = '00000000-0000-0000-0000-000000000000';
      const fakeEstudianteId = '00000000-0000-0000-0000-000000000001';

      // ACT
      const response = await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${fakeClaseId}/estudiantes/${fakeEstudianteId}`,
        )
        .set('Cookie', cookies)
        .send({ estado: 'Presente' });

      // ASSERT
      expect(response.status).toBe(404);
    });

    it('debe retornar 404 si el estudiante no existe', async () => {
      // ARRANGE
      const setup = await createClaseWithStudent(prisma);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );
      const fakeEstudianteId = '00000000-0000-0000-0000-000000000000';

      // ACT
      const response = await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${setup.clase.id}/estudiantes/${fakeEstudianteId}`,
        )
        .set('Cookie', cookies)
        .send({ estado: 'Presente' });

      // ASSERT
      expect(response.status).toBe(404);
    });

    it('debe retornar 400 con estado inválido (fuera de clase de equivalencia)', async () => {
      // ARRANGE
      const setup = await createClaseWithStudent(prisma);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${setup.clase.id}/estudiantes/${setup.estudiante.id}`,
        )
        .set('Cookie', cookies)
        .send({ estado: 'ESTADO_INVALIDO' });

      // ASSERT
      expect(response.status).toBe(400);
    });

    it('debe retornar 400 si no se envía estado', async () => {
      // ARRANGE
      const setup = await createClaseWithStudent(prisma);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${setup.clase.id}/estudiantes/${setup.estudiante.id}`,
        )
        .set('Cookie', cookies)
        .send({});

      // ASSERT
      expect(response.status).toBe(400);
    });
  });

  // ============================================================================
  // CATEGORÍA 3: OWNERSHIP Y AISLAMIENTO
  // ============================================================================
  describe('Ownership y Aislamiento', () => {
    it('debe retornar 403 si el docente intenta marcar asistencia en clase de otro docente', async () => {
      // ARRANGE
      const setup = await createClaseWithStudent(prisma);

      // Crear otro docente
      const { docente: otroDocente, password: otroPassword } =
        await createTestDocente(prisma);
      const cookies = await loginDocente(otroDocente.email, otroPassword);

      // ACT
      const response = await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${setup.clase.id}/estudiantes/${setup.estudiante.id}`,
        )
        .set('Cookie', cookies)
        .send({ estado: 'Presente' });

      // ASSERT
      expect(response.status).toBe(403);
    });

    it('debe permitir al docente dueño marcar asistencia', async () => {
      // ARRANGE
      const setup = await createClaseWithStudent(prisma);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${setup.clase.id}/estudiantes/${setup.estudiante.id}`,
        )
        .set('Cookie', cookies)
        .send({ estado: 'Presente' });

      // ASSERT
      expect([200, 201]).toContain(response.status);
    });
  });

  // ============================================================================
  // CATEGORÍA 4: HAPPY PATHS - Estados válidos (Decision Table)
  // ============================================================================
  describe('Happy Paths - Estados válidos', () => {
    it('debe marcar asistencia como PRESENTE correctamente', async () => {
      // ARRANGE
      const setup = await createClaseWithStudent(prisma);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${setup.clase.id}/estudiantes/${setup.estudiante.id}`,
        )
        .set('Cookie', cookies)
        .send({ estado: 'Presente' });

      // ASSERT
      expect([200, 201]).toContain(response.status);
      expect(response.body.estado).toBe('Presente');
    });

    it('debe marcar asistencia como AUSENTE correctamente', async () => {
      // ARRANGE
      const setup = await createClaseWithStudent(prisma);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${setup.clase.id}/estudiantes/${setup.estudiante.id}`,
        )
        .set('Cookie', cookies)
        .send({ estado: 'Ausente' });

      // ASSERT
      expect([200, 201]).toContain(response.status);
      expect(response.body.estado).toBe('Ausente');
    });

    it('debe marcar asistencia como JUSTIFICADO correctamente', async () => {
      // ARRANGE
      const setup = await createClaseWithStudent(prisma);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${setup.clase.id}/estudiantes/${setup.estudiante.id}`,
        )
        .set('Cookie', cookies)
        .send({ estado: 'Justificado' });

      // ASSERT
      expect([200, 201]).toContain(response.status);
      expect(response.body.estado).toBe('Justificado');
    });

    it('debe permitir agregar observaciones opcionales', async () => {
      // ARRANGE
      const setup = await createClaseWithStudent(prisma);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );
      const observacion =
        'El estudiante llegó tarde pero participó activamente';

      // ACT
      const response = await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${setup.clase.id}/estudiantes/${setup.estudiante.id}`,
        )
        .set('Cookie', cookies)
        .send({
          estado: 'Presente',
          observaciones: observacion,
        });

      // ASSERT
      expect([200, 201]).toContain(response.status);
      expect(response.body.estado).toBe('Presente');
      // La observación puede estar en el response o no, dependiendo del diseño
    });
  });

  // ============================================================================
  // CATEGORÍA 5: STATE TRANSITIONS - Cambios de estado
  // ============================================================================
  describe('State Transitions', () => {
    it('debe permitir cambiar de PRESENTE a AUSENTE', async () => {
      // ARRANGE
      const setup = await createClaseWithStudent(prisma);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // Primero marcar como PRESENTE
      await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${setup.clase.id}/estudiantes/${setup.estudiante.id}`,
        )
        .set('Cookie', cookies)
        .send({ estado: 'Presente' });

      // ACT - Cambiar a AUSENTE
      const response = await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${setup.clase.id}/estudiantes/${setup.estudiante.id}`,
        )
        .set('Cookie', cookies)
        .send({ estado: 'Ausente' });

      // ASSERT
      expect([200, 201]).toContain(response.status);
      expect(response.body.estado).toBe('Ausente');
    });

    it('debe permitir cambiar de AUSENTE a JUSTIFICADO', async () => {
      // ARRANGE
      const setup = await createClaseWithStudent(prisma);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // Primero marcar como AUSENTE
      await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${setup.clase.id}/estudiantes/${setup.estudiante.id}`,
        )
        .set('Cookie', cookies)
        .send({ estado: 'Ausente' });

      // ACT - Cambiar a JUSTIFICADO
      const response = await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${setup.clase.id}/estudiantes/${setup.estudiante.id}`,
        )
        .set('Cookie', cookies)
        .send({ estado: 'Justificado' });

      // ASSERT
      expect([200, 201]).toContain(response.status);
      expect(response.body.estado).toBe('Justificado');
    });

    it('debe permitir cambiar de JUSTIFICADO a PRESENTE', async () => {
      // ARRANGE
      const setup = await createClaseWithStudent(prisma);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // Primero marcar como JUSTIFICADO
      await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${setup.clase.id}/estudiantes/${setup.estudiante.id}`,
        )
        .set('Cookie', cookies)
        .send({ estado: 'Justificado' });

      // ACT - Cambiar a PRESENTE
      const response = await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${setup.clase.id}/estudiantes/${setup.estudiante.id}`,
        )
        .set('Cookie', cookies)
        .send({ estado: 'Presente' });

      // ASSERT
      expect([200, 201]).toContain(response.status);
      expect(response.body.estado).toBe('Presente');
    });
  });

  // ============================================================================
  // CATEGORÍA 6: IDEMPOTENCIA
  // ============================================================================
  describe('Idempotencia', () => {
    it('debe ser idempotente - marcar mismo estado dos veces no causa error', async () => {
      // ARRANGE
      const setup = await createClaseWithStudent(prisma);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // Primera marca
      await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${setup.clase.id}/estudiantes/${setup.estudiante.id}`,
        )
        .set('Cookie', cookies)
        .send({ estado: 'Presente' });

      // ACT - Segunda marca con mismo estado
      const response = await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${setup.clase.id}/estudiantes/${setup.estudiante.id}`,
        )
        .set('Cookie', cookies)
        .send({ estado: 'Presente' });

      // ASSERT
      expect([200, 201]).toContain(response.status);
      expect(response.body.estado).toBe('Presente');
    });
  });
});
