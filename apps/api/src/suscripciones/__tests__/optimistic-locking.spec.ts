/**
 * Tests TDD para Optimistic Locking en Suscripciones
 *
 * REGLAS:
 * - Cada update debe incluir version en WHERE
 * - Si version no coincide, lanza error (alguien más actualizó)
 * - El que llegue primero gana, el otro debe reintentar
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Prisma,
  EstadoSuscripcion,
  IntervaloSuscripcion,
} from '@prisma/client';

import { PreapprovalService } from '../services/preapproval.service';
import { PreapprovalWebhookService } from '../services/preapproval-webhook.service';
import { SuscripcionStateTransitionService } from '../services/suscripcion-state-transition.service';
import { GracePeriodService } from '../services/grace-period.service';
import { PrismaService } from '../../core/database/prisma.service';
import { WebhookIdempotencyService } from '../../pagos/services/webhook-idempotency.service';
import {
  OptimisticLockError,
  isOptimisticLockError,
} from '../errors/optimistic-lock.error';

describe('Optimistic Locking', () => {
  let preapprovalService: PreapprovalService;
  let webhookService: PreapprovalWebhookService;

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
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  const mockEventEmitter = { emit: jest.fn() };
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
  const mockSuscripcion = {
    id: 'suscripcion-123',
    tutor_id: 'tutor-123',
    plan_id: 'plan-123',
    estado: EstadoSuscripcion.ACTIVA,
    mp_preapproval_id: 'mp-123',
    version: 1, // Versión actual
    plan: { nombre: 'STEAM' },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

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

  describe('PreapprovalService.cancelar()', () => {
    it('should_include_version_in_update_where_clause', async () => {
      // Arrange
      mockPrismaService.suscripcion.findUnique.mockResolvedValue(
        mockSuscripcion,
      );
      mockPrismaService.suscripcion.update.mockResolvedValue({
        ...mockSuscripcion,
        estado: EstadoSuscripcion.CANCELADA,
        version: 2,
      });
      mockMpClient.update.mockResolvedValue({ status: 'cancelled' });

      // Act
      await preapprovalService.cancelar({
        suscripcionId: 'suscripcion-123',
        tutorId: 'tutor-123',
        motivo: 'Test',
        canceladoPor: 'tutor',
      });

      // Assert: El update debe incluir version en where
      expect(mockPrismaService.suscripcion.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'suscripcion-123',
            version: 1, // Debe coincidir con version actual
          }),
          data: expect.objectContaining({
            version: { increment: 1 }, // Debe incrementar version
          }),
        }),
      );
    });

    it('should_throw_OptimisticLockError_when_version_mismatch', async () => {
      // Arrange
      mockPrismaService.suscripcion.findUnique.mockResolvedValue(
        mockSuscripcion,
      );

      // Simular que alguien más actualizó (RecordNotFound por version mismatch)
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record to update not found',
        { code: 'P2025', clientVersion: '5.0.0' },
      );
      mockPrismaService.suscripcion.update.mockRejectedValue(prismaError);
      mockMpClient.update.mockResolvedValue({ status: 'cancelled' });

      // Act & Assert
      await expect(
        preapprovalService.cancelar({
          suscripcionId: 'suscripcion-123',
          tutorId: 'tutor-123',
          motivo: 'Test',
          canceladoPor: 'tutor',
        }),
      ).rejects.toThrow(OptimisticLockError);
    });
  });

  describe('PreapprovalWebhookService - delegación a stateTransitionService', () => {
    const webhookPayload = {
      type: 'subscription_preapproval' as const,
      action: 'updated' as const,
      id: 'webhook-123',
      api_version: 'v1',
      date_created: new Date().toISOString(),
      live_mode: false,
      user_id: 'user-123',
      data: { id: 'mp-preapproval-123' },
    };

    const preapprovalDetail = {
      id: 'mp-preapproval-123',
      status: 'authorized' as const,
      external_reference: 'suscripcion-123',
      payer_email: 'test@test.com',
      payer_id: 123,
      reason: 'Test',
      next_payment_date: new Date().toISOString(),
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months' as const,
        transaction_amount: 40000,
        currency_id: 'ARS' as const,
      },
      date_created: new Date().toISOString(),
      last_modified: new Date().toISOString(),
    };

    it('should_delegate_activation_to_stateTransitionService', async () => {
      // Arrange
      const pendingSuscripcion = {
        ...mockSuscripcion,
        estado: EstadoSuscripcion.PENDIENTE,
        version: 0,
      };
      mockPrismaService.suscripcion.findFirst.mockResolvedValue(
        pendingSuscripcion,
      );

      // El servicio delegado maneja el optimistic locking internamente
      mockStateTransitionService.transicionarAActiva.mockResolvedValue({
        result: {
          success: true,
          action: 'activated',
          suscripcionId: 'suscripcion-123',
          message: 'Suscripción activada',
        },
        pendingEvent: {
          eventName: 'suscripcion.activada',
          payload: {},
        },
      });

      // Act
      await webhookService.processWebhook(webhookPayload, preapprovalDetail);

      // Assert: Debe delegar al servicio con la suscripción y detalle
      expect(
        mockStateTransitionService.transicionarAActiva,
      ).toHaveBeenCalledWith(pendingSuscripcion, preapprovalDetail);
    });

    it('should_propagate_OptimisticLockError_from_stateTransitionService', async () => {
      // Arrange
      const pendingSuscripcion = {
        ...mockSuscripcion,
        estado: EstadoSuscripcion.PENDIENTE,
        version: 0,
      };
      mockPrismaService.suscripcion.findFirst.mockResolvedValue(
        pendingSuscripcion,
      );

      // El servicio delegado lanza OptimisticLockError
      mockStateTransitionService.transicionarAActiva.mockRejectedValue(
        new OptimisticLockError('suscripcion-123', 0),
      );

      // Act & Assert: El error se propaga
      await expect(
        webhookService.processWebhook(webhookPayload, preapprovalDetail),
      ).rejects.toThrow(OptimisticLockError);
    });
  });

  describe('isOptimisticLockError helper', () => {
    it('should_return_true_for_OptimisticLockError', () => {
      const error = new OptimisticLockError('suscripcion-123', 1);
      expect(isOptimisticLockError(error)).toBe(true);
    });

    it('should_return_true_for_Prisma_P2025_error', () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: '5.0.0' },
      );
      expect(isOptimisticLockError(error)).toBe(true);
    });

    it('should_return_false_for_other_errors', () => {
      const error = new Error('Random error');
      expect(isOptimisticLockError(error)).toBe(false);
    });
  });
});
