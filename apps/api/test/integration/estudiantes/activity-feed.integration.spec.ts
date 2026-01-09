/**
 * ============================================================================
 * INTEGRATION TESTS - Activity Feed (Endpoints)
 * ============================================================================
 *
 * Endpoint: GET /api/estudiantes/feed/mi-comision
 *
 * Query params:
 *   limit?: number (default: 10, max: 50)
 *
 * Response (200):
 *   {
 *     data: Array<{
 *       id, tipo, mensaje, xpGanado, metadata, creadoEn,
 *       estudiante: { id, nombre, apellido, avatarUrl },
 *       reacciones: Array<{ emoji, count, estudiantesIds }>,
 *       totalReacciones
 *     }>,
 *     meta: { total, page, limit, totalPages, hasMore }
 *   }
 *
 * Comportamiento:
 * - Solo muestra actividades de compañeros de clase (misma comisión)
 * - EXCLUYE las propias actividades del estudiante
 * - Ordenado por fecha, más recientes primero
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="activity-feed.integration" --runInBand
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/core/database/prisma.service';
import {
  cleanAllTestTables,
  createEstudianteConClaseGrupo,
  createTestTutor,
  createTestEstudiante,
  createTestDocente,
  createTestActividadFeed,
  createTestClaseGrupo,
} from '../../utils/db-cleanup.helper';
import { generateUniqueIP } from '../../utils/auth.helpers';

const FRONTEND_ORIGIN = 'http://localhost:3000';

describe('[INTEGRATION] Activity Feed - Endpoints', () => {
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
  // HELPER: Login estudiante
  // ============================================================================
  async function loginEstudiante(
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
        `Login failed for ${username}: ${response.status} - ${JSON.stringify(response.body)}`,
      );
    }

    const cookies = response.headers['set-cookie'];
    if (!cookies || !Array.isArray(cookies) || cookies.length === 0) {
      throw new Error(`No cookies returned for ${username}`);
    }

    return cookies;
  }

  // ============================================================================
  // HAPPY PATH
  // ============================================================================
  describe('GET /estudiantes/feed/mi-comision - Happy Path', () => {
    it('debe retornar actividades de compañeros de clase', async () => {
      // ARRANGE - Crear dos estudiantes en la misma clase
      const setup1 = await createEstudianteConClaseGrupo(prisma);

      // Crear segundo estudiante en la misma clase
      const { tutor } = await createTestTutor(prisma);
      const { estudiante: estudiante2 } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Inscribir estudiante2 en la misma clase
      await prisma.inscripcionClaseGrupo.create({
        data: {
          estudiante_id: estudiante2.id,
          clase_grupo_id: setup1.claseGrupo.id,
          tutor_id: tutor.id,
          fecha_inscripcion: new Date(),
        },
      });

      // Crear actividad para estudiante2 (el compañero)
      await createTestActividadFeed(prisma, estudiante2.id, {
        tipo: 'LECCION_COMPLETADA',
        mensaje: 'Completó una lección',
        xpGanado: 50,
      });

      const cookies = await loginEstudiante(
        setup1.estudiante.username,
        setup1.estudiantePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/feed/mi-comision')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);

      // Verificar que la actividad es del compañero, no del estudiante logueado
      const actividad = response.body.data[0];
      expect(actividad.estudiante.id).toBe(estudiante2.id);
    });

    it('NO debe incluir actividades propias en el feed', async () => {
      // ARRANGE
      const setup = await createEstudianteConClaseGrupo(prisma);

      // Crear actividad PROPIA del estudiante
      await createTestActividadFeed(prisma, setup.estudiante.id, {
        tipo: 'LECCION_COMPLETADA',
        mensaje: 'Mi propia actividad',
        xpGanado: 50,
      });

      const cookies = await loginEstudiante(
        setup.estudiante.username,
        setup.estudiantePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/feed/mi-comision')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);
      // No debe incluir la actividad propia
      const actividadPropia = response.body.data.find(
        (a: { estudiante: { id: string } }) =>
          a.estudiante.id === setup.estudiante.id,
      );
      expect(actividadPropia).toBeUndefined();
    });

    it('debe ordenar actividades por fecha (más recientes primero)', async () => {
      // ARRANGE
      const setup1 = await createEstudianteConClaseGrupo(prisma);

      // Crear compañero
      const { tutor } = await createTestTutor(prisma);
      const { estudiante: compañero } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      await prisma.inscripcionClaseGrupo.create({
        data: {
          estudiante_id: compañero.id,
          clase_grupo_id: setup1.claseGrupo.id,
          tutor_id: tutor.id,
          fecha_inscripcion: new Date(),
        },
      });

      // Crear actividades con diferentes fechas usando prisma directamente
      const fechaAntigua = new Date('2024-01-01');
      const fechaReciente = new Date('2024-06-01');

      await prisma.actividadFeed.create({
        data: {
          estudiante_id: compañero.id,
          tipo: 'LECCION_COMPLETADA',
          mensaje: 'Actividad antigua',
          xp_ganado: 50,
          creado_en: fechaAntigua,
          metadata: {},
        },
      });

      await prisma.actividadFeed.create({
        data: {
          estudiante_id: compañero.id,
          tipo: 'LOGRO_DESBLOQUEADO',
          mensaje: 'Actividad reciente',
          xp_ganado: 100,
          creado_en: fechaReciente,
          metadata: {},
        },
      });

      const cookies = await loginEstudiante(
        setup1.estudiante.username,
        setup1.estudiantePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/feed/mi-comision')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);

      // La primera debe ser la más reciente
      const primera = new Date(response.body.data[0].creadoEn);
      const segunda = new Date(response.body.data[1].creadoEn);
      expect(primera.getTime()).toBeGreaterThanOrEqual(segunda.getTime());
    });
  });

  // ============================================================================
  // PERMISOS
  // ============================================================================
  describe('GET /estudiantes/feed/mi-comision - Permisos', () => {
    it('debe retornar 401 sin token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/feed/mi-comision')
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(401);
    });

    it('debe retornar 403 con token de docente', async () => {
      // ARRANGE
      const { docente, password } = await createTestDocente(prisma);

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({ email: docente.email, password });

      const cookies = loginResponse.headers['set-cookie'] ?? [];

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/feed/mi-comision')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(403);
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================
  describe('GET /estudiantes/feed/mi-comision - Edge Cases', () => {
    it('debe retornar array vacío si estudiante no tiene comisión/clase', async () => {
      // ARRANGE - Estudiante sin inscripción en ninguna clase
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const cookies = await loginEstudiante(estudiante.username, password);

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/feed/mi-comision')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT - Debe retornar vacío, no error
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it('debe retornar array vacío si comisión no tiene actividades', async () => {
      // ARRANGE
      const setup = await createEstudianteConClaseGrupo(prisma);
      const cookies = await loginEstudiante(
        setup.estudiante.username,
        setup.estudiantePassword,
      );

      // ACT - Sin crear ninguna actividad
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/feed/mi-comision')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it('debe respetar el parámetro limit', async () => {
      // ARRANGE
      const setup1 = await createEstudianteConClaseGrupo(prisma);

      // Crear compañero
      const { tutor } = await createTestTutor(prisma);
      const { estudiante: compañero } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      await prisma.inscripcionClaseGrupo.create({
        data: {
          estudiante_id: compañero.id,
          clase_grupo_id: setup1.claseGrupo.id,
          tutor_id: tutor.id,
          fecha_inscripcion: new Date(),
        },
      });

      // Crear 5 actividades
      for (let i = 0; i < 5; i++) {
        await createTestActividadFeed(prisma, compañero.id, {
          tipo: 'LECCION_COMPLETADA',
          mensaje: `Actividad ${i}`,
          xpGanado: 50,
        });
      }

      const cookies = await loginEstudiante(
        setup1.estudiante.username,
        setup1.estudiantePassword,
      );

      // ACT - Pedir solo 2
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/feed/mi-comision?limit=2')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
    });

    it('NO debe mostrar actividades de estudiantes de OTRA comisión', async () => {
      // ARRANGE - Setup correcto: UN sector, DOS clases, DOS estudiantes
      // Esto representa el caso real donde hay múltiples comisiones

      // 1. Crear infraestructura compartida (sector, docente)
      const setup1 = await createEstudianteConClaseGrupo(prisma);
      // setup1 ya tiene: sector, docente, claseGrupo1, estudiante1

      // 2. Crear SEGUNDA clase en el MISMO sector (reutilizar sector)
      const claseGrupo2 = await createTestClaseGrupo(prisma, {
        docenteId: setup1.docente.id,
        sectorId: setup1.sector.id, // Mismo sector, evita constraint violation
        nombre: 'Clase Grupo 2',
      });

      // 3. Crear estudiante B e inscribirlo en clase 2 (otra comisión)
      const { tutor: tutor2 } = await createTestTutor(prisma);
      const { estudiante: estudianteOtraComision } = await createTestEstudiante(
        prisma,
        { tutorId: tutor2.id },
      );

      await prisma.inscripcionClaseGrupo.create({
        data: {
          estudiante_id: estudianteOtraComision.id,
          clase_grupo_id: claseGrupo2.id,
          tutor_id: tutor2.id,
          fecha_inscripcion: new Date(),
        },
      });

      // 4. Crear actividad para estudiante de OTRA comisión
      await createTestActividadFeed(prisma, estudianteOtraComision.id, {
        tipo: 'LECCION_COMPLETADA',
        mensaje: 'Actividad de otra comisión',
        xpGanado: 50,
      });

      const cookies = await loginEstudiante(
        setup1.estudiante.username,
        setup1.estudiantePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/feed/mi-comision')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT - Estudiante A NO debe ver actividades de estudiante B (otra comisión)
      expect(response.status).toBe(200);
      const actividadOtraComision = response.body.data.find(
        (a: { estudiante: { id: string } }) =>
          a.estudiante.id === estudianteOtraComision.id,
      );
      expect(actividadOtraComision).toBeUndefined();
    });
  });
});
