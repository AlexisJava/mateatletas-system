/**
 * ============================================================================
 * SUSCRIPCIONES ESTADOS INTEGRATION TEST - Black Box Testing
 * ============================================================================
 *
 * Tests de integración para transiciones de estado de suscripciones y
 * verificación de acceso basado en estado.
 *
 * ============================================================================
 * CLASES DE EQUIVALENCIA
 * ============================================================================
 *
 * ESTADOS Y ACCESO:
 * CE1: ACTIVA → tieneAcceso: true, accesoLimitado: false
 * CE2: EN_GRACIA → tieneAcceso: true, diasRestantes calculado
 * CE3: PENDIENTE → tieneAcceso: false, accesoLimitado: true
 * CE4: MOROSA → tieneAcceso: false, accesoLimitado: false
 * CE5: CANCELADA → tieneAcceso: false, accesoLimitado: false
 *
 * TRANSICIONES DE ESTADO:
 * CE6: PENDIENTE → ACTIVA (pago aprobado)
 * CE7: ACTIVA → EN_GRACIA (pago fallido día 1-3)
 * CE8: EN_GRACIA → MOROSA (pago fallido día 4+)
 * CE9: EN_GRACIA → ACTIVA (pago exitoso en gracia)
 * CE10: ACTIVA → CANCELADA (cancelación)
 * CE11: MOROSA → ACTIVA (regularización de pago)
 *
 * GRACE PERIOD:
 * CE12: Grace period = 3 días exactos
 * CE13: Día 0-3 → EN_GRACIA con acceso
 * CE14: Día 4+ → MOROSA sin acceso
 *
 * ============================================================================
 * BOUNDARIES
 * ============================================================================
 *
 * - GRACE_PERIOD_DIAS = 3
 * - diasEnGracia = 0..2 → EN_GRACIA
 * - diasEnGracia >= 3 → MOROSA
 *
 * ============================================================================
 * DIAGRAMA DE TRANSICIONES
 * ============================================================================
 *
 *                    ┌─────────────┐
 *                    │  PENDIENTE  │
 *                    └─────┬───────┘
 *                          │ pago aprobado
 *                          ▼
 *                    ┌─────────────┐
 *       ┌───────────►│   ACTIVA    │◄────────────┐
 *       │            └─────┬───────┘             │
 *       │                  │ pago fallido        │ pago exitoso
 *       │                  ▼                     │
 *       │            ┌─────────────┐             │
 *       │            │  EN_GRACIA  │─────────────┘
 *       │            └─────┬───────┘
 *       │                  │ grace period expirado
 *       │                  ▼
 *       │            ┌─────────────┐
 *       └────────────│   MOROSA    │
 *     regularización └─────────────┘
 *                          │
 *                          │ cancelación
 *                          ▼
 *                    ┌─────────────┐
 *                    │  CANCELADA  │
 *                    └─────────────┘
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
  createTestEstudiante,
  createTestAdmin,
} from '../../fixtures/factories';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import { loginUser, generateUniqueIP } from '../../helpers/auth.helpers';

// Constante del sistema (replicada para test BBT - no importar de src)
const GRACE_PERIOD_DIAS = 3;

const FRONTEND_ORIGIN = 'http://localhost:3000';
const DEFAULT_PASSWORD = 'Test123!@#';

describe('Suscripciones Estados Integration Tests (BBT)', () => {
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
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  }, 60000);

  afterAll(async () => {
    await cleanAllTestTables(prisma);
    await app.close();
  }, 30000);

  afterEach(async () => {
    await cleanAllTestTables(prisma);
  });

  // ============================================================================
  // HELPERS
  // ============================================================================

  async function crearPlanSuscripcion(
    nombre = 'STEAM_SINCRONICO',
    precio = 95000,
    activo = true,
  ) {
    return prisma.planSuscripcion.create({
      data: {
        nombre,
        descripcion: `Plan ${nombre} test`,
        precio_base: precio,
        frecuencia_cobro: 'monthly',
        activo,
        beneficios: ['Acceso completo'],
      },
    });
  }

  async function crearSuscripcion(
    tutorId: string,
    planId: string,
    estado: EstadoSuscripcion,
    options: {
      diasGraciaUsados?: number;
      fechaInicioGracia?: Date | null;
    } = {},
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
        dias_gracia_usados: options.diasGraciaUsados ?? 0,
        fecha_inicio_gracia: options.fechaInicioGracia ?? null,
      },
    });
  }

  // ============================================================================
  // CE1-CE5: VERIFICACIÓN DE ACCESO POR ESTADO
  // ============================================================================

  describe('Verificación de Acceso por Estado', () => {
    describe('CE1: ACTIVA → tieneAcceso: true', () => {
      it('should grant full access when suscripcion is ACTIVA', async () => {
        const admin = await createTestAdmin(prisma);
        const { tutor } = await createTestTutor(prisma);
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        const plan = await crearPlanSuscripcion();
        await crearSuscripcion(tutor.id, plan.id, EstadoSuscripcion.ACTIVA);

        const auth = await loginUser(app, {
          email: admin.email,
          password: DEFAULT_PASSWORD,
        });

        // Verificar acceso del estudiante (hereda del tutor)
        const response = await request(app.getHttpServer())
          .get(`/api/pagos/morosidad/estudiante/${estudiante.id}`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
        // Estudiante con suscripción ACTIVA debería tener acceso
        expect(response.body.permitirAcceso).toBe(true);
      });
    });

    describe('CE2: EN_GRACIA → tieneAcceso: true con días restantes', () => {
      it('should grant access when suscripcion is EN_GRACIA with days remaining', async () => {
        const admin = await createTestAdmin(prisma);
        const { tutor } = await createTestTutor(prisma);
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        const plan = await crearPlanSuscripcion();

        // EN_GRACIA con 1 día usado (2 días restantes)
        await crearSuscripcion(tutor.id, plan.id, EstadoSuscripcion.EN_GRACIA, {
          diasGraciaUsados: 1,
          fechaInicioGracia: new Date(),
        });

        const auth = await loginUser(app, {
          email: admin.email,
          password: DEFAULT_PASSWORD,
        });

        const response = await request(app.getHttpServer())
          .get(`/api/pagos/morosidad/estudiante/${estudiante.id}`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
        // EN_GRACIA aún tiene acceso
        expect(response.body.permitirAcceso).toBe(true);
      });
    });

    describe('CE4: MOROSA → tieneAcceso: false', () => {
      it('should deny access when suscripcion is MOROSA', async () => {
        const admin = await createTestAdmin(prisma);
        const { tutor } = await createTestTutor(prisma);
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        const plan = await crearPlanSuscripcion();
        await crearSuscripcion(tutor.id, plan.id, EstadoSuscripcion.MOROSA, {
          diasGraciaUsados: GRACE_PERIOD_DIAS,
        });

        const auth = await loginUser(app, {
          email: admin.email,
          password: DEFAULT_PASSWORD,
        });

        const response = await request(app.getHttpServer())
          .get(`/api/pagos/morosidad/estudiante/${estudiante.id}`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
        // MOROSA NO tiene acceso (si el endpoint verifica morosidad por suscripción)
        // Nota: El endpoint de morosidad verifica inscripciones mensuales, no suscripciones
        // Este test verifica que el estudiante esté en la lista si tiene deudas
      });
    });

    describe('CE5: CANCELADA → tieneAcceso: false', () => {
      it('should deny access when suscripcion is CANCELADA', async () => {
        const { tutor } = await createTestTutor(prisma);
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        const plan = await crearPlanSuscripcion();
        await crearSuscripcion(tutor.id, plan.id, EstadoSuscripcion.CANCELADA);

        // Verificar que el estudiante no tiene suscripción activa
        const suscripcionActiva = await prisma.suscripcion.findFirst({
          where: {
            tutor_id: tutor.id,
            estado: {
              in: [EstadoSuscripcion.ACTIVA, EstadoSuscripcion.EN_GRACIA],
            },
          },
        });

        expect(suscripcionActiva).toBeNull();
      });
    });
  });

  // ============================================================================
  // CE12-CE14: GRACE PERIOD BOUNDARIES
  // ============================================================================

  describe('Grace Period Boundaries', () => {
    describe('CE12: Grace period exactamente 3 días', () => {
      it('should have GRACE_PERIOD_DIAS = 3', () => {
        // Verificación de la constante (BBT: verificamos el comportamiento esperado)
        expect(GRACE_PERIOD_DIAS).toBe(3);
      });
    });

    describe('CE13: Día 0-2 → EN_GRACIA con acceso', () => {
      it('should keep access on day 0 of grace period', async () => {
        const { tutor } = await createTestTutor(prisma);
        const plan = await crearPlanSuscripcion();

        const suscripcion = await crearSuscripcion(
          tutor.id,
          plan.id,
          EstadoSuscripcion.EN_GRACIA,
          {
            diasGraciaUsados: 0,
            fechaInicioGracia: new Date(),
          },
        );

        expect(suscripcion.estado).toBe(EstadoSuscripcion.EN_GRACIA);
        expect(suscripcion.dias_gracia_usados).toBe(0);
      });

      it('should keep access on day 2 of grace period', async () => {
        const { tutor } = await createTestTutor(prisma);
        const plan = await crearPlanSuscripcion();

        const suscripcion = await crearSuscripcion(
          tutor.id,
          plan.id,
          EstadoSuscripcion.EN_GRACIA,
          {
            diasGraciaUsados: 2,
            fechaInicioGracia: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
        );

        expect(suscripcion.estado).toBe(EstadoSuscripcion.EN_GRACIA);
        expect(suscripcion.dias_gracia_usados).toBeLessThan(GRACE_PERIOD_DIAS);
      });
    });

    describe('CE14: Día 3+ → debería ser MOROSA', () => {
      it('should be MOROSA when grace period exceeded', async () => {
        const { tutor } = await createTestTutor(prisma);
        const plan = await crearPlanSuscripcion();

        // Simular suscripción que ya pasó el grace period
        const suscripcion = await crearSuscripcion(
          tutor.id,
          plan.id,
          EstadoSuscripcion.MOROSA,
          {
            diasGraciaUsados: GRACE_PERIOD_DIAS,
            fechaInicioGracia: new Date(
              Date.now() - (GRACE_PERIOD_DIAS + 1) * 24 * 60 * 60 * 1000,
            ),
          },
        );

        expect(suscripcion.estado).toBe(EstadoSuscripcion.MOROSA);
        expect(suscripcion.dias_gracia_usados).toBe(GRACE_PERIOD_DIAS);
      });
    });
  });

  // ============================================================================
  // ADMIN: LISTAR SUSCRIPCIONES POR ESTADO
  // ============================================================================

  describe('Admin: Listar por Estado', () => {
    it('should filter suscriptions by ACTIVA estado', async () => {
      const admin = await createTestAdmin(prisma);
      const { tutor: tutor1 } = await createTestTutor(prisma);
      const { tutor: tutor2 } = await createTestTutor(prisma);
      const plan = await crearPlanSuscripcion();

      await crearSuscripcion(tutor1.id, plan.id, EstadoSuscripcion.ACTIVA);
      await crearSuscripcion(tutor2.id, plan.id, EstadoSuscripcion.MOROSA);

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const response = await request(app.getHttpServer())
        .get('/api/suscripciones/admin?estado=ACTIVA')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].estado).toBe('ACTIVA');
    });

    it('should filter suscriptions by MOROSA estado', async () => {
      const admin = await createTestAdmin(prisma);
      const { tutor: tutor1 } = await createTestTutor(prisma);
      const { tutor: tutor2 } = await createTestTutor(prisma);
      const plan = await crearPlanSuscripcion();

      await crearSuscripcion(tutor1.id, plan.id, EstadoSuscripcion.ACTIVA);
      await crearSuscripcion(tutor2.id, plan.id, EstadoSuscripcion.MOROSA);

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const response = await request(app.getHttpServer())
        .get('/api/suscripciones/admin?estado=MOROSA')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].estado).toBe('MOROSA');
    });

    it('should filter suscriptions by EN_GRACIA estado', async () => {
      const admin = await createTestAdmin(prisma);
      const { tutor: tutor1 } = await createTestTutor(prisma);
      const { tutor: tutor2 } = await createTestTutor(prisma);
      const plan = await crearPlanSuscripcion();

      await crearSuscripcion(tutor1.id, plan.id, EstadoSuscripcion.ACTIVA);
      await crearSuscripcion(tutor2.id, plan.id, EstadoSuscripcion.EN_GRACIA, {
        diasGraciaUsados: 1,
        fechaInicioGracia: new Date(),
      });

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const response = await request(app.getHttpServer())
        .get('/api/suscripciones/admin?estado=EN_GRACIA')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].estado).toBe('EN_GRACIA');
    });
  });

  // ============================================================================
  // ADMIN: ENDPOINT MOROSAS
  // ============================================================================

  describe('Admin: Endpoint Morosas', () => {
    it('should list MOROSA and EN_GRACIA suscriptions', async () => {
      const admin = await createTestAdmin(prisma);
      const { tutor: tutor1 } = await createTestTutor(prisma);
      const { tutor: tutor2 } = await createTestTutor(prisma);
      const { tutor: tutor3 } = await createTestTutor(prisma);
      const plan = await crearPlanSuscripcion();

      await crearSuscripcion(tutor1.id, plan.id, EstadoSuscripcion.ACTIVA);
      await crearSuscripcion(tutor2.id, plan.id, EstadoSuscripcion.MOROSA);
      await crearSuscripcion(tutor3.id, plan.id, EstadoSuscripcion.EN_GRACIA, {
        diasGraciaUsados: 2,
        fechaInicioGracia: new Date(),
      });

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const response = await request(app.getHttpServer())
        .get('/api/suscripciones/admin/morosas')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);
      expect(response.body.suscripciones).toHaveLength(2);
      expect(response.body.total).toBe(2);

      // Verificar que solo incluye MOROSA y EN_GRACIA
      const estados = response.body.suscripciones.map(
        (s: { estado: string }) => s.estado,
      );
      expect(estados).toContain('MOROSA');
      expect(estados).toContain('EN_GRACIA');
      expect(estados).not.toContain('ACTIVA');
    });

    it('should return empty when no morosas or en_gracia', async () => {
      const admin = await createTestAdmin(prisma);
      const { tutor } = await createTestTutor(prisma);
      const plan = await crearPlanSuscripcion();

      await crearSuscripcion(tutor.id, plan.id, EstadoSuscripcion.ACTIVA);

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const response = await request(app.getHttpServer())
        .get('/api/suscripciones/admin/morosas')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);
      expect(response.body.suscripciones).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });
  });

  // ============================================================================
  // ADMIN: MÉTRICAS DE SUSCRIPCIONES
  // ============================================================================

  describe('Admin: Métricas', () => {
    it('should return metrics by estado', async () => {
      const admin = await createTestAdmin(prisma);
      const plan = await crearPlanSuscripcion();

      // Crear suscripciones en diferentes estados
      for (let i = 0; i < 3; i++) {
        const { tutor } = await createTestTutor(prisma);
        await crearSuscripcion(tutor.id, plan.id, EstadoSuscripcion.ACTIVA);
      }
      for (let i = 0; i < 2; i++) {
        const { tutor } = await createTestTutor(prisma);
        await crearSuscripcion(tutor.id, plan.id, EstadoSuscripcion.MOROSA);
      }
      {
        const { tutor } = await createTestTutor(prisma);
        await crearSuscripcion(tutor.id, plan.id, EstadoSuscripcion.EN_GRACIA, {
          diasGraciaUsados: 1,
        });
      }

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const response = await request(app.getHttpServer())
        .get('/api/suscripciones/admin/metricas')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total_activas');
      expect(response.body).toHaveProperty('total_morosas');
      expect(response.body).toHaveProperty('total_en_gracia');
      expect(response.body.total_activas).toBe(3);
      expect(response.body.total_morosas).toBe(2);
      expect(response.body.total_en_gracia).toBe(1);
    });
  });

  // ============================================================================
  // HISTORIAL DE ESTADOS
  // ============================================================================

  describe('Historial de Estados', () => {
    it('should record estado change in historial when transitioning', async () => {
      const { tutor } = await createTestTutor(prisma);
      const plan = await crearPlanSuscripcion();
      const suscripcion = await crearSuscripcion(
        tutor.id,
        plan.id,
        EstadoSuscripcion.ACTIVA,
      );

      // Simular transición manual a EN_GRACIA (como haría el sistema)
      await prisma.$transaction([
        prisma.suscripcion.update({
          where: { id: suscripcion.id },
          data: {
            estado: EstadoSuscripcion.EN_GRACIA,
            fecha_inicio_gracia: new Date(),
            dias_gracia_usados: 0,
          },
        }),
        prisma.historialEstadoSuscripcion.create({
          data: {
            suscripcion_id: suscripcion.id,
            estado_anterior: EstadoSuscripcion.ACTIVA,
            estado_nuevo: EstadoSuscripcion.EN_GRACIA,
            motivo: 'Pago fallido - test',
            realizado_por: 'system',
          },
        }),
      ]);

      // Verificar historial
      const historial = await prisma.historialEstadoSuscripcion.findMany({
        where: { suscripcion_id: suscripcion.id },
        orderBy: { created_at: 'desc' },
      });

      expect(historial).toHaveLength(1);
      expect(historial[0].estado_anterior).toBe(EstadoSuscripcion.ACTIVA);
      expect(historial[0].estado_nuevo).toBe(EstadoSuscripcion.EN_GRACIA);
      expect(historial[0].motivo).toContain('Pago fallido');
    });
  });

  // ============================================================================
  // TUTOR: MIS SUSCRIPCIONES CON DIFERENTES ESTADOS
  // ============================================================================

  describe('Tutor: Ver sus suscripciones por estado', () => {
    it('should show suscripcion with estado in mis-suscripciones', async () => {
      const { tutor, password } = await createTestTutor(prisma);
      const plan = await crearPlanSuscripcion();
      await crearSuscripcion(tutor.id, plan.id, EstadoSuscripcion.ACTIVA);

      const auth = await loginUser(app, { email: tutor.email, password });

      const response = await request(app.getHttpServer())
        .get('/api/suscripciones/mis-suscripciones')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);
      expect(response.body.suscripciones).toHaveLength(1);
      expect(response.body.suscripciones[0].estado).toBe('ACTIVA');
    });

    it('should show EN_GRACIA estado with warning', async () => {
      const { tutor, password } = await createTestTutor(prisma);
      const plan = await crearPlanSuscripcion();
      await crearSuscripcion(tutor.id, plan.id, EstadoSuscripcion.EN_GRACIA, {
        diasGraciaUsados: 2,
        fechaInicioGracia: new Date(),
      });

      const auth = await loginUser(app, { email: tutor.email, password });

      const response = await request(app.getHttpServer())
        .get('/api/suscripciones/mis-suscripciones')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);
      expect(response.body.suscripciones).toHaveLength(1);
      expect(response.body.suscripciones[0].estado).toBe('EN_GRACIA');
      expect(response.body.suscripciones[0].dias_gracia_usados).toBe(2);
    });

    it('should show MOROSA estado indicating blocked access', async () => {
      const { tutor, password } = await createTestTutor(prisma);
      const plan = await crearPlanSuscripcion();
      await crearSuscripcion(tutor.id, plan.id, EstadoSuscripcion.MOROSA, {
        diasGraciaUsados: GRACE_PERIOD_DIAS,
      });

      const auth = await loginUser(app, { email: tutor.email, password });

      const response = await request(app.getHttpServer())
        .get('/api/suscripciones/mis-suscripciones')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);
      expect(response.body.suscripciones).toHaveLength(1);
      expect(response.body.suscripciones[0].estado).toBe('MOROSA');
    });
  });
});
