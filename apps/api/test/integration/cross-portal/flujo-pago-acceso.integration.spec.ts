/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST - Flujo Completo: Pago → Acceso Estudiante
 * ============================================================================
 *
 * FLUJO DE NEGOCIO COMPLETO:
 *
 * 1. INSCRIPCIÓN CREADA:
 *    - Admin inscribe estudiante a comisión
 *    - Se genera InscripcionMensual con estado Pendiente
 *
 * 2. TUTOR VE DEUDA:
 *    - Tutor consulta morosidad y ve cuota pendiente
 *    - Sistema indica monto a pagar
 *
 * 3. TUTOR PAGA:
 *    a) Pago automático: MercadoPago envía webhook approved
 *    b) Pago manual: Admin registra pago en efectivo
 *
 * 4. ESTUDIANTE ACCEDE:
 *    - Estudiante ya no está bloqueado por morosidad
 *    - Puede acceder a contenido educativo
 *
 * CASOS DE PRUEBA:
 * - Happy path: pago aprobado → acceso permitido
 * - Morosidad: no paga → acceso bloqueado
 * - Pago parcial → acceso bloqueado hasta completar
 * - Múltiples hijos: deuda de uno no afecta al otro
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --config test/jest-e2e.json --testPathPatterns="flujo-pago-acceso" --runInBand
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
  createTestTutor,
  createTestAdmin,
  createTestEstudiante,
  createTestProducto,
  DEFAULT_PASSWORD,
} from '../../fixtures/factories';
import {
  loginUser,
  FRONTEND_ORIGIN,
  generateUniqueIP,
} from '../../helpers/auth.helpers';
import { EstadoPago } from '@prisma/client';

