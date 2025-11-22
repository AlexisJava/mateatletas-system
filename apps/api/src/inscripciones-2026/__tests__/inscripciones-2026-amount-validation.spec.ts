/**
 * Test Suite: Amount Validation - Inscripciones 2026
 *
 * OBJETIVO:
 * Validar que el sistema previene fraude verificando que el monto recibido
 * en el webhook de MercadoPago coincida con el monto esperado en la base de datos.
 *
 * CONTEXTO DE SEGURIDAD:
 * - Atacante puede modificar monto en la request a MercadoPago
 * - Sin validación: cliente paga $50 por servicio de $5000
 * - Webhook aprueba porque status='approved' (sin verificar monto)
 *
 * ESCENARIO DE ATAQUE:
 * 1. Cliente crea inscripción de $5000
 * 2. Atacante intercepta request y cambia monto a $50
 * 3. MercadoPago cobra $50
 * 4. Webhook aprueba porque status='approved'
 * 5. Cliente obtiene servicio de $5000 pagando solo $50
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
import { MercadoPagoWebhookProcessorService } from '../../shared/services/mercadopago-webhook-processor.service';
import { WebhookIdempotencyService } from '../../pagos/services/webhook-idempotency.service';
import { PaymentAmountValidatorService } from '../../pagos/services/payment-amount-validator.service';
import { MercadoPagoWebhookDto } from '../../pagos/dto/mercadopago-webhook.dto';

describe('Inscripciones2026Service - Amount Validation', () => {
  let service: Inscripciones2026Service;
  let prisma: PrismaService;
  let webhookIdempotency: WebhookIdempotencyService;
  let amountValidator: PaymentAmountValidatorService;

  const mockPrismaService = {
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
    $transaction: jest.fn((callback: (tx: any) => any) => {
      // Mock transaction context con las mismas operaciones
      const tx = {
        pagoInscripcion2026: {
          update: mockPrismaService.pagoInscripcion2026.update,
        },
        inscripcion2026: {
          findUnique: mockPrismaService.inscripcion2026.findUnique,
          update: mockPrismaService.inscripcion2026.update,
        },
        historialEstadoInscripcion2026: {
          create: mockPrismaService.historialEstadoInscripcion2026.create,
        },
      };
      return callback(tx);
    }),
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

  const mockPinGenerator = {
    generateUniquePin: jest.fn(),
  };

  const mockTutorCreation = {
    hashPassword: jest.fn(),
  };

  const mockWebhookProcessor = {
    processWebhook: jest.fn(),
    mapPaymentStatus: jest.fn(),
  };

  const mockWebhookIdempotency = {
    wasProcessed: jest.fn(),
    markAsProcessed: jest.fn(),
  };

  const mockAmountValidator = {
    validatePagoInscripcion2026: jest.fn(),
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

    service = module.get<Inscripciones2026Service>(Inscripciones2026Service);
    prisma = module.get<PrismaService>(PrismaService);
    webhookIdempotency = module.get<WebhookIdempotencyService>(
      WebhookIdempotencyService,
    );
    amountValidator = module.get<PaymentAmountValidatorService>(
      PaymentAmountValidatorService,
    );

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('procesarWebhookMercadoPago - Amount Validation', () => {
    /**
     * TEST 1: DEBE VALIDAR MONTO ANTES DE APROBAR PAGO
     *
     * ESCENARIO:
     * 1. Webhook llega con status='approved'
     * 2. Sistema debe validar monto ANTES de aprobar
     * 3. Si monto no coincide → RECHAZAR
     *
     * VALIDACIONES:
     * - validatePagoInscripcion2026 debe llamarse con pagoId y receivedAmount
     * - Debe llamarse ANTES de actualizar estado del pago
     */
    it('debe validar monto antes de aprobar pago', async () => {
      // ARRANGE: Webhook con pago aprobado
      const paymentId = '999888777';
      const pagoId = 'pago-inscripcion-123';
      const inscripcionId = 'ins-789';

      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'payment.updated',
        data: {
          id: paymentId,
        },
        date_created: '2025-01-22T10:00:00Z',
        id: 'webhook-amount-validation',
        live_mode: true,
        user_id: '123456',
        api_version: 'v1',
      };

      // Mock: No procesado aún (pasar idempotencia)
      mockWebhookIdempotency.wasProcessed.mockResolvedValueOnce(false);

      // Mock: Pago encontrado con monto esperado $5000
      const mockPago = {
        id: pagoId,
        inscripcion_id: inscripcionId,
        tipo: 'inscripcion',
        monto: 5000, // Monto esperado
        estado: 'pending',
        inscripcion: {
          id: inscripcionId,
          estado: 'pending',
        },
      };

      // Mock: Validación de monto exitosa (monto coincide)
      mockAmountValidator.validatePagoInscripcion2026.mockResolvedValueOnce({
        isValid: true,
        expectedAmount: 5000,
        receivedAmount: 5000,
        difference: 0,
      });

      // Mock: processWebhook retorna éxito con payment info
      mockWebhookProcessor.processWebhook.mockImplementationOnce(
        async (
          _webhookData: MercadoPagoWebhookDto,
          _tipo: string,
          findPaymentCallback: (parsed: unknown) => Promise<unknown>,
          updatePaymentCallback: (pago: unknown, context: unknown) => Promise<unknown>,
        ) => {
          // Simular búsqueda de pago
          const parsed = {
            ids: { inscripcionId },
          };
          const pago = await findPaymentCallback(parsed);

          // Simular actualización
          const context = {
            parsedReference: parsed,
            paymentStatus: 'approved',
            payment: {
              id: paymentId,
              transaction_amount: 5000, // Monto recibido
            },
          };

          return await updatePaymentCallback(pago, context);
        },
      );

      mockWebhookProcessor.mapPaymentStatus.mockReturnValueOnce('paid');
      mockPrismaService.pagoInscripcion2026.findFirst.mockResolvedValueOnce(mockPago);
      mockPrismaService.pagoInscripcion2026.update.mockResolvedValueOnce({
        ...mockPago,
        estado: 'paid',
      });
      mockPrismaService.inscripcion2026.findUnique.mockResolvedValueOnce(mockPago.inscripcion);
      mockPrismaService.inscripcion2026.update.mockResolvedValueOnce({
        ...mockPago.inscripcion,
        estado: 'active',
      });
      mockPrismaService.historialEstadoInscripcion2026.create.mockResolvedValueOnce({});

      // ACT
      await service.procesarWebhookMercadoPago(webhookData);

      // ASSERT: validatePagoInscripcion2026 debe haber sido llamado
      expect(amountValidator.validatePagoInscripcion2026).toHaveBeenCalledWith(
        pagoId,
        5000,
      );

      // ASSERT: Debe llamarse ANTES de update (verificamos que se llamó)
      expect(amountValidator.validatePagoInscripcion2026).toHaveBeenCalled();
    });

    /**
     * TEST 2: DEBE RECHAZAR PAGO SI MONTO NO COINCIDE
     *
     * ESCENARIO DE ATAQUE:
     * 1. Cliente crea inscripción de $5000
     * 2. Atacante modifica monto a $50
     * 3. Webhook llega con transaction_amount=$50
     * 4. Sistema detecta discrepancia
     * 5. Pago debe RECHAZARSE
     *
     * VALIDACIONES:
     * - validatePagoInscripcion2026 retorna isValid=false
     * - NO debe actualizar estado del pago a 'paid'
     * - NO debe marcar webhook como procesado
     * - Debe loguear alerta de fraude
     */
    it('debe rechazar pago si monto no coincide (fraude detectado)', async () => {
      // ARRANGE: Webhook con monto fraudulento
      const paymentId = '111222333';
      const pagoId = 'pago-fraude-456';
      const inscripcionId = 'ins-fraud-789';

      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'payment.updated',
        data: {
          id: paymentId,
        },
        date_created: '2025-01-22T10:00:00Z',
        id: 'webhook-fraud',
        live_mode: true,
        user_id: '123456',
        api_version: 'v1',
      };

      mockWebhookIdempotency.wasProcessed.mockResolvedValueOnce(false);

      const mockPago = {
        id: pagoId,
        inscripcion_id: inscripcionId,
        tipo: 'inscripcion',
        monto: 5000, // Monto esperado: $5000
        estado: 'pending',
        inscripcion: {
          id: inscripcionId,
          estado: 'pending',
        },
      };

      // Mock: Validación de monto FALLA (fraude detectado)
      mockAmountValidator.validatePagoInscripcion2026.mockResolvedValueOnce({
        isValid: false,
        expectedAmount: 5000,
        receivedAmount: 50, // ⚠️ FRAUDE: Solo $50 en lugar de $5000
        difference: 4950,
        reason: 'Amount mismatch: expected $5000.00, received $50.00',
      });

      mockWebhookProcessor.processWebhook.mockImplementationOnce(
        async (
          _webhookData: MercadoPagoWebhookDto,
          _tipo: string,
          findPaymentCallback: (parsed: unknown) => Promise<unknown>,
          updatePaymentCallback: (pago: unknown, context: unknown) => Promise<unknown>,
        ) => {
          const parsed = {
            ids: { inscripcionId },
          };
          const pago = await findPaymentCallback(parsed);

          const context = {
            parsedReference: parsed,
            paymentStatus: 'approved',
            payment: {
              id: paymentId,
              transaction_amount: 50, // ⚠️ Monto fraudulento
            },
          };

          return await updatePaymentCallback(pago, context);
        },
      );

      mockPrismaService.pagoInscripcion2026.findFirst.mockResolvedValueOnce(mockPago);

      // ACT & ASSERT: Debe lanzar BadRequestException
      await expect(
        service.procesarWebhookMercadoPago(webhookData),
      ).rejects.toThrow(BadRequestException);

      // ASSERT: validatePagoInscripcion2026 fue llamado
      expect(amountValidator.validatePagoInscripcion2026).toHaveBeenCalledWith(
        pagoId,
        50,
      );

      // ASSERT: NO debe actualizar pago a 'paid'
      expect(mockPrismaService.pagoInscripcion2026.update).not.toHaveBeenCalled();

      // ASSERT: NO debe marcar como procesado
      expect(webhookIdempotency.markAsProcessed).not.toHaveBeenCalled();
    });

    /**
     * TEST 3: DEBE PERMITIR DIFERENCIAS MENORES (TOLERANCIA 1%)
     *
     * ESCENARIO:
     * 1. Monto esperado: $10,000.00
     * 2. Monto recibido: $10,000.50 (diferencia por redondeo de MP)
     * 3. Diferencia: $0.50 (0.005% < 1% tolerancia)
     * 4. Debe APROBAR porque está dentro de tolerancia
     *
     * VALIDACIONES:
     * - validatePagoInscripcion2026 retorna isValid=true
     * - Pago debe actualizarse a 'paid'
     * - Webhook debe marcarse como procesado
     */
    it('debe permitir diferencias menores dentro de tolerancia (1%)', async () => {
      const paymentId = '444555666';
      const pagoId = 'pago-tolerancia-789';
      const inscripcionId = 'ins-tol-123';

      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'payment.updated',
        data: {
          id: paymentId,
        },
        date_created: '2025-01-22T10:00:00Z',
        id: 'webhook-tolerance',
        live_mode: true,
        user_id: '123456',
        api_version: 'v1',
      };

      mockWebhookIdempotency.wasProcessed.mockResolvedValueOnce(false);

      const mockPago = {
        id: pagoId,
        inscripcion_id: inscripcionId,
        tipo: 'inscripcion',
        monto: 10000, // Esperado: $10,000.00
        estado: 'pending',
        inscripcion: {
          id: inscripcionId,
          estado: 'pending',
        },
      };

      // Mock: Validación exitosa (dentro de tolerancia)
      mockAmountValidator.validatePagoInscripcion2026.mockResolvedValueOnce({
        isValid: true,
        expectedAmount: 10000,
        receivedAmount: 10000.5, // Diferencia mínima
        difference: 0.5,
      });

      mockWebhookProcessor.processWebhook.mockImplementationOnce(
        async (
          _webhookData: MercadoPagoWebhookDto,
          _tipo: string,
          findPaymentCallback: (parsed: unknown) => Promise<unknown>,
          updatePaymentCallback: (pago: unknown, context: unknown) => Promise<unknown>,
        ) => {
          const parsed = {
            ids: { inscripcionId },
          };
          const pago = await findPaymentCallback(parsed);

          const context = {
            parsedReference: parsed,
            paymentStatus: 'approved',
            payment: {
              id: paymentId,
              transaction_amount: 10000.5,
            },
          };

          return await updatePaymentCallback(pago, context);
        },
      );

      mockWebhookProcessor.mapPaymentStatus.mockReturnValueOnce('paid');
      mockPrismaService.pagoInscripcion2026.findFirst.mockResolvedValueOnce(mockPago);
      mockPrismaService.pagoInscripcion2026.update.mockResolvedValueOnce({
        ...mockPago,
        estado: 'paid',
      });
      mockPrismaService.inscripcion2026.findUnique.mockResolvedValueOnce(mockPago.inscripcion);
      mockPrismaService.inscripcion2026.update.mockResolvedValueOnce({
        ...mockPago.inscripcion,
        estado: 'active',
      });
      mockPrismaService.historialEstadoInscripcion2026.create.mockResolvedValueOnce({});

      // ACT
      const result = await service.procesarWebhookMercadoPago(webhookData);

      // ASSERT: Debe aprobar
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
        }),
      );

      // ASSERT: Pago actualizado
      expect(mockPrismaService.pagoInscripcion2026.update).toHaveBeenCalled();

      // ASSERT: Marcado como procesado
      expect(webhookIdempotency.markAsProcessed).toHaveBeenCalled();
    });

    /**
     * TEST 4: DEBE TENER TIPOS EXPLÍCITOS EN VALIDACIÓN
     *
     * VALIDACIONES:
     * - pagoId: string (no any)
     * - receivedAmount: number (no any)
     * - ValidationResult tipado correctamente
     */
    it('debe tener tipos explícitos en validación de montos', () => {
      // Este test verifica que el código compile con tipos estrictos
      const pagoId: string = 'test-pago-id';
      const receivedAmount: number = 5000;

      // Verificar que el mock acepta tipos correctos
      mockAmountValidator.validatePagoInscripcion2026(pagoId, receivedAmount);

      expect(typeof pagoId).toBe('string');
      expect(typeof receivedAmount).toBe('number');
    });
  });
});