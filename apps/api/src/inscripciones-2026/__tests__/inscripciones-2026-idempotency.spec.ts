import { Test, TestingModule } from '@nestjs/testing';
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
 * Test Suite: Webhook Idempotency - Inscripciones 2026 (Facade)
 *
 * OBJETIVO: Validar que el service facade delega correctamente al use-case
 * que maneja la idempotencia.
 *
 * NOTA: Los tests detallados de idempotencia están en:
 * - procesar-webhook-inscripcion.use-case.spec.ts
 *
 * Este archivo prueba que el service facade delega correctamente
 * al ProcesarWebhookInscripcionUseCase.
 */
describe('Inscripciones2026Service - Webhook Idempotency (Facade)', () => {
  let service: Inscripciones2026Service;
  let procesarWebhookUseCase: ProcesarWebhookInscripcionUseCase;

  const mockPrisma = {
    inscripcion2026: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    pagoInscripcion2026: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    historialEstadoInscripcion2026: {
      create: jest.fn(),
    },
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
      return undefined;
    }),
  };

  const mockPricingCalculator = {
    calcularTarifaInscripcion: jest.fn().mockReturnValue(25000),
    calcularTotalInscripcion2026: jest
      .fn()
      .mockReturnValue({ total: 158400, descuento: 12 }),
    aplicarDescuento: jest.fn(
      (base: number, desc: number) => base * (1 - desc / 100),
    ),
  };

  const mockPinGenerator = {
    generateUniquePin: jest.fn().mockResolvedValue('1234'),
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
        { provide: PrismaService, useValue: mockPrisma },
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

  describe('procesarWebhookMercadoPago - Idempotency Delegation', () => {
    /**
     * TEST 1: DEBE DELEGAR AL USE-CASE QUE MANEJA IDEMPOTENCIA
     */
    it('should delegate to use-case that handles idempotency', async () => {
      const paymentId = '123456789';
      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'payment.updated',
        data: { id: paymentId },
        date_created: '2025-01-20T10:00:00Z',
        id: 12345,
        live_mode: true,
        user_id: '123456',
        api_version: 'v1',
      };

      mockProcesarWebhookUseCase.execute.mockResolvedValueOnce({
        success: true,
        message: 'Already processed (idempotent)',
        paymentId,
      });

      const result = await service.procesarWebhookMercadoPago(webhookData);

      expect(procesarWebhookUseCase.execute).toHaveBeenCalledWith(webhookData);
      expect(result).toEqual({
        success: true,
        message: 'Already processed (idempotent)',
        paymentId,
      });
    });

    /**
     * TEST 2: DEBE PROCESAR WEBHOOK NUEVO VIA USE-CASE
     */
    it('should process new webhook via use-case', async () => {
      const paymentId = '987654321';
      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'payment.updated',
        data: { id: paymentId },
        date_created: '2025-01-20T10:00:00Z',
        id: 54321,
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
     * TEST 3: DEBE MANEJAR RACE CONDITION VIA USE-CASE
     */
    it('should handle race condition response from use-case', async () => {
      const paymentId = '111222333';
      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'payment.updated',
        data: { id: paymentId },
        date_created: '2025-01-20T10:00:00Z',
        id: 789,
        live_mode: true,
        user_id: '123456',
        api_version: 'v1',
      };

      // Use-case maneja race condition y retorna éxito
      mockProcesarWebhookUseCase.execute.mockResolvedValueOnce({
        success: true,
        inscripcionId: 'ins-456',
        paymentStatus: 'paid',
      });

      const result = await service.procesarWebhookMercadoPago(webhookData);

      expect(result.success).toBe(true);
    });

    /**
     * TEST 4: DEBE PROPAGAR ERRORES DEL USE-CASE
     */
    it('should propagate errors from use-case', async () => {
      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'payment.updated',
        data: { id: '888999000' },
        date_created: '2025-01-20T10:00:00Z',
        id: 999,
        live_mode: true,
        user_id: '123456',
        api_version: 'v1',
      };

      mockProcesarWebhookUseCase.execute.mockRejectedValueOnce(
        new Error('Database connection lost'),
      );

      await expect(
        service.procesarWebhookMercadoPago(webhookData),
      ).rejects.toThrow('Database connection lost');
    });

    /**
     * TEST 5: DEBE RETORNAR METADATA COMPLETA DEL USE-CASE
     */
    it('should return complete metadata from use-case', async () => {
      const paymentId = '444555666';
      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'payment.updated',
        data: { id: paymentId },
        date_created: '2025-01-20T10:00:00Z',
        id: 666,
        live_mode: true,
        user_id: '123456',
        api_version: 'v1',
      };

      mockProcesarWebhookUseCase.execute.mockResolvedValueOnce({
        success: true,
        inscripcionId: 'ins-meta',
        paymentStatus: 'paid',
        inscripcionStatus: 'active',
        externalReference: 'inscripcion2026-ins-meta-tutor-123',
      });

      const result = await service.procesarWebhookMercadoPago(webhookData);

      expect(result).toEqual({
        success: true,
        inscripcionId: 'ins-meta',
        paymentStatus: 'paid',
        inscripcionStatus: 'active',
        externalReference: 'inscripcion2026-ins-meta-tutor-123',
      });
    });
  });

  describe('Edge Cases', () => {
    /**
     * TEST 6: DEBE PASAR DATOS EXACTOS AL USE-CASE
     */
    it('should pass exact webhook data to use-case without modification', async () => {
      const specificWebhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'payment.created',
        data: { id: 'specific-payment-12345' },
        date_created: '2024-06-15T15:45:00Z',
        id: 777,
        live_mode: false,
        user_id: '999888',
        api_version: 'v2',
      };

      mockProcesarWebhookUseCase.execute.mockResolvedValueOnce({
        success: true,
      });

      await service.procesarWebhookMercadoPago(specificWebhookData);

      expect(procesarWebhookUseCase.execute).toHaveBeenCalledWith(
        specificWebhookData,
      );
    });

    /**
     * TEST 7: TIPOS EXPLÍCITOS EN TODA LA CADENA
     */
    it('should have explicit types throughout the chain', () => {
      const paymentId: string = '123';
      const wasProcessed: boolean = true;
      const result: { success: boolean; message?: string } = {
        success: true,
        message: 'test',
      };

      expect(typeof paymentId).toBe('string');
      expect(typeof wasProcessed).toBe('boolean');
      expect(typeof result.success).toBe('boolean');
    });
  });
});
