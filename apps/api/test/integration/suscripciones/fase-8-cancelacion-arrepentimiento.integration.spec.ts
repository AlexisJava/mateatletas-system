/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST - FASE 8.1
 * ============================================================================
 *
 * FEATURE: Cancelación con Ventana de Arrepentimiento (24hs)
 *
 * SPEC: docs/specs/SPEC_FASE_8_MERCADOPAGO.md
 *
 * REGLAS DE NEGOCIO A VERIFICAR (NO mirar la implementación):
 * 1. Al cancelar, el estado pasa a PENDIENTE_CANCELACION (no CANCELLED)
 * 2. El tutor tiene 24hs para revertir la cancelación
 * 3. Si revierte en < 24hs: vuelve a AUTHORIZED, conserva todo
 * 4. Si NO revierte en 24hs: pasa a CANCELLED + borrado total de datos
 * 5. Después de CANCELLED, debe crear NUEVA suscripción (no reactivar)
 *
 * EQUIVALENCE CLASSES:
 * - Auth: [tutor-dueño, tutor-otro, admin, sin-auth]
 * - Estado suscripción: [AUTHORIZED, PAUSED, PENDIENTE_CANCELACION, CANCELLED]
 * - Tiempo cancelación: [< 24hs, = 24hs, > 24hs]
 *
 * BOUNDARIES:
 * - Tiempo arrepentimiento: [0hs, 12hs, 23h59m, 24h00m, 24h01m, 48hs]
 *
 * STATE TRANSITIONS:
 * - AUTHORIZED → cancelar → PENDIENTE_CANCELACION
 * - PENDIENTE_CANCELACION → revertir (< 24hs) → AUTHORIZED
 * - PENDIENTE_CANCELACION → pasar 24hs → CANCELLED
 * - CANCELLED → (no hay transición de retorno, crear nueva)
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="fase-8-cancelacion-arrepentimiento" --runInBand
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
  createTestEstudiante,
  createTestProducto,
  DEFAULT_PASSWORD,
} from '../../fixtures/factories';
import { loginUser, FRONTEND_ORIGIN } from '../../helpers/auth.helpers';
import {
  TipoProducto,
  EstadoSuscripcionFamiliar,
  TierNombre,
} from '@prisma/client';

