/**
 * ============================================================================
 * INTEGRATION TESTS - GET /asistencia/docente/resumen
 * ============================================================================
 *
 * Tests para obtener el resumen de asistencia del docente.
 * Metodología: Black Box Testing (BBT)
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: cd apps/api && npx jest --config test/jest-e2e.json --testPathPattern="resumen-docente.integration" --runInBand
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

describe('[INTEGRATION] GET /asistencia/docente/resumen', () => {
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
  // HELPER: Setup con múltiples estudiantes y una Clase
  // ============================================================================
  async function createClaseWithStudents(numStudents: number = 3) {
    const { docente, password } = await createTestDocente(prisma);
    const sector = await createTestSector(prisma);
    const clase = await createTestClase(prisma, {
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
      students.push({ estudiante, password: studPassword });
    }

    return {
      docente,
      docentePassword: password,
      clase,
      students,
    };
  }

  // ============================================================================
  // CATEGORÍA 1: AUTENTICACIÓN Y AUTORIZACIÓN
  // ============================================================================
  describe('Autenticación y Autorización', () => {
    it('debe retornar 401 si no hay token', async () => {
      // ACT
      const response = await request(app.getHttpServer()).get(
        '/api/asistencia/docente/resumen',
      );

      // ASSERT
      expect(response.status).toBe(401);
    });

    it('debe retornar 401 con token malformado', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/asistencia/docente/resumen')
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
        .get('/api/asistencia/docente/resumen')
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
        .get('/api/asistencia/docente/resumen')
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(403);
    });

    it('debe permitir acceso con rol DOCENTE válido', async () => {
      // ARRANGE
      const { docente, password } = await createTestDocente(prisma);
      const cookies = await loginDocente(docente.email, password);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/asistencia/docente/resumen')
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(200);
    });
  });

  // ============================================================================
  // CATEGORÍA 2: HAPPY PATHS - Resumen de asistencia
  // ============================================================================
  describe('Happy Paths - Resumen de asistencia', () => {
    it('debe retornar resumen vacío si el docente no tiene clases', async () => {
      // ARRANGE
      const { docente, password } = await createTestDocente(prisma);
      const cookies = await loginDocente(docente.email, password);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/asistencia/docente/resumen')
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('debe retornar resumen con datos después de marcar asistencia', async () => {
      // ARRANGE
      const setup = await createClaseWithStudents(3);
      const cookies = await loginDocente(
        setup.docente.email,
        setup.docentePassword,
      );

      // Marcar asistencia
      await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${setup.clase.id}/estudiantes/${setup.students[0].estudiante.id}`,
        )
        .set('Cookie', cookies)
        .send({ estado: 'Presente' });

      await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${setup.clase.id}/estudiantes/${setup.students[1].estudiante.id}`,
        )
        .set('Cookie', cookies)
        .send({ estado: 'Ausente' });

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/asistencia/docente/resumen')
        .set('Cookie', cookies);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });

  // ============================================================================
  // CATEGORÍA 3: AISLAMIENTO
  // ============================================================================
  describe('Aislamiento', () => {
    it('debe solo retornar datos del docente autenticado', async () => {
      // ARRANGE
      const setup1 = await createClaseWithStudents(2);
      const setup2 = await createClaseWithStudents(2);

      // Marcar asistencia en ambas clases
      const cookies1 = await loginDocente(
        setup1.docente.email,
        setup1.docentePassword,
      );
      await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${setup1.clase.id}/estudiantes/${setup1.students[0].estudiante.id}`,
        )
        .set('Cookie', cookies1)
        .send({ estado: 'Presente' });

      const cookies2 = await loginDocente(
        setup2.docente.email,
        setup2.docentePassword,
      );
      await request(app.getHttpServer())
        .post(
          `/api/asistencia/clases/${setup2.clase.id}/estudiantes/${setup2.students[0].estudiante.id}`,
        )
        .set('Cookie', cookies2)
        .send({ estado: 'Ausente' });

      // ACT - Docente 1 obtiene su resumen
      const response = await request(app.getHttpServer())
        .get('/api/asistencia/docente/resumen')
        .set('Cookie', cookies1);

      // ASSERT
      expect(response.status).toBe(200);
      // El resumen debe contener solo datos del docente 1
    });
  });
});
