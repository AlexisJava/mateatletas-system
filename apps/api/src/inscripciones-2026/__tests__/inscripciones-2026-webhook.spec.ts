import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { Inscripciones2026Service } from '../inscripciones-2026.service';
import { PrismaService } from '../../core/database/prisma.service';
import { MercadoPagoService } from '../../pagos/mercadopago.service';
import { ConfigService } from '@nestjs/config';
import { PricingCalculatorService } from '../../domain/services/pricing-calculator.service';
import { PinGeneratorService } from '../../shared/services/pin-generator.service';
import { TutorCreationService } from '../../shared/services/tutor-creation.service';
import { MercadoPagoWebhookDto } from '../../pagos/dto/mercadopago-webhook.dto';
import {
  ValidarInscripcionUseCase,
  ProcesarWebhookInscripcionUseCase,
} from '../use-cases';

/**
 * TESTS PARA WEBHOOK INSCRIPCIONES 2026 - SERVICE FACADE
 *
 * NOTA: Los tests detallados de la lógica de webhook están en:
 * - procesar-webhook-inscripcion.use-case.spec.ts
 *
 * Este archivo prueba que el service facade delega correctamente
 * al ProcesarWebhookInscripcionUseCase.
 *
 * Cobertura:
 * - Delegación correcta al use-case
 * - Propagación de respuestas exitosas
 * - Propagación de errores
 * - Diferentes tipos de webhook
 * - Diferentes estados de pago
 */

