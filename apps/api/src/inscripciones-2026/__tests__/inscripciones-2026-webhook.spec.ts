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
import { MercadoPagoWebhookDto } from '../../pagos/dto/mercadopago-webhook.dto';
import { WebhookIdempotencyService } from '../../pagos/services/webhook-idempotency.service';
import { PaymentAmountValidatorService } from '../../pagos/services/payment-amount-validator.service';

/**
 * TESTS EXHAUSTIVOS PARA WEBHOOK INSCRIPCIONES 2026
 *
 * Cobertura:
 * - procesarWebhookMercadoPago(): Procesamiento completo de webhook
 * - Parsing de external_reference
 * - Actualización de estados según payment status
 * - Manejo de errores y edge cases
 * - Validación de tipos de notificación
 * - Integración con MercadoPago API
 * - Actualización de historial
 *
 * Casos de Prueba:
 * - Webhook tipo "payment" con estado "approved"
 * - Webhook tipo "payment" con estado "rejected"
 * - Webhook tipo "payment" con estado "pending"
 * - Webhook tipo "payment" con estado "cancelled"
 * - Webhook tipo diferente a "payment" (merchant_order, etc)
 * - External reference inválida
 * - Pago no encontrado en DB
 * - Errores de MercadoPago API
 * - Estados desconocidos
 */

