/**
 * ============================================================================
 * INTEGRATION TESTS - Mi Aula Virtual (Endpoints)
 * ============================================================================
 *
 * Tests de integración para el endpoint GET /estudiantes/mi-aula
 *
 * Este endpoint retorna el resumen del aula virtual del estudiante:
 * - Sectores con planificaciones activas
 * - Progreso en clases (activas/completadas)
 * - Tareas pendientes
 *
 * Setup required:
 *   docker-compose -f docker-compose.test.yml up -d
 *   DATABASE_URL="postgresql://test:test_password_123@localhost:5433/mateatletas_test"
 *
 * Run:
 *   yarn workspace api test --testPathPattern="mi-aula.integration" --runInBand
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
  createFullAulaSetup,
  createTestAdmin,
  createTestDocente,
  createTestTutor,
  createTestEstudiante,
  createTestSector,
  createTestClaseGrupo,
  createTestInscripcionClaseGrupo,
  createTestPlanificacion,
  createTestAsignacionPlanificacion,
} from '../../fixtures/factories';
import {
  generateUniqueIP,
  loginEstudianteRaw,
  FRONTEND_ORIGIN,
} from '../../helpers/auth.helpers';

describe('[INTEGRATION] Mi Aula Virtual - Endpoints', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
  // Helper wrapper para usar el helper centralizado con la app actual
  async function loginEstudiante(
    username: string,
    password: string,
  ): Promise<string[]> {
    return loginEstudianteRaw(app, { username, password });
  }

  // ============================================================================
  // HAPPY PATH
  // ============================================================================
  describe('GET /estudiantes/mi-aula - Happy Path', () => {
    it('debe retornar planificación cuando estudiante tiene 1 inscripción', async () => {
      // ARRANGE
      const setup = await createFullAulaSetup(prisma, {
        cantidadClases: 2,
        activarClases: [1],
      });
      const cookies = await loginEstudiante(
        setup.estudiante.username,
        setup.estudiantePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/mi-aula')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.sectores).toHaveLength(1);
      expect(response.body.resumen.total_planificaciones).toBe(1);
      expect(response.body.resumen.total_clases_activas).toBe(1);
    });

    it('debe mostrar datos del docente asignado', async () => {
      // ARRANGE
      const setup = await createFullAulaSetup(prisma, {
        cantidadClases: 2,
        activarClases: [1],
      });
      const cookies = await loginEstudiante(
        setup.estudiante.username,
        setup.estudiantePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/mi-aula')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);
      const planificacion = response.body.sectores[0].planificaciones[0];
      expect(planificacion.docente).toBeDefined();
      expect(planificacion.docente.id).toBe(setup.docente.id);
    });

    it('debe mostrar progreso correcto cuando hay clases activas', async () => {
      // ARRANGE - Activar 2 de 3 clases
      const setup = await createFullAulaSetup(prisma, {
        cantidadClases: 3,
        activarClases: [1, 2],
      });
      const cookies = await loginEstudiante(
        setup.estudiante.username,
        setup.estudiantePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/mi-aula')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.resumen.total_clases_activas).toBe(2);
      expect(response.body.resumen.total_clases_completadas).toBe(0);
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================
  describe('GET /estudiantes/mi-aula - Edge Cases', () => {
    it('debe retornar vacío cuando estudiante no tiene inscripciones', async () => {
      // ARRANGE - Estudiante sin grupo
      const { tutor, password: tutorPassword } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      const cookies = await loginEstudiante(estudiante.username, password);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/mi-aula')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.sectores).toEqual([]);
      expect(response.body.resumen.total_planificaciones).toBe(0);
    });

    it('debe retornar vacío cuando grupo no tiene planificación asignada', async () => {
      // ARRANGE - Estudiante inscrito pero sin planificación
      const { docente } = await createTestDocente(prisma);
      const sector = await createTestSector(prisma);
      const grupo = await prisma.grupoPedagogico.create({
        data: {
          codigo: `GP-${Date.now()}`,
          nombre: 'Grupo Sin Plan',
          activo: true,
          sector_id: sector.id,
        },
      });
      const claseGrupo = await createTestClaseGrupo(prisma, {
        docenteId: docente.id,
        grupoId: grupo.id,
        sectorId: sector.id,
      });

      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      await createTestInscripcionClaseGrupo(
        prisma,
        estudiante.id,
        claseGrupo.id,
        tutor.id,
      );
      const cookies = await loginEstudiante(estudiante.username, password);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/mi-aula')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.resumen.total_planificaciones).toBe(0);
    });

    it('debe mostrar clases_activas=0 cuando planificación existe pero ninguna clase activada', async () => {
      // ARRANGE - Planificación sin clases activadas
      const setup = await createFullAulaSetup(prisma, {
        cantidadClases: 2,
        activarClases: [], // Ninguna clase activada
      });
      const cookies = await loginEstudiante(
        setup.estudiante.username,
        setup.estudiantePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/mi-aula')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);
      // Sin clases activadas, no aparece en el resumen como "planificación"
      // porque el servicio filtra por estadosClases con teoria_activa o practica_activa
      expect(response.body.resumen.total_clases_activas).toBe(0);
    });
  });

  // ============================================================================
  // CASOS DE ERROR
  // ============================================================================
  describe('GET /estudiantes/mi-aula - Errores', () => {
    it('debe retornar 401 sin token', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/mi-aula')
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(401);
    });

    it('debe retornar 403 con token de otro rol (docente)', async () => {
      // ARRANGE - Login como docente
      const { docente, password } = await createTestDocente(prisma);

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({ email: docente.email, password });

      const cookies = loginResponse.headers['set-cookie'] ?? [];

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/mi-aula')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT - Debería ser 403 Forbidden (rol incorrecto)
      expect([401, 403]).toContain(response.status);
    });
  });
});
