/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST - FASE 8.2
 * ============================================================================
 *
 * FEATURE: Emails de Grace Period (Pago Fallido)
 *
 * SPEC: docs/specs/SPEC_FASE_8_MERCADOPAGO.md
 *
 * REGLAS DE NEGOCIO A VERIFICAR (NO mirar la implementación):
 * 1. Cuando un pago falla, la suscripción pasa a PAUSED con fechaGracia (3 días)
 * 2. Día 0 (webhook): Email 1 "Tu pago falló, tenés 3 días"
 * 3. Día 1 (cron 09:00): Email 2 "Te quedan 2 días"
 * 4. Día 2 (cron 09:00): Email 3 "ÚLTIMO DÍA"
 * 5. Día 3 (cron 00:05): fechaGracia expiró → PENDIENTE_CANCELACION + email "24hs para pagar"
 * 6. No enviar emails duplicados (rastreo via metadata en notificaciones)
 * 7. Solo procesar suscripciones de tutores con email configurado
 *
 * EQUIVALENCE CLASSES:
 * - Estado suscripción: [PAUSED+fechaGracia, PAUSED sin fechaGracia, AUTHORIZED, CANCELLED]
 * - Días restantes: [3 días (día 0), 2 días (día 1), 1 día (día 2), 0 o menos (expirado)]
 * - Tutor con email: [tiene email, no tiene email]
 *
 * BOUNDARIES:
 * - fechaGracia: [ahora +3 días, ahora +2 días, ahora +1 día, ahora, ahora -1 segundo]
 *
 * STATE TRANSITIONS:
 * - PAUSED (fechaGracia válida) → cron diario → envía email según día
 * - PAUSED (fechaGracia expirada) → cron 00:05 → PENDIENTE_CANCELACION
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="fase-8-2-grace-period-emails" --runInBand
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/core/database/prisma.service';
import { EmailService } from '../../../src/email/email.service';
import { GracePeriodEmailCronService } from '../../../src/suscripciones/services/grace-period-email-cron.service';
import { GracePeriodExpiredCronService } from '../../../src/suscripciones/services/grace-period-expired-cron.service';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import {
  createTestTutor,
  createTestEstudiante,
} from '../../fixtures/factories';
import {
  EstadoSuscripcionFamiliar,
  TierNombre,
  TipoNotificacion,
} from '@prisma/client';