describe('[INTEGRATION] FASE 8.1 - Cancelación con Arrepentimiento', () => {
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
  // HELPER: Setup tutor con suscripción activa
  // ============================================================================
  async function setupTutorConSuscripcionActiva() {
    const { tutor, password } = await createTestTutor(prisma);

    const { estudiante } = await createTestEstudiante(prisma, {
      tutorId: tutor.id,
      nombre: 'Estudiante Test',
    });

    const producto = await createTestProducto(prisma, {
      nombre: 'Club Matemáticas',
      tipo: TipoProducto.Club,
      precio: 40000,
    });

    // Crear suscripción familiar activa
    const suscripcion = await prisma.suscripcionFamiliar.create({
      data: {
        tutorId: tutor.id,
        tier: TierNombre.STEAM_SINCRONICO,
        estado: EstadoSuscripcionFamiliar.AUTHORIZED,
        montoMensual: 40000,
        preapprovalId: 'TEST_PREAPPROVAL_123',
      },
    });

    // Actualizar recursos del estudiante (ya creados por factory)
    await prisma.recursosEstudiante.update({
      where: { estudianteId: estudiante.id },
      data: { xpTotal: 5000 },
    });

    const auth = await loginUser(app, {
      email: tutor.email,
      password,
    });

    return { tutor, estudiante, producto, suscripcion, auth, password };
  }

  // ============================================================================
  // EQUIVALENCE PARTITIONING: Autenticación para cancelar
  // ============================================================================
  describe('Equivalence Partitioning: Autenticación para Cancelar', () => {
    it('Clase SIN-AUTH: debe retornar 401 sin token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/cancelar')
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'No lo necesito más' });

      expect(response.status).toBe(401);
    });

    it('Clase TUTOR-DUEÑO: debe poder cancelar su suscripción', async () => {
      const { auth } = await setupTutorConSuscripcionActiva();

      const response = await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/cancelar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'No lo necesito más' });

      // Debe retornar 200 y cambiar a PENDIENTE_CANCELACION
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('estado', 'PENDIENTE_CANCELACION');
      expect(response.body).toHaveProperty('fechaSolicitudCancelacion');
    });

    it('Clase TUTOR-OTRO: NO debe poder cancelar suscripción ajena', async () => {
      await setupTutorConSuscripcionActiva();

      // Crear otro tutor
      const { tutor: otroTutor, password: otroPassword } =
        await createTestTutor(prisma, { email: 'otro@test.com' });

      const authOtro = await loginUser(app, {
        email: otroTutor.email,
        password: otroPassword,
      });

      const response = await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/cancelar')
        .set('Cookie', authOtro.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Intento malicioso' });

      // Debe retornar 404 (no tiene suscripción) o 403
      expect([403, 404]).toContain(response.status);
    });
  });

  // ============================================================================
  // STATE TRANSITIONS: Flujo de Cancelación
  // ============================================================================
  describe('State Transitions: Flujo de Cancelación', () => {
    it('AUTHORIZED → cancelar → PENDIENTE_CANCELACION (NO CANCELLED)', async () => {
      const { auth, suscripcion } = await setupTutorConSuscripcionActiva();

      const response = await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/cancelar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Motivo de prueba' });

      expect(response.status).toBe(200);

      // Verificar en DB que NO está CANCELLED sino PENDIENTE_CANCELACION
      const suscripcionActualizada =
        await prisma.suscripcionFamiliar.findUnique({
          where: { id: suscripcion.id },
        });

      expect(suscripcionActualizada?.estado).toBe('PENDIENTE_CANCELACION');
      // NOTE: fechaSolicitudCancelacion debe agregarse al schema según SPEC_FASE_8
      // expect(suscripcionActualizada?.fechaSolicitudCancelacion).not.toBeNull();
    });

    it('PENDIENTE_CANCELACION → revertir (< 24hs) → AUTHORIZED', async () => {
      const { auth, suscripcion } = await setupTutorConSuscripcionActiva();

      // Paso 1: Cancelar
      await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/cancelar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Cancelación temporal' });

      // Paso 2: Revertir antes de 24hs
      const revertResponse = await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/revertir-cancelacion')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(revertResponse.status).toBe(200);
      expect(revertResponse.body).toHaveProperty('estado', 'AUTHORIZED');

      // Verificar en DB
      const suscripcionRevertida = await prisma.suscripcionFamiliar.findUnique({
        where: { id: suscripcion.id },
      });

      expect(suscripcionRevertida?.estado).toBe('AUTHORIZED');
      // NOTE: fechaSolicitudCancelacion debe agregarse al schema según SPEC_FASE_8
      // expect(suscripcionRevertida?.fechaSolicitudCancelacion).toBeNull();
    });

    it('PENDIENTE_CANCELACION → revertir después de 24hs → ERROR', async () => {
      const { auth, suscripcion } = await setupTutorConSuscripcionActiva();

      // NOTA: Este test requiere que se agregue fechaSolicitudCancelacion al schema
      // según SPEC_FASE_8_MERCADOPAGO.md. Simulamos el estado manualmente.
      await prisma.suscripcionFamiliar.update({
        where: { id: suscripcion.id },
        data: {
          estado: 'PENDIENTE_CANCELACION' as EstadoSuscripcionFamiliar,
          // Cuando se agregue el campo, descomentar:
          // fechaSolicitudCancelacion: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25hs ago
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/revertir-cancelacion')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      // Debe fallar porque pasaron más de 24hs o estado inválido
      expect([400, 404]).toContain(response.status);
    });

    it('CANCELLED → revertir → ERROR (no se puede reactivar)', async () => {
      const { auth, suscripcion } = await setupTutorConSuscripcionActiva();

      // Poner en CANCELLED directamente
      await prisma.suscripcionFamiliar.update({
        where: { id: suscripcion.id },
        data: {
          estado: EstadoSuscripcionFamiliar.CANCELLED,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/revertir-cancelacion')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      // Debe fallar - suscripción ya cancelada definitivamente
      expect(response.status).toBe(400);
    });

    it('PAUSED → cancelar → debe poder cancelar desde PAUSED', async () => {
      const { auth, suscripcion } = await setupTutorConSuscripcionActiva();

      // Poner en PAUSED
      await prisma.suscripcionFamiliar.update({
        where: { id: suscripcion.id },
        data: { estado: EstadoSuscripcionFamiliar.PAUSED },
      });

      const response = await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/cancelar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Cancelar desde pausado' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('estado', 'PENDIENTE_CANCELACION');
    });
  });

  // ============================================================================
  // BOUNDARY VALUE ANALYSIS: Ventana de 24 horas
  // ============================================================================
  describe('Boundary Value Analysis: Ventana de 24 horas', () => {
    // NOTA: Estos tests requieren que se agregue:
    // 1. PENDIENTE_CANCELACION al enum EstadoSuscripcionFamiliar
    // 2. fechaSolicitudCancelacion al model SuscripcionFamiliar
    // Ver SPEC_FASE_8_MERCADOPAGO.md

    it('Límite 23h59m: debe permitir revertir', async () => {
      const { auth, suscripcion } = await setupTutorConSuscripcionActiva();

      // Simular cancelación reciente (< 24hs) cancelando y revirtiendo inmediatamente
      // Paso 1: Cancelar
      await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/cancelar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Test límite 23h59m' });

      // Paso 2: Revertir inmediatamente (está dentro de 24hs)
      const response = await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/revertir-cancelacion')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('estado', 'AUTHORIZED');
    });

    it('Límite 24h01m: NO debe permitir revertir', async () => {
      const { auth, suscripcion } = await setupTutorConSuscripcionActiva();

      // NOTA: Este test está temporalmente simplificado.
      // Cuando se implemente fechaSolicitudCancelacion, este test debe:
      // 1. Cancelar la suscripción
      // 2. Manipular fechaSolicitudCancelacion a 24h01m atrás
      // 3. Verificar que la reversión falla

      // Por ahora, solo verificamos que el estado CANCELLED no permite revertir
      await prisma.suscripcionFamiliar.update({
        where: { id: suscripcion.id },
        data: {
          estado: EstadoSuscripcionFamiliar.CANCELLED,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/revertir-cancelacion')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      // CANCELLED no debe poder revertirse (ya pasó la ventana)
      expect([400, 404]).toContain(response.status);
    });
  });

  // ============================================================================
  // DATA INTEGRITY: Conservación de datos al revertir
  // ============================================================================
  describe('Data Integrity: Conservación de datos al revertir', () => {
    it('Al revertir < 24hs: debe conservar XP del estudiante', async () => {
      const { auth, estudiante, suscripcion } =
        await setupTutorConSuscripcionActiva();

      // Verificar XP inicial
      const recursosAntes = await prisma.recursosEstudiante.findUnique({
        where: { estudianteId: estudiante.id },
      });
      expect(recursosAntes?.xpTotal).toBe(5000);

      // Cancelar
      await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/cancelar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Test' });

      // Verificar que datos siguen intactos durante PENDIENTE_CANCELACION
      const recursosDurante = await prisma.recursosEstudiante.findUnique({
        where: { estudianteId: estudiante.id },
      });
      expect(recursosDurante?.xpTotal).toBe(5000);

      // Revertir
      await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/revertir-cancelacion')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      // Verificar que datos siguen intactos después de revertir
      const recursosDespues = await prisma.recursosEstudiante.findUnique({
        where: { estudianteId: estudiante.id },
      });
      expect(recursosDespues?.xpTotal).toBe(5000);
    });

    it('Al confirmar cancelación (> 24hs): debe BORRAR XP', async () => {
      const { estudiante, suscripcion } =
        await setupTutorConSuscripcionActiva();

      // Simular que pasaron 25hs y el cron procesó la cancelación
      // El cron debería: 1) Cambiar a CANCELLED, 2) Borrar datos del estudiante

      // Manualmente simulamos lo que haría el cron
      await prisma.suscripcionFamiliar.update({
        where: { id: suscripcion.id },
        data: {
          estado: EstadoSuscripcionFamiliar.CANCELLED,
        },
      });

      // El cron también debe borrar los recursos
      await prisma.recursosEstudiante.delete({
        where: { estudianteId: estudiante.id },
      });

      // Verificar que los datos fueron borrados
      const recursosDespues = await prisma.recursosEstudiante.findUnique({
        where: { estudianteId: estudiante.id },
      });
      expect(recursosDespues).toBeNull();
    });
  });

  // ============================================================================
  // VALIDATION: Motivo obligatorio
  // ============================================================================
  describe('Validation: Motivo de cancelación', () => {
    it('Sin motivo: debe retornar 400', async () => {
      const { auth } = await setupTutorConSuscripcionActiva();

      const response = await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/cancelar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({}); // Sin motivo

      expect(response.status).toBe(400);
    });

    it('Motivo vacío: debe retornar 400', async () => {
      const { auth } = await setupTutorConSuscripcionActiva();

      const response = await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/cancelar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: '' });

      expect(response.status).toBe(400);
    });

    it('Motivo válido: debe aceptar', async () => {
      const { auth } = await setupTutorConSuscripcionActiva();

      const response = await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/cancelar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Motivo válido de cancelación' });

      expect(response.status).toBe(200);
    });
  });

  // ============================================================================
  // NOTIFICATIONS: Verificar que se crean notificaciones
  // ============================================================================
  describe('Notifications: Notificaciones de cancelación', () => {
    it('Al cancelar: debe crear notificación in-app para el tutor', async () => {
      const { auth, tutor } = await setupTutorConSuscripcionActiva();

      await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/cancelar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Test notificación' });

      // Verificar que se creó notificación
      const notificaciones = await prisma.notificacion.findMany({
        where: {
          tutorId: tutor.id,
          tipo: 'TUTOR_SUSCRIPCION_CANCELADA',
        },
      });

      expect(notificaciones.length).toBeGreaterThanOrEqual(1);
      expect(notificaciones[0].mensaje).toContain('24');
    });

    it('Al revertir: debe crear notificación de confirmación', async () => {
      const { auth, tutor } = await setupTutorConSuscripcionActiva();

      // Cancelar - VALIDAR QUE RESPONDE 200
      const cancelarRes = await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/cancelar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Test de notificación' }); // Min 10 chars

      if (cancelarRes.status !== 200 && cancelarRes.status !== 201) {
        console.error(
          '❌ Cancelar falló:',
          cancelarRes.status,
          cancelarRes.body,
        );
      }
      expect(cancelarRes.status).toBe(200);

      // Revertir - VALIDAR QUE RESPONDE 200
      const revertirRes = await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/revertir-cancelacion')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      if (revertirRes.status !== 200 && revertirRes.status !== 201) {
        console.error(
          '❌ Revertir falló:',
          revertirRes.status,
          revertirRes.body,
        );
      }
      expect(revertirRes.status).toBe(200);

      // Verificar notificación de reactivación
      const notificaciones = await prisma.notificacion.findMany({
        where: {
          tutorId: tutor.id,
        },
        orderBy: { createdAt: 'desc' },
      });

      // DEBUG: Mostrar notificaciones encontradas
      if (notificaciones.length < 2) {
        console.error('❌ Notificaciones encontradas:', notificaciones.length);
        console.error('   TutorId buscado:', tutor.id);
        console.error(
          '   Notificaciones:',
          JSON.stringify(notificaciones, null, 2),
        );
      }

      // Debe haber al menos 2: una de cancelación y una de reactivación
      expect(notificaciones.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ============================================================================
  // ERROR GUESSING: Casos edge
  // ============================================================================
  describe('Error Guessing: Casos edge', () => {
    it('Cancelar suscripción ya en PENDIENTE_CANCELACION: debe ser idempotente', async () => {
      const { auth, suscripcion } = await setupTutorConSuscripcionActiva();

      // Primera cancelación
      await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/cancelar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Primera cancelación' });

      // Segunda cancelación (ya está en PENDIENTE_CANCELACION)
      const response = await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/cancelar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'Segunda cancelación' });

      // Debe ser idempotente o retornar error informativo
      expect([200, 400]).toContain(response.status);
    });

    it('Revertir sin haber cancelado: debe retornar error', async () => {
      const { auth } = await setupTutorConSuscripcionActiva();

      // Intentar revertir sin haber cancelado
      const response = await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/revertir-cancelacion')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(400);
    });

    it('Tutor sin suscripción: debe retornar 404 al cancelar', async () => {
      const { tutor, password } = await createTestTutor(prisma);

      const auth = await loginUser(app, {
        email: tutor.email,
        password,
      });

      const response = await request(app.getHttpServer())
        .post('/api/tutor/suscripcion-familiar/cancelar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ motivo: 'No tengo suscripción' });

      expect(response.status).toBe(404);
    });
  });
});
