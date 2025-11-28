import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProcesarWebhookInscripcionUseCase } from '../procesar-webhook-inscripcion.use-case';
import { PrismaService } from '../../../core/database/prisma.service';
import { MercadoPagoWebhookProcessorService } from '../../../shared/services/mercadopago-webhook-processor.service';
import { WebhookIdempotencyService } from '../../../pagos/services/webhook-idempotency.service';
import { PaymentAmountValidatorService } from '../../../pagos/services/payment-amount-validator.service';
import { MercadoPagoWebhookDto } from '../../../pagos/dto/mercadopago-webhook.dto';

describe('ProcesarWebhookInscripcionUseCase', () => {
  let useCase: ProcesarWebhookInscripcionUseCase;
  let mockPrismaService: jest.Mocked<PrismaService>;
  let mockWebhookProcessor: jest.Mocked<MercadoPagoWebhookProcessorService>;
  let mockWebhookIdempotency: jest.Mocked<WebhookIdempotencyService>;
  let mockAmountValidator: jest.Mocked<PaymentAmountValidatorService>;

  // Mock data
  const mockPaymentId = 'payment-123';
  const mockInscripcionId = 'inscripcion-456';

  const mockWebhookData: MercadoPagoWebhookDto = {
    type: 'payment',
    action: 'payment.created',
    data: {
      id: mockPaymentId,
    },
  };

  const mockPago = {
    id: 'pago-id',
    inscripcion_id: mockInscripcionId,
    tipo: 'inscripcion',
    monto: 50000,
    estado: 'pending',
    inscripcion: {
      id: mockInscripcionId,
      estado: 'pending',
    },
  };

  beforeEach(async () => {
    mockPrismaService = {
      pagoInscripcion2026: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      inscripcion2026: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      historialEstadoInscripcion2026: {
        create: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(mockPrismaService)),
    } as unknown as jest.Mocked<PrismaService>;

    mockWebhookProcessor = {
      processWebhook: jest.fn(),
      mapPaymentStatus: jest.fn().mockReturnValue('paid'),
    } as unknown as jest.Mocked<MercadoPagoWebhookProcessorService>;

    mockWebhookIdempotency = {
      wasProcessed: jest.fn().mockResolvedValue(false),
      markAsProcessed: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<WebhookIdempotencyService>;

    mockAmountValidator = {
      validatePagoInscripcion2026: jest.fn().mockResolvedValue({
        isValid: true,
        expectedAmount: 50000,
        receivedAmount: 50000,
      }),
    } as unknown as jest.Mocked<PaymentAmountValidatorService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcesarWebhookInscripcionUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: MercadoPagoWebhookProcessorService,
          useValue: mockWebhookProcessor,
        },
        {
          provide: WebhookIdempotencyService,
          useValue: mockWebhookIdempotency,
        },
        {
          provide: PaymentAmountValidatorService,
          useValue: mockAmountValidator,
        },
      ],
    }).compile();

    useCase = module.get<ProcesarWebhookInscripcionUseCase>(
      ProcesarWebhookInscripcionUseCase,
    );
  });

  describe('execute', () => {
    it('should_throw_BadRequestException_if_payment_id_missing', async () => {
      // Arrange
      const webhookWithoutPaymentId: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'payment.created',
        data: {
          id: '',
        },
      };

      // Act & Assert
      await expect(useCase.execute(webhookWithoutPaymentId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(useCase.execute(webhookWithoutPaymentId)).rejects.toThrow(
        'payment_id is required',
      );
    });

    it('should_return_success_if_already_processed_idempotent', async () => {
      // Arrange
      mockWebhookIdempotency.wasProcessed.mockResolvedValue(true);

      // Act
      const result = await useCase.execute(mockWebhookData);

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Already processed (idempotent)',
        paymentId: mockPaymentId,
      });
      expect(mockWebhookProcessor.processWebhook).not.toHaveBeenCalled();
    });

    it('should_process_webhook_and_mark_as_processed', async () => {
      // Arrange
      mockWebhookProcessor.processWebhook.mockResolvedValue({
        success: true,
        inscripcionId: mockInscripcionId,
        paymentStatus: 'paid',
        inscripcionStatus: 'active',
      });

      // Act
      const result = await useCase.execute(mockWebhookData);

      // Assert
      expect(mockWebhookIdempotency.wasProcessed).toHaveBeenCalledWith(
        mockPaymentId,
      );
      expect(mockWebhookProcessor.processWebhook).toHaveBeenCalled();
      expect(mockWebhookIdempotency.markAsProcessed).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should_not_mark_as_processed_if_webhook_fails', async () => {
      // Arrange
      mockWebhookProcessor.processWebhook.mockResolvedValue({
        success: false,
        error: 'Processing failed',
      });

      // Act
      const result = await useCase.execute(mockWebhookData);

      // Assert
      expect(mockWebhookIdempotency.markAsProcessed).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
    });
  });

  describe('amount validation', () => {
    it('should_validate_amount_before_approving_payment', async () => {
      // Arrange
      mockPrismaService.inscripcion2026.findUnique.mockResolvedValue({
        id: mockInscripcionId,
        estado: 'pending',
      });

      mockWebhookProcessor.processWebhook.mockImplementation(
        async (_, __, _findPago, updateCallback) => {
          // Simular el contexto del webhook processor
          const context = {
            paymentStatus: 'approved',
            payment: {
              id: mockPaymentId,
              transaction_amount: 50000,
            },
            parsedReference: {
              ids: { inscripcionId: mockInscripcionId },
            },
          };

          // Llamar al callback de actualización
          await updateCallback(mockPago, context);

          return {
            success: true,
            inscripcionId: mockInscripcionId,
            paymentStatus: 'paid',
          };
        },
      );

      // Act
      await useCase.execute(mockWebhookData);

      // Assert
      expect(
        mockAmountValidator.validatePagoInscripcion2026,
      ).toHaveBeenCalled();
    });

    it('should_throw_if_amount_validation_fails', async () => {
      // Arrange
      mockAmountValidator.validatePagoInscripcion2026.mockResolvedValue({
        isValid: false,
        expectedAmount: 50000,
        receivedAmount: 30000,
        difference: 20000,
        reason: 'Amount mismatch',
      });

      mockWebhookProcessor.processWebhook.mockImplementation(
        async (_, __, _findPago, updateCallback) => {
          const context = {
            paymentStatus: 'approved',
            payment: {
              id: mockPaymentId,
              transaction_amount: 30000,
            },
            parsedReference: {
              ids: { inscripcionId: mockInscripcionId },
            },
          };

          await updateCallback(mockPago, context);
          return { success: true };
        },
      );

      // Act & Assert
      await expect(useCase.execute(mockWebhookData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('state transitions', () => {
    it('should_update_inscripcion_to_active_when_payment_approved', async () => {
      // Arrange
      mockPrismaService.inscripcion2026.findUnique.mockResolvedValue({
        id: mockInscripcionId,
        estado: 'pending',
      });

      mockWebhookProcessor.processWebhook.mockImplementation(
        async (_, __, _findPago, updateCallback) => {
          const context = {
            paymentStatus: 'approved',
            payment: { id: mockPaymentId, transaction_amount: 50000 },
            parsedReference: { ids: { inscripcionId: mockInscripcionId } },
          };
          await updateCallback(mockPago, context);
          return { success: true, inscripcionId: mockInscripcionId };
        },
      );

      // Act
      await useCase.execute(mockWebhookData);

      // Assert
      expect(mockPrismaService.inscripcion2026.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockInscripcionId },
          data: { estado: 'active' },
        }),
      );
    });

    it('should_update_inscripcion_to_payment_failed_when_payment_fails', async () => {
      // Arrange
      mockWebhookProcessor.mapPaymentStatus.mockReturnValue('failed');
      mockPrismaService.inscripcion2026.findUnique.mockResolvedValue({
        id: mockInscripcionId,
        estado: 'pending',
      });

      mockWebhookProcessor.processWebhook.mockImplementation(
        async (_, __, _findPago, updateCallback) => {
          const context = {
            paymentStatus: 'rejected',
            payment: { id: mockPaymentId },
            parsedReference: { ids: { inscripcionId: mockInscripcionId } },
          };
          await updateCallback(mockPago, context);
          return { success: true, inscripcionId: mockInscripcionId };
        },
      );

      // Act
      await useCase.execute(mockWebhookData);

      // Assert
      expect(mockPrismaService.inscripcion2026.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockInscripcionId },
          data: { estado: 'payment_failed' },
        }),
      );
    });

    it('should_create_historial_entry_on_state_change', async () => {
      // Arrange
      mockPrismaService.inscripcion2026.findUnique.mockResolvedValue({
        id: mockInscripcionId,
        estado: 'pending',
      });

      mockWebhookProcessor.processWebhook.mockImplementation(
        async (_, __, _findPago, updateCallback) => {
          const context = {
            paymentStatus: 'approved',
            payment: { id: mockPaymentId, transaction_amount: 50000 },
            parsedReference: { ids: { inscripcionId: mockInscripcionId } },
          };
          await updateCallback(mockPago, context);
          return { success: true, inscripcionId: mockInscripcionId };
        },
      );

      // Act
      await useCase.execute(mockWebhookData);

      // Assert
      expect(
        mockPrismaService.historialEstadoInscripcion2026.create,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            inscripcion_id: mockInscripcionId,
            estado_anterior: 'pending',
            estado_nuevo: 'active',
            realizado_por: 'mercadopago-webhook',
          }),
        }),
      );
    });
  });

  describe('race condition handling', () => {
    it('should_handle_P2002_error_gracefully_race_condition', async () => {
      // Arrange
      const prismaError = { code: 'P2002' };
      mockWebhookIdempotency.markAsProcessed.mockRejectedValue(prismaError);
      mockWebhookProcessor.processWebhook.mockResolvedValue({
        success: true,
        inscripcionId: mockInscripcionId,
      });

      // Act - should not throw
      const result = await useCase.execute(mockWebhookData);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});
