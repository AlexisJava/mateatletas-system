/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST - Vencimiento y Recargos de Pagos
 * ============================================================================
 *
 * REQUISITOS DE NEGOCIO (no mirar código, testear desde contrato):
 *
 * R1. FECHAS DE CORTE:
 *   - Del 1 al 9: El tutor puede pagar el monto normal
 *   - Del 10 al 12: El tutor debe pagar con 15% de recargo
 *   - Del 13 en adelante: La inscripción se ANULA automáticamente
 *
 * R2. RECARGO DEL 15%:
 *   - Si el monto base es $10.000, con recargo debe pagar $11.500
 *   - El sistema debe calcular correctamente: monto * 1.15
 *
 * R3. ANULACIÓN AUTOMÁTICA:
 *   - Las inscripciones Pendientes o Parciales después del día 12 se anulan
 *   - Las inscripciones Pagadas NO se anulan nunca
 *   - Las inscripciones ya Anuladas no cambian (idempotencia)
 *
 * R4. PERIODOS ATRASADOS:
 *   - Si estamos en febrero y hay inscripciones de enero sin pagar → se anulan
 *
 * R5. AISLAMIENTO:
 *   - Un estudiante con inscripción de enero pagada y febrero pendiente:
 *     solo se anula febrero, no afecta enero
 *
 * ESTRATEGIA DE TESTING:
 * - NO usamos jest.useFakeTimers() porque bloquea NestJS
 * - Usamos periodos del PASADO para simular vencimientos
 * - La fecha de vencimiento día 9 ya pasó → debería anularse
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --config test/jest-e2e.json --testPathPatterns="vencimiento-pagos" --runInBand
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

