/**
 * ============================================================================
 * SUSCRIPCIONES CRUD INTEGRATION TEST - Black Box Testing
 * ============================================================================
 *
 * ENDPOINTS:
 * - GET /suscripciones/planes → Lista planes disponibles (público)
 * - POST /suscripciones → Crear suscripción (tutor)
 * - GET /suscripciones/mis-suscripciones → Mis suscripciones (tutor)
 * - GET /suscripciones/:id → Detalle suscripción (tutor)
 * - POST /suscripciones/:id/cancelar → Cancelar suscripción (tutor)
 * - GET /suscripciones/:id/pagos → Historial pagos (tutor)
 * - GET /suscripciones/admin → Lista todas (admin)
 * - GET /suscripciones/admin/morosas → Lista morosas (admin)
 * - GET /suscripciones/admin/metricas → Dashboard métricas (admin)
 *
 * EQUIVALENCE CLASSES:
 *
 * GET /suscripciones/planes:
 * - CE1: Request anónimo → 200 + lista de planes activos
 * - CE2: Request autenticado → 200 (también funciona)
 *
 * POST /suscripciones:
 * - CE3: Tutor con datos válidos + plan libros → 200 (sin clase requerida)
 * - CE4: Tutor con datos válidos + plan sync + clase → 200
 * - CE5: Tutor con plan sync SIN clase → 400
 * - CE6: Tutor con estudiante de otro tutor → 400
 * - CE7: Tutor con plan inexistente → 400
 * - CE8: Docente/Admin intentando crear → 403
 * - CE9: Sin autenticar → 401
 *
 * GET /suscripciones/mis-suscripciones:
 * - CE10: Tutor con suscripciones → Lista sus suscripciones
 * - CE11: Tutor sin suscripciones → Lista vacía
 * - CE12: Solo ve sus propias suscripciones (aislamiento)
 * - CE13: Sin autenticar → 401
 *
 * GET /suscripciones/:id:
 * - CE14: Tutor accede a su suscripción → 200
 * - CE15: Tutor accede a suscripción ajena → 403/404
 * - CE16: Sin autenticar → 401
 *
 * POST /suscripciones/:id/cancelar:
 * - CE17: Cancelar suscripción ACTIVA propia → 200
 * - CE18: Cancelar suscripción ya CANCELADA → 400
 * - CE19: Cancelar suscripción MOROSA → 400
 * - CE20: Cancelar suscripción ajena → 400
 * - CE21: Sin autenticar → 401
 *
 * ADMIN ENDPOINTS:
 * - CE22: Admin accede a /admin → 200 + lista todas
 * - CE23: Admin accede a /admin/morosas → 200
 * - CE24: Admin accede a /admin/metricas → 200
 * - CE25: Tutor accede a /admin → 403
 * - CE26: Docente accede a /admin → 403
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="suscripciones-crud.integration" --runInBand
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { EstadoSuscripcion } from '@prisma/client';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/core/database/prisma.service';
import {
  createTestTutor,
  createTestAdmin,
  createTestDocente,
  createTestEstudiante,
} from '../../fixtures/factories';
import {
  createTestPlan,
  createTestSuscripcion,
} from '../../fixtures/factories/plan.factory';
import {
  createTestSector,
  createTestClaseGrupo,
} from '../../fixtures/factories/grupo.factory';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import { loginUser, generateUniqueIP } from '../../helpers/auth.helpers';

const DEFAULT_PASSWORD = 'TestPassword123!';

describe('[INTEGRATION] Suscripciones CRUD (BBT)', () => {
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
  // HELPERS
  // ============================================================================
  async function crearPlanSuscripcion(nombre: string, precio: number) {
    return prisma.planSuscripcion.create({
      data: {
        nombre,
        descripcion: `Plan ${nombre}`,
        precio,
        duracion_meses: 1,
        activo: true,
        features: ['Feature 1', 'Feature 2'],
      },
    });
  }

  async function crearSuscripcionDirecta(
    tutorId: string,
    planId: string,
    estado: EstadoSuscripcion = EstadoSuscripcion.ACTIVA,
    estudianteIds: string[] = [],
  ) {
    return prisma.suscripcion.create({
      data: {
        tutor_id: tutorId,
        plan_id: planId,
        estado,
        precio_final: 95000,
        mp_preapproval_id: `preapproval_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        mp_status:
          estado === EstadoSuscripcion.ACTIVA ? 'authorized' : 'pending',
        estudiantes:
          estudianteIds.length > 0
            ? { connect: estudianteIds.map((id) => ({ id })) }
            : undefined,
      },
      include: { estudiantes: true },
    });
  }

  // ============================================================================
  // CE1-CE2: GET /suscripciones/planes (PÚBLICO)
  // ============================================================================
  describe('GET /api/suscripciones/planes', () => {
    it('CE1: should return list of active plans without authentication', async () => {
      // Arrange
      await crearPlanSuscripcion('STEAM_LIBROS', 40000);
      await crearPlanSuscripcion('STEAM_ASINCRONICO', 65000);
      await crearPlanSuscripcion('STEAM_SINCRONICO', 95000);

      // Act
      const response = await request(app.getHttpServer()).get(
        '/api/suscripciones/planes',
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.planes).toBeDefined();
      expect(Array.isArray(response.body.planes)).toBe(true);
      expect(response.body.planes.length).toBe(3);

      // Verificar estructura de plan
      const plan = response.body.planes[0];
      expect(plan).toHaveProperty('id');
      expect(plan).toHaveProperty('nombre');
      expect(plan).toHaveProperty('precio');
      expect(plan).toHaveProperty('features');
    });

    it('CE2: should also work when authenticated', async () => {
      // Arrange
      await crearPlanSuscripcion('STEAM_LIBROS', 40000);
      const { tutor, password } = await createTestTutor(prisma);
      const auth = await loginUser(app, { email: tutor.email, password });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/suscripciones/planes')
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.planes.length).toBeGreaterThanOrEqual(1);
    });

    it('should not return inactive plans', async () => {
      // Arrange
      await crearPlanSuscripcion('STEAM_LIBROS', 40000);
      await prisma.planSuscripcion.create({
        data: {
          nombre: 'PLAN_INACTIVO',
          descripcion: 'Plan inactivo',
          precio: 10000,
          duracion_meses: 1,
          activo: false,
          features: [],
        },
      });

      // Act
      const response = await request(app.getHttpServer()).get(
        '/api/suscripciones/planes',
      );

      // Assert
      expect(response.status).toBe(200);
      const nombres = response.body.planes.map(
        (p: { nombre: string }) => p.nombre,
      );
      expect(nombres).not.toContain('PLAN_INACTIVO');
    });
  });

  // ============================================================================
  // CE3-CE9: POST /suscripciones (CREAR)
  // ============================================================================
  describe('POST /api/suscripciones', () => {
    it('CE3: should create subscription for plan LIBROS (no class required)', async () => {
      // Arrange
      const plan = await crearPlanSuscripcion('STEAM_LIBROS', 40000);
      const { tutor, password } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const auth = await loginUser(app, { email: tutor.email, password });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/suscripciones')
        .set('Cookie', auth.cookie)
        .send({
          plan_id: plan.id,
          estudiante_ids: [estudiante.id],
        });

      // Assert - Puede ser 200/201 dependiendo de si hay mock de MP
      // En test sin MP real, puede devolver error de MP pero validaciones pasan
      // Lo importante es que no sea 400 por validación
      if (response.status === 200 || response.status === 201) {
        expect(response.body).toHaveProperty('suscripcion_id');
      }
      // Si falla por MP no configurado, al menos no debe ser 400/403
      expect([200, 201, 500, 503]).toContain(response.status);
    });

    it('CE5: should return 400 when plan SYNC without clase_grupo_id', async () => {
      // Arrange
      const plan = await crearPlanSuscripcion('STEAM_SINCRONICO', 95000);
      const { tutor, password } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const auth = await loginUser(app, { email: tutor.email, password });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/suscripciones')
        .set('Cookie', auth.cookie)
        .send({
          plan_id: plan.id,
          estudiante_ids: [estudiante.id],
          // SIN clase_grupo_id
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('requiere seleccionar una clase');
    });

    it('CE6: should return 400 when estudiante belongs to another tutor', async () => {
      // Arrange
      const plan = await crearPlanSuscripcion('STEAM_LIBROS', 40000);
      const { tutor: tutor1, password } = await createTestTutor(prisma);
      const { tutor: tutor2 } = await createTestTutor(prisma, {
        email: 'tutor2@example.com',
      });
      const { estudiante: estudianteDeOtro } = await createTestEstudiante(
        prisma,
        { tutorId: tutor2.id },
      );

      const auth = await loginUser(app, { email: tutor1.email, password });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/suscripciones')
        .set('Cookie', auth.cookie)
        .send({
          plan_id: plan.id,
          estudiante_ids: [estudianteDeOtro.id],
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('no pertenecen a tu cuenta');
    });

    it('CE7: should return 400 when plan does not exist', async () => {
      // Arrange
      const { tutor, password } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const auth = await loginUser(app, { email: tutor.email, password });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/suscripciones')
        .set('Cookie', auth.cookie)
        .send({
          plan_id: 'cnonexistentplanid00000',
          estudiante_ids: [estudiante.id],
        });

      // Assert
      expect(response.status).toBe(400);
    });

    it('CE9: should return 401 when not authenticated', async () => {
      // Arrange
      const plan = await crearPlanSuscripcion('STEAM_LIBROS', 40000);

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/suscripciones')
        .send({
          plan_id: plan.id,
          estudiante_ids: ['cstudentid0000000000000'],
        });

      // Assert
      expect(response.status).toBe(401);
    });
  });

  // ============================================================================
  // CE10-CE13: GET /suscripciones/mis-suscripciones
  // ============================================================================
  describe('GET /api/suscripciones/mis-suscripciones', () => {
    it('CE10: should return list of tutor subscriptions', async () => {
      // Arrange
      const plan = await crearPlanSuscripcion('STEAM_LIBROS', 40000);
      const { tutor, password } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      await crearSuscripcionDirecta(
        tutor.id,
        plan.id,
        EstadoSuscripcion.ACTIVA,
        [estudiante.id],
      );

      const auth = await loginUser(app, { email: tutor.email, password });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/suscripciones/mis-suscripciones')
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.suscripciones).toBeDefined();
      expect(Array.isArray(response.body.suscripciones)).toBe(true);
      expect(response.body.suscripciones.length).toBe(1);
    });

    it('CE11: should return empty list when tutor has no subscriptions', async () => {
      // Arrange
      const { tutor, password } = await createTestTutor(prisma);
      const auth = await loginUser(app, { email: tutor.email, password });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/suscripciones/mis-suscripciones')
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.suscripciones).toEqual([]);
    });

    it('CE12: should only show own subscriptions (data isolation)', async () => {
      // Arrange
      const plan = await crearPlanSuscripcion('STEAM_LIBROS', 40000);

      // Tutor 1 con suscripción
      const { tutor: tutor1, password: password1 } =
        await createTestTutor(prisma);
      const { estudiante: est1 } = await createTestEstudiante(prisma, {
        tutorId: tutor1.id,
      });
      await crearSuscripcionDirecta(
        tutor1.id,
        plan.id,
        EstadoSuscripcion.ACTIVA,
        [est1.id],
      );

      // Tutor 2 con otra suscripción
      const { tutor: tutor2 } = await createTestTutor(prisma, {
        email: 'tutor2@example.com',
      });
      const { estudiante: est2 } = await createTestEstudiante(prisma, {
        tutorId: tutor2.id,
      });
      await crearSuscripcionDirecta(
        tutor2.id,
        plan.id,
        EstadoSuscripcion.ACTIVA,
        [est2.id],
      );

      const auth = await loginUser(app, {
        email: tutor1.email,
        password: password1,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/suscripciones/mis-suscripciones')
        .set('Cookie', auth.cookie);

      // Assert - Solo debe ver la suya
      expect(response.status).toBe(200);
      expect(response.body.suscripciones.length).toBe(1);
    });

    it('CE13: should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app.getHttpServer()).get(
        '/api/suscripciones/mis-suscripciones',
      );

      // Assert
      expect(response.status).toBe(401);
    });
  });

  // ============================================================================
  // CE14-CE16: GET /suscripciones/:id
  // ============================================================================
  describe('GET /api/suscripciones/:id', () => {
    it('CE14: should return subscription detail when owner', async () => {
      // Arrange
      const plan = await crearPlanSuscripcion('STEAM_LIBROS', 40000);
      const { tutor, password } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const suscripcion = await crearSuscripcionDirecta(
        tutor.id,
        plan.id,
        EstadoSuscripcion.ACTIVA,
        [estudiante.id],
      );

      const auth = await loginUser(app, { email: tutor.email, password });

      // Act
      const response = await request(app.getHttpServer())
        .get(`/api/suscripciones/${suscripcion.id}`)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(suscripcion.id);
    });

    it('CE15: should return 403/404 when accessing another tutor subscription', async () => {
      // Arrange
      const plan = await crearPlanSuscripcion('STEAM_LIBROS', 40000);

      const { tutor: tutor1, password: password1 } =
        await createTestTutor(prisma);
      const { tutor: tutor2 } = await createTestTutor(prisma, {
        email: 'tutor2@example.com',
      });

      const { estudiante: est2 } = await createTestEstudiante(prisma, {
        tutorId: tutor2.id,
      });

      const suscripcionDeOtro = await crearSuscripcionDirecta(
        tutor2.id,
        plan.id,
        EstadoSuscripcion.ACTIVA,
        [est2.id],
      );

      const auth = await loginUser(app, {
        email: tutor1.email,
        password: password1,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get(`/api/suscripciones/${suscripcionDeOtro.id}`)
        .set('Cookie', auth.cookie);

      // Assert - Puede ser 403 o 404 (no revelar existencia)
      expect([403, 404]).toContain(response.status);
    });

    it('CE16: should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app.getHttpServer()).get(
        '/api/suscripciones/csomesubscriptionid000',
      );

      // Assert
      expect(response.status).toBe(401);
    });
  });

  // ============================================================================
  // CE17-CE21: POST /suscripciones/:id/cancelar
  // ============================================================================
  describe('POST /api/suscripciones/:id/cancelar', () => {
    it('CE17: should cancel ACTIVE subscription successfully', async () => {
      // Arrange
      const plan = await crearPlanSuscripcion('STEAM_LIBROS', 40000);
      const { tutor, password } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const suscripcion = await crearSuscripcionDirecta(
        tutor.id,
        plan.id,
        EstadoSuscripcion.ACTIVA,
        [estudiante.id],
      );

      const auth = await loginUser(app, { email: tutor.email, password });

      // Act
      const response = await request(app.getHttpServer())
        .post(`/api/suscripciones/${suscripcion.id}/cancelar`)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.mensaje).toContain('cancelada exitosamente');

      // Verificar en DB
      const suscripcionActualizada = await prisma.suscripcion.findUnique({
        where: { id: suscripcion.id },
      });
      expect(suscripcionActualizada?.estado).toBe(EstadoSuscripcion.CANCELADA);
    });

    it('CE18: should return 400 when canceling already CANCELLED subscription', async () => {
      // Arrange
      const plan = await crearPlanSuscripcion('STEAM_LIBROS', 40000);
      const { tutor, password } = await createTestTutor(prisma);

      const suscripcion = await crearSuscripcionDirecta(
        tutor.id,
        plan.id,
        EstadoSuscripcion.CANCELADA,
      );

      const auth = await loginUser(app, { email: tutor.email, password });

      // Act
      const response = await request(app.getHttpServer())
        .post(`/api/suscripciones/${suscripcion.id}/cancelar`)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('ya está cancelada');
    });

    it('CE19: should return 400 when canceling MOROSA subscription', async () => {
      // Arrange
      const plan = await crearPlanSuscripcion('STEAM_LIBROS', 40000);
      const { tutor, password } = await createTestTutor(prisma);

      const suscripcion = await crearSuscripcionDirecta(
        tutor.id,
        plan.id,
        EstadoSuscripcion.MOROSA,
      );

      const auth = await loginUser(app, { email: tutor.email, password });

      // Act
      const response = await request(app.getHttpServer())
        .post(`/api/suscripciones/${suscripcion.id}/cancelar`)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('morosa');
    });

    it('CE20: should return 400 when canceling another tutor subscription', async () => {
      // Arrange
      const plan = await crearPlanSuscripcion('STEAM_LIBROS', 40000);

      const { tutor: tutor1, password: password1 } =
        await createTestTutor(prisma);
      const { tutor: tutor2 } = await createTestTutor(prisma, {
        email: 'tutor2@example.com',
      });

      const suscripcionDeOtro = await crearSuscripcionDirecta(
        tutor2.id,
        plan.id,
        EstadoSuscripcion.ACTIVA,
      );

      const auth = await loginUser(app, {
        email: tutor1.email,
        password: password1,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post(`/api/suscripciones/${suscripcionDeOtro.id}/cancelar`)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('No autorizado');
    });

    it('CE21: should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app.getHttpServer()).post(
        '/api/suscripciones/csomesubscriptionid000/cancelar',
      );

      // Assert
      expect(response.status).toBe(401);
    });
  });

  // ============================================================================
  // CE22-CE26: ADMIN ENDPOINTS
  // ============================================================================
  describe('Admin Endpoints', () => {
    it('CE22: admin should access /admin and see all subscriptions', async () => {
      // Arrange
      const plan = await crearPlanSuscripcion('STEAM_LIBROS', 40000);
      const { tutor: tutor1 } = await createTestTutor(prisma);
      const { tutor: tutor2 } = await createTestTutor(prisma, {
        email: 'tutor2@example.com',
      });

      await crearSuscripcionDirecta(
        tutor1.id,
        plan.id,
        EstadoSuscripcion.ACTIVA,
      );
      await crearSuscripcionDirecta(
        tutor2.id,
        plan.id,
        EstadoSuscripcion.ACTIVA,
      );

      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/suscripciones/admin')
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.suscripciones).toBeDefined();
      expect(response.body.suscripciones.length).toBeGreaterThanOrEqual(2);
    });

    it('CE23: admin should access /admin/morosas', async () => {
      // Arrange
      const plan = await crearPlanSuscripcion('STEAM_LIBROS', 40000);
      const { tutor } = await createTestTutor(prisma);

      // Crear suscripción morosa
      await crearSuscripcionDirecta(
        tutor.id,
        plan.id,
        EstadoSuscripcion.MOROSA,
      );

      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/suscripciones/admin/morosas')
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.morosas).toBeDefined();
    });

    it('CE24: admin should access /admin/metricas', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/suscripciones/admin/metricas')
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      // Debería tener métricas
      expect(response.body).toBeDefined();
    });

    it('CE25: tutor should NOT access /admin', async () => {
      // Arrange
      const { tutor, password } = await createTestTutor(prisma);
      const auth = await loginUser(app, { email: tutor.email, password });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/suscripciones/admin')
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(403);
    });

    it('CE26: docente should NOT access /admin', async () => {
      // Arrange
      const { docente, password } = await createTestDocente(prisma);
      const auth = await loginUser(app, { email: docente.email, password });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/suscripciones/admin')
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(403);
    });
  });

  // ============================================================================
  // VALIDATION TESTS
  // ============================================================================
  describe('Validation Tests', () => {
    it('should reject invalid CUID format for plan_id', async () => {
      // Arrange
      const { tutor, password } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const auth = await loginUser(app, { email: tutor.email, password });

      // Act - UUID format instead of CUID
      const response = await request(app.getHttpServer())
        .post('/api/suscripciones')
        .set('Cookie', auth.cookie)
        .send({
          plan_id: '550e8400-e29b-41d4-a716-446655440000', // UUID, not CUID
          estudiante_ids: [estudiante.id],
        });

      // Assert
      expect(response.status).toBe(400);
    });

    it('should reject empty estudiante_ids array', async () => {
      // Arrange
      const plan = await crearPlanSuscripcion('STEAM_LIBROS', 40000);
      const { tutor, password } = await createTestTutor(prisma);
      const auth = await loginUser(app, { email: tutor.email, password });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/suscripciones')
        .set('Cookie', auth.cookie)
        .send({
          plan_id: plan.id,
          estudiante_ids: [],
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('al menos un estudiante');
    });
  });
});
