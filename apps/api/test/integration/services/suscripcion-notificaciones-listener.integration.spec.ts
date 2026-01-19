/**
 * ============================================================================
 * INTEGRATION TESTS - SuscripcionNotificacionesListener
 * ============================================================================
 *
 * Tests de integración BLACK BOX contra PostgreSQL de test.
 *
 * REQUISITOS BAJO TEST:
 * El listener escucha eventos de suscripción y crea notificaciones automáticas:
 *
 * 1. suscripcion.creada → Notifica al tutor sobre nueva suscripción
 * 2. suscripcion.activada → Notifica activación (primer pago)
 * 3. suscripcion.cancelada → Notifica cancelación con motivo
 * 4. suscripcion.en_gracia → Notifica período de gracia (prioridad ALTA)
 * 5. suscripcion.morosa → Notifica estado moroso (prioridad CRITICA)
 * 6. suscripcion.pago_registrado → Notifica pago exitoso (solo approved)
 *
 * CLASES DE EQUIVALENCIA:
 * - Eventos: válidos vs inválidos
 * - Prioridad: MEDIA | ALTA | CRITICA según evento
 * - Pago status: approved vs otros (rejected, pending, etc.)
 * - Cancelado por: tutor | admin | system
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: npm run test:integration -- --testPathPattern="suscripcion-notificaciones-listener"
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SuscripcionNotificacionesListener } from '../../../src/notificaciones/listeners/suscripcion-notificaciones.listener';
import { PrismaService } from '../../../src/core/database/prisma.service';
import { AppModule } from '../../../src/app.module';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import { createTestTutor } from '../../fixtures/factories';
import {
  SuscripcionCreadaEvent,
  SuscripcionActivadaEvent,
  SuscripcionCanceladaEvent,
  SuscripcionEnGraciaEvent,
  SuscripcionMorosaEvent,
  PagoSuscripcionRegistradoEvent,
} from '../../../src/suscripciones/events/suscripcion.events';
import {
  TipoNotificacion,
  PrioridadNotificacion,
  EstadoSuscripcion,
} from '@prisma/client';

describe('[INTEGRATION] SuscripcionNotificacionesListener', () => {
  let app: INestApplication;
  let listener: SuscripcionNotificacionesListener;
  let eventEmitter: EventEmitter2;
  let prisma: PrismaService;

  let tutorId: string;

  // ============================================================================
  // Setup
  // ============================================================================
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    listener = app.get<SuscripcionNotificacionesListener>(
      SuscripcionNotificacionesListener,
    );
    eventEmitter = app.get<EventEmitter2>(EventEmitter2);
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await cleanAllTestTables(prisma);
    await prisma.notificacion.deleteMany({});

    // Crear tutor de prueba
    const { tutor } = await createTestTutor(prisma);
    tutorId = tutor.id;
  });

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Obtiene notificaciones del tutor
   */
  async function getNotificacionesTutor() {
    return prisma.notificacion.findMany({
      where: { tutor_id: tutorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============================================================================
  // TEST 1: suscripcion.creada
  // ============================================================================
  describe('handleSuscripcionCreada', () => {
    it('debe crear notificación al tutor cuando se crea suscripción', async () => {
      // Arrange
      const event = new SuscripcionCreadaEvent({
        suscripcionId: 'sus-123',
        tutorId,
        planId: 'plan-123',
        mpPreapprovalId: 'mp-123',
        precioFinal: 15000,
        descuentoPorcentaje: 10,
      });

      // Act
      await listener.handleSuscripcionCreada(event);

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones).toHaveLength(1);
      expect(notificaciones[0].tipo).toBe(
        TipoNotificacion.TUTOR_SUSCRIPCION_RENOVADA,
      );
      expect(notificaciones[0].titulo).toBe('Suscripción creada');
      expect(notificaciones[0].mensaje).toContain('15');
      expect(notificaciones[0].mensaje).toContain('10%');
    });

    it('debe incluir metadata con suscripcion_id', async () => {
      // Arrange
      const event = new SuscripcionCreadaEvent({
        suscripcionId: 'sus-456',
        tutorId,
        planId: 'plan-456',
        mpPreapprovalId: 'mp-456',
        precioFinal: 20000,
        descuentoPorcentaje: 0,
      });

      // Act
      await listener.handleSuscripcionCreada(event);

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones[0].metadata).toHaveProperty(
        'suscripcion_id',
        'sus-456',
      );
    });

    it('no debe mostrar descuento si es 0%', async () => {
      // Arrange
      const event = new SuscripcionCreadaEvent({
        suscripcionId: 'sus-789',
        tutorId,
        planId: 'plan-789',
        mpPreapprovalId: 'mp-789',
        precioFinal: 10000,
        descuentoPorcentaje: 0,
      });

      // Act
      await listener.handleSuscripcionCreada(event);

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones[0].mensaje).not.toContain('%');
    });
  });

  // ============================================================================
  // TEST 2: suscripcion.activada
  // ============================================================================
  describe('handleSuscripcionActivada', () => {
    it('debe crear notificación de activación', async () => {
      // Arrange
      const event = new SuscripcionActivadaEvent({
        suscripcionId: 'sus-act-123',
        tutorId,
        mpPaymentId: 'pay-123',
      });

      // Act
      await listener.handleSuscripcionActivada(event);

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones).toHaveLength(1);
      expect(notificaciones[0].tipo).toBe(
        TipoNotificacion.TUTOR_SUSCRIPCION_RENOVADA,
      );
      expect(notificaciones[0].titulo).toBe('Suscripción activada');
      expect(notificaciones[0].mensaje).toContain('activa');
    });

    it('debe incluir mp_payment_id en metadata', async () => {
      // Arrange
      const event = new SuscripcionActivadaEvent({
        suscripcionId: 'sus-act-456',
        tutorId,
        mpPaymentId: 'pay-456',
      });

      // Act
      await listener.handleSuscripcionActivada(event);

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones[0].metadata).toHaveProperty(
        'mp_payment_id',
        'pay-456',
      );
    });
  });

  // ============================================================================
  // TEST 3: suscripcion.cancelada
  // ============================================================================
  describe('handleSuscripcionCancelada', () => {
    it('debe crear notificación de cancelación con prioridad ALTA', async () => {
      // Arrange
      const event = new SuscripcionCanceladaEvent({
        suscripcionId: 'sus-can-123',
        tutorId,
        motivo: 'Solicitud del usuario',
        canceladoPor: 'tutor',
        estadoAnterior: EstadoSuscripcion.ACTIVA,
      });

      // Act
      await listener.handleSuscripcionCancelada(event);

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones).toHaveLength(1);
      expect(notificaciones[0].tipo).toBe(
        TipoNotificacion.TUTOR_SUSCRIPCION_CANCELADA,
      );
      expect(notificaciones[0].prioridad).toBe(PrioridadNotificacion.ALTA);
    });

    it('debe mostrar mensaje correcto cuando cancelado por tutor', async () => {
      // Arrange
      const event = new SuscripcionCanceladaEvent({
        suscripcionId: 'sus-can-tutor',
        tutorId,
        motivo: 'Ya no necesito el servicio',
        canceladoPor: 'tutor',
        estadoAnterior: EstadoSuscripcion.ACTIVA,
      });

      // Act
      await listener.handleSuscripcionCancelada(event);

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones[0].mensaje).toContain('a tu solicitud');
    });

    it('debe mostrar mensaje correcto cuando cancelado por admin', async () => {
      // Arrange
      const event = new SuscripcionCanceladaEvent({
        suscripcionId: 'sus-can-admin',
        tutorId,
        motivo: 'Fraude detectado',
        canceladoPor: 'admin',
        estadoAnterior: EstadoSuscripcion.ACTIVA,
      });

      // Act
      await listener.handleSuscripcionCancelada(event);

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones[0].mensaje).toContain('por el administrador');
      expect(notificaciones[0].mensaje).toContain('Fraude detectado');
    });

    it('debe mostrar mensaje correcto cuando cancelado por sistema', async () => {
      // Arrange
      const event = new SuscripcionCanceladaEvent({
        suscripcionId: 'sus-can-system',
        tutorId,
        motivo: 'Falta de pago',
        canceladoPor: 'system',
        estadoAnterior: EstadoSuscripcion.MOROSA,
      });

      // Act
      await listener.handleSuscripcionCancelada(event);

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones[0].mensaje).toContain(
        'automáticamente por el sistema',
      );
    });

    it('debe incluir metadata completa', async () => {
      // Arrange
      const event = new SuscripcionCanceladaEvent({
        suscripcionId: 'sus-can-meta',
        tutorId,
        motivo: 'Motivo de prueba',
        canceladoPor: 'admin',
        estadoAnterior: EstadoSuscripcion.EN_GRACIA,
      });

      // Act
      await listener.handleSuscripcionCancelada(event);

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones[0].metadata).toEqual({
        suscripcion_id: 'sus-can-meta',
        motivo: 'Motivo de prueba',
        cancelado_por: 'admin',
      });
    });
  });

  // ============================================================================
  // TEST 4: suscripcion.en_gracia
  // ============================================================================
  describe('handleSuscripcionEnGracia', () => {
    it('debe crear notificación de período de gracia con prioridad ALTA', async () => {
      // Arrange
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + 5);

      const event = new SuscripcionEnGraciaEvent({
        suscripcionId: 'sus-gracia-123',
        tutorId,
        fechaLimiteGracia: fechaLimite,
        diasRestantes: 5,
      });

      // Act
      await listener.handleSuscripcionEnGracia(event);

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones).toHaveLength(1);
      expect(notificaciones[0].tipo).toBe(
        TipoNotificacion.TUTOR_SUSCRIPCION_PROXIMA_VENCER,
      );
      expect(notificaciones[0].prioridad).toBe(PrioridadNotificacion.ALTA);
      expect(notificaciones[0].titulo).toContain('Período de gracia');
    });

    it('debe mostrar días restantes en el mensaje', async () => {
      // Arrange
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + 3);

      const event = new SuscripcionEnGraciaEvent({
        suscripcionId: 'sus-gracia-456',
        tutorId,
        fechaLimiteGracia: fechaLimite,
        diasRestantes: 3,
      });

      // Act
      await listener.handleSuscripcionEnGracia(event);

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones[0].mensaje).toContain('3 días');
    });

    it('debe incluir fecha_limite en metadata', async () => {
      // Arrange
      const fechaLimite = new Date('2026-02-15');

      const event = new SuscripcionEnGraciaEvent({
        suscripcionId: 'sus-gracia-789',
        tutorId,
        fechaLimiteGracia: fechaLimite,
        diasRestantes: 7,
      });

      // Act
      await listener.handleSuscripcionEnGracia(event);

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones[0].metadata).toHaveProperty('fecha_limite');
      expect(notificaciones[0].metadata).toHaveProperty('dias_restantes', 7);
    });
  });

  // ============================================================================
  // TEST 5: suscripcion.morosa
  // ============================================================================
  describe('handleSuscripcionMorosa', () => {
    it('debe crear notificación de morosidad con prioridad CRITICA', async () => {
      // Arrange
      const event = new SuscripcionMorosaEvent({
        suscripcionId: 'sus-morosa-123',
        tutorId,
        diasGraciaUsados: 7,
      });

      // Act
      await listener.handleSuscripcionMorosa(event);

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones).toHaveLength(1);
      expect(notificaciones[0].tipo).toBe(
        TipoNotificacion.TUTOR_SUSCRIPCION_CANCELADA,
      );
      expect(notificaciones[0].prioridad).toBe(PrioridadNotificacion.CRITICA);
      expect(notificaciones[0].titulo).toContain('suspendido');
    });

    it('debe mostrar días de gracia usados en el mensaje', async () => {
      // Arrange
      const event = new SuscripcionMorosaEvent({
        suscripcionId: 'sus-morosa-456',
        tutorId,
        diasGraciaUsados: 10,
      });

      // Act
      await listener.handleSuscripcionMorosa(event);

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones[0].mensaje).toContain('10 días');
    });

    it('debe incluir dias_gracia_usados en metadata', async () => {
      // Arrange
      const event = new SuscripcionMorosaEvent({
        suscripcionId: 'sus-morosa-789',
        tutorId,
        diasGraciaUsados: 5,
      });

      // Act
      await listener.handleSuscripcionMorosa(event);

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones[0].metadata).toEqual({
        suscripcion_id: 'sus-morosa-789',
        dias_gracia_usados: 5,
      });
    });
  });

  // ============================================================================
  // TEST 6: suscripcion.pago_registrado
  // ============================================================================
  describe('handlePagoRegistrado', () => {
    it('debe crear notificación solo para pagos approved', async () => {
      // Arrange
      const event = new PagoSuscripcionRegistradoEvent({
        pagoId: 'pago-123',
        suscripcionId: 'sus-pago-123',
        tutorId,
        mpPaymentId: 'mp-pay-123',
        monto: 15000,
        status: 'approved',
      });

      // Act
      await listener.handlePagoRegistrado(event);

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones).toHaveLength(1);
      expect(notificaciones[0].mensaje).toContain('15');
    });

    it('NO debe crear notificación para pagos rejected', async () => {
      // Arrange
      const event = new PagoSuscripcionRegistradoEvent({
        pagoId: 'pago-rejected',
        suscripcionId: 'sus-pago-rejected',
        tutorId,
        mpPaymentId: 'mp-pay-rejected',
        monto: 10000,
        status: 'rejected',
      });

      // Act
      await listener.handlePagoRegistrado(event);

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones).toHaveLength(0);
    });

    it('NO debe crear notificación para pagos pending', async () => {
      // Arrange
      const event = new PagoSuscripcionRegistradoEvent({
        pagoId: 'pago-pending',
        suscripcionId: 'sus-pago-pending',
        tutorId,
        mpPaymentId: 'mp-pay-pending',
        monto: 10000,
        status: 'pending',
      });

      // Act
      await listener.handlePagoRegistrado(event);

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones).toHaveLength(0);
    });

    it('NO debe crear notificación para pagos in_process', async () => {
      // Arrange
      const event = new PagoSuscripcionRegistradoEvent({
        pagoId: 'pago-process',
        suscripcionId: 'sus-pago-process',
        tutorId,
        mpPaymentId: 'mp-pay-process',
        monto: 10000,
        status: 'in_process',
      });

      // Act
      await listener.handlePagoRegistrado(event);

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones).toHaveLength(0);
    });
  });

  // ============================================================================
  // TEST 7: Eventos via EventEmitter (integración completa)
  // ============================================================================
  describe('Integración con EventEmitter', () => {
    it('debe recibir evento suscripcion.creada via EventEmitter', async () => {
      // Arrange
      const event = new SuscripcionCreadaEvent({
        suscripcionId: 'sus-emit-123',
        tutorId,
        planId: 'plan-emit',
        mpPreapprovalId: 'mp-emit',
        precioFinal: 25000,
        descuentoPorcentaje: 15,
      });

      // Act
      eventEmitter.emit(SuscripcionCreadaEvent.EVENT_NAME, event);

      // Esperar un poco para que el listener procese
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones.length).toBeGreaterThanOrEqual(1);
    });

    it('debe procesar múltiples eventos en secuencia', async () => {
      // Arrange
      const eventCreada = new SuscripcionCreadaEvent({
        suscripcionId: 'sus-multi',
        tutorId,
        planId: 'plan-multi',
        mpPreapprovalId: 'mp-multi',
        precioFinal: 10000,
        descuentoPorcentaje: 0,
      });

      const eventActivada = new SuscripcionActivadaEvent({
        suscripcionId: 'sus-multi',
        tutorId,
        mpPaymentId: 'pay-multi',
      });

      // Act
      await listener.handleSuscripcionCreada(eventCreada);
      await listener.handleSuscripcionActivada(eventActivada);

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones).toHaveLength(2);

      const tipos = notificaciones.map((n) => n.titulo);
      expect(tipos).toContain('Suscripción creada');
      expect(tipos).toContain('Suscripción activada');
    });
  });

  // ============================================================================
  // TEST 8: Verificar prioridades correctas
  // ============================================================================
  describe('Prioridades de notificaciones', () => {
    it('suscripcion.creada debe tener prioridad MEDIA (default)', async () => {
      // Arrange & Act
      await listener.handleSuscripcionCreada(
        new SuscripcionCreadaEvent({
          suscripcionId: 'sus-pri-1',
          tutorId,
          planId: 'plan',
          mpPreapprovalId: 'mp',
          precioFinal: 1000,
          descuentoPorcentaje: 0,
        }),
      );

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones[0].prioridad).toBe(PrioridadNotificacion.MEDIA);
    });

    it('suscripcion.activada debe tener prioridad MEDIA (default)', async () => {
      // Arrange & Act
      await listener.handleSuscripcionActivada(
        new SuscripcionActivadaEvent({
          suscripcionId: 'sus-pri-2',
          tutorId,
          mpPaymentId: 'pay',
        }),
      );

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones[0].prioridad).toBe(PrioridadNotificacion.MEDIA);
    });

    it('suscripcion.cancelada debe tener prioridad ALTA', async () => {
      // Arrange & Act
      await listener.handleSuscripcionCancelada(
        new SuscripcionCanceladaEvent({
          suscripcionId: 'sus-pri-3',
          tutorId,
          motivo: 'Test',
          canceladoPor: 'tutor',
          estadoAnterior: EstadoSuscripcion.ACTIVA,
        }),
      );

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones[0].prioridad).toBe(PrioridadNotificacion.ALTA);
    });

    it('suscripcion.en_gracia debe tener prioridad ALTA', async () => {
      // Arrange & Act
      await listener.handleSuscripcionEnGracia(
        new SuscripcionEnGraciaEvent({
          suscripcionId: 'sus-pri-4',
          tutorId,
          fechaLimiteGracia: new Date(),
          diasRestantes: 5,
        }),
      );

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones[0].prioridad).toBe(PrioridadNotificacion.ALTA);
    });

    it('suscripcion.morosa debe tener prioridad CRITICA', async () => {
      // Arrange & Act
      await listener.handleSuscripcionMorosa(
        new SuscripcionMorosaEvent({
          suscripcionId: 'sus-pri-5',
          tutorId,
          diasGraciaUsados: 7,
        }),
      );

      // Assert
      const notificaciones = await getNotificacionesTutor();
      expect(notificaciones[0].prioridad).toBe(PrioridadNotificacion.CRITICA);
    });
  });
});