describe('Inscripciones2026Service - Webhook Processing (Facade)', () => {
  let service: Inscripciones2026Service;
  let procesarWebhookUseCase: ProcesarWebhookInscripcionUseCase;

  // Mock data
  const mockWebhookData: MercadoPagoWebhookDto = {
    action: 'payment.updated',
    type: 'payment',
    data: {
      id: '123456789',
    },
    live_mode: true,
    date_created: '2024-01-15T10:30:00Z',
    id: 'webhook-test-id',
    user_id: '123456',
    api_version: 'v1',
  };

  const mockPrismaService = {
    pagoInscripcion2026: { findFirst: jest.fn(), update: jest.fn() },
    inscripcion2026: { findUnique: jest.fn(), update: jest.fn() },
    historialEstadoInscripcion2026: { create: jest.fn() },
    $transaction: jest.fn(),
  };

  const mockMercadoPagoService = {
    getPayment: jest.fn(),
    isMockMode: jest.fn().mockReturnValue(false),
    createPreference: jest.fn(),
    buildInscripcion2026PreferenceData: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'BACKEND_URL') return 'http://localhost:3001';
      if (key === 'FRONTEND_URL') return 'http://localhost:3000';
      return null;
    }),
  };

  const mockPricingCalculator = {
    calcularTarifaInscripcion: jest.fn().mockReturnValue(25000),
    calcularTotalInscripcion2026: jest
      .fn()
      .mockReturnValue({ total: 158400, descuento: 12 }),
    aplicarDescuento: jest.fn((base, desc) => base * (1 - desc / 100)),
  };

  const mockPinGenerator = {
    generateUniquePin: jest
      .fn()
      .mockImplementation(async () =>
        Math.floor(1000 + Math.random() * 9000).toString(),
      ),
  };

  const mockTutorCreation = {
    hashPassword: jest.fn().mockResolvedValue('$2b$10$hashedpassword'),
    validateUniqueEmail: jest.fn(),
  };

  const mockValidarInscripcionUseCase = {
    execute: jest.fn().mockReturnValue({
      isValid: true,
      inscripcionFee: 25000,
      monthlyTotal: 158400,
      siblingDiscount: 12,
      cursosPerStudent: [1],
    }),
  };

  const mockProcesarWebhookUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Inscripciones2026Service,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MercadoPagoService, useValue: mockMercadoPagoService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PricingCalculatorService, useValue: mockPricingCalculator },
        { provide: PinGeneratorService, useValue: mockPinGenerator },
        { provide: TutorCreationService, useValue: mockTutorCreation },
        {
          provide: ValidarInscripcionUseCase,
          useValue: mockValidarInscripcionUseCase,
        },
        {
          provide: ProcesarWebhookInscripcionUseCase,
          useValue: mockProcesarWebhookUseCase,
        },
      ],
    }).compile();

    service = module.get<Inscripciones2026Service>(Inscripciones2026Service);
    procesarWebhookUseCase = module.get<ProcesarWebhookInscripcionUseCase>(
      ProcesarWebhookInscripcionUseCase,
    );

    jest.clearAllMocks();
  });

  describe('Webhook Delegation to UseCase', () => {
    it('should delegate webhook processing to ProcesarWebhookInscripcionUseCase', async () => {
      mockProcesarWebhookUseCase.execute.mockResolvedValueOnce({
        success: true,
        inscripcionId: 'inscabc123',
        paymentStatus: 'paid',
        inscripcionStatus: 'active',
      });

      const result = await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(procesarWebhookUseCase.execute).toHaveBeenCalledWith(
        mockWebhookData,
      );
      expect(result).toEqual({
        success: true,
        inscripcionId: 'inscabc123',
        paymentStatus: 'paid',
        inscripcionStatus: 'active',
      });
    });

    it('should pass exact webhook data to use-case without modification', async () => {
      const specificWebhookData: MercadoPagoWebhookDto = {
        action: 'payment.created',
        type: 'payment',
        data: { id: 'specific-payment-id-12345' },
        live_mode: false,
        date_created: '2024-06-15T15:45:00Z',
        id: 'webhook-specific-id',
        user_id: '999888',
        api_version: 'v2',
      };

      mockProcesarWebhookUseCase.execute.mockResolvedValueOnce({
        success: true,
        paymentId: 'specific-payment-id-12345',
      });

      await service.procesarWebhookMercadoPago(specificWebhookData);

      expect(procesarWebhookUseCase.execute).toHaveBeenCalledWith(
        specificWebhookData,
      );
    });
  });

  describe('Webhook Type Handling via UseCase', () => {
    it('should return use-case response for non-payment webhooks', async () => {
      const merchantOrderWebhook = {
        ...mockWebhookData,
        type: 'merchant_order',
      };

      mockProcesarWebhookUseCase.execute.mockResolvedValueOnce({
        success: false,
        message: 'Webhook type not handled',
      });

      const result =
        await service.procesarWebhookMercadoPago(merchantOrderWebhook);

      expect(result).toEqual({
        success: false,
        message: 'Webhook type not handled',
      });
    });
  });

  describe('Payment Status Processing via UseCase', () => {
    it('should return approved payment result from use-case', async () => {
      mockProcesarWebhookUseCase.execute.mockResolvedValueOnce({
        success: true,
        inscripcionId: 'ins-123',
        paymentStatus: 'paid',
        inscripcionStatus: 'active',
      });

      const result = await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(result).toEqual({
        success: true,
        inscripcionId: 'ins-123',
        paymentStatus: 'paid',
        inscripcionStatus: 'active',
      });
    });

    it('should return rejected payment result from use-case', async () => {
      mockProcesarWebhookUseCase.execute.mockResolvedValueOnce({
        success: true,
        inscripcionId: 'ins-456',
        paymentStatus: 'failed',
        inscripcionStatus: 'payment_failed',
      });

      const result = await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(result.paymentStatus).toBe('failed');
      expect(result.inscripcionStatus).toBe('payment_failed');
    });

    it('should return pending payment result from use-case', async () => {
      mockProcesarWebhookUseCase.execute.mockResolvedValueOnce({
        success: true,
        inscripcionId: 'ins-789',
        paymentStatus: 'pending',
        inscripcionStatus: 'pending',
      });

      const result = await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(result.paymentStatus).toBe('pending');
      expect(result.inscripcionStatus).toBe('pending');
    });
  });

  describe('Idempotency Handling via UseCase', () => {
    it('should return idempotent response from use-case for duplicate webhooks', async () => {
      mockProcesarWebhookUseCase.execute.mockResolvedValueOnce({
        success: true,
        message: 'Already processed (idempotent)',
        paymentId: '123456789',
      });

      const result = await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(result).toEqual({
        success: true,
        message: 'Already processed (idempotent)',
        paymentId: '123456789',
      });
    });
  });

  describe('Error Handling via UseCase', () => {
    it('should propagate BadRequestException from use-case for missing payment_id', async () => {
      mockProcesarWebhookUseCase.execute.mockRejectedValue(
        new BadRequestException('payment_id is required'),
      );

      await expect(
        service.procesarWebhookMercadoPago(mockWebhookData),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.procesarWebhookMercadoPago(mockWebhookData),
      ).rejects.toThrow('payment_id is required');
    });

    it('should propagate BadRequestException from use-case for fraud detection', async () => {
      mockProcesarWebhookUseCase.execute.mockRejectedValueOnce(
        new BadRequestException(
          'Payment amount validation failed: Amount mismatch',
        ),
      );

      await expect(
        service.procesarWebhookMercadoPago(mockWebhookData),
      ).rejects.toThrow('Payment amount validation failed');
    });

    it('should propagate use-case response for payment not found', async () => {
      mockProcesarWebhookUseCase.execute.mockResolvedValueOnce({
        success: false,
        message: 'Payment not found in database',
      });

      const result = await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(result).toEqual({
        success: false,
        message: 'Payment not found in database',
      });
    });

    it('should propagate use-case response for invalid external reference', async () => {
      mockProcesarWebhookUseCase.execute.mockResolvedValueOnce({
        success: false,
        message: 'Invalid external_reference format',
      });

      const result = await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(result).toEqual({
        success: false,
        message: 'Invalid external_reference format',
      });
    });

    it('should propagate use-case response for null external reference', async () => {
      mockProcesarWebhookUseCase.execute.mockResolvedValueOnce({
        success: false,
        message: 'Payment without external_reference',
      });

      const result = await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(result).toEqual({
        success: false,
        message: 'Payment without external_reference',
      });
    });

    it('should propagate generic errors from use-case', async () => {
      mockProcesarWebhookUseCase.execute.mockRejectedValueOnce(
        new Error('Unexpected error in use-case'),
      );

      await expect(
        service.procesarWebhookMercadoPago(mockWebhookData),
      ).rejects.toThrow('Unexpected error in use-case');
    });
  });

  describe('Edge Cases via UseCase', () => {
    it('should handle different inscription types via use-case', async () => {
      const testCases = [
        { tipo: 'COLONIA', inscripcionId: 'ins-colonia' },
        { tipo: 'CICLO_2026', inscripcionId: 'ins-ciclo' },
        { tipo: 'PACK_COMPLETO', inscripcionId: 'ins-pack' },
      ];

      for (const testCase of testCases) {
        mockProcesarWebhookUseCase.execute.mockResolvedValueOnce({
          success: true,
          inscripcionId: testCase.inscripcionId,
          paymentStatus: 'paid',
          inscripcionStatus: 'active',
        });

        const result =
          await service.procesarWebhookMercadoPago(mockWebhookData);

        expect(result.inscripcionId).toBe(testCase.inscripcionId);
      }
    });

    it('should handle already active inscription via use-case', async () => {
      mockProcesarWebhookUseCase.execute.mockResolvedValueOnce({
        success: true,
        inscripcionId: 'ins-already-active',
        paymentStatus: 'paid',
        inscripcionStatus: 'active',
        message: 'State unchanged - already active',
      });

      const result = await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(result.success).toBe(true);
      expect(result.inscripcionStatus).toBe('active');
    });
  });
});
