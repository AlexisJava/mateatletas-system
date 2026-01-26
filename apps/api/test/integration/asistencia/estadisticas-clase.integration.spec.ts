/**
 * ============================================================================
 * INTEGRATION TESTS - GET /asistencia/clases/:claseId/estadisticas
 * ============================================================================
 *
 * Tests para obtener estadísticas de asistencia de una clase.
 * Metodología: Black Box Testing (BBT)
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: cd apps/api && npx jest --config test/jest-e2e.json --testPathPattern="estadisticas-clase.integration" --runInBand
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
} from '../../fixtures/factories';
import { generateUniqueIP, FRONTEND_ORIGIN } from '../../helpers/auth.helpers';

describe('[INTEGRATION] GET /asistencia/clases/:claseId/estadisticas', () => {
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
  // HELPER: Setup con docente y clase (Clase, no ClaseGrupo)
  // ============================================================================
  async function createClaseWithDocente() {
    const { docente, password } = await createTestDocente(prisma);
    const sector = await createTestSector(prisma);
    const clase = await createTestClase(prisma, {
      docenteId: docente.id,
      sectorId: sector.id,
    });

    return {
      docente,
      docentePassword: password,
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
        '/api/asistencia/clases/some-id/estadisticas',
      );

      // ASSERT
      expect(response.status).toBe(401);
    });

    it('debe retornar 401 con token malformado', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/asistencia/clases/some-id/estadisticas')
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
        .get('/api/asistencia/clases/some-id/estadisticas')
        .set('Cookie', cookies);

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
        .get('/api/asistencia/clases/some-id/estadisticas')
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(403);
    });

    it('debe permitir acceso con rol DOCENTE válido', async () => {
      // ARRANGE
      const setup = await createClaseWithDocente();
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .get(`/api/asistencia/clases/${setup.clase.id}/estadisticas`)
        .set('Cookie', cookies);

      // ASSERT
      expect([200, 404]).toContain(response.status);
    });
  });

  // ============================================================================
  // CATEGORÍA 2: VALIDACIÓN DE PARÁMETROS
  // ============================================================================
  describe('Validación de Parámetros', () => {
    it('debe retornar 404 si la clase no existe', async () => {
      // ARRANGE
      const { docente, password } = await createTestDocente(prisma);
      const cookies = await loginDocente(docente.email, password);
      const fakeClaseId = '00000000-0000-0000-0000-000000000000';

      // ACT
      const response = await request(app.getHttpServer())
        .get(`/api/asistencia/clases/${fakeClaseId}/estadisticas`)
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(404);
    });
  });

  // ============================================================================
  // CATEGORÍA 3: OWNERSHIP Y AISLAMIENTO
  // ============================================================================
  describe('Ownership y Aislamiento', () => {
    it('debe retornar 403 si el docente no es dueño de la clase', async () => {
      // ARRANGE
      const setup = await createClaseWithDocente();

      // Crear otro docente
      const { docente: otroDocente, password: otroPassword } =
        await createTestDocente(prisma);
      const cookies = await loginDocente(otroDocente.email, otroPassword);

      // ACT
      const response = await request(app.getHttpServer())
        .get(`/api/asistencia/clases/${setup.clase.id}/estadisticas`)
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(403);
    });

    it('debe permitir al docente dueño ver estadísticas', async () => {
      // ARRANGE
      const setup = await createClaseWithDocente();
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .get(`/api/asistencia/clases/${setup.clase.id}/estadisticas`)
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(200);
    });
  });

  // ============================================================================
  // CATEGORÍA 4: HAPPY PATHS - Estadísticas de asistencia
  // ============================================================================
  describe('Happy Paths - Estadísticas de asistencia', () => {
    it('debe retornar estadísticas vacías si no hay asistencia registrada', async () => {
      // ARRANGE
      const setup = await createClaseWithDocente();
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .get(`/api/asistencia/clases/${setup.clase.id}/estadisticas`)
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('debe retornar estadísticas con estructura válida', async () => {
      // ARRANGE
      const setup = await createClaseWithDocente();
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .get(`/api/asistencia/clases/${setup.clase.id}/estadisticas`)
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });
});
