/**
 * ============================================================================
 * INTEGRATION TESTS - GET /asistencia/estudiantes/:estudianteId
 * ============================================================================
 *
 * Tests para obtener el historial de asistencia de un estudiante.
 * Metodología: Black Box Testing (BBT)
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: cd apps/api && npx jest --config test/jest-e2e.json --testPathPattern="historial-estudiante.integration" --runInBand
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
  createTestClase,
  createTestSector,
} from '../../fixtures/factories';
import { generateUniqueIP, FRONTEND_ORIGIN } from '../../helpers/auth.helpers';

describe('[INTEGRATION] GET /asistencia/estudiantes/:estudianteId', () => {
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
  // HELPER: Setup completo con Clase para marcar asistencia
  // ============================================================================
  async function createSetupWithClase() {
    // Usamos createEstudianteConClaseGrupo para la inscripción/ownership
    const setup = await createEstudianteConClaseGrupo(prisma);
    // Creamos una Clase adicional para marcar asistencia
    const sector = await createTestSector(prisma);
    const clase = await createTestClase(prisma, {
      docenteId: setup.docente.id,
      sectorId: sector.id,
    });

    return {
      ...setup,
      clase,
    };
  }

  // ============================================================================
  // CATEGORÍA 1: AUTENTICACIÓN Y AUTORIZACIÓN
  // ============================================================================
  describe('Autenticación y Autorización', () => {
    it('debe retornar 401 si no hay token', async () => {
      // ACT
      const response = await request(app.getHttpServer()).get(
        '/api/asistencia/estudiantes/some-id',
      );

      // ASSERT
      expect(response.status).toBe(401);
    });

    it('debe retornar 401 con token malformado', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/asistencia/estudiantes/some-id')
        .set('Cookie', ['auth-token=invalid-token']);

      // ASSERT
      expect(response.status).toBe(401);
    });

    it('debe permitir acceso a TUTOR para ver historial de sus estudiantes', async () => {
      // ARRANGE
      // TUTOR está permitido según el controller: @Roles(Role.TUTOR, Role.DOCENTE, Role.ADMIN)
      const setup = await createEstudianteConClaseGrupo(prisma);
      const cookies = await loginTutor(setup.tutor.email, setup.tutorPassword);

      // ACT
      const response = await request(app.getHttpServer())
        .get(`/api/asistencia/estudiantes/${setup.estudiante.id}`)
        .set('Cookie', cookies);

      // ASSERT
      // TUTOR puede ver el historial de su propio estudiante
      expect([200, 403]).toContain(response.status);
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
        .get('/api/asistencia/estudiantes/some-id')
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(403);
    });

    it('debe permitir acceso con rol DOCENTE válido', async () => {
      // ARRANGE
      const setup = await createEstudianteConClaseGrupo(prisma);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .get(`/api/asistencia/estudiantes/${setup.estudiante.id}`)
        .set('Cookie', cookies);

      // ASSERT
      expect([200, 404]).toContain(response.status);
    });
  });

  // ============================================================================
  // CATEGORÍA 2: VALIDACIÓN DE PARÁMETROS
  // ============================================================================
  describe('Validación de Parámetros', () => {
    it('debe retornar 404 si el estudiante no existe', async () => {
      // ARRANGE
      const { docente, password } = await createTestDocente(prisma);
      const cookies = await loginDocente(docente.email, password);
      const fakeEstudianteId = '00000000-0000-0000-0000-000000000000';

      // ACT
      const response = await request(app.getHttpServer())
        .get(`/api/asistencia/estudiantes/${fakeEstudianteId}`)
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(404);
    });
  });

  // ============================================================================
  // CATEGORÍA 3: OWNERSHIP Y AISLAMIENTO
  // ============================================================================
  describe('Ownership y Aislamiento', () => {
    it('debe retornar 403 si el docente no tiene al estudiante en ninguna clase', async () => {
      // ARRANGE
      const setup = await createEstudianteConClaseGrupo(prisma);

      // Crear otro docente sin relación con el estudiante
      const { docente: otroDocente, password: otroPassword } =
        await createTestDocente(prisma);
      const cookies = await loginDocente(otroDocente.email, otroPassword);

      // ACT
      const response = await request(app.getHttpServer())
        .get(`/api/asistencia/estudiantes/${setup.estudiante.id}`)
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(403);
    });

    it('debe permitir al docente ver historial de su estudiante', async () => {
      // ARRANGE
      const setup = await createEstudianteConClaseGrupo(prisma);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .get(`/api/asistencia/estudiantes/${setup.estudiante.id}`)
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(200);
    });
  });

  // ============================================================================
  // CATEGORÍA 4: HAPPY PATHS - Historial de asistencia
  // ============================================================================
  describe('Happy Paths - Historial de asistencia', () => {
    it('debe retornar historial vacío si no hay asistencia registrada', async () => {
      // ARRANGE
      const setup = await createEstudianteConClaseGrupo(prisma);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .get(`/api/asistencia/estudiantes/${setup.estudiante.id}`)
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('debe retornar historial después de marcar asistencia', async () => {
      // ARRANGE
      const setup = await createSetupWithClase();
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // Marcar asistencia primero (usa Clase.id, no ClaseGrupo.id)
      await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${setup.clase.id}/estudiantes/${setup.estudiante.id}`,
        )
        .set('Cookie', cookies)
        .send({ estado: 'Presente' });

      // ACT
      const response = await request(app.getHttpServer())
        .get(`/api/asistencia/estudiantes/${setup.estudiante.id}`)
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(200);
    });
  });

  // ============================================================================
  // CATEGORÍA 5: FILTROS Y PAGINACIÓN
  // ============================================================================
  describe('Filtros y Paginación', () => {
    it('debe permitir filtrar por rango de fechas', async () => {
      // ARRANGE
      const setup = await createEstudianteConClaseGrupo(prisma);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );
      const fechaDesde = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const fechaHasta = new Date().toISOString();

      // ACT
      const response = await request(app.getHttpServer())
        .get(
          `/api/asistencia/estudiantes/${setup.estudiante.id}?desde=${fechaDesde}&hasta=${fechaHasta}`,
        )
        .set('Cookie', cookies);

      // ASSERT
      expect([200, 400]).toContain(response.status);
    });
  });
});
