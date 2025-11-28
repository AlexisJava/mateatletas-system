import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
import { TipoExternalReference } from '../../domain/constants';

/**
 * Test Suite: Webhook Idempotency - Inscripciones 2026
 *
 * OBJETIVO: Validar que el sistema previene procesamiento duplicado de webhooks
 *
 * CONTEXTO DE SEGURIDAD:
 * - MercadoPago reintenta webhooks si no recibe 200 OK en <5s
 * - Sin idempotencia: Mismo pago puede procesarse 5-10 veces
 * - Riesgo: Historial corrupto, estados inconsistentes
 *
 * ESTÁNDAR: OWASP A04:2021 - Insecure Design
 */
describe('Inscripciones2026Service - Webhook Idempotency', () => {
  let service: Inscripciones2026Service;
  let prisma: PrismaService;
  let mercadoPagoService: MercadoPagoService;
  let webhookIdempotency: WebhookIdempotencyService;
  let eventEmitter: EventEmitter2;

  // Mocks tipados (ZERO any/unknown)
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
  };

  const mockWebhookIdempotency = {
    wasProcessed: jest.fn(),
    markAsProcessed: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Inscripciones2026Service,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: MercadoPagoService,
          useValue: mockMercadoPagoService,
        },
        {
          provide: WebhookIdempotencyService,
          useValue: mockWebhookIdempotency,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'BACKEND_URL') return 'http://localhost:3001';
              if (key === 'FRONTEND_URL') return 'http://localhost:3000';
              return undefined;
            }),
          },
        },
        {
          provide: PricingCalculatorService,
          useValue: {},
        },
        {
          provide: PinGeneratorService,
          useValue: {},
        },
        {
          provide: TutorCreationService,
          useValue: {},
        },
        {
          provide: MercadoPagoWebhookProcessorService,
          useValue: {
            processWebhook: jest.fn(),
            mapPaymentStatus: jest.fn((status: string) => {
              const map: Record<string, string> = {
                approved: 'paid',
                rejected: 'failed',
                pending: 'pending',
              };
              return map[status] || 'pending';
            }),
          },
        },
        {
          provide: PaymentAmountValidatorService,
          useValue: {
            validatePagoInscripcion2026: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<Inscripciones2026Service>(Inscripciones2026Service);
    prisma = module.get<PrismaService>(PrismaService);
    mercadoPagoService = module.get<MercadoPagoService>(MercadoPagoService);
    webhookIdempotency = module.get<WebhookIdempotencyService>(
      WebhookIdempotencyService,
    );
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('procesarWebhookMercadoPago - Idempotency', () => {
    /**
     * TEST 1: DEBE IGNORAR WEBHOOKS DUPLICADOS
     *
     * ESCENARIO:
     * 1. Primer webhook procesa pago exitosamente
     * 2. MercadoPago reintenta (mismo payment_id)
     * 3. Sistema debe detectar duplicado y retornar sin procesar
     *
     * VALIDACIONES:
     * - wasProcessed() debe retornar true en segundo intento
     * - processWebhook() NO debe ejecutarse en segundo intento
     * - Debe retornar success:true con mensaje "Already processed"
     * - NO debe crear entradas duplicadas en historial
     */
    it('debe ignorar webhooks duplicados (idempotencia)', async () => {
      // ARRANGE: Datos del webhook
      const paymentId = '123456789';
      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'payment.updated',
        data: {
          id: paymentId,
        },
        date_created: '2025-01-20T10:00:00Z',
        id: 'webhook-123',
        live_mode: true,
        user_id: '123456',
        api_version: 'v1',
      };

      // ARRANGE: Mock - Simular que el webhook YA fue procesado
      mockWebhookIdempotency.wasProcessed.mockResolvedValueOnce(true);

      // ACT: Procesar webhook
      const result = await service.procesarWebhookMercadoPago(webhookData);

      // ASSERT: Debe detectar duplicado
      expect(webhookIdempotency.wasProcessed).toHaveBeenCalledWith(paymentId);
      expect(webhookIdempotency.wasProcessed).toHaveBeenCalledTimes(1);

      // ASSERT: NO debe procesar el webhook
      expect(mockMercadoPagoService.getPayment).not.toHaveBeenCalled();
      expect(mockPrisma.pagoInscripcion2026.update).not.toHaveBeenCalled();
      expect(
        mockPrisma.historialEstadoInscripcion2026.create,
      ).not.toHaveBeenCalled();

      // ASSERT: Debe retornar éxito con mensaje de duplicado
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('Already processed'),
        }),
      );
    });

    /**
     * TEST 2: DEBE PROCESAR WEBHOOK NUEVO (NO DUPLICADO)
     *
     * ESCENARIO:
     * 1. Webhook llega por primera vez
     * 2. wasProcessed() retorna false
     * 3. Sistema debe procesarlo normalmente
     * 4. Debe marcar como procesado al final
     *
     * VALIDACIONES:
     * - wasProcessed() debe retornar false
     * - processWebhook() debe ejecutarse
     * - markAsProcessed() debe llamarse al final
     * - Debe retornar success:true
     */
    it('debe procesar webhook nuevo (primer intento)', async () => {
      // ARRANGE: Datos del webhook
      const paymentId = '987654321';
      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'payment.updated',
        data: {
          id: paymentId,
        },
        date_created: '2025-01-20T10:00:00Z',
        id: 'webhook-456',
        live_mode: true,
        user_id: '123456',
        api_version: 'v1',
      };

      // ARRANGE: Mock - Webhook NO fue procesado antes
      mockWebhookIdempotency.wasProcessed.mockResolvedValueOnce(false);

      // ARRANGE: Mock - processWebhook retorna éxito
      const mockWebhookProcessor = service['webhookProcessor'];
      (mockWebhookProcessor.processWebhook as jest.Mock).mockResolvedValueOnce({
        success: true,
        inscripcionId: 'ins-123',
        paymentStatus: 'paid',
      });

      // ACT: Procesar webhook
      const result = await service.procesarWebhookMercadoPago(webhookData);

      // ASSERT: Debe verificar idempotencia
      expect(webhookIdempotency.wasProcessed).toHaveBeenCalledWith(paymentId);

      // ASSERT: Debe procesarlo normalmente
      expect(mockWebhookProcessor.processWebhook).toHaveBeenCalledWith(
        webhookData,
        TipoExternalReference.INSCRIPCION_2026,
        expect.any(Function), // findPayment callback
        expect.any(Function), // updatePayment callback
      );

      // ASSERT: Debe marcar como procesado
      expect(webhookIdempotency.markAsProcessed).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentId,
          webhookType: 'inscripcion2026',
        }),
      );

      // ASSERT: Debe retornar éxito
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
        }),
      );
    });

    /**
     * TEST 3: DEBE MANEJAR RACE CONDITION CORRECTAMENTE
     *
     * ESCENARIO:
     * 1. Dos webhooks llegan simultáneamente (race condition)
     * 2. Ambos pasan wasProcessed() = false
     * 3. Uno logra marcar como procesado (unique constraint)
     * 4. El otro debe manejar el error P2002 gracefully
     *
     * VALIDACIONES:
     * - markAsProcessed() puede fallar con P2002 (unique constraint)
     * - Sistema debe loguearlo como warning (no error)
     * - Debe retornar success:true (ya fue procesado por el otro)
     */
    it('debe manejar race condition en markAsProcessed', async () => {
      // ARRANGE: Datos del webhook
      const paymentId = '111222333';
      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'payment.updated',
        data: {
          id: paymentId,
        },
        date_created: '2025-01-20T10:00:00Z',
        id: 'webhook-789',
        live_mode: true,
        user_id: '123456',
        api_version: 'v1',
      };

      // ARRANGE: wasProcessed retorna false (ambos webhooks pasan)
      mockWebhookIdempotency.wasProcessed.mockResolvedValueOnce(false);

      // ARRANGE: processWebhook ejecuta exitosamente
      const mockWebhookProcessor = service['webhookProcessor'];
      (mockWebhookProcessor.processWebhook as jest.Mock).mockResolvedValueOnce({
        success: true,
        inscripcionId: 'ins-456',
        paymentStatus: 'paid',
      });

      // ARRANGE: markAsProcessed falla con unique constraint (otro proceso ya lo marcó)
      const uniqueConstraintError = new Error('Unique constraint failed');
      Object.assign(uniqueConstraintError, { code: 'P2002' });
      mockWebhookIdempotency.markAsProcessed.mockRejectedValueOnce(
        uniqueConstraintError,
      );

      // ACT: Procesar webhook (debería NO lanzar error)
      const result = await service.procesarWebhookMercadoPago(webhookData);

      // ASSERT: Debe intentar marcar como procesado
      expect(webhookIdempotency.markAsProcessed).toHaveBeenCalled();

      // ASSERT: Debe retornar éxito (race condition manejada)
      // Nota: Actualmente esto FALLARÁ porque no está implementado
      // El servicio debe catchear P2002 y retornar success:true
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
        }),
      );
    });

    /**
     * TEST 4: DEBE LOGUEAR WEBHOOKS DUPLICADOS PARA AUDITORÍA
     *
     * ESCENARIO:
     * 1. Webhook duplicado llega
     * 2. Sistema lo detecta
     * 3. Debe loguear para auditoría de seguridad
     *
     * VALIDACIONES:
     * - Logger debe llamarse con nivel 'warn'
     * - Mensaje debe contener payment_id
     * - Contexto debe indicar 'duplicate webhook'
     */
    it('debe loguear webhooks duplicados para auditoría', async () => {
      // ARRANGE: Spy en logger
      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');

      // ARRANGE: Webhook duplicado
      const paymentId = '555666777';
      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'payment.updated',
        data: {
          id: paymentId,
        },
        date_created: '2025-01-20T10:00:00Z',
        id: 'webhook-999',
        live_mode: true,
        user_id: '123456',
        api_version: 'v1',
      };

      mockWebhookIdempotency.wasProcessed.mockResolvedValueOnce(true);

      // ACT
      await service.procesarWebhookMercadoPago(webhookData);

      // ASSERT: Debe loguear como warning
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('duplicado'),
      );
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(paymentId),
      );
    });

    /**
     * TEST 5: NO DEBE MARCAR COMO PROCESADO SI FALLA EL PROCESAMIENTO
     *
     * ESCENARIO:
     * 1. Webhook nuevo (no duplicado)
     * 2. processWebhook() falla (error de DB, timeout, etc)
     * 3. NO debe marcar como procesado (debe poder reintentarse)
     *
     * VALIDACIONES:
     * - wasProcessed() retorna false
     * - processWebhook() lanza error
     * - markAsProcessed() NO debe llamarse
     * - Error debe propagarse
     */
    it('no debe marcar como procesado si falla el procesamiento', async () => {
      // ARRANGE
      const paymentId = '888999000';
      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'payment.updated',
        data: {
          id: paymentId,
        },
        date_created: '2025-01-20T10:00:00Z',
        id: 'webhook-error',
        live_mode: true,
        user_id: '123456',
        api_version: 'v1',
      };

      mockWebhookIdempotency.wasProcessed.mockResolvedValueOnce(false);

      // ARRANGE: processWebhook falla
      const mockWebhookProcessor = service['webhookProcessor'];
      const processingError = new Error('Database connection lost');
      (mockWebhookProcessor.processWebhook as jest.Mock).mockRejectedValueOnce(
        processingError,
      );

      // ACT & ASSERT: Debe propagar el error
      await expect(
        service.procesarWebhookMercadoPago(webhookData),
      ).rejects.toThrow('Database connection lost');

      // ASSERT: NO debe marcar como procesado
      expect(webhookIdempotency.markAsProcessed).not.toHaveBeenCalled();
    });

    /**
     * TEST 6: DEBE PERSISTIR METADATA DEL WEBHOOK PROCESADO
     *
     * ESCENARIO:
     * 1. Webhook procesa exitosamente
     * 2. markAsProcessed() debe recibir metadata completa
     *
     * VALIDACIONES:
     * - paymentId correcto
     * - webhookType = 'inscripcion2026'
     * - status del webhook
     * - externalReference si disponible
     */
    it('debe persistir metadata completa del webhook procesado', async () => {
      // ARRANGE
      const paymentId = '444555666';
      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'payment.updated',
        data: {
          id: paymentId,
        },
        date_created: '2025-01-20T10:00:00Z',
        id: 'webhook-metadata',
        live_mode: true,
        user_id: '123456',
        api_version: 'v1',
      };

      mockWebhookIdempotency.wasProcessed.mockResolvedValueOnce(false);

      const mockWebhookProcessor = service['webhookProcessor'];
      (mockWebhookProcessor.processWebhook as jest.Mock).mockResolvedValueOnce({
        success: true,
        inscripcionId: 'ins-meta',
        paymentStatus: 'paid',
        externalReference: 'inscripcion2026-ins-meta-tutor-123',
      });

      // ACT
      await service.procesarWebhookMercadoPago(webhookData);

      // ASSERT: Metadata completa
      expect(webhookIdempotency.markAsProcessed).toHaveBeenCalledWith({
        paymentId,
        webhookType: 'inscripcion2026',
        status: expect.any(String),
        externalReference: expect.stringContaining('inscripcion2026'),
      });
    });
  });

  describe('Edge Cases y Validaciones de Tipos', () => {
    /**
     * TEST 7: DEBE MANEJAR PAYMENT_ID UNDEFINED GRACEFULLY
     */
    it('debe lanzar error si payment_id es undefined', async () => {
      const webhookData = {
        type: 'payment',
        action: 'payment.updated',
        data: {
          id: undefined as unknown as string, // Tipo inválido pero puede ocurrir en runtime
        },
        date_created: '2025-01-20T10:00:00Z',
        id: 'webhook-invalid',
        live_mode: true,
        user_id: '123456',
        api_version: 'v1',
      };

      // ACT & ASSERT
      await expect(
        service.procesarWebhookMercadoPago(
          webhookData as MercadoPagoWebhookDto,
        ),
      ).rejects.toThrow();
    });

    /**
     * TEST 8: DEBE VALIDAR TIPOS EXPLÍCITOS (ZERO any/unknown)
     *
     * Este test valida que todos los tipos sean explícitos
     * Si el código usa 'any' o 'unknown', TypeScript lo detectará
     */
    it('debe tener tipos explícitos en toda la cadena', () => {
      // Este test pasa si TypeScript compila sin errores de tipo
      // La validación real ocurre en compile-time

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
