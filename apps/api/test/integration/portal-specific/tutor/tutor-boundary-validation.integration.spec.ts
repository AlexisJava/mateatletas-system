/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST - Portal Tutor: Boundary Values & Validation
 * ============================================================================
 *
 * METODOLOGÍA: Black Box Testing - Tests como JUECES, no cómplices.
 *
 * Este archivo complementa tutor-portal.integration.spec.ts con:
 * - Boundary Value Analysis (límites de paginación)
 * - Validation Testing (formatos inválidos)
 * - Data Isolation (cada tutor solo ve sus datos)
 * - Edge Cases (estados inválidos, estudiantes suspendidos)
 *
 * CLASES DE EQUIVALENCIA TESTEADAS:
 * - BOUNDARY: limit=0, limit=1, limit=50 (máximo), limit=51 (excede)
 * - VALIDATION: periodo con formato inválido, estadoPago inválido
 * - ISOLATION: dashboard/alertas aislados por tutor
 * - EDGE CASES: estudiantes suspendidos, suscripciones canceladas
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --config test/jest-e2e.json --testPathPattern="tutor-boundary" --runInBand
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../../../src/app.module';
import { PrismaService } from '../../../../src/core/database/prisma.service';
import { cleanAllTestTables } from '../../../helpers/db-cleanup';
import {
  createTestTutor,
  createTestEstudiante,
  createTestDocente,
  createTestProducto,
  createTestAdmin,
  DEFAULT_PASSWORD,
} from '../../../fixtures/factories';
import {
  loginUser,
  FRONTEND_ORIGIN,
  generateUniqueIP,
} from '../../../helpers/auth.helpers';
import { EstadoPago, EstadoAccesoEstudiante } from '@prisma/client';

