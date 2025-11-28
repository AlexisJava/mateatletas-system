/**
 * Test Suite: Amount Validation - Inscripciones 2026
 *
 * OBJETIVO:
 * Validar que el sistema previene fraude verificando que el monto recibido
 * en el webhook de MercadoPago coincida con el monto esperado en la base de datos.
 *
 * NOTA: Los tests detallados de validación de monto están en:
 * - procesar-webhook-inscripcion.use-case.spec.ts
 *
 * Este test verifica que el service facade delega correctamente al use-case.
 *
 * ESTÁNDAR INTERNACIONAL:
 * - OWASP A04:2021 - Insecure Design
 * - PCI DSS Req 6.5.10 - Broken Authentication
 * - ISO 27001 A.14.2.5 - Secure Development
 */

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

describe('Inscripciones2026Service - Amount Validation (Facade)', () => {
  let service: Inscripciones2026Service;
  let procesarWebhookUseCase: ProcesarWebhookInscripcionUseCase;

  const mockPrismaService = {
    pagoInscripcion2026: { findFirst: jest.fn(), update: jest.fn() },
    inscripcion2026: { findUnique: jest.fn(), update: jest.fn() },
    historialEstadoInscripcion2026: { create: jest.fn() },
    $transaction: jest.fn(),
  };

  const mockMercadoPagoService = {
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
    calcularTarifaInscripcion: jest.fn(),
    calcularDescuentoInscripcion2026: jest.fn(),
    calcularTotalInscripcion2026: jest.fn(),
    aplicarDescuento: jest.fn(),
  };

  const mockPinGenerator = { generateUniquePin: jest.fn() };
  const mockTutorCreation = { hashPassword: jest.fn() };

  const mockValidarInscripcionUseCase = {
    execute: jest.fn().mockReturnValue({
      isValid: true,
      inscripcionFee: 5000,
      monthlyTotal: 15000,
      siblingDiscount: 0,
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

  describe('procesarWebhookMercadoPago - Delegation to UseCase', () => {
    /**
     * TEST 1: Service debe delegar al use-case
     */
    it('should_delegate_webhook_processing_to_usecase', async () => {
      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'payment.updated',
        data: { id: '999888777' },
        date_created: '2025-01-22T10:00:00Z',
        id: 'webhook-test',
        live_mode: true,
        user_id: '123456',
        api_version: 'v1',
      };

      mockProcesarWebhookUseCase.execute.mockResolvedValueOnce({
        success: true,
        inscripcionId: 'ins-123',
        paymentStatus: 'paid',
        inscripcionStatus: 'active',
      });

      const result = await service.procesarWebhookMercadoPago(webhookData);

      expect(procesarWebhookUseCase.execute).toHaveBeenCalledWith(webhookData);
      expect(result).toEqual({
        success: true,
        inscripcionId: 'ins-123',
        paymentStatus: 'paid',
        inscripcionStatus: 'active',
      });
    });

    /**
     * TEST 2: Service debe propagar errores del use-case (fraude detectado)
     */
    it('should_propagate_fraud_detection_error_from_usecase', async () => {
      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'payment.updated',
        data: { id: '111222333' },
        date_created: '2025-01-22T10:00:00Z',
        id: 'webhook-fraud',
        live_mode: true,
        user_id: '123456',
        api_version: 'v1',
      };

      mockProcesarWebhookUseCase.execute.mockRejectedValueOnce(
        new BadRequestException(
          'Payment amount validation failed: Amount mismatch',
        ),
      );

      await expect(
        service.procesarWebhookMercadoPago(webhookData),
      ).rejects.toThrow(BadRequestException);

      expect(procesarWebhookUseCase.execute).toHaveBeenCalledWith(webhookData);
    });

    /**
     * TEST 3: Service debe manejar respuesta idempotente del use-case
     */
    it('should_handle_idempotent_response_from_usecase', async () => {
      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'payment.updated',
        data: { id: '444555666' },
        date_created: '2025-01-22T10:00:00Z',
        id: 'webhook-duplicate',
        live_mode: true,
        user_id: '123456',
        api_version: 'v1',
      };

      mockProcesarWebhookUseCase.execute.mockResolvedValueOnce({
        success: true,
        message: 'Already processed (idempotent)',
        paymentId: '444555666',
      });

      const result = await service.procesarWebhookMercadoPago(webhookData);

      expect(result).toEqual({
        success: true,
        message: 'Already processed (idempotent)',
        paymentId: '444555666',
      });
    });
  });
});
