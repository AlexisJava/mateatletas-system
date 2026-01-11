/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST - Pago Manual Admin
 * ============================================================================
 *
 * ENDPOINT: POST /api/admin/pagos/manual
 *
 * REQUISITOS DE NEGOCIO (Finanzas - sistema crítico):
 * 1. Registrar pagos manuales (efectivo, transferencia, etc.)
 * 2. Manejar todos los casos extremos de pagos
 * 3. Mantener integridad financiera
 *
 * EQUIVALENCE CLASSES:
 * - Auth: [admin-válido, docente, estudiante, sin-auth]
 * - Inscripción: [existe-pendiente, existe-pagada, existe-parcial, existe-vencida, no-existe]
 * - Monto: [exacto, menor(parcial), mayor(sobrepago), cero, negativo]
 * - Método pago: [Efectivo, Transferencia, MercadoPago, Otro, vacío]
 *
 * BOUNDARIES:
 * - Monto: $0, $1, precio_final-1, precio_final, precio_final+1, MAX_INT
 * - Inscripción ID: UUID válido inexistente, formato inválido
 *
 * STATE TRANSITIONS:
 * - Pendiente + pago_exacto → Pagado
 * - Pendiente + pago_parcial → Parcial
 * - Parcial + pago_completo → Pagado (acumula)
 * - Vencido + pago → Pagado
 * - Pagado + pago → Error (ya pagado)
 *
 * CASOS EXTREMOS DE NEGOCIO:
 * - Sobrepago: ¿Qué pasa con el excedente?
 * - Múltiples pagos parciales: ¿Acumula correctamente?
 * - Doble pago simultáneo: ¿Race condition?
 * - Editar/anular pago: ¿Se puede corregir errores?
 * - Tutor con múltiples hijos: ¿Pago único cubre varios?
 * - Inscripción de estudiante dado de baja
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="pago-manual.integration" --runInBand
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
  createTestDocente,
  createTestEstudiante,
  createTestProducto,
  DEFAULT_PASSWORD,
} from '../../fixtures/factories';
import {
  loginUser,
  FRONTEND_ORIGIN,
  generateUniqueIP,
} from '../../helpers/auth.helpers';

