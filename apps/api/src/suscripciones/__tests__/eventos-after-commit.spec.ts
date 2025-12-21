/**
 * Tests TDD para verificar que eventos se emiten DESPUÉS del commit
 *
 * REGLA CRÍTICA: Los eventos SOLO se emiten si la transacción fue exitosa.
 * Esto previene que listeners actúen sobre datos no persistidos.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EstadoSuscripcion, IntervaloSuscripcion } from '@prisma/client';

import { PreapprovalService } from '../services/preapproval.service';
import { PreapprovalWebhookService } from '../services/preapproval-webhook.service';
import { SuscripcionStateTransitionService } from '../services/suscripcion-state-transition.service';
import { GracePeriodService } from '../services/grace-period.service';
import { PrismaService } from '../../core/database/prisma.service';
import { WebhookIdempotencyService } from '../../pagos/services/webhook-idempotency.service';
import {
  SuscripcionCreadaEvent,
  SuscripcionCanceladaEvent,
  SuscripcionActivadaEvent,
} from '../events';
import {
  CrearSuscripcionInput,
  CancelarSuscripcionInput,
  PreApprovalWebhookPayload,
  PreApprovalDetail,
} from '../types';

describe('Eventos After Commit', () => {
  let preapprovalService: PreapprovalService;
  let webhookService: PreapprovalWebhookService;

  // Orden de operaciones para verificar secuencia
  const operationOrder: string[] = [];

  const mockPrismaService = {
    tutor: { findUnique: jest.fn() },
    planSuscripcion: { findUnique: jest.fn() },
    suscripcion: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    historialEstadoSuscripcion: { create: jest.fn() },
    $transaction: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn().mockImplementation((eventName: string) => {
      operationOrder.push(`emit:${eventName}`);
    }),
  };

  const mockIdempotencyService = {
    wasProcessed: jest.fn().mockResolvedValue(false),
    markAsProcessed: jest.fn().mockResolvedValue(undefined),
  };

  const mockStateTransitionService = {
    transicionarAActiva: jest.fn(),
    transicionarACancelada: jest.fn(),
    transicionarPausadaACancelada: jest.fn(),
  };

  const mockGracePeriodService = {
    handlePaymentFailed: jest.fn(),
    calcularDiasEnGracia: jest.fn(),
  };

  const mockMpClient = {
    create: jest.fn(),
    update: jest.fn(),
    get: jest.fn(),
  };

  // Datos de prueba
  const mockTutor = { id: 'tutor-123', email: 'test@test.com' };
  const mockPlan = {
    id: 'plan-123',
    nombre: 'STEAM',
    precio_base: { toNumber: () => 40000 },
    intervalo: IntervaloSuscripcion.MENSUAL,
    intervalo_cantidad: 1,
    activo: true,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    operationOrder.length = 0;

    // $transaction registra cuando se completa
    mockPrismaService.$transaction.mockImplementation(
      async <T>(callback: (tx: typeof mockPrismaService) => Promise<T>) => {
        const result = await callback(mockPrismaService);
        operationOrder.push('transaction:commit');
        return result;
      },
    );

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        PreapprovalService,
        PreapprovalWebhookService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        {
          provide: WebhookIdempotencyService,
          useValue: mockIdempotencyService,
        },
        {
          provide: SuscripcionStateTransitionService,
          useValue: mockStateTransitionService,
        },
        {
          provide: GracePeriodService,
          useValue: mockGracePeriodService,
        },
      ],
    }).compile();

    preapprovalService = module.get<PreapprovalService>(PreapprovalService);
    webhookService = module.get<PreapprovalWebhookService>(
      PreapprovalWebhookService,
    );

    preapprovalService.setMpPreApprovalClient(mockMpClient);
  });

  // ============================================================================
  // TESTS: crear() - Evento después del commit
  // ============================================================================

  describe('PreapprovalService.crear() - Evento después del commit', () => {
    const crearInput: CrearSuscripcionInput = {
      tutorId: 'tutor-123',
      planId: 'plan-123',
      tutorEmail: 'test@test.com',
      tutorNombre: 'Test User',
      numeroHijo: 1,
    };

    it('should_emit_SuscripcionCreadaEvent_only_after_transaction_commits', async () => {
      // Arrange
      mockPrismaService.tutor.findUnique.mockResolvedValue(mockTutor);
      mockPrismaService.planSuscripcion.findUnique.mockResolvedValue(mockPlan);
      mockPrismaService.suscripcion.create.mockResolvedValue({
        id: 'suscripcion-123',
        tutor_id: 'tutor-123',
        estado: EstadoSuscripcion.PENDIENTE,
      });
      mockMpClient.create.mockResolvedValue({
        id: 'mp-123',
        init_point: 'https://mp.com',
        status: 'pending',
      });

      // Act
      await preapprovalService.crear(crearInput);

      // Assert: El commit debe ocurrir ANTES del emit
      const commitIndex = operationOrder.indexOf('transaction:commit');
      const emitIndex = operationOrder.indexOf(
        `emit:${SuscripcionCreadaEvent.EVENT_NAME}`,
      );

      expect(commitIndex).toBeGreaterThan(-1);
      expect(emitIndex).toBeGreaterThan(-1);
      expect(commitIndex).toBeLessThan(emitIndex);
    });

    it('should_emit_event_with_correct_data_after_success', async () => {
      // Arrange
      mockPrismaService.tutor.findUnique.mockResolvedValue(mockTutor);
      mockPrismaService.planSuscripcion.findUnique.mockResolvedValue(mockPlan);
      mockPrismaService.suscripcion.create.mockResolvedValue({
        id: 'suscripcion-123',
        tutor_id: 'tutor-123',
        estado: EstadoSuscripcion.PENDIENTE,
      });
      mockMpClient.create.mockResolvedValue({
        id: 'mp-123',
        init_point: 'https://mp.com',
        status: 'pending',
      });

      // Act
      await preapprovalService.crear(crearInput);

      // Assert
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        SuscripcionCreadaEvent.EVENT_NAME,
        expect.objectContaining({
          suscripcionId: 'suscripcion-123',
          tutorId: 'tutor-123',
          planId: 'plan-123',
          mpPreapprovalId: 'mp-123',
        }),
      );
    });

    it('should_never_emit_event_when_transaction_fails', async () => {
      // Arrange
      mockPrismaService.tutor.findUnique.mockResolvedValue(mockTutor);
      mockPrismaService.planSuscripcion.findUnique.mockResolvedValue(mockPlan);
      mockPrismaService.suscripcion.create.mockResolvedValue({
        id: 'suscripcion-123',
        tutor_id: 'tutor-123',
      });

      // MP falla - transacción debe hacer rollback
      mockMpClient.create.mockRejectedValue(new Error('MP API failed'));

      // $transaction no hace commit si hay error
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        try {
          return await callback(mockPrismaService);
        } catch (error) {
          operationOrder.push('transaction:rollback');
          throw error;
        }
      });

      // Act
      try {
        await preapprovalService.crear(crearInput);
      } catch {
        // Expected to fail
      }

      // Assert: El evento NUNCA debe emitirse
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      expect(operationOrder).toContain('transaction:rollback');
      expect(operationOrder).not.toContain('transaction:commit');
    });
  });

  // ============================================================================
  // TESTS: cancelar() - Evento después del commit
  // ============================================================================

  describe('PreapprovalService.cancelar() - Evento después del commit', () => {
    const mockSuscripcion = {
      id: 'suscripcion-123',
      tutor_id: 'tutor-123',
      mp_preapproval_id: 'mp-123',
      estado: EstadoSuscripcion.ACTIVA,
      plan: { nombre: 'STEAM' },
    };

    const cancelarInput: CancelarSuscripcionInput = {
      suscripcionId: 'suscripcion-123',
      tutorId: 'tutor-123',
      motivo: 'Test cancel',
      canceladoPor: 'tutor',
    };

    it('should_emit_SuscripcionCanceladaEvent_only_after_transaction_commits', async () => {
      // Arrange
      mockPrismaService.suscripcion.findUnique.mockResolvedValue(
        mockSuscripcion,
      );
      mockPrismaService.suscripcion.update.mockResolvedValue({
        ...mockSuscripcion,
        estado: EstadoSuscripcion.CANCELADA,
      });
      mockMpClient.update.mockResolvedValue({ status: 'cancelled' });

      // Act
      await preapprovalService.cancelar(cancelarInput);

      // Assert
      const commitIndex = operationOrder.indexOf('transaction:commit');
      const emitIndex = operationOrder.indexOf(
        `emit:${SuscripcionCanceladaEvent.EVENT_NAME}`,
      );

      expect(commitIndex).toBeLessThan(emitIndex);
    });

    it('should_never_emit_event_when_cancel_fails', async () => {
      // Arrange
      mockPrismaService.suscripcion.findUnique.mockResolvedValue(
        mockSuscripcion,
      );
      mockMpClient.update.mockRejectedValue(new Error('MP cancel failed'));

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        try {
          return await callback(mockPrismaService);
        } catch (error) {
          operationOrder.push('transaction:rollback');
          throw error;
        }
      });

      // Act
      try {
        await preapprovalService.cancelar(cancelarInput);
      } catch {
        // Expected
      }

      // Assert
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // TESTS: Webhook handlers - Evento después del commit
  // ============================================================================

  describe('PreapprovalWebhookService - Evento después del commit', () => {
    const mockSuscripcion = {
      id: 'suscripcion-123',
      tutor_id: 'tutor-123',
      estado: EstadoSuscripcion.PENDIENTE,
      version: 1,
    };

    const webhookPayload: PreApprovalWebhookPayload = {
      type: 'subscription_preapproval',
      action: 'updated',
      id: 'webhook-123',
      api_version: 'v1',
      date_created: new Date().toISOString(),
      live_mode: false,
      user_id: 'user-123',
      data: { id: 'mp-preapproval-123' },
    };

    const preapprovalDetail: PreApprovalDetail = {
      id: 'mp-preapproval-123',
      status: 'authorized',
      external_reference: 'suscripcion-123',
      payer_email: 'test@test.com',
      payer_id: 123,
      reason: 'Test',
      next_payment_date: new Date().toISOString(),
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 40000,
        currency_id: 'ARS',
      },
      date_created: new Date().toISOString(),
      last_modified: new Date().toISOString(),
    };

    it('should_emit_SuscripcionActivadaEvent_only_after_transaction_commits', async () => {
      // Arrange
      mockPrismaService.suscripcion.findFirst.mockResolvedValue(
        mockSuscripcion,
      );

      // Ahora el PreapprovalWebhookService delega a stateTransitionService
      // El evento pendiente se emite DESPUÉS del commit
      mockStateTransitionService.transicionarAActiva.mockImplementation(
        async () => {
          // Simular la transacción
          await mockPrismaService.$transaction(async () => {
            mockPrismaService.suscripcion.update({});
          });
          return {
            result: {
              success: true,
              action: 'activated',
              suscripcionId: 'suscripcion-123',
              message: 'Suscripción activada',
            },
            pendingEvent: {
              eventName: SuscripcionActivadaEvent.EVENT_NAME,
              payload: new SuscripcionActivadaEvent({
                suscripcionId: 'suscripcion-123',
                tutorId: 'tutor-123',
                mpPaymentId: 'mp-preapproval-123',
              }),
            },
          };
        },
      );

      // Act
      await webhookService.processWebhook(webhookPayload, preapprovalDetail);

      // Assert: El commit debe ocurrir ANTES del emit
      const commitIndex = operationOrder.indexOf('transaction:commit');
      const emitIndex = operationOrder.indexOf(
        `emit:${SuscripcionActivadaEvent.EVENT_NAME}`,
      );

      expect(commitIndex).toBeGreaterThan(-1);
      expect(emitIndex).toBeGreaterThan(-1);
      expect(commitIndex).toBeLessThan(emitIndex);
    });

    it('should_never_emit_event_when_webhook_processing_fails', async () => {
      // Arrange
      mockPrismaService.suscripcion.findFirst.mockResolvedValue(
        mockSuscripcion,
      );

      // El servicio lanza error, no debe haber evento
      mockStateTransitionService.transicionarAActiva.mockRejectedValue(
        new Error('DB error'),
      );

      // Act
      try {
        await webhookService.processWebhook(webhookPayload, preapprovalDetail);
      } catch {
        // Expected
      }

      // Assert
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });
  });
});
