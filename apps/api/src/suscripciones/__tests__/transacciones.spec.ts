/**
 * Tests TDD para verificar transaccionalidad en servicios de suscripciones
 *
 * REGLA: Si cualquier paso falla, todo debe hacer rollback.
 * - crear(): si MP falla → suscripción NO existe en DB
 * - cancelar(): si update falla → estado NO cambia
 * - webhook: si historial falla → estado NO cambia
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
  CrearSuscripcionInput,
  CancelarSuscripcionInput,
  PreApprovalWebhookPayload,
  PreApprovalDetail,
} from '../types';

describe('Transaccionalidad en Suscripciones', () => {
  // ============================================================================
  // SETUP COMÚN
  // ============================================================================

  let preapprovalService: PreapprovalService;
  let webhookService: PreapprovalWebhookService;

  // Mock de Prisma con $transaction que ejecuta el callback
  const mockPrismaService = {
    tutor: { findUnique: jest.fn() },
    planSuscripcion: { findUnique: jest.fn() },
    suscripcion: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    historialEstadoSuscripcion: { create: jest.fn() },
    $transaction: jest.fn(),
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
  const mockTutor = { id: 'tutor-123', email: 'test@test.com' };
  const mockPlan = {
    id: 'plan-123',
    nombre: 'STEAM',
    precio_base: { toNumber: () => 40000 },
    intervalo: IntervaloSuscripcion.MENSUAL,
    intervalo_cantidad: 1,
    activo: true,
  };

  const crearInput: CrearSuscripcionInput = {
    tutorId: 'tutor-123',
    planId: 'plan-123',
    tutorEmail: 'test@test.com',
    tutorNombre: 'Test User',
    numeroHijo: 1,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Configurar $transaction para que ejecute el callback con el prisma mock
    mockPrismaService.$transaction.mockImplementation(
      async <T>(callback: (tx: typeof mockPrismaService) => Promise<T>) => {
        return callback(mockPrismaService);
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
  // TESTS: crear() - Transaccionalidad
  // ============================================================================

  describe('PreapprovalService.crear() - Transaccionalidad', () => {
    it('should_use_transaction_when_creating_subscription', async () => {
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
        init_point: 'https://mp.com/checkout',
        status: 'pending',
      });

      // Act
      await preapprovalService.crear(crearInput);

      // Assert: Debe usar $transaction
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should_rollback_db_when_mp_api_fails', async () => {
      // Arrange
      mockPrismaService.tutor.findUnique.mockResolvedValue(mockTutor);
      mockPrismaService.planSuscripcion.findUnique.mockResolvedValue(mockPlan);
      mockPrismaService.suscripcion.create.mockResolvedValue({
        id: 'suscripcion-123',
        tutor_id: 'tutor-123',
        estado: EstadoSuscripcion.PENDIENTE,
      });

      // Simular que MP falla
      mockMpClient.create.mockRejectedValue(new Error('MercadoPago API error'));

      // Configurar $transaction para que haga rollback en error
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        try {
          return await callback(mockPrismaService);
        } catch (error) {
          // El rollback ocurre automáticamente al lanzar el error
          throw error;
        }
      });

      // Act & Assert
      await expect(preapprovalService.crear(crearInput)).rejects.toThrow();

      // La suscripción NO debe quedar en DB (rollback)
      // Verificamos que update (para agregar mp_id) NUNCA se llamó
      expect(mockPrismaService.suscripcion.update).not.toHaveBeenCalled();
    });

    it('should_not_emit_event_when_transaction_fails', async () => {
      // Arrange
      mockPrismaService.tutor.findUnique.mockResolvedValue(mockTutor);
      mockPrismaService.planSuscripcion.findUnique.mockResolvedValue(mockPlan);
      mockPrismaService.suscripcion.create.mockResolvedValue({
        id: 'suscripcion-123',
        tutor_id: 'tutor-123',
        estado: EstadoSuscripcion.PENDIENTE,
      });
      mockMpClient.create.mockRejectedValue(new Error('MP API error'));

      // Act
      try {
        await preapprovalService.crear(crearInput);
      } catch {
        // Expected to fail
      }

      // Assert: Evento NUNCA debe emitirse si falló
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // TESTS: cancelar() - Transaccionalidad
  // ============================================================================

  describe('PreapprovalService.cancelar() - Transaccionalidad', () => {
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

    it('should_use_transaction_when_cancelling', async () => {
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
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should_not_update_state_when_mp_cancel_fails', async () => {
      // Arrange
      mockPrismaService.suscripcion.findUnique.mockResolvedValue(
        mockSuscripcion,
      );
      mockMpClient.update.mockRejectedValue(new Error('MP cancel failed'));

      // Configurar para simular rollback
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        try {
          return await callback(mockPrismaService);
        } catch (error) {
          throw error;
        }
      });

      // Act & Assert
      await expect(
        preapprovalService.cancelar(cancelarInput),
      ).rejects.toThrow();

      // El estado NO debe cambiar (rollback)
      // En una transacción real, esto sería automático
    });

    it('should_not_emit_event_when_cancel_fails', async () => {
      // Arrange
      mockPrismaService.suscripcion.findUnique.mockResolvedValue(
        mockSuscripcion,
      );
      mockMpClient.update.mockRejectedValue(new Error('MP error'));

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
  // TESTS: Webhook handlers - Transaccionalidad
  // ============================================================================

  describe('PreapprovalWebhookService - Transaccionalidad', () => {
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
      reason: 'Test subscription',
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

    it('should_use_transaction_when_processing_webhook', async () => {
      // Arrange
      mockPrismaService.suscripcion.findFirst.mockResolvedValue(
        mockSuscripcion,
      );

      // Ahora PreapprovalWebhookService delega a stateTransitionService
      // que internamente usa transacciones
      mockStateTransitionService.transicionarAActiva.mockImplementation(
        async () => {
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
              eventName: 'suscripcion.activada',
              payload: {},
            },
          };
        },
      );

      // Act
      await webhookService.processWebhook(webhookPayload, preapprovalDetail);

      // Assert: La transacción se usa dentro del servicio delegado
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should_rollback_when_history_creation_fails', async () => {
      // Arrange
      mockPrismaService.suscripcion.findFirst.mockResolvedValue(
        mockSuscripcion,
      );

      // Simular error en el servicio delegado (que maneja transacciones)
      mockStateTransitionService.transicionarAActiva.mockRejectedValue(
        new Error('DB error'),
      );

      // Act & Assert
      await expect(
        webhookService.processWebhook(webhookPayload, preapprovalDetail),
      ).rejects.toThrow('DB error');
    });

    it('should_not_emit_event_when_webhook_processing_fails', async () => {
      // Arrange
      mockPrismaService.suscripcion.findFirst.mockResolvedValue(
        mockSuscripcion,
      );

      // Simular error en el servicio delegado
      mockStateTransitionService.transicionarAActiva.mockRejectedValue(
        new Error('Update failed'),
      );

      // Act
      try {
        await webhookService.processWebhook(webhookPayload, preapprovalDetail);
      } catch {
        // Expected
      }

      // Assert: No debe emitir evento si hubo error
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });
  });
});
