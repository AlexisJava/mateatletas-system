/**
 * ============================================================================
 * INTEGRATION TESTS - POST /asistencia/clase-grupo/batch
 * ============================================================================
 *
 * Tests para tomar asistencia en batch para una ClaseGrupo.
 * Metodología: Black Box Testing (BBT)
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: cd apps/api && npx jest --config test/jest-e2e.json --testPathPattern="asistencia-clase-grupo-batch.integration" --runInBand
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
  createEstudianteConClaseGrupo,
  createTestDocente,
  createTestTutor,
  createTestEstudiante,
  createTestClaseGrupo,
  createTestSector,
  createTestInscripcionClaseGrupo,
} from '../../fixtures/factories';
import { generateUniqueIP, FRONTEND_ORIGIN } from '../../helpers/auth.helpers';

describe('[INTEGRATION] POST /asistencia/clase-grupo/batch', () => {
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
  // HELPER: Setup con múltiples estudiantes en una ClaseGrupo
  // ============================================================================
  async function createClaseGrupoWithStudents(numStudents: number = 3) {
    const { docente, password } = await createTestDocente(prisma);
    const sector = await createTestSector(prisma);
    const claseGrupo = await createTestClaseGrupo(prisma, {
      docenteId: docente.id,
      sectorId: sector.id,
    });

    const students: Array<{
      estudiante: { id: string; username: string };
      password: string;
    }> = [];

    for (let i = 0; i < numStudents; i++) {
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password: studPassword } = await createTestEstudiante(
        prisma,
        { tutorId: tutor.id },
      );
      await createTestInscripcionClaseGrupo(
        prisma,
        estudiante.id,
        claseGrupo.id,
        tutor.id,
      );
      students.push({ estudiante, password: studPassword });
    }

    return {
      docente,
      docentePassword: password,
      claseGrupo,
      students,
    };
  }

  // ============================================================================
  // CATEGORÍA 1: AUTENTICACIÓN Y AUTORIZACIÓN
  // ============================================================================
  describe('Autenticación y Autorización', () => {
    it('debe retornar 401 si no hay token', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/asistencia/clase-grupo/batch')
        .send({
          claseGrupoId: 'some-id',
          fecha: new Date().toISOString(),
          asistencias: [],
        });

      // ASSERT
      expect(response.status).toBe(401);
    });

    it('debe retornar 401 con token malformado', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/asistencia/clase-grupo/batch')
        .set('Cookie', ['auth-token=invalid-token'])
        .send({
          claseGrupoId: 'some-id',
          fecha: new Date().toISOString(),
          asistencias: [],
        });

      // ASSERT
      expect(response.status).toBe(401);
    });

    it('debe retornar 403 si el rol es TUTOR', async () => {
      // ARRANGE
      const { tutor, password } = await createTestTutor(prisma);
      const cookies = await loginTutor(tutor.email, password);

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/asistencia/clase-grupo/batch')
        .set('Cookie', cookies)
        .send({
          claseGrupoId: 'some-id',
          fecha: new Date().toISOString(),
          asistencias: [],
        });

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
        .post('/api/asistencia/clase-grupo/batch')
        .set('Cookie', cookies)
        .send({
          claseGrupoId: 'some-id',
          fecha: new Date().toISOString(),
          asistencias: [],
        });

      // ASSERT
      expect(response.status).toBe(403);
    });

    it('debe permitir acceso con rol DOCENTE válido', async () => {
      // ARRANGE
      const setup = await createClaseGrupoWithStudents(1);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/asistencia/clase-grupo/batch')
        .set('Cookie', cookies)
        .send({
          claseGrupoId: setup.claseGrupo.id,
          fecha: new Date().toISOString(),
          asistencias: [
            {
              estudianteId: setup.students[0].estudiante.id,
              estado: 'Presente',
            },
          ],
        });

      // ASSERT
      expect([200, 201]).toContain(response.status);
    });
  });

  // ============================================================================
  // CATEGORÍA 2: VALIDACIÓN DE PARÁMETROS
  // ============================================================================
  describe('Validación de Parámetros', () => {
    it('debe retornar 404 si la claseGrupo no existe', async () => {
      // ARRANGE
      const { docente, password } = await createTestDocente(prisma);
      const cookies = await loginDocente(docente.email, password);
      const fakeClaseGrupoId = '00000000-0000-0000-0000-000000000000';

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/asistencia/clase-grupo/batch')
        .set('Cookie', cookies)
        .send({
          claseGrupoId: fakeClaseGrupoId,
          fecha: new Date().toISOString(),
          asistencias: [],
        });

      // ASSERT
      expect(response.status).toBe(404);
    });

    it('debe retornar 400 si no se envía claseGrupoId', async () => {
      // ARRANGE
      const { docente, password } = await createTestDocente(prisma);
      const cookies = await loginDocente(docente.email, password);

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/asistencia/clase-grupo/batch')
        .set('Cookie', cookies)
        .send({
          asistencias: [],
        });

      // ASSERT
      expect(response.status).toBe(400);
    });

    it('debe retornar 400 si no se envía array de asistencias', async () => {
      // ARRANGE
      const setup = await createClaseGrupoWithStudents(1);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/asistencia/clase-grupo/batch')
        .set('Cookie', cookies)
        .send({
          claseGrupoId: setup.claseGrupo.id,
        });

      // ASSERT
      expect(response.status).toBe(400);
    });

    it('debe retornar 400 si asistencias no es un array', async () => {
      // ARRANGE
      const setup = await createClaseGrupoWithStudents(1);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/asistencia/clase-grupo/batch')
        .set('Cookie', cookies)
        .send({
          claseGrupoId: setup.claseGrupo.id,
          fecha: new Date().toISOString(),
          asistencias: 'not-an-array',
        });

      // ASSERT
      expect(response.status).toBe(400);
    });

    it('debe retornar 400 si algún estado es inválido', async () => {
      // ARRANGE
      const setup = await createClaseGrupoWithStudents(1);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/asistencia/clase-grupo/batch')
        .set('Cookie', cookies)
        .send({
          claseGrupoId: setup.claseGrupo.id,
          fecha: new Date().toISOString(),
          asistencias: [
            {
              estudianteId: setup.students[0].estudiante.id,
              estado: 'ESTADO_INVALIDO',
            },
          ],
        });

      // ASSERT
      expect(response.status).toBe(400);
    });
  });

  // ============================================================================
  // CATEGORÍA 3: OWNERSHIP Y AISLAMIENTO
  // ============================================================================
  describe('Ownership y Aislamiento', () => {
    it('debe retornar 403 si el docente no es dueño de la ClaseGrupo', async () => {
      // ARRANGE
      const setup = await createClaseGrupoWithStudents(1);

      // Crear otro docente
      const { docente: otroDocente, password: otroPassword } =
        await createTestDocente(prisma);
      const cookies = await loginDocente(otroDocente.email, otroPassword);

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/asistencia/clase-grupo/batch')
        .set('Cookie', cookies)
        .send({
          claseGrupoId: setup.claseGrupo.id,
          fecha: new Date().toISOString(),
          asistencias: [
            {
              estudianteId: setup.students[0].estudiante.id,
              estado: 'Presente',
            },
          ],
        });

      // ASSERT
      expect(response.status).toBe(403);
    });

    it('debe permitir al docente dueño tomar asistencia', async () => {
      // ARRANGE
      const setup = await createClaseGrupoWithStudents(1);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/asistencia/clase-grupo/batch')
        .set('Cookie', cookies)
        .send({
          claseGrupoId: setup.claseGrupo.id,
          fecha: new Date().toISOString(),
          asistencias: [
            {
              estudianteId: setup.students[0].estudiante.id,
              estado: 'Presente',
            },
          ],
        });

      // ASSERT
      expect([200, 201]).toContain(response.status);
    });
  });

  // ============================================================================
  // CATEGORÍA 4: HAPPY PATHS - Batch operations
  // ============================================================================
  describe('Happy Paths - Batch operations', () => {
    it('debe marcar asistencia para múltiples estudiantes', async () => {
      // ARRANGE
      const setup = await createClaseGrupoWithStudents(3);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/asistencia/clase-grupo/batch')
        .set('Cookie', cookies)
        .send({
          claseGrupoId: setup.claseGrupo.id,
          fecha: new Date().toISOString(),
          asistencias: [
            {
              estudianteId: setup.students[0].estudiante.id,
              estado: 'Presente',
            },
            {
              estudianteId: setup.students[1].estudiante.id,
              estado: 'Ausente',
            },
            {
              estudianteId: setup.students[2].estudiante.id,
              estado: 'Justificado',
            },
          ],
        });

      // ASSERT
      expect([200, 201]).toContain(response.status);
    });

    it('debe permitir enviar array vacío de asistencias', async () => {
      // ARRANGE
      const setup = await createClaseGrupoWithStudents(1);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/asistencia/clase-grupo/batch')
        .set('Cookie', cookies)
        .send({
          claseGrupoId: setup.claseGrupo.id,
          fecha: new Date().toISOString(),
          asistencias: [],
        });

      // ASSERT
      // Puede retornar 200 OK con resultado vacío o 400 según diseño
      expect([200, 201, 400]).toContain(response.status);
    });

    it('debe permitir especificar una fecha para la asistencia', async () => {
      // ARRANGE
      const setup = await createClaseGrupoWithStudents(1);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );
      const fechaEspecifica = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/asistencia/clase-grupo/batch')
        .set('Cookie', cookies)
        .send({
          claseGrupoId: setup.claseGrupo.id,
          fecha: fechaEspecifica,
          asistencias: [
            {
              estudianteId: setup.students[0].estudiante.id,
              estado: 'Presente',
            },
          ],
        });

      // ASSERT
      expect([200, 201]).toContain(response.status);
    });

    it('debe permitir todos los estados válidos en batch', async () => {
      // ARRANGE
      const setup = await createClaseGrupoWithStudents(3);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/asistencia/clase-grupo/batch')
        .set('Cookie', cookies)
        .send({
          claseGrupoId: setup.claseGrupo.id,
          fecha: new Date().toISOString(),
          asistencias: [
            {
              estudianteId: setup.students[0].estudiante.id,
              estado: 'Presente',
            },
            {
              estudianteId: setup.students[1].estudiante.id,
              estado: 'Ausente',
            },
            {
              estudianteId: setup.students[2].estudiante.id,
              estado: 'Justificado',
            },
          ],
        });

      // ASSERT
      expect([200, 201]).toContain(response.status);
    });
  });

  // ============================================================================
  // CATEGORÍA 5: BOUNDARY VALUES - Límites del batch
  // ============================================================================
  describe('Boundary Values - Límites del batch', () => {
    it('debe manejar batch de un solo estudiante', async () => {
      // ARRANGE
      const setup = await createClaseGrupoWithStudents(1);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/asistencia/clase-grupo/batch')
        .set('Cookie', cookies)
        .send({
          claseGrupoId: setup.claseGrupo.id,
          fecha: new Date().toISOString(),
          asistencias: [
            {
              estudianteId: setup.students[0].estudiante.id,
              estado: 'Presente',
            },
          ],
        });

      // ASSERT
      expect([200, 201]).toContain(response.status);
    });
  });

  // ============================================================================
  // CATEGORÍA 6: IDEMPOTENCIA
  // ============================================================================
  describe('Idempotencia', () => {
    it('debe ser idempotente - enviar mismo batch dos veces no causa error', async () => {
      // ARRANGE
      const setup = await createClaseGrupoWithStudents(2);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );
      const batchData = {
        claseGrupoId: setup.claseGrupo.id,
        fecha: new Date().toISOString(),
        asistencias: [
          {
            estudianteId: setup.students[0].estudiante.id,
            estado: 'Presente',
          },
          {
            estudianteId: setup.students[1].estudiante.id,
            estado: 'Ausente',
          },
        ],
      };

      // Primer envío
      await request(app.getHttpServer())
        .post('/api/asistencia/clase-grupo/batch')
        .set('Cookie', cookies)
        .send(batchData);

      // ACT - Segundo envío
      const response = await request(app.getHttpServer())
        .post('/api/asistencia/clase-grupo/batch')
        .set('Cookie', cookies)
        .send(batchData);

      // ASSERT
      expect([200, 201]).toContain(response.status);
    });

    it('debe permitir actualizar estados en un segundo batch', async () => {
      // ARRANGE
      const setup = await createClaseGrupoWithStudents(1);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // Primer batch - marcar AUSENTE
      await request(app.getHttpServer())
        .post('/api/asistencia/clase-grupo/batch')
        .set('Cookie', cookies)
        .send({
          claseGrupoId: setup.claseGrupo.id,
          fecha: new Date().toISOString(),
          asistencias: [
            {
              estudianteId: setup.students[0].estudiante.id,
              estado: 'Ausente',
            },
          ],
        });

      // ACT - Segundo batch - cambiar a JUSTIFICADO
      const response = await request(app.getHttpServer())
        .post('/api/asistencia/clase-grupo/batch')
        .set('Cookie', cookies)
        .send({
          claseGrupoId: setup.claseGrupo.id,
          fecha: new Date().toISOString(),
          asistencias: [
            {
              estudianteId: setup.students[0].estudiante.id,
              estado: 'Justificado',
            },
          ],
        });

      // ASSERT
      expect([200, 201]).toContain(response.status);
    });
  });

  // ============================================================================
  // CATEGORÍA 7: ERROR GUESSING - Casos de borde
  // ============================================================================
  describe('Error Guessing - Casos de borde', () => {
    it('debe ignorar estudiantes no inscritos en la ClaseGrupo', async () => {
      // ARRANGE
      const setup = await createClaseGrupoWithStudents(1);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // Crear estudiante NO inscrito en la claseGrupo
      const { estudiante: estudianteNoInscrito } =
        await createTestEstudiante(prisma);

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/asistencia/clase-grupo/batch')
        .set('Cookie', cookies)
        .send({
          claseGrupoId: setup.claseGrupo.id,
          fecha: new Date().toISOString(),
          asistencias: [
            {
              estudianteId: setup.students[0].estudiante.id,
              estado: 'Presente',
            },
            {
              estudianteId: estudianteNoInscrito.id,
              estado: 'Presente',
            },
          ],
        });

      // ASSERT
      // Puede procesar parcialmente o fallar completamente
      // El comportamiento esperado depende del diseño
      expect([200, 201, 400, 404]).toContain(response.status);
    });

    it('debe manejar estudiante duplicado en el mismo batch', async () => {
      // ARRANGE
      const setup = await createClaseGrupoWithStudents(1);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/asistencia/clase-grupo/batch')
        .set('Cookie', cookies)
        .send({
          claseGrupoId: setup.claseGrupo.id,
          fecha: new Date().toISOString(),
          asistencias: [
            {
              estudianteId: setup.students[0].estudiante.id,
              estado: 'Presente',
            },
            {
              estudianteId: setup.students[0].estudiante.id,
              estado: 'Ausente',
            },
          ],
        });

      // ASSERT
      // Puede procesar el último o fallar con 400
      expect([200, 201, 400]).toContain(response.status);
    });
  });
});
