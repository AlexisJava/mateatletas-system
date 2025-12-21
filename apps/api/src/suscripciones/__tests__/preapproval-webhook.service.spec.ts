/**
 * Tests TDD para PreapprovalWebhookService (Orquestador)
 *
 * ARQUITECTURA: Este servicio es un ORQUESTADOR que delega a:
 * - SuscripcionStateTransitionService: transiciones a ACTIVA/CANCELADA
 * - GracePeriodService: manejo de EN_GRACIA/MOROSA
 *
 * REGLA DE NEGOCIO: Las suscripciones NO SE PAUSAN.
 * Si el tutor no paga, se cancela. Si quiere volver, crea una nueva.
 *
 * Flujo de webhooks subscription_preapproval:
 * 1. authorized → delega a stateTransitionService.transicionarAActiva
 * 2. cancelled → delega a stateTransitionService.transicionarACancelada
 * 3. paused → delega a stateTransitionService.transicionarPausadaACancelada
 * 4. pending → skip (sin cambios)
 * 5. Idempotencia: ignorar duplicados
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';
import { EstadoSuscripcion } from '@prisma/client';
import { PreapprovalWebhookService } from '../services/preapproval-webhook.service';
import { SuscripcionStateTransitionService } from '../services/suscripcion-state-transition.service';
import { GracePeriodService } from '../services/grace-period.service';
import { PrismaService } from '../../core/database/prisma.service';
import { WebhookIdempotencyService } from '../../pagos/services/webhook-idempotency.service';
import {
  PreApprovalWebhookPayload,
  PreApprovalDetail,
} from '../types/preapproval.types';
import {
  SuscripcionActivadaEvent,
  SuscripcionCanceladaEvent,
} from '../events/suscripcion.events';

describe('PreapprovalWebhookService', () => {
  let service: PreapprovalWebhookService;
  let prisma: jest.Mocked<PrismaService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let idempotencyService: jest.Mocked<WebhookIdempotencyService>;
  let stateTransitionService: jest.Mocked<SuscripcionStateTransitionService>;
  let gracePeriodService: jest.Mocked<GracePeriodService>;

  // Mock de suscripción existente
  const mockSuscripcion = {
    id: 'suscripcion-123',
    tutor_id: 'tutor-456',
    plan_id: 'plan-789',
    estado: EstadoSuscripcion.PENDIENTE,
    mp_preapproval_id: 'mp-preapproval-abc',
    precio_final: 40000,
    created_at: new Date(),
    updated_at: new Date(),
    dias_gracia_usados: 0,
    fecha_inicio_gracia: null,
    version: 1,
  };

  // Mock de webhook payload
  const createWebhookPayload = (
    preapprovalId: string,
    action: 'created' | 'updated' | 'payment.created' = 'updated',
  ): PreApprovalWebhookPayload => ({
    type: 'subscription_preapproval',
    action,
    id: `webhook-${Date.now()}`,
    api_version: 'v1',
    date_created: new Date().toISOString(),
    live_mode: true,
    user_id: '12345678',
    data: { id: preapprovalId },
  });

  // Mock de detalle de preapproval desde API MP
  const createPreapprovalDetail = (
    status: 'authorized' | 'cancelled' | 'pending' | 'paused',
    externalRef: string,
  ): PreApprovalDetail => ({
    id: 'mp-preapproval-abc',
    status,
    external_reference: externalRef,
    payer_email: 'tutor@example.com',
    payer_id: 999,
    reason: 'Suscripción STEAM',
    next_payment_date: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    auto_recurring: {
      frequency: 1,
      frequency_type: 'months',
      transaction_amount: 40000,
      currency_id: 'ARS',
    },
    date_created: new Date().toISOString(),
    last_modified: new Date().toISOString(),
  });

  beforeEach(async () => {
    // Mock PrismaService
    const mockPrisma = {
      suscripcion: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      historialEstadoSuscripcion: {
        create: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(mockPrisma)),
    };

    // Mock EventEmitter
    const mockEventEmitter = {
      emit: jest.fn(),
    };

    // Mock IdempotencyService
    const mockIdempotency = {
      wasProcessed: jest.fn().mockResolvedValue(false),
      markAsProcessed: jest.fn().mockResolvedValue(undefined),
    };

    // Mock SuscripcionStateTransitionService
    const mockStateTransition = {
      transicionarAActiva: jest.fn(),
      transicionarACancelada: jest.fn(),
      transicionarPausadaACancelada: jest.fn(),
    };

    // Mock GracePeriodService
    const mockGracePeriod = {
      handlePaymentFailed: jest.fn(),
      calcularDiasEnGracia: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreapprovalWebhookService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: WebhookIdempotencyService, useValue: mockIdempotency },
        {
          provide: SuscripcionStateTransitionService,
          useValue: mockStateTransition,
        },
        { provide: GracePeriodService, useValue: mockGracePeriod },
      ],
    }).compile();

    service = module.get<PreapprovalWebhookService>(PreapprovalWebhookService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
    eventEmitter = module.get(EventEmitter2) as jest.Mocked<EventEmitter2>;
    idempotencyService = module.get(
      WebhookIdempotencyService,
    ) as jest.Mocked<WebhookIdempotencyService>;
    stateTransitionService = module.get(
      SuscripcionStateTransitionService,
    ) as jest.Mocked<SuscripcionStateTransitionService>;
    gracePeriodService = module.get(
      GracePeriodService,
    ) as jest.Mocked<GracePeriodService>;

    // Silenciar logs en tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processWebhook', () => {
    describe('Evento "authorized" → delega a stateTransitionService', () => {
      it('debe delegar a transicionarAActiva cuando recibe authorized', async () => {
        // Arrange
        const payload = createWebhookPayload('mp-preapproval-abc');
        const detail = createPreapprovalDetail('authorized', 'suscripcion-123');

        (prisma.suscripcion.findFirst as jest.Mock).mockResolvedValue(
          mockSuscripcion,
        );

        const mockPendingEvent = {
          eventName: 'suscripcion.activada',
          payload: new SuscripcionActivadaEvent({
            suscripcionId: 'suscripcion-123',
            tutorId: 'tutor-456',
            mpPaymentId: 'mp-preapproval-abc',
          }),
        };

        stateTransitionService.transicionarAActiva.mockResolvedValue({
          result: {
            success: true,
            action: 'activated',
            suscripcionId: 'suscripcion-123',
            message: 'Suscripción activada exitosamente',
          },
          pendingEvent: mockPendingEvent,
        });

        // Act
        const result = await service.processWebhook(payload, detail);

        // Assert
        expect(result.success).toBe(true);
        expect(result.action).toBe('activated');
        expect(stateTransitionService.transicionarAActiva).toHaveBeenCalledWith(
          mockSuscripcion,
          detail,
        );
      });

      it('debe emitir evento pendiente después del commit exitoso', async () => {
        // Arrange
        const payload = createWebhookPayload('mp-preapproval-abc');
        const detail = createPreapprovalDetail('authorized', 'suscripcion-123');

        (prisma.suscripcion.findFirst as jest.Mock).mockResolvedValue(
          mockSuscripcion,
        );

        const mockPendingEvent = {
          eventName: 'suscripcion.activada',
          payload: new SuscripcionActivadaEvent({
            suscripcionId: 'suscripcion-123',
            tutorId: 'tutor-456',
            mpPaymentId: 'mp-preapproval-abc',
          }),
        };

        stateTransitionService.transicionarAActiva.mockResolvedValue({
          result: {
            success: true,
            action: 'activated',
            suscripcionId: 'suscripcion-123',
            message: 'Suscripción activada',
          },
          pendingEvent: mockPendingEvent,
        });

        // Act
        await service.processWebhook(payload, detail);

        // Assert
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'suscripcion.activada',
          expect.any(SuscripcionActivadaEvent),
        );
      });

      it('debe marcar idempotencia después de procesar exitosamente', async () => {
        // Arrange
        const payload = createWebhookPayload('mp-preapproval-abc');
        const detail = createPreapprovalDetail('authorized', 'suscripcion-123');

        (prisma.suscripcion.findFirst as jest.Mock).mockResolvedValue(
          mockSuscripcion,
        );

        stateTransitionService.transicionarAActiva.mockResolvedValue({
          result: {
            success: true,
            action: 'activated',
            suscripcionId: 'suscripcion-123',
            message: 'Suscripción activada',
          },
          pendingEvent: {
            eventName: 'suscripcion.activada',
            payload: new SuscripcionActivadaEvent({
              suscripcionId: 'suscripcion-123',
              tutorId: 'tutor-456',
              mpPaymentId: 'mp-preapproval-abc',
            }),
          },
        });

        // Act
        await service.processWebhook(payload, detail);

        // Assert
        expect(idempotencyService.markAsProcessed).toHaveBeenCalledWith(
          expect.objectContaining({
            paymentId: 'mp-preapproval-abc',
            webhookType: 'subscription_preapproval',
            status: 'authorized',
          }),
        );
      });
    });

    describe('Evento "cancelled" → delega a stateTransitionService', () => {
      it('debe delegar a transicionarACancelada cuando recibe cancelled', async () => {
        // Arrange
        const payload = createWebhookPayload('mp-preapproval-abc');
        const detail = createPreapprovalDetail('cancelled', 'suscripcion-123');
        const activeSuscripcion = {
          ...mockSuscripcion,
          estado: EstadoSuscripcion.ACTIVA,
        };

        (prisma.suscripcion.findFirst as jest.Mock).mockResolvedValue(
          activeSuscripcion,
        );

        stateTransitionService.transicionarACancelada.mockResolvedValue({
          result: {
            success: true,
            action: 'cancelled',
            suscripcionId: 'suscripcion-123',
            message: 'Suscripción cancelada',
          },
          pendingEvent: {
            eventName: 'suscripcion.cancelada',
            payload: new SuscripcionCanceladaEvent({
              suscripcionId: 'suscripcion-123',
              tutorId: 'tutor-456',
              motivo: 'Cancelada por MercadoPago',
              canceladoPor: 'system',
              estadoAnterior: EstadoSuscripcion.ACTIVA,
            }),
          },
        });

        // Act
        const result = await service.processWebhook(payload, detail);

        // Assert
        expect(result.success).toBe(true);
        expect(result.action).toBe('cancelled');
        expect(
          stateTransitionService.transicionarACancelada,
        ).toHaveBeenCalledWith(activeSuscripcion, detail);
      });

      it('debe emitir SuscripcionCanceladaEvent después del commit', async () => {
        // Arrange
        const payload = createWebhookPayload('mp-preapproval-abc');
        const detail = createPreapprovalDetail('cancelled', 'suscripcion-123');
        const activeSuscripcion = {
          ...mockSuscripcion,
          estado: EstadoSuscripcion.ACTIVA,
        };

        (prisma.suscripcion.findFirst as jest.Mock).mockResolvedValue(
          activeSuscripcion,
        );

        stateTransitionService.transicionarACancelada.mockResolvedValue({
          result: {
            success: true,
            action: 'cancelled',
            suscripcionId: 'suscripcion-123',
            message: 'Suscripción cancelada',
          },
          pendingEvent: {
            eventName: 'suscripcion.cancelada',
            payload: new SuscripcionCanceladaEvent({
              suscripcionId: 'suscripcion-123',
              tutorId: 'tutor-456',
              motivo: 'Cancelada por MercadoPago',
              canceladoPor: 'system',
              estadoAnterior: EstadoSuscripcion.ACTIVA,
            }),
          },
        });

        // Act
        await service.processWebhook(payload, detail);

        // Assert
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'suscripcion.cancelada',
          expect.any(SuscripcionCanceladaEvent),
        );
      });
    });

    describe('Idempotencia - ignorar duplicados', () => {
      it('debe ignorar webhook si ya fue procesado', async () => {
        // Arrange
        const payload = createWebhookPayload('mp-preapproval-abc');
        const detail = createPreapprovalDetail('authorized', 'suscripcion-123');

        (idempotencyService.wasProcessed as jest.Mock).mockResolvedValue(true);

        // Act
        const result = await service.processWebhook(payload, detail);

        // Assert
        expect(result.success).toBe(true);
        expect(result.action).toBe('skipped');
        expect(result.wasDuplicate).toBe(true);
        expect(
          stateTransitionService.transicionarAActiva,
        ).not.toHaveBeenCalled();
        expect(eventEmitter.emit).not.toHaveBeenCalled();
      });
    });

    describe('Suscripción no encontrada', () => {
      it('debe retornar error si no existe la suscripción', async () => {
        // Arrange
        const payload = createWebhookPayload('mp-unknown');
        const detail = createPreapprovalDetail(
          'authorized',
          'suscripcion-inexistente',
        );

        (prisma.suscripcion.findFirst as jest.Mock).mockResolvedValue(null);

        // Act
        const result = await service.processWebhook(payload, detail);

        // Assert
        expect(result.success).toBe(false);
        expect(result.action).toBe('error');
        expect(result.message).toContain('no encontrada');
      });
    });

    describe('Estado "pending" → skip sin cambios', () => {
      it('debe hacer skip cuando recibe pending', async () => {
        // Arrange
        const payload = createWebhookPayload('mp-preapproval-abc');
        const detail = createPreapprovalDetail('pending', 'suscripcion-123');

        (prisma.suscripcion.findFirst as jest.Mock).mockResolvedValue(
          mockSuscripcion,
        );

        // Act
        const result = await service.processWebhook(payload, detail);

        // Assert
        expect(result.success).toBe(true);
        expect(result.action).toBe('skipped');
        expect(
          stateTransitionService.transicionarAActiva,
        ).not.toHaveBeenCalled();
        expect(
          stateTransitionService.transicionarACancelada,
        ).not.toHaveBeenCalled();
      });
    });

    describe('Evento "paused" → delega a transicionarPausadaACancelada', () => {
      it('debe tratar estado "paused" de MP como cancelación (regla de negocio)', async () => {
        // REGLA: Nosotros no pausamos. Si MP envía paused, lo tratamos como cancelación.
        const payload = createWebhookPayload('mp-preapproval-abc');
        const detail = createPreapprovalDetail('paused', 'suscripcion-123');
        const activeSuscripcion = {
          ...mockSuscripcion,
          estado: EstadoSuscripcion.ACTIVA,
        };

        (prisma.suscripcion.findFirst as jest.Mock).mockResolvedValue(
          activeSuscripcion,
        );

        stateTransitionService.transicionarPausadaACancelada.mockResolvedValue({
          result: {
            success: true,
            action: 'cancelled',
            suscripcionId: 'suscripcion-123',
            message: 'Suscripción cancelada (paused → cancelled)',
          },
          pendingEvent: {
            eventName: 'suscripcion.cancelada',
            payload: new SuscripcionCanceladaEvent({
              suscripcionId: 'suscripcion-123',
              tutorId: 'tutor-456',
              motivo:
                'MercadoPago reportó estado paused - tratado como cancelación',
              canceladoPor: 'system',
              estadoAnterior: EstadoSuscripcion.ACTIVA,
            }),
          },
        });

        // Act
        const result = await service.processWebhook(payload, detail);

        // Assert: Debe delegar a transicionarPausadaACancelada
        expect(result.action).toBe('cancelled');
        expect(
          stateTransitionService.transicionarPausadaACancelada,
        ).toHaveBeenCalledWith(activeSuscripcion, detail);
      });
    });
  });

  describe('handlePaymentFailed (delega a GracePeriodService)', () => {
    it('debe delegar a gracePeriodService.handlePaymentFailed', async () => {
      // Arrange
      gracePeriodService.handlePaymentFailed.mockResolvedValue({
        success: true,
        action: 'grace_period',
        suscripcionId: 'suscripcion-123',
        message: 'Suscripción en período de gracia',
      });

      // Act
      const result = await service.handlePaymentFailed(
        'suscripcion-123',
        'rejected',
      );

      // Assert
      expect(result.action).toBe('grace_period');
      expect(gracePeriodService.handlePaymentFailed).toHaveBeenCalledWith(
        'suscripcion-123',
        'rejected',
      );
    });

    it('debe retornar resultado de morosa cuando gracePeriodService lo indica', async () => {
      // Arrange
      gracePeriodService.handlePaymentFailed.mockResolvedValue({
        success: true,
        action: 'morosa',
        suscripcionId: 'suscripcion-123',
        message: 'Suscripción pasó a morosa',
      });

      // Act
      const result = await service.handlePaymentFailed(
        'suscripcion-123',
        'rejected',
      );

      // Assert
      expect(result.action).toBe('morosa');
      expect(gracePeriodService.handlePaymentFailed).toHaveBeenCalledWith(
        'suscripcion-123',
        'rejected',
      );
    });
  });
});