describe('[INTEGRATION] Flujo Completo: Pago → Acceso Estudiante', () => {
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
  // HELPERS
  // ============================================================================

  /**
   * Crear inscripción pendiente para un estudiante
   */
  async function crearInscripcionPendiente(
    estudianteId: string,
    tutorId: string,
    productoId: string,
    options: { precioFinal?: number; periodo?: string } = {},
  ) {
    const hoy = new Date();
    const periodo =
      options.periodo ??
      `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
    const [anio, mes] = periodo.split('-').map(Number);

    return prisma.inscripcionMensual.create({
      data: {
        estudiante_id: estudianteId,
        tutor_id: tutorId,
        producto_id: productoId,
        anio,
        mes,
        periodo,
        precio_base: 10000,
        descuento_aplicado: 0,
        precio_final: options.precioFinal ?? 10000,
        tipo_descuento: 'NINGUNO',
        detalle_calculo: 'Sin descuento',
        estado_pago: EstadoPago.Pendiente,
        monto_pagado: 0,
        fecha_vencimiento: new Date(anio, mes - 1, 9),
      },
    });
  }

  /**
   * Helper: Obtener periodo vencido
   */
  function getPeriodoVencido(mesesAtras: number = 2): string {
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() - mesesAtras);
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
  }

  async function loginAsAdmin() {
    const admin = await createTestAdmin(prisma);
    return loginUser(app, { email: admin.email, password: DEFAULT_PASSWORD });
  }

  async function loginAsTutor(tutorEmail: string) {
    return loginUser(app, { email: tutorEmail, password: DEFAULT_PASSWORD });
  }

  // ============================================================================
  // HAPPY PATH: Pago completo → Acceso permitido
  // ============================================================================
  describe('Happy Path: Pago → Acceso', () => {
    it('estudiante con cuota pagada debe tener acceso permitido', async () => {
      // SETUP
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      const producto = await createTestProducto(prisma);

      // Crear inscripción PAGADA
      await prisma.inscripcionMensual.create({
        data: {
          estudiante_id: estudiante.id,
          tutor_id: tutor.id,
          producto_id: producto.id,
          anio: 2026,
          mes: 1,
          periodo: '2026-01',
          precio_base: 10000,
          descuento_aplicado: 0,
          precio_final: 10000,
          tipo_descuento: 'NINGUNO',
          detalle_calculo: 'Sin descuento',
          estado_pago: EstadoPago.Pagado,
          monto_pagado: 10000,
          fecha_vencimiento: new Date(2026, 0, 9),
        },
      });

      // LOGIN como tutor
      const auth = await loginAsTutor(tutor.email);

      // VERIFICAR: Endpoint de morosidad debe indicar sin deuda
      const response = await request(app.getHttpServer())
        .get(`/api/pagos/morosidad/estudiante/${estudiante.id}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);
      expect(response.body.permitirAcceso).toBe(true);
    });

    it('admin registra pago manual → estudiante obtiene acceso', async () => {
      // SETUP
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      const producto = await createTestProducto(prisma);
      const periodoVencido = getPeriodoVencido(2);

      // Crear inscripción PENDIENTE vencida
      const inscripcion = await crearInscripcionPendiente(
        estudiante.id,
        tutor.id,
        producto.id,
        { periodo: periodoVencido, precioFinal: 10000 },
      );

      const adminAuth = await loginAsAdmin();
      const tutorAuth = await loginAsTutor(tutor.email);

      // VERIFICAR: Inicialmente está bloqueado
      const responseAntes = await request(app.getHttpServer())
        .get(`/api/pagos/morosidad/estudiante/${estudiante.id}`)
        .set('Cookie', tutorAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(responseAntes.status).toBe(200);
      expect(responseAntes.body.permitirAcceso).toBe(false);

      // ACCIÓN: Admin registra pago manual
      await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', adminAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          monto: 10000,
          metodoPago: 'Efectivo',
          observaciones: 'Pago en oficina',
        });

      // VERIFICAR: Ahora tiene acceso
      const responseDespues = await request(app.getHttpServer())
        .get(`/api/pagos/morosidad/estudiante/${estudiante.id}`)
        .set('Cookie', tutorAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(responseDespues.status).toBe(200);
      expect(responseDespues.body.permitirAcceso).toBe(true);
    });
  });

  // ============================================================================
  // MOROSIDAD: No paga → Acceso bloqueado
  // ============================================================================
  describe('Morosidad: Bloqueo de acceso', () => {
    it('estudiante con cuota vencida sin pagar debe tener acceso bloqueado', async () => {
      // SETUP
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      const producto = await createTestProducto(prisma);
      const periodoVencido = getPeriodoVencido(2);

      // Crear inscripción PENDIENTE vencida
      await crearInscripcionPendiente(estudiante.id, tutor.id, producto.id, {
        periodo: periodoVencido,
      });

      const auth = await loginAsTutor(tutor.email);

      // VERIFICAR: Acceso bloqueado
      const response = await request(app.getHttpServer())
        .get(`/api/pagos/morosidad/estudiante/${estudiante.id}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);
      expect(response.body.permitirAcceso).toBe(false);
      expect(response.body.detalles.cuotasVencidas).toBeGreaterThan(0);
    });

    it('tutor puede ver detalle de deudas de sus estudiantes', async () => {
      // SETUP
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      const producto = await createTestProducto(prisma);
      const periodoVencido = getPeriodoVencido(2);

      // Crear inscripción PENDIENTE vencida
      await crearInscripcionPendiente(estudiante.id, tutor.id, producto.id, {
        periodo: periodoVencido,
        precioFinal: 15000,
      });

      const auth = await loginAsTutor(tutor.email);

      // VERIFICAR: Endpoint de morosidad del tutor
      const response = await request(app.getHttpServer())
        .get(`/api/pagos/morosidad/tutor/${tutor.id}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);
      expect(response.body.tieneMorosidad).toBe(true);
      expect(response.body.totalAdeudado).toBe(15000);
    });
  });

  // ============================================================================
  // AISLAMIENTO: Múltiples hijos
  // ============================================================================
  describe('Aislamiento entre estudiantes del mismo tutor', () => {
    it('deuda de hijo A no debe afectar acceso de hijo B', async () => {
      // SETUP: Un tutor con dos hijos
      const { tutor } = await createTestTutor(prisma);
      const { estudiante: hijoA } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      const { estudiante: hijoB } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      const producto = await createTestProducto(prisma);
      const periodoVencido = getPeriodoVencido(2);

      // Hijo A: tiene deuda (PENDIENTE vencida)
      await crearInscripcionPendiente(hijoA.id, tutor.id, producto.id, {
        periodo: periodoVencido,
      });

      // Hijo B: pagado (al día)
      await prisma.inscripcionMensual.create({
        data: {
          estudiante_id: hijoB.id,
          tutor_id: tutor.id,
          producto_id: producto.id,
          anio: 2026,
          mes: 1,
          periodo: '2026-01',
          precio_base: 10000,
          descuento_aplicado: 0,
          precio_final: 10000,
          tipo_descuento: 'NINGUNO',
          detalle_calculo: 'Sin descuento',
          estado_pago: EstadoPago.Pagado,
          monto_pagado: 10000,
          fecha_vencimiento: new Date(2026, 0, 9),
        },
      });

      const auth = await loginAsTutor(tutor.email);

      // VERIFICAR: Hijo A bloqueado
      const responseA = await request(app.getHttpServer())
        .get(`/api/pagos/morosidad/estudiante/${hijoA.id}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(responseA.body.permitirAcceso).toBe(false);

      // VERIFICAR: Hijo B tiene acceso
      const responseB = await request(app.getHttpServer())
        .get(`/api/pagos/morosidad/estudiante/${hijoB.id}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(responseB.body.permitirAcceso).toBe(true);
    });
  });

  // ============================================================================
  // ADMIN: Lista de morosos
  // ============================================================================
  describe('Admin: Gestión de morosos', () => {
    it('admin puede ver lista de todos los estudiantes morosos', async () => {
      // SETUP: Crear varios estudiantes con deudas
      const { tutor: tutor1 } = await createTestTutor(prisma);
      const { tutor: tutor2 } = await createTestTutor(prisma);
      const { estudiante: est1 } = await createTestEstudiante(prisma, {
        tutorId: tutor1.id,
      });
      const { estudiante: est2 } = await createTestEstudiante(prisma, {
        tutorId: tutor2.id,
      });
      const producto = await createTestProducto(prisma);
      const periodoVencido = getPeriodoVencido(2);

      // Ambos tienen deuda
      await crearInscripcionPendiente(est1.id, tutor1.id, producto.id, {
        periodo: periodoVencido,
      });
      await crearInscripcionPendiente(est2.id, tutor2.id, producto.id, {
        periodo: periodoVencido,
      });

      const auth = await loginAsAdmin();

      // VERIFICAR: Endpoint de morosos
      const response = await request(app.getHttpServer())
        .get('/api/pagos/morosidad/estudiantes')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });
  });
});