describe('[INTEGRATION] Vencimiento y Recargos de Pagos', () => {
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
  // HELPER: Crear inscripción mensual de prueba con periodo específico
  // ============================================================================
  async function crearInscripcionMensual(options: {
    periodo: string; // Formato: "2025-10" (año-mes)
    precioFinal?: number;
    estado?: EstadoPago;
    montoPagado?: number;
  }) {
    const { tutor } = await createTestTutor(prisma);
    const { estudiante } = await createTestEstudiante(prisma, {
      tutorId: tutor.id,
    });
    const producto = await createTestProducto(prisma, { precio: 10000 });

    const [anioStr, mesStr] = options.periodo.split('-');
    const anio = Number(anioStr);
    const mes = Number(mesStr);

    // Fecha de vencimiento: día 9 del mes del periodo
    const fechaVencimiento = new Date(anio, mes - 1, 9, 23, 59, 59, 999);

    const inscripcion = await prisma.inscripcionMensual.create({
      data: {
        estudiante_id: estudiante.id,
        tutor_id: tutor.id,
        producto_id: producto.id,
        anio,
        mes,
        periodo: options.periodo,
        precio_base: 10000,
        descuento_aplicado: 0,
        precio_final: options.precioFinal ?? 10000,
        tipo_descuento: 'NINGUNO',
        detalle_calculo: 'Sin descuento',
        estado_pago: options.estado ?? EstadoPago.Pendiente,
        monto_pagado: options.montoPagado ?? 0,
        fecha_vencimiento: fechaVencimiento,
      },
    });

    return { inscripcion, estudiante, tutor, producto };
  }

  async function loginAsAdmin() {
    const admin = await createTestAdmin(prisma);
    return loginUser(app, { email: admin.email, password: DEFAULT_PASSWORD });
  }

  /**
   * Helper: Obtener un periodo del pasado (garantizado vencido)
   * Por ejemplo: 3 meses atrás
   */
  function getPeriodoVencido(mesesAtras: number = 3): string {
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() - mesesAtras);
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    return `${anio}-${mes}`;
  }

  // ============================================================================
  // R3. ANULACIÓN AUTOMÁTICA - El proceso de anulación es el core
  // ============================================================================
  describe('R3. Anulación Automática', () => {
    describe('Inscripciones que SÍ deben anularse (periodo vencido)', () => {
      it('Pendiente de hace 3 meses → debe anularse', async () => {
        // REQUISITO: Las pendientes vencidas se anulan
        const periodoVencido = getPeriodoVencido(3);

        const { inscripcion } = await crearInscripcionMensual({
          periodo: periodoVencido,
          estado: EstadoPago.Pendiente,
        });

        const auth = await loginAsAdmin();

        // Ejecutar proceso de anulación
        const response = await request(app.getHttpServer())
          .post('/api/admin/pagos/anular-vencidas')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);

        // Verificar que se anuló
        const actual = await prisma.inscripcionMensual.findUnique({
          where: { id: inscripcion.id },
        });

        expect(actual?.estado_pago).toBe(EstadoPago.Anulado);
      });

      it('Parcial de hace 2 meses → debe anularse', async () => {
        // REQUISITO: Los pagos parciales vencidos también se anulan
        const periodoVencido = getPeriodoVencido(2);

        const { inscripcion } = await crearInscripcionMensual({
          periodo: periodoVencido,
          estado: EstadoPago.Parcial,
          montoPagado: 5000,
        });

        const auth = await loginAsAdmin();

        await request(app.getHttpServer())
          .post('/api/admin/pagos/anular-vencidas')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        const actual = await prisma.inscripcionMensual.findUnique({
          where: { id: inscripcion.id },
        });

        expect(actual?.estado_pago).toBe(EstadoPago.Anulado);
      });
    });

    describe('Inscripciones que NO deben anularse', () => {
      it('Pagada de hace 3 meses → NUNCA debe anularse', async () => {
        // REQUISITO CRÍTICO: Una inscripción pagada no se toca
        const periodoVencido = getPeriodoVencido(3);

        const { inscripcion } = await crearInscripcionMensual({
          periodo: periodoVencido,
          estado: EstadoPago.Pagado,
          montoPagado: 10000,
        });

        const auth = await loginAsAdmin();

        await request(app.getHttpServer())
          .post('/api/admin/pagos/anular-vencidas')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        const actual = await prisma.inscripcionMensual.findUnique({
          where: { id: inscripcion.id },
        });

        // DEBE seguir siendo Pagado
        expect(actual?.estado_pago).toBe(EstadoPago.Pagado);
      });

      it('Ya anulada → debe permanecer anulada (idempotencia)', async () => {
        // REQUISITO: Ejecutar anulación múltiples veces no causa problemas
        const periodoVencido = getPeriodoVencido(3);

        const { inscripcion } = await crearInscripcionMensual({
          periodo: periodoVencido,
          estado: EstadoPago.Anulado,
        });

        const auth = await loginAsAdmin();

        // Primera ejecución
        await request(app.getHttpServer())
          .post('/api/admin/pagos/anular-vencidas')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        // Segunda ejecución
        await request(app.getHttpServer())
          .post('/api/admin/pagos/anular-vencidas')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        const actual = await prisma.inscripcionMensual.findUnique({
          where: { id: inscripcion.id },
        });

        expect(actual?.estado_pago).toBe(EstadoPago.Anulado);
      });
    });
  });

  // ============================================================================
  // R4. PERIODOS ATRASADOS - Múltiples meses
  // ============================================================================
  describe('R4. Periodos Atrasados', () => {
    it('Múltiples meses atrasados → todos deben anularse', async () => {
      // REQUISITO: Si hay varios meses sin pagar, todos se anulan
      const { inscripcion: oct } = await crearInscripcionMensual({
        periodo: getPeriodoVencido(5), // 5 meses atrás
        estado: EstadoPago.Pendiente,
      });
      const { inscripcion: nov } = await crearInscripcionMensual({
        periodo: getPeriodoVencido(4), // 4 meses atrás
        estado: EstadoPago.Pendiente,
      });
      const { inscripcion: dic } = await crearInscripcionMensual({
        periodo: getPeriodoVencido(3), // 3 meses atrás
        estado: EstadoPago.Pendiente,
      });

      const auth = await loginAsAdmin();

      await request(app.getHttpServer())
        .post('/api/admin/pagos/anular-vencidas')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      const octActual = await prisma.inscripcionMensual.findUnique({
        where: { id: oct.id },
      });
      const novActual = await prisma.inscripcionMensual.findUnique({
        where: { id: nov.id },
      });
      const dicActual = await prisma.inscripcionMensual.findUnique({
        where: { id: dic.id },
      });

      expect(octActual?.estado_pago).toBe(EstadoPago.Anulado);
      expect(novActual?.estado_pago).toBe(EstadoPago.Anulado);
      expect(dicActual?.estado_pago).toBe(EstadoPago.Anulado);
    });
  });

  // ============================================================================
  // R5. AISLAMIENTO ENTRE INSCRIPCIONES
  // ============================================================================
  describe('R5. Aislamiento entre Inscripciones', () => {
    it('Mismo estudiante: mes pagado + mes pendiente → solo anula pendiente', async () => {
      // REQUISITO: Cada inscripción es independiente
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      const producto = await createTestProducto(prisma);

      const periodoVencido1 = getPeriodoVencido(4);
      const periodoVencido2 = getPeriodoVencido(3);
      const [anio1, mes1] = periodoVencido1.split('-').map(Number);
      const [anio2, mes2] = periodoVencido2.split('-').map(Number);

      // Mes anterior: PAGADO
      const inscPagada = await prisma.inscripcionMensual.create({
        data: {
          estudiante_id: estudiante.id,
          tutor_id: tutor.id,
          producto_id: producto.id,
          anio: anio1,
          mes: mes1,
          periodo: periodoVencido1,
          precio_base: 10000,
          descuento_aplicado: 0,
          precio_final: 10000,
          tipo_descuento: 'NINGUNO',
          detalle_calculo: 'Sin descuento',
          estado_pago: EstadoPago.Pagado,
          monto_pagado: 10000,
          fecha_vencimiento: new Date(anio1, mes1 - 1, 9),
        },
      });

      // Mes siguiente: PENDIENTE
      const inscPendiente = await prisma.inscripcionMensual.create({
        data: {
          estudiante_id: estudiante.id,
          tutor_id: tutor.id,
          producto_id: producto.id,
          anio: anio2,
          mes: mes2,
          periodo: periodoVencido2,
          precio_base: 10000,
          descuento_aplicado: 0,
          precio_final: 10000,
          tipo_descuento: 'NINGUNO',
          detalle_calculo: 'Sin descuento',
          estado_pago: EstadoPago.Pendiente,
          monto_pagado: 0,
          fecha_vencimiento: new Date(anio2, mes2 - 1, 9),
        },
      });

      const auth = await loginAsAdmin();

      await request(app.getHttpServer())
        .post('/api/admin/pagos/anular-vencidas')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      const pagadaActual = await prisma.inscripcionMensual.findUnique({
        where: { id: inscPagada.id },
      });
      const pendienteActual = await prisma.inscripcionMensual.findUnique({
        where: { id: inscPendiente.id },
      });

      // La pagada sigue PAGADA
      expect(pagadaActual?.estado_pago).toBe(EstadoPago.Pagado);
      // La pendiente se ANULA
      expect(pendienteActual?.estado_pago).toBe(EstadoPago.Anulado);
    });

    it('Estudiante A anulado NO afecta a Estudiante B', async () => {
      // REQUISITO: Aislamiento entre estudiantes
      const periodoVencido = getPeriodoVencido(3);

      const { inscripcion: inscA } = await crearInscripcionMensual({
        periodo: periodoVencido,
        estado: EstadoPago.Pendiente,
      });

      const { inscripcion: inscB } = await crearInscripcionMensual({
        periodo: periodoVencido,
        estado: EstadoPago.Pagado,
        montoPagado: 10000,
      });

      const auth = await loginAsAdmin();

      await request(app.getHttpServer())
        .post('/api/admin/pagos/anular-vencidas')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      const aActual = await prisma.inscripcionMensual.findUnique({
        where: { id: inscA.id },
      });
      const bActual = await prisma.inscripcionMensual.findUnique({
        where: { id: inscB.id },
      });

      // A se anula (estaba pendiente)
      expect(aActual?.estado_pago).toBe(EstadoPago.Anulado);
      // B sigue pagado
      expect(bActual?.estado_pago).toBe(EstadoPago.Pagado);
    });
  });

  // ============================================================================
  // ENDPOINT: GET stats-pendientes
  // ============================================================================
  describe('Endpoint: GET /api/admin/pagos/stats-pendientes', () => {
    it('debe retornar estadísticas de inscripciones pendientes', async () => {
      // Crear mix de inscripciones
      await crearInscripcionMensual({
        periodo: getPeriodoVencido(3),
        estado: EstadoPago.Pendiente,
      });
      await crearInscripcionMensual({
        periodo: getPeriodoVencido(2),
        estado: EstadoPago.Parcial,
        montoPagado: 5000,
      });
      await crearInscripcionMensual({
        periodo: getPeriodoVencido(1),
        estado: EstadoPago.Pagado,
        montoPagado: 10000,
      });

      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .get('/api/admin/pagos/stats-pendientes')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('vigentes');
      expect(response.body).toHaveProperty('conRecargo');
      expect(response.body).toHaveProperty('anulables');
    });
  });

  // ============================================================================
  // R1 & R2: PAGO MANUAL - Verificar que el endpoint funciona
  // ============================================================================
  describe('Pago Manual (Admin)', () => {
    it('debe permitir registrar un pago manual exitosamente', async () => {
      const periodoVencido = getPeriodoVencido(1);
      const { inscripcion } = await crearInscripcionMensual({
        periodo: periodoVencido,
        estado: EstadoPago.Pendiente,
        precioFinal: 10000,
      });

      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          monto: 10000,
          metodoPago: 'Efectivo',
          observaciones: 'Pago en oficina',
        });

      expect(response.status).toBe(200);

      // Verificar que la inscripción cambió de estado
      const actual = await prisma.inscripcionMensual.findUnique({
        where: { id: inscripcion.id },
      });

      // El estado debería ser Pagado o Parcial según el monto
      expect([EstadoPago.Pagado, EstadoPago.Parcial]).toContain(
        actual?.estado_pago,
      );
    });

    it('debe rechazar pago sin datos requeridos', async () => {
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          // Falta inscripcionId, monto, metodoPago
        });

      expect(response.status).toBe(400);
    });
  });
});