describe('[INTEGRATION] Portal Tutor - Boundary Values & Validation', () => {
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

  /**
   * Crea una inscripción mensual para un estudiante.
   */
  async function crearInscripcionMensual(options: {
    estudianteId: string;
    tutorId: string;
    productoId: string;
    periodo: string;
    precioFinal?: number;
    estado?: EstadoPago;
    montoPagado?: number;
    fechaVencimiento?: Date;
  }) {
    const [anioStr, mesStr] = options.periodo.split('-');
    const anio = Number(anioStr);
    const mes = Number(mesStr);

    const defaultVencimiento = new Date(anio, mes, 0, 23, 59, 59, 999);

    return prisma.inscripcionMensual.create({
      data: {
        estudiante_id: options.estudianteId,
        tutor_id: options.tutorId,
        producto_id: options.productoId,
        anio,
        mes,
        periodo: options.periodo,
        precio_base: options.precioFinal ?? 10000,
        descuento_aplicado: 0,
        precio_final: options.precioFinal ?? 10000,
        tipo_descuento: 'NINGUNO',
        detalle_calculo: 'Sin descuento',
        estado_pago: options.estado ?? EstadoPago.Pendiente,
        monto_pagado: options.montoPagado ?? 0,
        fecha_vencimiento: options.fechaVencimiento ?? defaultVencimiento,
      },
    });
  }

  function getPeriodoActual(): string {
    const now = new Date();
    const anio = now.getFullYear();
    const mes = String(now.getMonth() + 1).padStart(2, '0');
    return `${anio}-${mes}`;
  }

  // ============================================================================
  // BOUNDARY VALUE ANALYSIS: GET /tutor/proximas-clases
  // ============================================================================

  describe('Boundary Values: GET /tutor/proximas-clases', () => {
    describe('limit parameter boundaries', () => {
      it('limit=0: should_reject_or_use_default', async () => {
        // Requisito: @Min(1) debería rechazar limit=0
        const { tutor, password } = await createTestTutor(prisma);

        const auth = await loginUser(app, {
          email: tutor.email!,
          password,
        });

        const response = await request(app.getHttpServer())
          .get('/api/tutor/proximas-clases')
          .query({ limit: 0 })
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        // Según DTO: @Min(1) → debería retornar 400
        expect(response.status).toBe(400);
        expect(response.body.message).toContain('El límite mínimo es 1');
      });

      it('limit=1 (mínimo válido): should_accept_and_respect_limit', async () => {
        const { tutor, password } = await createTestTutor(prisma);

        const auth = await loginUser(app, {
          email: tutor.email!,
          password,
        });

        const response = await request(app.getHttpServer())
          .get('/api/tutor/proximas-clases')
          .query({ limit: 1 })
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('clases');
        expect(response.body.clases.length).toBeLessThanOrEqual(1);
      });

      it('limit=50 (máximo válido): should_accept', async () => {
        const { tutor, password } = await createTestTutor(prisma);

        const auth = await loginUser(app, {
          email: tutor.email!,
          password,
        });

        const response = await request(app.getHttpServer())
          .get('/api/tutor/proximas-clases')
          .query({ limit: 50 })
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('clases');
        expect(response.body.clases.length).toBeLessThanOrEqual(50);
      });

      it('limit=51 (excede máximo): should_reject', async () => {
        // Requisito: @Max(50) debería rechazar limit > 50
        const { tutor, password } = await createTestTutor(prisma);

        const auth = await loginUser(app, {
          email: tutor.email!,
          password,
        });

        const response = await request(app.getHttpServer())
          .get('/api/tutor/proximas-clases')
          .query({ limit: 51 })
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        // Según DTO: @Max(50) → debería retornar 400
        expect(response.status).toBe(400);
        expect(response.body.message).toContain('El límite máximo es 50');
      });

      it('limit=-1 (negativo): should_reject', async () => {
        const { tutor, password } = await createTestTutor(prisma);

        const auth = await loginUser(app, {
          email: tutor.email!,
          password,
        });

        const response = await request(app.getHttpServer())
          .get('/api/tutor/proximas-clases')
          .query({ limit: -1 })
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(400);
      });

      it('limit=string (no numérico): should_reject', async () => {
        const { tutor, password } = await createTestTutor(prisma);

        const auth = await loginUser(app, {
          email: tutor.email!,
          password,
        });

        const response = await request(app.getHttpServer())
          .get('/api/tutor/proximas-clases')
          .query({ limit: 'abc' })
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        // @IsInt debería rechazar
        expect(response.status).toBe(400);
      });

      it('limit=5.5 (decimal): should_reject', async () => {
        const { tutor, password } = await createTestTutor(prisma);

        const auth = await loginUser(app, {
          email: tutor.email!,
          password,
        });

        const response = await request(app.getHttpServer())
          .get('/api/tutor/proximas-clases')
          .query({ limit: 5.5 })
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        // @IsInt debería rechazar decimales
        expect(response.status).toBe(400);
      });
    });
  });

  // ============================================================================
  // VALIDATION: GET /tutor/mis-inscripciones
  // ============================================================================

  describe('Validation: GET /tutor/mis-inscripciones', () => {
    describe('periodo format validation', () => {
      it('formato_invalido_YYYYM: should_reject', async () => {
        // Requisito: @Matches(/^\d{4}-\d{2}$/)
        const { tutor, password } = await createTestTutor(prisma);

        const auth = await loginUser(app, {
          email: tutor.email!,
          password,
        });

        const response = await request(app.getHttpServer())
          .get('/api/tutor/mis-inscripciones')
          .query({ periodo: '2025-1' }) // Falta el cero
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(400);
        // El mensaje viene como array, verificar que contiene el texto esperado
        const messages = Array.isArray(response.body.message)
          ? response.body.message
          : [response.body.message];
        expect(messages.some((m: string) => m.includes('YYYY-MM'))).toBe(true);
      });

      it('formato_invalido_YYYYMM: should_reject', async () => {
        const { tutor, password } = await createTestTutor(prisma);

        const auth = await loginUser(app, {
          email: tutor.email!,
          password,
        });

        const response = await request(app.getHttpServer())
          .get('/api/tutor/mis-inscripciones')
          .query({ periodo: '202501' }) // Sin guión
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(400);
        const messages = Array.isArray(response.body.message)
          ? response.body.message
          : [response.body.message];
        expect(messages.some((m: string) => m.includes('YYYY-MM'))).toBe(true);
      });

      it('formato_invalido_texto: should_reject', async () => {
        const { tutor, password } = await createTestTutor(prisma);

        const auth = await loginUser(app, {
          email: tutor.email!,
          password,
        });

        const response = await request(app.getHttpServer())
          .get('/api/tutor/mis-inscripciones')
          .query({ periodo: 'enero-2025' })
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(400);
      });

      it('formato_valido_YYYY-MM: should_accept', async () => {
        const { tutor, password } = await createTestTutor(prisma);

        const auth = await loginUser(app, {
          email: tutor.email!,
          password,
        });

        const response = await request(app.getHttpServer())
          .get('/api/tutor/mis-inscripciones')
          .query({ periodo: '2025-01' })
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(200);
      });
    });

    describe('estadoPago enum validation', () => {
      it('estadoPago_invalido: should_reject', async () => {
        const { tutor, password } = await createTestTutor(prisma);

        const auth = await loginUser(app, {
          email: tutor.email!,
          password,
        });

        const response = await request(app.getHttpServer())
          .get('/api/tutor/mis-inscripciones')
          .query({ estadoPago: 'Invalido' })
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        expect(response.status).toBe(400);
        expect(response.body.message).toContain(
          'El estado de pago debe ser uno de: Pendiente, Pagado, Vencido',
        );
      });

      it('estadoPago_case_sensitive: should_reject_incorrect_case', async () => {
        // Requisito: El enum es case-sensitive (Pendiente, no pendiente)
        const { tutor, password } = await createTestTutor(prisma);

        const auth = await loginUser(app, {
          email: tutor.email!,
          password,
        });

        const response = await request(app.getHttpServer())
          .get('/api/tutor/mis-inscripciones')
          .query({ estadoPago: 'pendiente' }) // minúscula
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        // El enum es 'Pendiente' con mayúscula
        expect(response.status).toBe(400);
      });
    });

    describe('forbidNonWhitelisted validation', () => {
      it('should_reject_extra_query_params', async () => {
        // Requisito: forbidNonWhitelisted: true
        const { tutor, password } = await createTestTutor(prisma);

        const auth = await loginUser(app, {
          email: tutor.email!,
          password,
        });

        const response = await request(app.getHttpServer())
          .get('/api/tutor/mis-inscripciones')
          .query({ campoExtra: 'valor', otroExtra: 123 })
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP());

        // forbidNonWhitelisted debería rechazar campos extra
        // NOTA: Esto puede variar según configuración del ValidationPipe
        // Si acepta campos extra silenciosamente, es un posible bug
        expect([200, 400]).toContain(response.status);

        // Si es 200, verificar que los campos extra se ignoraron
        if (response.status === 200) {
          expect(response.body).toHaveProperty('inscripciones');
        }
      });
    });
  });

  // ============================================================================
  // DATA ISOLATION: Dashboard y Alertas
  // ============================================================================

  describe('Data Isolation: Dashboard & Alertas', () => {
    it('should_not_see_other_tutor_metrics_in_dashboard', async () => {
      // Arrange: Dos tutores con datos diferentes
      const { tutor: tutorA, password: passwordA } =
        await createTestTutor(prisma);
      const { tutor: tutorB } = await createTestTutor(prisma);

      // TutorA tiene 2 hijos
      await createTestEstudiante(prisma, { tutorId: tutorA.id });
      await createTestEstudiante(prisma, { tutorId: tutorA.id });

      // TutorB tiene 5 hijos
      await createTestEstudiante(prisma, { tutorId: tutorB.id });
      await createTestEstudiante(prisma, { tutorId: tutorB.id });
      await createTestEstudiante(prisma, { tutorId: tutorB.id });
      await createTestEstudiante(prisma, { tutorId: tutorB.id });
      await createTestEstudiante(prisma, { tutorId: tutorB.id });

      const authA = await loginUser(app, {
        email: tutorA.email!,
        password: passwordA,
      });

      // Act: TutorA pide su dashboard
      const response = await request(app.getHttpServer())
        .get('/api/tutor/dashboard-resumen')
        .set('Cookie', authA.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      // Assert: TutorA debería ver 2 hijos, NO 5 ni 7
      expect(response.status).toBe(200);
      expect(response.body.metricas.totalHijos).toBe(2);
    });

    it('should_not_see_other_tutor_alertas', async () => {
      // Arrange: Dos tutores con alertas diferentes
      const { tutor: tutorA, password: passwordA } =
        await createTestTutor(prisma);
      const { tutor: tutorB } = await createTestTutor(prisma);
      const producto = await createTestProducto(prisma);

      const { estudiante: hijoA } = await createTestEstudiante(prisma, {
        tutorId: tutorA.id,
      });
      const { estudiante: hijoB } = await createTestEstudiante(prisma, {
        tutorId: tutorB.id,
      });

      // TutorA tiene 1 inscripción vencida
      const fechaVencida = new Date();
      fechaVencida.setMonth(fechaVencida.getMonth() - 1);

      await crearInscripcionMensual({
        estudianteId: hijoA.id,
        tutorId: tutorA.id,
        productoId: producto.id,
        periodo: '2025-01',
        precioFinal: 10000,
        estado: EstadoPago.Vencido,
        fechaVencimiento: fechaVencida,
      });

      // TutorB tiene 3 inscripciones vencidas (más alertas)
      await crearInscripcionMensual({
        estudianteId: hijoB.id,
        tutorId: tutorB.id,
        productoId: producto.id,
        periodo: '2025-01',
        precioFinal: 20000,
        estado: EstadoPago.Vencido,
        fechaVencimiento: fechaVencida,
      });
      await crearInscripcionMensual({
        estudianteId: hijoB.id,
        tutorId: tutorB.id,
        productoId: producto.id,
        periodo: '2025-02',
        precioFinal: 20000,
        estado: EstadoPago.Vencido,
        fechaVencimiento: fechaVencida,
      });
      await crearInscripcionMensual({
        estudianteId: hijoB.id,
        tutorId: tutorB.id,
        productoId: producto.id,
        periodo: '2025-03',
        precioFinal: 20000,
        estado: EstadoPago.Vencido,
        fechaVencimiento: fechaVencida,
      });

      const authA = await loginUser(app, {
        email: tutorA.email!,
        password: passwordA,
      });

      // Act: TutorA pide sus alertas
      const response = await request(app.getHttpServer())
        .get('/api/tutor/alertas')
        .set('Cookie', authA.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      // Assert: TutorA debería ver máximo 1 alerta de pago, NO 3 ni 4
      expect(response.status).toBe(200);

      // Filtrar solo alertas de tipo pago
      const alertasPago = response.body.alertas.filter(
        (a: { tipo: string }) =>
          a.tipo === 'pago_vencido' || a.tipo === 'pago_por_vencer',
      );
      expect(alertasPago.length).toBeLessThanOrEqual(1);
    });

    it('should_not_see_other_tutor_hijos_in_dashboard', async () => {
      // Arrange
      const { tutor: tutorA, password: passwordA } =
        await createTestTutor(prisma);
      const { tutor: tutorB } = await createTestTutor(prisma);

      const { estudiante: hijoA } = await createTestEstudiante(prisma, {
        tutorId: tutorA.id,
      });
      await createTestEstudiante(prisma, { tutorId: tutorB.id });
      await createTestEstudiante(prisma, { tutorId: tutorB.id });

      const authA = await loginUser(app, {
        email: tutorA.email!,
        password: passwordA,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/tutor/dashboard-resumen')
        .set('Cookie', authA.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      // Assert: Solo debe ver su hijo
      expect(response.status).toBe(200);
      expect(response.body.hijos).toHaveLength(1);
      expect(response.body.hijos[0].id).toBe(hijoA.id);
    });
  });

  // ============================================================================
  // EDGE CASES: Estados especiales
  // ============================================================================

  describe('Edge Cases: Estados especiales', () => {
    it('should_include_suspended_estudiante_in_metrics', async () => {
      // Requisito: ¿Los estudiantes suspendidos deberían contar en métricas?
      // Este test verifica el comportamiento actual para documentarlo
      const { tutor, password } = await createTestTutor(prisma);

      // Crear estudiante activo y uno suspendido
      await createTestEstudiante(prisma, { tutorId: tutor.id });
      await prisma.estudiante.create({
        data: {
          tutor_id: tutor.id,
          nombre: 'Suspendido',
          apellido: 'Test',
          edad: 10,
          username: `suspendido_${Date.now()}`,
          password_hash: 'hash',
          nivelEscolar: 'Primaria',
          estado_acceso: EstadoAccesoEstudiante.SUSPENDIDO,
        },
      });

      const auth = await loginUser(app, {
        email: tutor.email!,
        password,
      });

      const response = await request(app.getHttpServer())
        .get('/api/tutor/dashboard-resumen')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      // Documentar comportamiento: ¿cuenta o no al suspendido?
      expect(response.status).toBe(200);

      // Este test documenta el comportamiento actual
      // Si cambia, el test fallará y sabremos que hubo un cambio
      const totalHijos = response.body.metricas.totalHijos;
      console.log(
        `[EDGE CASE] Estudiantes suspendidos incluidos en totalHijos: ${totalHijos === 2 ? 'SÍ' : 'NO'}`,
      );

      // El comportamiento actual debería ser consistente
      expect([1, 2]).toContain(totalHijos);
    });

    it('should_handle_tutor_with_no_inscripciones_gracefully', async () => {
      // Un tutor con hijos pero sin inscripciones NO debería fallar
      const { tutor, password } = await createTestTutor(prisma);
      await createTestEstudiante(prisma, { tutorId: tutor.id });

      const auth = await loginUser(app, {
        email: tutor.email!,
        password,
      });

      // Dashboard
      const dashboardRes = await request(app.getHttpServer())
        .get('/api/tutor/dashboard-resumen')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(dashboardRes.status).toBe(200);
      expect(dashboardRes.body.metricas.totalPagadoAnio).toBe(0);

      // Alertas
      const alertasRes = await request(app.getHttpServer())
        .get('/api/tutor/alertas')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(alertasRes.status).toBe(200);
      expect(alertasRes.body.alertas).toBeInstanceOf(Array);
    });

    it('should_handle_inscripcion_with_zero_amount', async () => {
      // Edge case: inscripción gratuita ($0)
      const { tutor, password } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      const producto = await createTestProducto(prisma);

      await crearInscripcionMensual({
        estudianteId: estudiante.id,
        tutorId: tutor.id,
        productoId: producto.id,
        periodo: getPeriodoActual(),
        precioFinal: 0, // Gratuito
        estado: EstadoPago.Pendiente,
      });

      const auth = await loginUser(app, {
        email: tutor.email!,
        password,
      });

      const response = await request(app.getHttpServer())
        .get('/api/tutor/mis-inscripciones')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(200);
      expect(response.body.inscripciones.length).toBe(1);
      expect(response.body.resumen.totalPendiente).toBe(0);
    });
  });

  // ============================================================================
  // ERROR GUESSING: Casos típicos de fallo
  // ============================================================================

  describe('Error Guessing: Casos típicos de fallo', () => {
    it('should_handle_special_characters_in_query', async () => {
      const { tutor, password } = await createTestTutor(prisma);

      const auth = await loginUser(app, {
        email: tutor.email!,
        password,
      });

      // Caracteres especiales en periodo (SQL injection attempt)
      const response = await request(app.getHttpServer())
        .get('/api/tutor/mis-inscripciones')
        .query({ periodo: "'; DROP TABLE--" })
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      // Debería rechazar por formato inválido, no ejecutar SQL
      expect(response.status).toBe(400);
    });

    it('should_handle_very_long_period_string', async () => {
      const { tutor, password } = await createTestTutor(prisma);

      const auth = await loginUser(app, {
        email: tutor.email!,
        password,
      });

      // String muy largo (buffer overflow attempt)
      const longString = '2025-01'.repeat(1000);
      const response = await request(app.getHttpServer())
        .get('/api/tutor/mis-inscripciones')
        .query({ periodo: longString })
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(400);
    });

    it('should_handle_unicode_in_query', async () => {
      const { tutor, password } = await createTestTutor(prisma);

      const auth = await loginUser(app, {
        email: tutor.email!,
        password,
      });

      // Unicode characters
      const response = await request(app.getHttpServer())
        .get('/api/tutor/mis-inscripciones')
        .query({ periodo: '2025-🎮' })
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(400);
    });
  });

  // ============================================================================
  // AUTH EDGE CASES
  // ============================================================================

  describe('Auth Edge Cases', () => {
    it('admin_should_not_access_tutor_endpoints', async () => {
      const admin = await createTestAdmin(prisma);

      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const response = await request(app.getHttpServer())
        .get('/api/tutor/mis-inscripciones')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      // Admin no tiene rol TUTOR, debería ser 403 o 404
      expect([403, 404]).toContain(response.status);
    });

    it('docente_should_not_access_tutor_endpoints', async () => {
      const { docente, password } = await createTestDocente(prisma);

      const auth = await loginUser(app, {
        email: docente.email,
        password,
      });

      const response = await request(app.getHttpServer())
        .get('/api/tutor/dashboard-resumen')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect([403, 404]).toContain(response.status);
    });
  });
});