describe('[INTEGRATION] Admin - Pago Manual', () => {
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
  // HELPER: Crear inscripción mensual de prueba
  // ============================================================================
  async function crearInscripcionPendiente(options?: {
    precioFinal?: number;
    estado?: 'Pendiente' | 'Vencido' | 'Parcial' | 'Pagado';
    periodo?: string;
  }) {
    const { tutor } = await createTestTutor(prisma);
    const { estudiante } = await createTestEstudiante(prisma, {
      tutorId: tutor.id,
    });
    const producto = await createTestProducto(prisma, { precio: 15000 });

    const inscripcion = await prisma.inscripcionMensual.create({
      data: {
        estudiante_id: estudiante.id,
        tutor_id: tutor.id,
        producto_id: producto.id,
        anio: 2026,
        mes: 1,
        periodo: options?.periodo ?? '2026-01',
        precio_base: 15000,
        descuento_aplicado: 0,
        precio_final: options?.precioFinal ?? 15000,
        tipo_descuento: 'NINGUNO',
        detalle_calculo: 'Sin descuento',
        estado_pago: options?.estado ?? 'Pendiente',
        fecha_vencimiento: new Date('2026-01-15'),
      },
    });

    return { inscripcion, estudiante, tutor, producto };
  }

  async function loginAsAdmin() {
    const admin = await createTestAdmin(prisma);
    return loginUser(app, { email: admin.email, password: DEFAULT_PASSWORD });
  }

  // ============================================================================
  // EQUIVALENCE PARTITIONING: AUTENTICACIÓN
  // ============================================================================
  describe('Equivalence Partitioning: Autenticación', () => {
    it('Clase ADMIN-VÁLIDO: debe permitir registrar pago', async () => {
      // ARRANGE
      const auth = await loginAsAdmin();
      const { inscripcion } = await crearInscripcionPendiente();

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          monto: 15000,
          metodoPago: 'Efectivo',
        });

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('Clase SIN-AUTH: debe retornar 401', async () => {
      const { inscripcion } = await crearInscripcionPendiente();

      const response = await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          monto: 15000,
          metodoPago: 'Efectivo',
        });

      expect(response.status).toBe(401);
    });

    it('Clase DOCENTE: debe retornar 403 (no autorizado)', async () => {
      const { docente, password } = await createTestDocente(prisma);
      const auth = await loginUser(app, { email: docente.email, password });
      const { inscripcion } = await crearInscripcionPendiente();

      const response = await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          monto: 15000,
          metodoPago: 'Efectivo',
        });

      expect(response.status).toBe(403);
    });
  });

  // ============================================================================
  // EQUIVALENCE PARTITIONING: ESTADO DE INSCRIPCIÓN
  // ============================================================================
  describe('Equivalence Partitioning: Estado Inscripción', () => {
    it('Clase PENDIENTE: debe aceptar pago y marcar como Pagado', async () => {
      const auth = await loginAsAdmin();
      const { inscripcion } = await crearInscripcionPendiente({
        estado: 'Pendiente',
      });

      const response = await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          monto: 15000,
          metodoPago: 'Transferencia',
        });

      expect(response.status).toBe(200);
      expect(response.body.inscripcion.estadoNuevo).toBe('Pagado');

      // Verificar en DB
      const updated = await prisma.inscripcionMensual.findUnique({
        where: { id: inscripcion.id },
      });
      expect(updated?.estado_pago).toBe('Pagado');
    });

    it('Clase VENCIDO: debe aceptar pago y marcar como Pagado', async () => {
      const auth = await loginAsAdmin();
      const { inscripcion } = await crearInscripcionPendiente({
        estado: 'Vencido',
      });

      const response = await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          monto: 15000,
          metodoPago: 'Efectivo',
        });

      expect(response.status).toBe(200);
      expect(response.body.inscripcion.estadoNuevo).toBe('Pagado');
    });

    it('Clase PAGADO: debe rechazar intento de doble pago', async () => {
      const auth = await loginAsAdmin();
      const { inscripcion } = await crearInscripcionPendiente({
        estado: 'Pagado',
      });

      const response = await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          monto: 15000,
          metodoPago: 'Efectivo',
        });

      expect(response.status).toBe(400);
    });

    it('Clase NO-EXISTE: debe retornar 404', async () => {
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: 'inscripcion-inexistente-123',
          monto: 15000,
          metodoPago: 'Efectivo',
        });

      expect(response.status).toBe(404);
    });
  });

  // ============================================================================
  // BOUNDARY VALUE ANALYSIS: MONTOS
  // ============================================================================
  describe('Boundary Value Analysis: Montos', () => {
    it('Monto $0: debe rechazar con error', async () => {
      const auth = await loginAsAdmin();
      const { inscripcion } = await crearInscripcionPendiente();

      const response = await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          monto: 0,
          metodoPago: 'Efectivo',
        });

      expect(response.status).toBe(400);
    });

    it('Monto negativo: debe rechazar con error', async () => {
      const auth = await loginAsAdmin();
      const { inscripcion } = await crearInscripcionPendiente();

      const response = await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          monto: -1000,
          metodoPago: 'Efectivo',
        });

      expect(response.status).toBe(400);
    });

    it('Monto $1 (mínimo positivo): debe aceptar como pago parcial', async () => {
      const auth = await loginAsAdmin();
      const { inscripcion } = await crearInscripcionPendiente({
        precioFinal: 15000,
      });

      const response = await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          monto: 1,
          metodoPago: 'Efectivo',
        });

      expect(response.status).toBe(200);
      expect(response.body.inscripcion.estadoNuevo).toBe('Parcial');
    });

    it('Monto precio_final - 1: debe marcar como Parcial', async () => {
      const auth = await loginAsAdmin();
      const { inscripcion } = await crearInscripcionPendiente({
        precioFinal: 15000,
      });

      const response = await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          monto: 14999,
          metodoPago: 'Efectivo',
        });

      expect(response.status).toBe(200);
      expect(response.body.inscripcion.estadoNuevo).toBe('Parcial');
    });

    it('Monto exacto (precio_final): debe marcar como Pagado', async () => {
      const auth = await loginAsAdmin();
      const { inscripcion } = await crearInscripcionPendiente({
        precioFinal: 15000,
      });

      const response = await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          monto: 15000,
          metodoPago: 'Efectivo',
        });

      expect(response.status).toBe(200);
      expect(response.body.inscripcion.estadoNuevo).toBe('Pagado');
    });

    it('Sobrepago (precio_final + 20000): debe aceptar y marcar como Pagado', async () => {
      const auth = await loginAsAdmin();
      const { inscripcion } = await crearInscripcionPendiente({
        precioFinal: 15000,
      });

      const response = await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          monto: 35000,
          metodoPago: 'Efectivo',
        });

      expect(response.status).toBe(200);
      expect(response.body.inscripcion.estadoNuevo).toBe('Pagado');

      // REQUISITO CRÍTICO: El monto real pagado debe guardarse
      expect(response.body.inscripcion.montoPagado).toBe(35000);
    });
  });

  // ============================================================================
  // STATE TRANSITIONS: PAGOS PARCIALES ACUMULADOS
  // ============================================================================
  describe('State Transitions: Pagos Parciales', () => {
    it('Parcial + segundo pago parcial: debe ACUMULAR el monto', async () => {
      const auth = await loginAsAdmin();
      const { inscripcion } = await crearInscripcionPendiente({
        precioFinal: 15000,
      });

      // Primer pago parcial: $5000
      await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          monto: 5000,
          metodoPago: 'Efectivo',
          observaciones: 'Primer pago',
        });

      // Segundo pago parcial: $5000
      const response2 = await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          monto: 5000,
          metodoPago: 'Efectivo',
          observaciones: 'Segundo pago',
        });

      // Aún parcial porque 5000 + 5000 = 10000 < 15000
      expect(response2.status).toBe(200);
      expect(response2.body.inscripcion.estadoNuevo).toBe('Parcial');

      // Tercer pago: $5000 - ahora completa los $15000
      const response3 = await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          monto: 5000,
          metodoPago: 'Efectivo',
          observaciones: 'Tercer pago - completa',
        });

      expect(response3.status).toBe(200);
      expect(response3.body.inscripcion.estadoNuevo).toBe('Pagado');
    });
  });

  // ============================================================================
  // ERROR GUESSING: CASOS TÍPICOS DE FALLO
  // ============================================================================
  describe('Error Guessing: Casos de Fallo', () => {
    it('inscripcionId con formato inválido: debe retornar 400', async () => {
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: 'not-a-valid-id!@#$',
          monto: 15000,
          metodoPago: 'Efectivo',
        });

      // 400 o 404 son aceptables
      expect([400, 404]).toContain(response.status);
    });

    it('metodoPago vacío: debe retornar 400', async () => {
      const auth = await loginAsAdmin();
      const { inscripcion } = await crearInscripcionPendiente();

      const response = await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          monto: 15000,
          metodoPago: '',
        });

      expect(response.status).toBe(400);
    });

    it('Campo monto faltante: debe retornar 400', async () => {
      const auth = await loginAsAdmin();
      const { inscripcion } = await crearInscripcionPendiente();

      const response = await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          metodoPago: 'Efectivo',
        });

      expect(response.status).toBe(400);
    });

    it('Caracteres especiales en observaciones: debe aceptar', async () => {
      const auth = await loginAsAdmin();
      const { inscripcion } = await crearInscripcionPendiente();

      const response = await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          monto: 15000,
          metodoPago: 'Efectivo',
          observaciones:
            'Pagó con $$ en efectivo. Nota: "especial" <test> 中文',
        });

      expect(response.status).toBe(200);
    });
  });

  // ============================================================================
  // CASOS DE NEGOCIO CRÍTICOS
  // ============================================================================
  describe('Casos de Negocio Críticos', () => {
    it('Sobrepago: debe registrar el monto REAL pagado, no solo el precio', async () => {
      const auth = await loginAsAdmin();
      const { inscripcion } = await crearInscripcionPendiente({
        precioFinal: 15000,
      });

      const response = await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          monto: 35000,
          metodoPago: 'Efectivo',
          observaciones: 'Sobrepago - $20k a favor',
        });

      expect(response.status).toBe(200);

      // CRÍTICO: El sistema debe guardar que pagó $35000, no $15000
      // Para poder dar saldo a favor o vuelto
      const enDB = await prisma.inscripcionMensual.findUnique({
        where: { id: inscripcion.id },
      });

      // Si no hay campo monto_recibido, este test fallará intencionalmente
      // para indicar que falta implementar el tracking de sobrepagos
      expect(response.body.inscripcion.montoPagado).toBe(35000);
    });

    it('Debe guardar fecha de pago correctamente', async () => {
      const auth = await loginAsAdmin();
      const { inscripcion } = await crearInscripcionPendiente();
      const antesDelPago = new Date();

      await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          monto: 15000,
          metodoPago: 'Efectivo',
        });

      const enDB = await prisma.inscripcionMensual.findUnique({
        where: { id: inscripcion.id },
      });

      expect(enDB?.fecha_pago).toBeDefined();
      expect(new Date(enDB!.fecha_pago!).getTime()).toBeGreaterThanOrEqual(
        antesDelPago.getTime(),
      );
    });

    it('Debe guardar método de pago correctamente', async () => {
      const auth = await loginAsAdmin();
      const { inscripcion } = await crearInscripcionPendiente();

      await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          monto: 15000,
          metodoPago: 'Transferencia Bancaria',
        });

      const enDB = await prisma.inscripcionMensual.findUnique({
        where: { id: inscripcion.id },
      });

      expect(enDB?.metodo_pago).toBe('Transferencia Bancaria');
    });

    it('Debe guardar observaciones cuando se proveen', async () => {
      const auth = await loginAsAdmin();
      const { inscripcion } = await crearInscripcionPendiente();

      await request(app.getHttpServer())
        .post('/api/admin/pagos/registrar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          inscripcionId: inscripcion.id,
          monto: 15000,
          metodoPago: 'Efectivo',
          observaciones: 'Pagó la mamá en oficina',
        });

      const enDB = await prisma.inscripcionMensual.findUnique({
        where: { id: inscripcion.id },
      });

      expect(enDB?.observaciones).toBe('Pagó la mamá en oficina');
    });
  });

  // ============================================================================
  // ENDPOINT: GET /api/admin/pagos/pendientes
  // ============================================================================
  describe('GET /api/admin/pagos/pendientes', () => {
    it('debe listar solo inscripciones con estado Pendiente, Vencido o Parcial', async () => {
      const auth = await loginAsAdmin();

      // Crear varias inscripciones con diferentes estados
      await crearInscripcionPendiente({
        estado: 'Pendiente',
        periodo: '2026-01',
      });
      await crearInscripcionPendiente({
        estado: 'Vencido',
        periodo: '2026-02',
      });
      await crearInscripcionPendiente({
        estado: 'Parcial',
        periodo: '2026-03',
      });
      await crearInscripcionPendiente({ estado: 'Pagado', periodo: '2026-04' });

      const response = await request(app.getHttpServer())
        .get('/api/admin/pagos/pendientes')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(3); // Solo Pendiente, Vencido, Parcial

      // Verificar que NO incluye la pagada
      const estados = response.body.data.map(
        (i: { estadoPago: string }) => i.estadoPago,
      );
      expect(estados).not.toContain('Pagado');
    });

    it('debe permitir búsqueda por nombre de estudiante', async () => {
      const auth = await loginAsAdmin();
      const { tutor } = await createTestTutor(prisma);

      // Crear estudiante con nombre específico
      const { estudiante } = await createTestEstudiante(prisma, {
        nombre: 'Lucas',
        apellido: 'Martínez',
        tutorId: tutor.id,
      });

      const producto = await createTestProducto(prisma);

      await prisma.inscripcionMensual.create({
        data: {
          estudiante_id: estudiante.id,
          tutor_id: tutor.id,
          producto_id: producto.id,
          anio: 2026,
          mes: 1,
          periodo: '2026-01',
          precio_base: 15000,
          descuento_aplicado: 0,
          precio_final: 15000,
          tipo_descuento: 'NINGUNO',
          detalle_calculo: 'Sin descuento',
          estado_pago: 'Pendiente',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/admin/pagos/pendientes?search=Lucas')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].estudiante.nombre).toContain('Lucas');
    });
  });
});