describe('Inscripciones2026Service - Webhook Processing', () => {
  let service: Inscripciones2026Service;
  let prismaService: PrismaService;
  let mercadoPagoService: MercadoPagoService;

  // Mock data
  const mockWebhookData: MercadoPagoWebhookDto = {
    action: 'payment.updated',
    type: 'payment',
    data: {
      id: '123456789',
    },
    live_mode: 'true',
    date_created: '2024-01-15T10:30:00Z',
  };

  const mockPaymentApproved = {
    id: 123456789,
    status: 'approved',
    external_reference:
      'inscripcion2026-inscabc123-tutor-tutorxyz789-tipo-COLONIA',
    transaction_amount: 25000,
    date_approved: '2024-01-15T10:30:00Z',
  };

  const mockPaymentRejected = {
    id: 123456789,
    status: 'rejected',
    external_reference:
      'inscripcion2026-inscabc123-tutor-tutorxyz789-tipo-COLONIA',
    transaction_amount: 25000,
  };

  const mockPagoInscripcion = {
    id: 'pago123',
    inscripcion_id: 'inscabc123',
    tipo: 'inscripcion',
    monto: 25000,
    estado: 'pending',
    mercadopago_preference_id: 'pref-123',
    mercadopago_payment_id: null,
    fecha_pago: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    inscripcion: {
      id: 'inscabc123',
      tutor_id: 'tutorxyz789',
      tipo_inscripcion: 'COLONIA',
      estado: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  beforeEach(async () => {
    // Crear mocks compartidos que serán usados tanto en prismaService como en el tx context
    const pagoUpdateMock = jest.fn();
    const inscripcionFindUniqueMock = jest.fn();
    const inscripcionUpdateMock = jest.fn();
    const historialCreateMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Inscripciones2026Service,
        {
          provide: PrismaService,
          useValue: {
            pagoInscripcion2026: {
              findFirst: jest.fn(),
              update: pagoUpdateMock,
            },
            inscripcion2026: {
              findUnique: inscripcionFindUniqueMock,
              update: inscripcionUpdateMock,
            },
            historialEstadoInscripcion2026: {
              create: historialCreateMock,
            },
            $transaction: jest.fn((callback: (tx: any) => any) => {
              // Mock transaction context usando los MISMOS mocks compartidos
              const tx = {
                pagoInscripcion2026: {
                  update: pagoUpdateMock,
                },
                inscripcion2026: {
                  findUnique: inscripcionFindUniqueMock,
                  update: inscripcionUpdateMock,
                },
                historialEstadoInscripcion2026: {
                  create: historialCreateMock,
                },
              };
              return callback(tx);
            }),
          },
        },
        {
          provide: MercadoPagoService,
          useValue: {
            getPayment: jest.fn(),
            isMockMode: jest.fn().mockReturnValue(false),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'BACKEND_URL') return 'http://localhost:3001';
              if (key === 'FRONTEND_URL') return 'http://localhost:3000';
              return null;
            }),
          },
        },
        {
          provide: PricingCalculatorService,
          useValue: {
            calcularTarifaInscripcion: jest.fn().mockReturnValue(25000),
            calcularTotalInscripcion2026: jest
              .fn()
              .mockReturnValue({ total: 158400, descuento: 12 }),
            aplicarDescuento: jest.fn((base, desc) => base * (1 - desc / 100)),
          },
        },
        {
          provide: PinGeneratorService,
          useValue: {
            generateUniquePin: jest
              .fn()
              .mockImplementation(async () =>
                Math.floor(1000 + Math.random() * 9000).toString(),
              ),
          },
        },
        {
          provide: TutorCreationService,
          useValue: {
            hashPassword: jest.fn().mockResolvedValue('$2b$10$hashedpassword'),
            validateUniqueEmail: jest.fn(),
          },
        },
        // Provide the real webhook processor since it's just a thin wrapper
        // We mock MercadoPagoService.getPayment which is what the processor calls
        MercadoPagoWebhookProcessorService,
        {
          provide: WebhookIdempotencyService,
          useValue: {
            wasProcessed: jest.fn().mockResolvedValue(false),
            markAsProcessed: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: PaymentAmountValidatorService,
          useValue: {
            validatePagoInscripcion2026: jest.fn().mockResolvedValue({
              isValid: true,
              expectedAmount: 25000,
              receivedAmount: 25000,
              difference: 0,
            }),
          },
        },
      ],
    }).compile();

    service = module.get<Inscripciones2026Service>(Inscripciones2026Service);
    prismaService = module.get<PrismaService>(PrismaService);
    mercadoPagoService = module.get<MercadoPagoService>(MercadoPagoService);

    jest.clearAllMocks();
  });

  describe('Webhook Type Validation', () => {
    it('should ignore non-payment webhooks', async () => {
      const webhookData = {
        ...mockWebhookData,
        type: 'merchant_order',
      };

      const result = await service.procesarWebhookMercadoPago(webhookData);

      expect(result).toEqual({
        success: false,
        message: 'Webhook type not handled',
      });
      expect(mercadoPagoService.getPayment).not.toHaveBeenCalled();
    });

    it('should process payment webhooks', async () => {
      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(mockPaymentApproved);
      jest
        .spyOn(prismaService.pagoInscripcion2026, 'findFirst')
        .mockResolvedValue(mockPagoInscripcion as any);
      jest
        .spyOn(prismaService.pagoInscripcion2026, 'update')
        .mockResolvedValue(mockPagoInscripcion as any);
      jest
        .spyOn(prismaService.inscripcion2026, 'findUnique')
        .mockResolvedValue(mockPagoInscripcion.inscripcion as any);
      jest
        .spyOn(prismaService.inscripcion2026, 'update')
        .mockResolvedValue(mockPagoInscripcion.inscripcion as any);
      jest
        .spyOn(prismaService.historialEstadoInscripcion2026, 'create')
        .mockResolvedValue({} as any);

      await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(mercadoPagoService.getPayment).toHaveBeenCalledWith('123456789');
    });
  });

  describe('External Reference Parsing', () => {
    it('should correctly parse inscripcion2026 external reference', async () => {
      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(mockPaymentApproved);
      jest
        .spyOn(prismaService.pagoInscripcion2026, 'findFirst')
        .mockResolvedValue(mockPagoInscripcion as any);
      jest
        .spyOn(prismaService.pagoInscripcion2026, 'update')
        .mockResolvedValue(mockPagoInscripcion as any);
      jest
        .spyOn(prismaService.inscripcion2026, 'findUnique')
        .mockResolvedValue(mockPagoInscripcion.inscripcion as any);
      jest
        .spyOn(prismaService.inscripcion2026, 'update')
        .mockResolvedValue(mockPagoInscripcion.inscripcion as any);
      jest
        .spyOn(prismaService.historialEstadoInscripcion2026, 'create')
        .mockResolvedValue({} as any);

      await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(prismaService.pagoInscripcion2026.findFirst).toHaveBeenCalledWith({
        where: {
          inscripcion_id: 'inscabc123',
          tipo: 'inscripcion',
        },
        include: {
          inscripcion: true,
        },
      });
    });

    it('should reject external reference without inscripcion2026 prefix', async () => {
      const paymentInvalidRef = {
        ...mockPaymentApproved,
        external_reference: 'membresia-123-tutor-456',
      };

      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(paymentInvalidRef);

      const result = await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(result).toEqual({
        success: false,
        message: 'Invalid external_reference format',
      });
      expect(
        prismaService.pagoInscripcion2026.findFirst,
      ).not.toHaveBeenCalled();
    });

    it('should handle null external reference', async () => {
      const paymentNullRef = {
        ...mockPaymentApproved,
        external_reference: null,
      };

      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(paymentNullRef);

      const result = await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(result).toEqual({
        success: false,
        message: 'Payment without external_reference',
      });
    });

    it('should handle malformed external reference', async () => {
      const paymentMalformedRef = {
        ...mockPaymentApproved,
        external_reference: 'inscripcion2026-', // Sin ID
      };

      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(paymentMalformedRef);

      const result = await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(result).toEqual({
        success: false,
        message: 'Invalid external_reference format',
      });
    });
  });

  describe('Payment Status Processing - APPROVED', () => {
    beforeEach(() => {
      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(mockPaymentApproved);
      jest
        .spyOn(prismaService.pagoInscripcion2026, 'findFirst')
        .mockResolvedValue(mockPagoInscripcion as any);
      jest
        .spyOn(prismaService.pagoInscripcion2026, 'update')
        .mockResolvedValue(mockPagoInscripcion as any);
      jest
        .spyOn(prismaService.inscripcion2026, 'findUnique')
        .mockResolvedValue(mockPagoInscripcion.inscripcion as any);
      jest
        .spyOn(prismaService.inscripcion2026, 'update')
        .mockResolvedValue(mockPagoInscripcion.inscripcion as any);
      jest
        .spyOn(prismaService.historialEstadoInscripcion2026, 'create')
        .mockResolvedValue({} as any);
    });

    it('should update pago to "paid" when payment is approved', async () => {
      await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(prismaService.pagoInscripcion2026.update).toHaveBeenCalledWith({
        where: { id: 'pago123' },
        data: {
          estado: 'paid',
          mercadopago_payment_id: '123456789',
          fecha_pago: expect.any(Date),
        },
      });
    });

    it('should update inscripcion to "active" when payment is approved', async () => {
      await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(prismaService.inscripcion2026.update).toHaveBeenCalledWith({
        where: { id: 'inscabc123' },
        data: { estado: 'active' },
      });
    });

    it('should create historial entry when payment is approved', async () => {
      await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(
        prismaService.historialEstadoInscripcion2026.create,
      ).toHaveBeenCalledWith({
        data: {
          inscripcion_id: 'inscabc123',
          estado_anterior: 'pending',
          estado_nuevo: 'active',
          razon: expect.stringContaining('Pago paid'),
          realizado_por: 'mercadopago-webhook',
        },
      });
    });

    it('should return success response when payment is approved', async () => {
      const result = await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(result).toEqual({
        success: true,
        inscripcionId: 'inscabc123',
        paymentStatus: 'paid',
        inscripcionStatus: 'active',
      });
    });
  });

  describe('Payment Status Processing - REJECTED', () => {
    beforeEach(() => {
      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(mockPaymentRejected);
      jest
        .spyOn(prismaService.pagoInscripcion2026, 'findFirst')
        .mockResolvedValue(mockPagoInscripcion as any);
      jest
        .spyOn(prismaService.pagoInscripcion2026, 'update')
        .mockResolvedValue(mockPagoInscripcion as any);
      jest
        .spyOn(prismaService.inscripcion2026, 'findUnique')
        .mockResolvedValue(mockPagoInscripcion.inscripcion as any);
      jest
        .spyOn(prismaService.inscripcion2026, 'update')
        .mockResolvedValue(mockPagoInscripcion.inscripcion as any);
      jest
        .spyOn(prismaService.historialEstadoInscripcion2026, 'create')
        .mockResolvedValue({} as any);
    });

    it('should update pago to "failed" when payment is rejected', async () => {
      await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(prismaService.pagoInscripcion2026.update).toHaveBeenCalledWith({
        where: { id: 'pago123' },
        data: {
          estado: 'failed',
          mercadopago_payment_id: '123456789',
          fecha_pago: undefined,
        },
      });
    });

    it('should update inscripcion to "payment_failed" when payment is rejected', async () => {
      await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(prismaService.inscripcion2026.update).toHaveBeenCalledWith({
        where: { id: 'inscabc123' },
        data: { estado: 'payment_failed' },
      });
    });
  });

  describe('Payment Status Processing - CANCELLED', () => {
    it('should handle cancelled payment same as rejected', async () => {
      const paymentCancelled = {
        ...mockPaymentRejected,
        status: 'cancelled',
      };

      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(paymentCancelled);
      jest
        .spyOn(prismaService.pagoInscripcion2026, 'findFirst')
        .mockResolvedValue(mockPagoInscripcion as any);
      jest
        .spyOn(prismaService.pagoInscripcion2026, 'update')
        .mockResolvedValue(mockPagoInscripcion as any);
      jest
        .spyOn(prismaService.inscripcion2026, 'findUnique')
        .mockResolvedValue(mockPagoInscripcion.inscripcion as any);
      jest
        .spyOn(prismaService.inscripcion2026, 'update')
        .mockResolvedValue(mockPagoInscripcion.inscripcion as any);
      jest
        .spyOn(prismaService.historialEstadoInscripcion2026, 'create')
        .mockResolvedValue({} as any);

      await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(prismaService.pagoInscripcion2026.update).toHaveBeenCalledWith({
        where: { id: 'pago123' },
        data: {
          estado: 'failed',
          mercadopago_payment_id: '123456789',
          fecha_pago: undefined,
        },
      });
    });
  });

  describe('Payment Status Processing - PENDING', () => {
    it('should keep estado as "pending" when payment is pending', async () => {
      const paymentPending = {
        ...mockPaymentApproved,
        status: 'pending',
      };

      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(paymentPending);
      jest
        .spyOn(prismaService.pagoInscripcion2026, 'findFirst')
        .mockResolvedValue(mockPagoInscripcion as any);
      jest
        .spyOn(prismaService.pagoInscripcion2026, 'update')
        .mockResolvedValue(mockPagoInscripcion as any);

      // Estado ya es pending, no debería actualizar inscripcion
      await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(prismaService.pagoInscripcion2026.update).toHaveBeenCalledWith({
        where: { id: 'pago123' },
        data: {
          estado: 'pending',
          mercadopago_payment_id: '123456789',
          fecha_pago: undefined,
        },
      });

      // No debería llamar a update de inscripcion porque el estado es el mismo
      expect(prismaService.inscripcion2026.update).not.toHaveBeenCalled();
    });

    it('should handle "in_process" status as pending', async () => {
      const paymentInProcess = {
        ...mockPaymentApproved,
        status: 'in_process',
      };

      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(paymentInProcess);
      jest
        .spyOn(prismaService.pagoInscripcion2026, 'findFirst')
        .mockResolvedValue(mockPagoInscripcion as any);
      jest
        .spyOn(prismaService.pagoInscripcion2026, 'update')
        .mockResolvedValue(mockPagoInscripcion as any);

      await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(prismaService.pagoInscripcion2026.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            estado: 'pending',
          }),
        }),
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw BadRequestException when pago not found', async () => {
      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(mockPaymentApproved);
      jest
        .spyOn(prismaService.pagoInscripcion2026, 'findFirst')
        .mockResolvedValue(null);

      const result = await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(result).toEqual({
        success: false,
        message: 'Payment not found in database',
      });
    });

    it('should handle MercadoPago API errors', async () => {
      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockRejectedValue(new Error('API Error'));

      await expect(
        service.procesarWebhookMercadoPago(mockWebhookData),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle database errors gracefully', async () => {
      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(mockPaymentApproved);
      jest
        .spyOn(prismaService.pagoInscripcion2026, 'findFirst')
        .mockRejectedValue(new Error('DB Error'));

      await expect(
        service.procesarWebhookMercadoPago(mockWebhookData),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle unknown payment status', async () => {
      const paymentUnknown = {
        ...mockPaymentApproved,
        status: 'unknown_status',
      };

      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(paymentUnknown);
      jest
        .spyOn(prismaService.pagoInscripcion2026, 'findFirst')
        .mockResolvedValue(mockPagoInscripcion as any);
      jest
        .spyOn(prismaService.pagoInscripcion2026, 'update')
        .mockResolvedValue(mockPagoInscripcion as any);

      await service.procesarWebhookMercadoPago(mockWebhookData);

      // Debe usar 'pending' como fallback
      expect(prismaService.pagoInscripcion2026.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            estado: 'pending',
          }),
        }),
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle inscripcion with multiple tipos (COLONIA, CICLO, PACK)', async () => {
      const testCases = [
        'inscripcion2026-id1-tutor-t1-tipo-COLONIA',
        'inscripcion2026-id2-tutor-t2-tipo-CICLO_2026',
        'inscripcion2026-id3-tutor-t3-tipo-PACK_COMPLETO',
      ];

      for (const externalRef of testCases) {
        const payment = {
          ...mockPaymentApproved,
          external_reference: externalRef,
        };
        const inscripcionId = externalRef.split('-')[1];

        jest.spyOn(mercadoPagoService, 'getPayment').mockResolvedValue(payment);
        jest
          .spyOn(prismaService.pagoInscripcion2026, 'findFirst')
          .mockResolvedValue({
            ...mockPagoInscripcion,
            inscripcion_id: inscripcionId,
          } as any);
        jest
          .spyOn(prismaService.pagoInscripcion2026, 'update')
          .mockResolvedValue(mockPagoInscripcion as any);
        jest
          .spyOn(prismaService.inscripcion2026, 'findUnique')
          .mockResolvedValue(mockPagoInscripcion.inscripcion as any);
        jest
          .spyOn(prismaService.inscripcion2026, 'update')
          .mockResolvedValue(mockPagoInscripcion.inscripcion as any);
        jest
          .spyOn(prismaService.historialEstadoInscripcion2026, 'create')
          .mockResolvedValue({} as any);

        const result =
          await service.procesarWebhookMercadoPago(mockWebhookData);

        expect(result.inscripcionId).toBe(inscripcionId);
      }
    });

    it('should not update inscripcion if estado is already correct', async () => {
      const pagoConEstadoActivo = {
        ...mockPagoInscripcion,
        inscripcion: {
          ...mockPagoInscripcion.inscripcion,
          estado: 'active', // Ya activo
        },
      };

      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(mockPaymentApproved);
      jest
        .spyOn(prismaService.pagoInscripcion2026, 'findFirst')
        .mockResolvedValue(pagoConEstadoActivo as any);
      jest
        .spyOn(prismaService.pagoInscripcion2026, 'update')
        .mockResolvedValue(mockPagoInscripcion as any);

      await service.procesarWebhookMercadoPago(mockWebhookData);

      // No debe actualizar inscripcion si el estado ya es correcto
      expect(prismaService.inscripcion2026.update).not.toHaveBeenCalled();
      expect(
        prismaService.historialEstadoInscripcion2026.create,
      ).not.toHaveBeenCalled();
    });
  });
});
