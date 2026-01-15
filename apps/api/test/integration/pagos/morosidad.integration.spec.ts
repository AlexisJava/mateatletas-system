/**
 * ============================================================================
 * MOROSIDAD INTEGRATION TESTS - Tests de Integración BBT
 * ============================================================================
 *
 * Tests Black Box para endpoints de morosidad del módulo de pagos.
 * Estos tests validan el comportamiento desde la perspectiva del usuario,
 * sin conocimiento de la implementación interna.
 *
 * METODOLOGÍA: Black Box Testing (tests como jueces, no cómplices)
 *
 * ============================================================================
 * CLASES DE EQUIVALENCIA
 * ============================================================================
 *
 * GET /pagos/morosidad/tutor/:tutorId
 * -----------------------------------
 * CE1: Tutor SIN deudas → tieneMorosidad: false, totalAdeudado: 0
 * CE2: Tutor CON deudas pendientes NO vencidas → tieneMorosidad: false
 * CE3: Tutor CON deudas VENCIDAS → tieneMorosidad: true, totalAdeudado > 0
 * CE4: Tutor con múltiples estudiantes, algunos morosos → conteo correcto
 * CE5: Tutor inexistente → tieneMorosidad: false (no falla)
 *
 * GET /pagos/morosidad/estudiante/:estudianteId
 * ---------------------------------------------
 * CE6: Estudiante al día → permitirAcceso: true
 * CE7: Estudiante con deuda vencida → permitirAcceso: false, detalles completos
 * CE8: Estudiante con deuda del mes actual (no vencida aún) → permitirAcceso: true
 * CE9: Estudiante inexistente → permitirAcceso: true (no hay deudas)
 *
 * GET /pagos/morosidad/estudiantes (Admin only)
 * ---------------------------------------------
 * CE10: Sistema sin morosos → array vacío
 * CE11: Sistema con morosos → lista con detalles por estudiante
 * CE12: Acceso no-admin → 403 Forbidden
 *
 * ============================================================================
 * BOUNDARIES
 * ============================================================================
 *
 * - Vencimiento = último día del mes del periodo
 * - Hoy = día de vencimiento → NO vencido
 * - Hoy = día después de vencimiento → VENCIDO
 *
 * ============================================================================
 * NOTAS DE IMPLEMENTACIÓN
 * ============================================================================
 *
 * - Periodo formato: "YYYY-MM" (ej: "2026-01")
 * - Fecha vencimiento = último día del mes del periodo (ej: 2026-01-31)
 * - estado_pago: "Pendiente" | "Pagado" | "Vencido" | "Anulado"
 * - La morosidad se detecta cuando: hoy > fecha_vencimiento AND estado_pago = "Pendiente"
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/core/database/prisma.service';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import {
  loginUser,
  FRONTEND_ORIGIN,
  generateUniqueIP,
} from '../../helpers/auth.helpers';
import {
  createTestTutor,
  createTestAdmin,
  createTestEstudiante,
  createTestDocente,
  createTestProducto,
  DEFAULT_PASSWORD,
} from '../../fixtures/factories';
import { EstadoPagoInscripcion } from '@prisma/client';

describe('Morosidad Integration Tests (BBT)', () => {
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
  });

  afterEach(async () => {
    await cleanAllTestTables(prisma);
  });

  // ============================================================================
  // HELPERS
  // ============================================================================

  async function crearProducto() {
    return createTestProducto(prisma);
  }

  async function crearInscripcionMensual(
    estudianteId: string,
    tutorId: string,
    productoId: string,
    periodo: string,
    estadoPago: EstadoPagoInscripcion = EstadoPagoInscripcion.Pendiente,
    precioFinal: number = 15000,
  ) {
    return prisma.inscripcionMensual.create({
      data: {
        estudiante_id: estudianteId,
        tutor_id: tutorId,
        producto_id: productoId,
        periodo,
        estado_pago: estadoPago,
        precio_base: precioFinal,
        precio_final: precioFinal,
        descuento_aplicado: 0,
        tipo_descuento: null,
        notas: 'Test morosidad',
      },
    });
  }

  /**
   * Genera un periodo pasado (vencido) relativo a hoy
   * @param mesesAtras Cantidad de meses hacia atrás
   */
  function periodoVencido(mesesAtras: number = 1): string {
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() - mesesAtras);
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Genera el periodo actual (no vencido aún)
   */
  function periodoActual(): string {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Genera un periodo futuro
   */
  function periodoFuturo(mesesAdelante: number = 1): string {
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() + mesesAdelante);
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  }

  // ============================================================================
  // GET /pagos/morosidad/tutor/:tutorId
  // ============================================================================

  describe('GET /pagos/morosidad/tutor/:tutorId', () => {
    describe('Autenticación', () => {
      it('should return 401 when no token provided', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/pagos/morosidad/tutor/some-id')
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(401);
      });

      it('should allow tutor to see own morosidad', async () => {
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });

        const response = await request(app.getHttpServer())
          .get(`/api/pagos/morosidad/tutor/${tutor.id}`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
      });

      it('should NOT allow tutor to see another tutor morosidad', async () => {
        const { tutor: tutor1, password: password1 } =
          await createTestTutor(prisma);
        const { tutor: tutor2 } = await createTestTutor(prisma);
        const auth = await loginUser(app, {
          email: tutor1.email,
          password: password1,
        });

        const response = await request(app.getHttpServer())
          .get(`/api/pagos/morosidad/tutor/${tutor2.id}`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(404); // NotFoundException
      });

      it('should allow admin to see any tutor morosidad', async () => {
        const admin = await createTestAdmin(prisma);
        const { tutor } = await createTestTutor(prisma);
        const auth = await loginUser(app, {
          email: admin.email,
          password: DEFAULT_PASSWORD,
        });

        const response = await request(app.getHttpServer())
          .get(`/api/pagos/morosidad/tutor/${tutor.id}`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
      });
    });

    describe('CE1: Tutor SIN deudas', () => {
      it('should return tieneMorosidad: false when tutor has no inscriptions', async () => {
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });

        const response = await request(app.getHttpServer())
          .get(`/api/pagos/morosidad/tutor/${tutor.id}`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
        expect(response.body.tieneMorosidad).toBe(false);
        expect(response.body.totalAdeudado).toBe(0);
        expect(response.body.cantidadCuotasVencidas).toBe(0);
      });

      it('should return tieneMorosidad: false when all inscriptions are paid', async () => {
        const { tutor, password } = await createTestTutor(prisma);
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        const producto = await crearProducto();
        const auth = await loginUser(app, { email: tutor.email, password });

        // Crear inscripción PAGADA del mes pasado
        await crearInscripcionMensual(
          estudiante.id,
          tutor.id,
          producto.id,
          periodoVencido(1),
          EstadoPagoInscripcion.Pagado,
        );

        const response = await request(app.getHttpServer())
          .get(`/api/pagos/morosidad/tutor/${tutor.id}`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
        expect(response.body.tieneMorosidad).toBe(false);
        expect(response.body.totalAdeudado).toBe(0);
      });
    });

    describe('CE2: Tutor CON deudas pendientes NO vencidas', () => {
      it('should return tieneMorosidad: false when debt is current month (not due yet)', async () => {
        const { tutor, password } = await createTestTutor(prisma);
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        const producto = await crearProducto();
        const auth = await loginUser(app, { email: tutor.email, password });

        // Crear inscripción PENDIENTE del mes actual (no vencida aún)
        await crearInscripcionMensual(
          estudiante.id,
          tutor.id,
          producto.id,
          periodoActual(),
          EstadoPagoInscripcion.Pendiente,
        );

        const response = await request(app.getHttpServer())
          .get(`/api/pagos/morosidad/tutor/${tutor.id}`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
        expect(response.body.tieneMorosidad).toBe(false);
      });

      it('should return tieneMorosidad: false when debt is future month', async () => {
        const { tutor, password } = await createTestTutor(prisma);
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        const producto = await crearProducto();
        const auth = await loginUser(app, { email: tutor.email, password });

        // Crear inscripción PENDIENTE del mes futuro
        await crearInscripcionMensual(
          estudiante.id,
          tutor.id,
          producto.id,
          periodoFuturo(1),
          EstadoPagoInscripcion.Pendiente,
        );

        const response = await request(app.getHttpServer())
          .get(`/api/pagos/morosidad/tutor/${tutor.id}`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
        expect(response.body.tieneMorosidad).toBe(false);
      });
    });

    describe('CE3: Tutor CON deudas VENCIDAS', () => {
      it('should return tieneMorosidad: true with correct totalAdeudado', async () => {
        const { tutor, password } = await createTestTutor(prisma);
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        const producto = await crearProducto();
        const auth = await loginUser(app, { email: tutor.email, password });

        const monto = 20000;
        // Crear inscripción PENDIENTE del mes pasado (vencida)
        await crearInscripcionMensual(
          estudiante.id,
          tutor.id,
          producto.id,
          periodoVencido(1),
          EstadoPagoInscripcion.Pendiente,
          monto,
        );

        const response = await request(app.getHttpServer())
          .get(`/api/pagos/morosidad/tutor/${tutor.id}`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
        expect(response.body.tieneMorosidad).toBe(true);
        expect(response.body.totalAdeudado).toBe(monto);
        expect(response.body.cantidadCuotasVencidas).toBe(1);
        expect(response.body.estudiantesAfectados).toBe(1);
      });

      it('should sum multiple overdue debts correctly', async () => {
        const { tutor, password } = await createTestTutor(prisma);
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        const producto = await crearProducto();
        const auth = await loginUser(app, { email: tutor.email, password });

        const monto1 = 15000;
        const monto2 = 18000;

        // Dos meses vencidos
        await crearInscripcionMensual(
          estudiante.id,
          tutor.id,
          producto.id,
          periodoVencido(2),
          EstadoPagoInscripcion.Pendiente,
          monto1,
        );
        await crearInscripcionMensual(
          estudiante.id,
          tutor.id,
          producto.id,
          periodoVencido(1),
          EstadoPagoInscripcion.Pendiente,
          monto2,
        );

        const response = await request(app.getHttpServer())
          .get(`/api/pagos/morosidad/tutor/${tutor.id}`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
        expect(response.body.tieneMorosidad).toBe(true);
        expect(response.body.totalAdeudado).toBe(monto1 + monto2);
        expect(response.body.cantidadCuotasVencidas).toBe(2);
      });

      it('should include detalleEstudiantes with correct structure', async () => {
        const { tutor, password } = await createTestTutor(prisma);
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        const producto = await crearProducto();
        const auth = await loginUser(app, { email: tutor.email, password });

        await crearInscripcionMensual(
          estudiante.id,
          tutor.id,
          producto.id,
          periodoVencido(1),
          EstadoPagoInscripcion.Pendiente,
          15000,
        );

        const response = await request(app.getHttpServer())
          .get(`/api/pagos/morosidad/tutor/${tutor.id}`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.detalleEstudiantes)).toBe(true);
        expect(response.body.detalleEstudiantes.length).toBeGreaterThan(0);

        const detalle = response.body.detalleEstudiantes[0];
        expect(detalle).toHaveProperty('estudianteId');
        expect(detalle).toHaveProperty('estudianteNombre');
        expect(detalle).toHaveProperty('periodo');
        expect(detalle).toHaveProperty('monto');
        expect(detalle).toHaveProperty('fechaVencimiento');
        expect(detalle).toHaveProperty('diasVencido');
        expect(detalle.diasVencido).toBeGreaterThan(0);
      });
    });

    describe('CE4: Tutor con múltiples estudiantes', () => {
      it('should count affected students correctly when some are overdue', async () => {
        const { tutor, password } = await createTestTutor(prisma);
        const { estudiante: est1 } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        const { estudiante: est2 } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        const producto = await crearProducto();
        const auth = await loginUser(app, { email: tutor.email, password });

        // Est1: deuda vencida
        await crearInscripcionMensual(
          est1.id,
          tutor.id,
          producto.id,
          periodoVencido(1),
          EstadoPagoInscripcion.Pendiente,
          15000,
        );

        // Est2: pagado
        await crearInscripcionMensual(
          est2.id,
          tutor.id,
          producto.id,
          periodoVencido(1),
          EstadoPagoInscripcion.Pagado,
          15000,
        );

        const response = await request(app.getHttpServer())
          .get(`/api/pagos/morosidad/tutor/${tutor.id}`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
        expect(response.body.estudiantesAfectados).toBe(1);
      });
    });
  });

  // ============================================================================
  // GET /pagos/morosidad/estudiante/:estudianteId
  // ============================================================================

  describe('GET /pagos/morosidad/estudiante/:estudianteId', () => {
    describe('Autenticación', () => {
      it('should return 401 when no token provided', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/pagos/morosidad/estudiante/some-id')
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(401);
      });

      it('should return 403 when docente tries to access', async () => {
        // Según @Roles(Role.ADMIN, Role.TUTOR), docentes NO tienen acceso
        const { docente, password } = await createTestDocente(prisma);
        const { tutor } = await createTestTutor(prisma);
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        const auth = await loginUser(app, { email: docente.email, password });

        const response = await request(app.getHttpServer())
          .get(`/api/pagos/morosidad/estudiante/${estudiante.id}`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        // Docente no está en @Roles(Role.ADMIN, Role.TUTOR)
        expect(response.status).toBe(403);
      });
    });

    describe('CE6: Estudiante al día', () => {
      it('should return permitirAcceso: true when student has no debt', async () => {
        const admin = await createTestAdmin(prisma);
        const { tutor } = await createTestTutor(prisma);
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
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
        expect(response.body.permitirAcceso).toBe(true);
        expect(response.body.mensaje).toContain('al día');
      });

      it('should return permitirAcceso: true when all debt is paid', async () => {
        const admin = await createTestAdmin(prisma);
        const { tutor } = await createTestTutor(prisma);
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        const producto = await crearProducto();
        const auth = await loginUser(app, {
          email: admin.email,
          password: DEFAULT_PASSWORD,
        });

        await crearInscripcionMensual(
          estudiante.id,
          tutor.id,
          producto.id,
          periodoVencido(1),
          EstadoPagoInscripcion.Pagado,
        );

        const response = await request(app.getHttpServer())
          .get(`/api/pagos/morosidad/estudiante/${estudiante.id}`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
        expect(response.body.permitirAcceso).toBe(true);
      });
    });

    describe('CE7: Estudiante con deuda vencida', () => {
      it('should return permitirAcceso: false with details when student has overdue debt', async () => {
        const admin = await createTestAdmin(prisma);
        const { tutor } = await createTestTutor(prisma);
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        const producto = await crearProducto();
        const auth = await loginUser(app, {
          email: admin.email,
          password: DEFAULT_PASSWORD,
        });

        const monto = 25000;
        const periodo = periodoVencido(1);
        await crearInscripcionMensual(
          estudiante.id,
          tutor.id,
          producto.id,
          periodo,
          EstadoPagoInscripcion.Pendiente,
          monto,
        );

        const response = await request(app.getHttpServer())
          .get(`/api/pagos/morosidad/estudiante/${estudiante.id}`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
        expect(response.body.permitirAcceso).toBe(false);
        expect(response.body.mensaje).toContain('bloqueado');
        expect(response.body.detalles).toBeDefined();
        expect(response.body.detalles.cuotasVencidas).toBe(1);
        expect(response.body.detalles.totalAdeudado).toBe(monto);
        expect(response.body.detalles.periodos).toContain(periodo);
      });
    });

    describe('CE8: Estudiante con deuda del mes actual (no vencida)', () => {
      it('should return permitirAcceso: true when debt is current month', async () => {
        const admin = await createTestAdmin(prisma);
        const { tutor } = await createTestTutor(prisma);
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        const producto = await crearProducto();
        const auth = await loginUser(app, {
          email: admin.email,
          password: DEFAULT_PASSWORD,
        });

        // Deuda del mes actual - no está vencida aún
        await crearInscripcionMensual(
          estudiante.id,
          tutor.id,
          producto.id,
          periodoActual(),
          EstadoPagoInscripcion.Pendiente,
        );

        const response = await request(app.getHttpServer())
          .get(`/api/pagos/morosidad/estudiante/${estudiante.id}`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
        expect(response.body.permitirAcceso).toBe(true);
      });
    });
  });

  // ============================================================================
  // GET /pagos/morosidad/estudiantes (Admin only)
  // ============================================================================

  describe('GET /pagos/morosidad/estudiantes', () => {
    describe('Autenticación y Autorización', () => {
      it('should return 401 when no token provided', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/pagos/morosidad/estudiantes')
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(401);
      });

      it('should return 403 when tutor tries to access', async () => {
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });

        const response = await request(app.getHttpServer())
          .get('/api/pagos/morosidad/estudiantes')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(403);
      });

      it('should return 403 when docente tries to access', async () => {
        const { docente, password } = await createTestDocente(prisma);
        const auth = await loginUser(app, { email: docente.email, password });

        const response = await request(app.getHttpServer())
          .get('/api/pagos/morosidad/estudiantes')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(403);
      });
    });

    describe('CE10: Sistema sin morosos', () => {
      it('should return empty array when no students are overdue', async () => {
        const admin = await createTestAdmin(prisma);
        const auth = await loginUser(app, {
          email: admin.email,
          password: DEFAULT_PASSWORD,
        });

        const response = await request(app.getHttpServer())
          .get('/api/pagos/morosidad/estudiantes')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
      });

      it('should return empty array when all students are paid', async () => {
        const admin = await createTestAdmin(prisma);
        const { tutor } = await createTestTutor(prisma);
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        const producto = await crearProducto();
        const auth = await loginUser(app, {
          email: admin.email,
          password: DEFAULT_PASSWORD,
        });

        await crearInscripcionMensual(
          estudiante.id,
          tutor.id,
          producto.id,
          periodoVencido(1),
          EstadoPagoInscripcion.Pagado,
        );

        const response = await request(app.getHttpServer())
          .get('/api/pagos/morosidad/estudiantes')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(0);
      });
    });

    describe('CE11: Sistema con morosos', () => {
      it('should return list of overdue students with correct structure', async () => {
        const admin = await createTestAdmin(prisma);
        const { tutor } = await createTestTutor(prisma);
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        const producto = await crearProducto();
        const auth = await loginUser(app, {
          email: admin.email,
          password: DEFAULT_PASSWORD,
        });

        await crearInscripcionMensual(
          estudiante.id,
          tutor.id,
          producto.id,
          periodoVencido(1),
          EstadoPagoInscripcion.Pendiente,
          15000,
        );

        const response = await request(app.getHttpServer())
          .get('/api/pagos/morosidad/estudiantes')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);

        const moroso = response.body[0];
        expect(moroso).toHaveProperty('id', estudiante.id);
        expect(moroso).toHaveProperty('nombre');
        expect(moroso).toHaveProperty('edad');
        expect(moroso).toHaveProperty('tutor');
        expect(moroso.tutor).toHaveProperty('id', tutor.id);
        expect(moroso.tutor).toHaveProperty('nombre');
        expect(moroso.tutor).toHaveProperty('email');
        expect(moroso).toHaveProperty('cuotasVencidas');
        expect(moroso).toHaveProperty('totalAdeudado');
        expect(moroso).toHaveProperty('detalleDeuda');
        expect(Array.isArray(moroso.detalleDeuda)).toBe(true);
      });

      it('should NOT include students with only current month debt', async () => {
        const admin = await createTestAdmin(prisma);
        const { tutor } = await createTestTutor(prisma);
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        const producto = await crearProducto();
        const auth = await loginUser(app, {
          email: admin.email,
          password: DEFAULT_PASSWORD,
        });

        // Solo deuda del mes actual (no vencida)
        await crearInscripcionMensual(
          estudiante.id,
          tutor.id,
          producto.id,
          periodoActual(),
          EstadoPagoInscripcion.Pendiente,
        );

        const response = await request(app.getHttpServer())
          .get('/api/pagos/morosidad/estudiantes')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(0);
      });

      it('should return multiple overdue students correctly', async () => {
        const admin = await createTestAdmin(prisma);
        const { tutor } = await createTestTutor(prisma);
        const { estudiante: est1 } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        const { estudiante: est2 } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        const producto = await crearProducto();
        const auth = await loginUser(app, {
          email: admin.email,
          password: DEFAULT_PASSWORD,
        });

        // Ambos estudiantes con deuda vencida
        await crearInscripcionMensual(
          est1.id,
          tutor.id,
          producto.id,
          periodoVencido(1),
          EstadoPagoInscripcion.Pendiente,
        );
        await crearInscripcionMensual(
          est2.id,
          tutor.id,
          producto.id,
          periodoVencido(1),
          EstadoPagoInscripcion.Pendiente,
        );

        const response = await request(app.getHttpServer())
          .get('/api/pagos/morosidad/estudiantes')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
      });
    });
  });
});