describe('[INTEGRATION] FASE 8.2 - Grace Period Emails', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let emailService: EmailService;
  let gracePeriodEmailCron: GracePeriodEmailCronService;
  let gracePeriodExpiredCron: GracePeriodExpiredCronService;

  // Spies para verificar que se enviaron emails
  let sendGracePeriodDay2Spy: jest.SpyInstance;
  let sendGracePeriodDay3Spy: jest.SpyInstance;
  let sendEmailSpy: jest.SpyInstance;

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
    emailService = app.get<EmailService>(EmailService);
    gracePeriodEmailCron = app.get<GracePeriodEmailCronService>(
      GracePeriodEmailCronService,
    );
    gracePeriodExpiredCron = app.get<GracePeriodExpiredCronService>(
      GracePeriodExpiredCronService,
    );

    await app.init();
  }, 60000);

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  }, 30000);

  beforeEach(async () => {
    await cleanAllTestTables(prisma);

    // Mockear métodos de email para no enviar emails reales
    sendGracePeriodDay2Spy = jest
      .spyOn(emailService, 'sendGracePeriodDay2Email')
      .mockResolvedValue(true);
    sendGracePeriodDay3Spy = jest
      .spyOn(emailService, 'sendGracePeriodDay3Email')
      .mockResolvedValue(true);
    sendEmailSpy = jest
      .spyOn(emailService, 'sendEmail')
      .mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================================================
  // HELPER: Setup tutor con suscripción en grace period
  // ============================================================================
  async function setupTutorEnGracePeriod(diasRestantes: number) {
    const { tutor, password } = await createTestTutor(prisma);

    const { estudiante } = await createTestEstudiante(prisma, {
      tutorId: tutor.id,
      nombre: 'Estudiante Test',
    });

    // Calcular fechaGracia: ahora + diasRestantes días
    const fechaGracia = new Date();
    fechaGracia.setDate(fechaGracia.getDate() + diasRestantes);

    // Crear suscripción en PAUSED con fechaGracia
    const suscripcion = await prisma.suscripcionFamiliar.create({
      data: {
        tutorId: tutor.id,
        tier: TierNombre.STEAM_SINCRONICO,
        estado: EstadoSuscripcionFamiliar.PAUSED,
        montoMensual: 40000,
        preapprovalId: `TEST_PREAPPROVAL_${Date.now()}`,
        fechaGracia,
      },
    });

    return { tutor, estudiante, suscripcion, password, fechaGracia };
  }

  // ============================================================================
  // GracePeriodEmailCronService Tests
  // ============================================================================
  describe('GracePeriodEmailCronService', () => {
    describe('Equivalence Partitioning: Estado de suscripción', () => {
      it('Clase PAUSED+fechaGracia: debe procesar suscripciones en grace period', async () => {
        // 2 días restantes = día 1 del grace period → debe enviar Email 2
        await setupTutorEnGracePeriod(2);

        await gracePeriodEmailCron.handleGracePeriodEmails();

        // Debe haber intentado enviar email día 2
        expect(sendGracePeriodDay2Spy).toHaveBeenCalledTimes(1);
      });

      it('Clase PAUSED sin fechaGracia: NO debe procesar', async () => {
        const { tutor } = await createTestTutor(prisma);

        await createTestEstudiante(prisma, {
          tutorId: tutor.id,
          nombre: 'Estudiante Test',
        });

        // Suscripción PAUSED pero SIN fechaGracia
        await prisma.suscripcionFamiliar.create({
          data: {
            tutorId: tutor.id,
            tier: TierNombre.STEAM_SINCRONICO,
            estado: EstadoSuscripcionFamiliar.PAUSED,
            montoMensual: 40000,
            fechaGracia: null, // Sin fecha de gracia
          },
        });

        await gracePeriodEmailCron.handleGracePeriodEmails();

        // No debe enviar ningún email
        expect(sendGracePeriodDay2Spy).not.toHaveBeenCalled();
        expect(sendGracePeriodDay3Spy).not.toHaveBeenCalled();
      });

      it('Clase AUTHORIZED: NO debe procesar', async () => {
        const { tutor } = await createTestTutor(prisma);

        await createTestEstudiante(prisma, {
          tutorId: tutor.id,
          nombre: 'Estudiante Test',
        });

        // Suscripción AUTHORIZED (no en grace period)
        await prisma.suscripcionFamiliar.create({
          data: {
            tutorId: tutor.id,
            tier: TierNombre.STEAM_SINCRONICO,
            estado: EstadoSuscripcionFamiliar.AUTHORIZED,
            montoMensual: 40000,
          },
        });

        await gracePeriodEmailCron.handleGracePeriodEmails();

        expect(sendGracePeriodDay2Spy).not.toHaveBeenCalled();
        expect(sendGracePeriodDay3Spy).not.toHaveBeenCalled();
      });
    });

    describe('Boundary Value Analysis: Días restantes', () => {
      it('3 días restantes (día 0): NO debe enviar email (webhook ya lo envió)', async () => {
        await setupTutorEnGracePeriod(3);

        await gracePeriodEmailCron.handleGracePeriodEmails();

        // Día 0 = email 1, que se envía en el webhook, no en este cron
        expect(sendGracePeriodDay2Spy).not.toHaveBeenCalled();
        expect(sendGracePeriodDay3Spy).not.toHaveBeenCalled();
      });

      it('2 días restantes (día 1): debe enviar Email 2', async () => {
        const { tutor } = await setupTutorEnGracePeriod(2);

        await gracePeriodEmailCron.handleGracePeriodEmails();

        expect(sendGracePeriodDay2Spy).toHaveBeenCalledTimes(1);
        expect(sendGracePeriodDay2Spy).toHaveBeenCalledWith(
          tutor.email,
          expect.any(String),
          expect.any(Array),
          expect.any(String),
        );
      });

      it('1 día restante (día 2): debe enviar Email 3 (ÚLTIMO DÍA)', async () => {
        const { tutor } = await setupTutorEnGracePeriod(1);

        await gracePeriodEmailCron.handleGracePeriodEmails();

        expect(sendGracePeriodDay3Spy).toHaveBeenCalledTimes(1);
        expect(sendGracePeriodDay3Spy).toHaveBeenCalledWith(
          tutor.email,
          expect.any(String),
          expect.any(Array),
          expect.any(String),
        );
      });

      it('0 días restantes: NO debe enviar email (el otro cron lo maneja)', async () => {
        // fechaGracia = hoy, ya expiró → GracePeriodExpiredCron lo maneja
        await setupTutorEnGracePeriod(0);

        await gracePeriodEmailCron.handleGracePeriodEmails();

        expect(sendGracePeriodDay2Spy).not.toHaveBeenCalled();
        expect(sendGracePeriodDay3Spy).not.toHaveBeenCalled();
      });
    });

    describe('Idempotencia: No enviar emails duplicados', () => {
      it('NO debe enviar email si ya se envió para ese día', async () => {
        const { tutor, suscripcion } = await setupTutorEnGracePeriod(2);

        // Simular que ya se envió email día 1 creando notificación con metadata
        await prisma.notificacion.create({
          data: {
            tutorId: tutor.id,
            tipo: TipoNotificacion.TUTOR_SUSCRIPCION_PROXIMA_VENCER,
            titulo: 'Test notificación previa',
            mensaje: 'Ya enviado',
            metadata: {
              suscripcionId: suscripcion.id,
              gracePeriodEmailDay: 1, // Ya se envió día 1
            },
          },
        });

        await gracePeriodEmailCron.handleGracePeriodEmails();

        // No debe enviar porque ya se envió
        expect(sendGracePeriodDay2Spy).not.toHaveBeenCalled();
      });

      it('SÍ debe enviar email si es un día diferente', async () => {
        const { tutor, suscripcion } = await setupTutorEnGracePeriod(1);

        // Simular que ya se envió email día 1 pero ahora estamos en día 2
        await prisma.notificacion.create({
          data: {
            tutorId: tutor.id,
            tipo: TipoNotificacion.TUTOR_SUSCRIPCION_PROXIMA_VENCER,
            titulo: 'Test notificación previa',
            mensaje: 'Ya enviado día 1',
            metadata: {
              suscripcionId: suscripcion.id,
              gracePeriodEmailDay: 1, // Ya se envió día 1
            },
          },
        });

        await gracePeriodEmailCron.handleGracePeriodEmails();

        // Debe enviar día 2 porque no se ha enviado
        expect(sendGracePeriodDay3Spy).toHaveBeenCalledTimes(1);
      });
    });

    describe('Notificaciones: Crear notificación in-app', () => {
      it('Debe crear notificación al enviar email día 1', async () => {
        const { tutor, suscripcion } = await setupTutorEnGracePeriod(2);

        await gracePeriodEmailCron.handleGracePeriodEmails();

        // Verificar que se creó notificación
        const notificaciones = await prisma.notificacion.findMany({
          where: {
            tutorId: tutor.id,
            tipo: TipoNotificacion.TUTOR_SUSCRIPCION_PROXIMA_VENCER,
          },
        });

        expect(notificaciones.length).toBe(1);
        expect(notificaciones[0].metadata).toMatchObject({
          suscripcionId: suscripcion.id,
          gracePeriodEmailDay: 1,
          emailEnviado: true,
        });
      });

      it('Debe crear notificación con prioridad CRITICA para día 2', async () => {
        const { tutor } = await setupTutorEnGracePeriod(1);

        await gracePeriodEmailCron.handleGracePeriodEmails();

        const notificaciones = await prisma.notificacion.findMany({
          where: {
            tutorId: tutor.id,
            tipo: TipoNotificacion.TUTOR_SUSCRIPCION_PROXIMA_VENCER,
          },
        });

        expect(notificaciones.length).toBe(1);
        expect(notificaciones[0].prioridad).toBe('CRITICA');
      });
    });

    describe('Edge Cases: Tutor sin email', () => {
      it('NO debe procesar tutores sin email configurado', async () => {
        // Crear tutor sin email
        const tutor = await prisma.tutor.create({
          data: {
            nombre: 'Tutor Sin Email',
            apellido: 'Test',
            email: null, // Sin email
            passwordHash: 'hash123',
          },
        });

        await prisma.estudiante.create({
          data: {
            tutorId: tutor.id,
            nombre: 'Estudiante',
            apellido: 'Test',
            username: `est_${Date.now()}`,
            nivelEscolar: 'Primaria',
            edad: 10,
            passwordHash: 'hash123',
          },
        });

        // Crear suscripción
        await prisma.suscripcionFamiliar.create({
          data: {
            tutorId: tutor.id,
            tier: TierNombre.STEAM_SINCRONICO,
            estado: EstadoSuscripcionFamiliar.PAUSED,
            montoMensual: 40000,
            fechaGracia: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          },
        });

        await gracePeriodEmailCron.handleGracePeriodEmails();

        // No debe enviar email porque tutor no tiene email
        expect(sendGracePeriodDay2Spy).not.toHaveBeenCalled();
        expect(sendGracePeriodDay3Spy).not.toHaveBeenCalled();
      });
    });
  });

  // ============================================================================
  // GracePeriodExpiredCronService Tests
  // ============================================================================
  describe('GracePeriodExpiredCronService', () => {
    describe('State Transitions: Grace period expirado', () => {
      it('PAUSED (fechaGracia expirada) → PENDIENTE_CANCELACION', async () => {
        // Crear suscripción con fechaGracia en el pasado
        const { tutor } = await createTestTutor(prisma);

        await createTestEstudiante(prisma, {
          tutorId: tutor.id,
          nombre: 'Estudiante Test',
        });

        const fechaGraciaExpirada = new Date();
        fechaGraciaExpirada.setHours(fechaGraciaExpirada.getHours() - 1); // 1 hora atrás

        const suscripcion = await prisma.suscripcionFamiliar.create({
          data: {
            tutorId: tutor.id,
            tier: TierNombre.STEAM_SINCRONICO,
            estado: EstadoSuscripcionFamiliar.PAUSED,
            montoMensual: 40000,
            fechaGracia: fechaGraciaExpirada,
          },
        });

        await gracePeriodExpiredCron.handleGracePeriodExpired();

        // Verificar transición de estado
        const suscripcionActualizada =
          await prisma.suscripcionFamiliar.findUnique({
            where: { id: suscripcion.id },
          });

        expect(suscripcionActualizada?.estado).toBe('PENDIENTE_CANCELACION');
        expect(
          suscripcionActualizada?.fechaSolicitudCancelacion,
        ).not.toBeNull();
        expect(suscripcionActualizada?.motivoCancelacion).toContain(
          'Grace period expirado',
        );
        expect(suscripcionActualizada?.fechaGracia).toBeNull(); // Se limpia
      });

      it('PAUSED (fechaGracia futura) → NO cambia estado', async () => {
        // fechaGracia en el futuro, aún no expiró
        const { suscripcion } = await setupTutorEnGracePeriod(2);

        await gracePeriodExpiredCron.handleGracePeriodExpired();

        const suscripcionActualizada =
          await prisma.suscripcionFamiliar.findUnique({
            where: { id: suscripcion.id },
          });

        expect(suscripcionActualizada?.estado).toBe('PAUSED');
      });
    });

    describe('Email y Notificación al expirar', () => {
      it('Debe enviar email informando 24hs de arrepentimiento', async () => {
        const { tutor } = await createTestTutor(prisma);

        await createTestEstudiante(prisma, {
          tutorId: tutor.id,
          nombre: 'Estudiante Test',
        });

        const fechaGraciaExpirada = new Date();
        fechaGraciaExpirada.setHours(fechaGraciaExpirada.getHours() - 1);

        await prisma.suscripcionFamiliar.create({
          data: {
            tutorId: tutor.id,
            tier: TierNombre.STEAM_SINCRONICO,
            estado: EstadoSuscripcionFamiliar.PAUSED,
            montoMensual: 40000,
            fechaGracia: fechaGraciaExpirada,
          },
        });

        await gracePeriodExpiredCron.handleGracePeriodExpired();

        // Debe haber enviado email
        expect(sendEmailSpy).toHaveBeenCalledTimes(1);
        expect(sendEmailSpy).toHaveBeenCalledWith(
          tutor.email,
          expect.stringContaining('período de gracia expiró'),
          expect.any(String),
          expect.any(String),
        );
      });

      it('Debe crear notificación CRITICA al expirar', async () => {
        const { tutor } = await createTestTutor(prisma);

        await createTestEstudiante(prisma, {
          tutorId: tutor.id,
          nombre: 'Estudiante Test',
        });

        const fechaGraciaExpirada = new Date();
        fechaGraciaExpirada.setHours(fechaGraciaExpirada.getHours() - 1);

        await prisma.suscripcionFamiliar.create({
          data: {
            tutorId: tutor.id,
            tier: TierNombre.STEAM_SINCRONICO,
            estado: EstadoSuscripcionFamiliar.PAUSED,
            montoMensual: 40000,
            fechaGracia: fechaGraciaExpirada,
          },
        });

        await gracePeriodExpiredCron.handleGracePeriodExpired();

        const notificaciones = await prisma.notificacion.findMany({
          where: {
            tutorId: tutor.id,
            tipo: TipoNotificacion.TUTOR_SUSCRIPCION_CANCELADA,
          },
        });

        expect(notificaciones.length).toBe(1);
        expect(notificaciones[0].prioridad).toBe('CRITICA');
        expect(notificaciones[0].mensaje).toContain('24 horas');
      });
    });

    describe('Edge Cases: Múltiples suscripciones expiradas', () => {
      it('Debe procesar todas las suscripciones expiradas', async () => {
        // Crear 3 tutores con suscripciones expiradas
        for (let i = 0; i < 3; i++) {
          const { tutor } = await createTestTutor(prisma, {
            email: `tutor${i}@test.com`,
          });

          await createTestEstudiante(prisma, {
            tutorId: tutor.id,
            nombre: `Estudiante ${i}`,
          });

          const fechaExpirada = new Date();
          fechaExpirada.setHours(fechaExpirada.getHours() - 1);

          await prisma.suscripcionFamiliar.create({
            data: {
              tutorId: tutor.id,
              tier: TierNombre.STEAM_SINCRONICO,
              estado: EstadoSuscripcionFamiliar.PAUSED,
              montoMensual: 40000,
              fechaGracia: fechaExpirada,
            },
          });
        }

        await gracePeriodExpiredCron.handleGracePeriodExpired();

        // Verificar que todas pasaron a PENDIENTE_CANCELACION
        const suscripcionesPendientes =
          await prisma.suscripcionFamiliar.findMany({
            where: { estado: 'PENDIENTE_CANCELACION' },
          });

        expect(suscripcionesPendientes.length).toBe(3);

        // Verificar que se enviaron 3 emails
        expect(sendEmailSpy).toHaveBeenCalledTimes(3);
      });
    });

    describe('Edge Cases: Tutor sin email', () => {
      it('NO debe procesar tutores sin email', async () => {
        // Crear tutor sin email
        const tutor = await prisma.tutor.create({
          data: {
            nombre: 'Tutor Sin Email',
            apellido: 'Test',
            email: null,
            passwordHash: 'hash123',
          },
        });

        await prisma.estudiante.create({
          data: {
            tutorId: tutor.id,
            nombre: 'Estudiante',
            apellido: 'Test',
            username: `est_expired_${Date.now()}`,
            nivelEscolar: 'Primaria',
            edad: 10,
            passwordHash: 'hash123',
          },
        });

        const fechaExpirada = new Date();
        fechaExpirada.setHours(fechaExpirada.getHours() - 1);

        const suscripcion = await prisma.suscripcionFamiliar.create({
          data: {
            tutorId: tutor.id,
            tier: TierNombre.STEAM_SINCRONICO,
            estado: EstadoSuscripcionFamiliar.PAUSED,
            montoMensual: 40000,
            fechaGracia: fechaExpirada,
          },
        });

        await gracePeriodExpiredCron.handleGracePeriodExpired();

        // No debe enviar email
        expect(sendEmailSpy).not.toHaveBeenCalled();

        // La suscripción NO debe cambiar de estado (se filtró en la query)
        const suscripcionActualizada =
          await prisma.suscripcionFamiliar.findUnique({
            where: { id: suscripcion.id },
          });

        expect(suscripcionActualizada?.estado).toBe('PAUSED');
      });
    });
  });

  // ============================================================================
  // Integración: Flujo completo de grace period
  // ============================================================================
  describe('Flujo Completo: Grace Period → PENDIENTE_CANCELACION', () => {
    it('Día 1: envía email 2, Día 2: envía email 3, Día 3: transiciona', async () => {
      const { tutor, suscripcion } = await setupTutorEnGracePeriod(2);

      // Día 1: 2 días restantes → Email 2
      await gracePeriodEmailCron.handleGracePeriodEmails();
      expect(sendGracePeriodDay2Spy).toHaveBeenCalledTimes(1);

      // Simular que pasó un día: actualizar fechaGracia a 1 día restante
      await prisma.suscripcionFamiliar.update({
        where: { id: suscripcion.id },
        data: {
          fechaGracia: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        },
      });

      // Día 2: 1 día restante → Email 3
      await gracePeriodEmailCron.handleGracePeriodEmails();
      expect(sendGracePeriodDay3Spy).toHaveBeenCalledTimes(1);

      // Simular que pasó otro día: fechaGracia expiró
      await prisma.suscripcionFamiliar.update({
        where: { id: suscripcion.id },
        data: {
          fechaGracia: new Date(Date.now() - 1000), // 1 segundo en el pasado
        },
      });

      // Limpiar notificaciones anteriores para poder procesar
      await prisma.notificacion.deleteMany({
        where: { tutorId: tutor.id },
      });

      // Día 3: expirado → PENDIENTE_CANCELACION
      await gracePeriodExpiredCron.handleGracePeriodExpired();

      const suscripcionFinal = await prisma.suscripcionFamiliar.findUnique({
        where: { id: suscripcion.id },
      });

      expect(suscripcionFinal?.estado).toBe('PENDIENTE_CANCELACION');
    });
  });
});
