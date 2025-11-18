import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ColoniaService } from '../colonia.service';
import { PrismaClient } from '@prisma/client';
import { MercadoPagoService } from '../../pagos/mercadopago.service';
import { MercadoPagoWebhookDto } from '../../pagos/dto/mercadopago-webhook.dto';

/**
 * TODO: AUDITORÍA DE TESTS FALLIDOS - COLONIA WEBHOOK
 * =====================================================
 *
 * ESTADO: 14/27 tests fallando (51.8% de fallo)
 * FECHA: 2024-01-17
 * IMPACTO: BAJO (funcionalidad real probablemente funciona, solo tests desactualizados)
 *
 * PROBLEMA PRINCIPAL:
 * Los tests usan formato de external_reference que no coincide con el parser
 * centralizado en payment.constants.ts (parseLegacyExternalReference).
 *
 * CAUSA RAÍZ:
 * El servicio cambió para usar parseLegacyExternalReference() que solo acepta:
 * 1. IDs numéricos puros (regex: /^\d+$/) → tipo PAGO_COLONIA
 * 2. Patrones específicos: "membresia-*", "inscripcion-*", "inscripcion2026-*"
 *
 * Los tests usan: "pago-colonia-123" (contiene caracteres no numéricos)
 * El parser rechaza esto y retorna { message: 'Invalid external_reference format' }
 * Por lo tanto NINGUNO de los tests llega a ejecutar la lógica de actualización.
 *
 * TESTS FALLIDOS Y RAZONES:
 *
 * 1. "should correctly parse colonia external reference" (línea 125)
 *    - Espera: que se llame a prisma.coloniaPago.findUnique()
 *    - Realidad: Parser rechaza "pago-colonia-123", retorna early con error
 *    - Fix: Cambiar external_reference a valor numérico "123" o actualizar parser
 *
 * 2. "should handle null external reference" (línea 150)
 *    - Espera: mensaje "Payment without valid external_reference"
 *    - Recibe: mensaje "Payment without external_reference"
 *    - Fix: Actualizar expectativa del test
 *
 * 3-9. Tests de estados de pago (APPROVED, REJECTED, CANCELLED, PENDING) (líneas 165-294)
 *    - Espera: que se llame a prisma.coloniaPago.update() con estados paid/failed/pending
 *    - Realidad: Parser rechaza external_reference, nunca llega a update()
 *    - Fix: Usar external_reference válido (numérico)
 *
 * 10. "should fallback to first pending payment" (línea 297)
 *    - Espera: 2 llamadas a findUnique (preference_id + fallback)
 *    - Realidad: 0 llamadas porque parser rechaza external_reference
 *    - Fix: Usar external_reference válido
 *
 * 11. "should return error when no pending payments found" (línea 330)
 *    - Espera: "No pending payments found"
 *    - Recibe: "Invalid external_reference format"
 *    - Fix: Usar external_reference válido
 *
 * 12. "should handle database errors gracefully" (línea 347)
 *    - Espera: throw BadRequestException
 *    - Realidad: Resuelve con { message: "Invalid external_reference format" }
 *    - Fix: Usar external_reference válido para que llegue al código que puede fallar
 *
 * 13. "should handle unknown payment status" (línea 354)
 *    - Espera: update con estado "pending" (fallback)
 *    - Realidad: No llega a update() por parser
 *    - Fix: Usar external_reference válido
 *
 * 14. "should handle inscripcion IDs with special characters" (línea 378)
 *    - Usa: "colonia-insc_2026-abc-123"
 *    - Espera: result.inscripcionId === "insc_2026-abc-123"
 *    - Realidad: result es { message: "Invalid external_reference format" }
 *    - Fix: Actualizar formato o parser
 *
 * 15. "should handle very large payment amounts" (línea 401)
 *    - Espera: result.success === true
 *    - Realidad: result es { message: "Invalid external_reference format" }
 *    - Fix: Usar external_reference válido
 *
 * SOLUCIONES POSIBLES:
 *
 * OPCIÓN A (RECOMENDADA): Actualizar tests para usar formato válido
 * - Cambiar mockPaymentApproved.external_reference de "pago-colonia-123" a "123"
 * - Cambiar mockColoniaPago.id para que coincida con "123"
 * - Actualizar todos los tests que crean custom payments
 * - Pros: Tests reflejan comportamiento real del parser
 * - Contras: Requiere actualizar ~15 lugares en el archivo
 *
 * OPCIÓN B: Actualizar parser para aceptar formato "pago-colonia-{id}"
 * - Modificar parseLegacyExternalReference en payment.constants.ts
 * - Agregar case para /^pago-colonia-(\d+)$/
 * - Pros: Tests funcionan sin cambios
 * - Contras: Puede no reflejar formato real de MercadoPago
 *
 * OPCIÓN C: Revisar formato real de external_reference en producción
 * - Verificar qué formato se usa en createPreferenceColonia()
 * - Actualizar parser Y tests para que coincidan con la realidad
 * - Pros: Garantiza coherencia con producción
 * - Contras: Requiere revisar código de creación de preferencias
 *
 * PRÓXIMOS PASOS:
 * 1. Verificar en colonia.service.ts cómo se crea el external_reference
 * 2. Ver método createPreferenceColonia() y qué formato usa
 * 3. Decidir entre Opción A, B o C
 * 4. Implementar fix sistemáticamente
 * 5. Verificar que los 14 tests pasen
 *
 * ARCHIVOS RELACIONADOS:
 * - apps/api/src/domain/constants/payment.constants.ts (línea 272-281: parser PAGO_COLONIA)
 * - apps/api/src/colonia/colonia.service.ts (línea 292-296: uso del parser)
 * - apps/api/src/colonia/colonia.service.ts (línea 140-180: createPreferenceColonia)
 */

/**
 * TESTS EXHAUSTIVOS PARA WEBHOOK COLONIA
 *
 * Cobertura:
 * - procesarWebhookMercadoPago(): Procesamiento de webhook Colonia
 * - actualizarPagoColonia(): Actualización de estado de pago
 * - Parsing de external_reference formato "colonia-{id}"
 * - Actualización de ColoniaPago
 * - Manejo de errores y edge cases
 * - Fallback a pago pendiente cuando no se encuentra por preference_id
 *
 * Casos de Prueba:
 * - Webhook con pago aprobado
 * - Webhook con pago rechazado
 * - Webhook con pago cancelado
 * - Webhook con pago pendiente
 * - External reference inválida
 * - Pago no encontrado
 * - Múltiples pagos pendientes (selecciona el más antiguo)
 */

describe('ColoniaService - Webhook Processing', () => {
  let service: ColoniaService;
  let prisma: PrismaClient;
  let mercadoPagoService: MercadoPagoService;

  const mockWebhookData: MercadoPagoWebhookDto = {
    action: 'payment.updated',
    type: 'payment',
    data: {
      id: '987654321',
    },
    live_mode: 'true',
    date_created: '2024-01-15T10:30:00Z',
  };

  const mockPaymentApproved = {
    id: 987654321,
    status: 'approved',
    external_reference: '123', // ID numérico del pago (parseLegacyExternalReference acepta formato numérico)
    transaction_amount: 55000,
    date_approved: '2024-01-15T10:30:00Z',
    additional_info: {
      items: [{ id: '123' }],
    },
  };

  const mockColoniaPago = {
    id: '123',
    inscripcion_id: 'insc-colonia-123',
    mes: 'enero',
    anio: 2026,
    monto: 55000,
    estado: 'pending',
    mercadopago_preference_id: 'pref-colonia-123',
    mercadopago_payment_id: null,
    fecha_pago: null,
    fecha_vencimiento: new Date('2026-01-05'),
    fecha_creacion: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColoniaService,
        {
          provide: PrismaClient,
          useValue: {
            coloniaPago: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: MercadoPagoService,
          useValue: {
            getPayment: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ColoniaService>(ColoniaService);
    prisma = module.get<PrismaClient>(PrismaClient);
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

      expect(result).toEqual({ message: 'Webhook type not handled' });
      expect(mercadoPagoService.getPayment).not.toHaveBeenCalled();
    });

    it('should process payment webhooks', async () => {
      jest.spyOn(mercadoPagoService, 'getPayment').mockResolvedValue(mockPaymentApproved);
      jest.spyOn(prisma.coloniaPago, 'findUnique').mockResolvedValue(mockColoniaPago);
      jest.spyOn(prisma.coloniaPago, 'update').mockResolvedValue(mockColoniaPago);

      await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(mercadoPagoService.getPayment).toHaveBeenCalledWith('987654321');
    });
  });

  describe('External Reference Parsing', () => {
    it('should correctly parse colonia external reference', async () => {
      jest.spyOn(mercadoPagoService, 'getPayment').mockResolvedValue(mockPaymentApproved);
      jest.spyOn(prisma.coloniaPago, 'findUnique').mockResolvedValue(mockColoniaPago);
      jest.spyOn(prisma.coloniaPago, 'update').mockResolvedValue(mockColoniaPago);

      await service.procesarWebhookMercadoPago(mockWebhookData);

      // Debe buscar pago con el pagoId extraído
      expect(prisma.coloniaPago.findUnique).toHaveBeenCalled();
    });

    it('should reject external reference without colonia prefix', async () => {
      const paymentInvalidRef = {
        ...mockPaymentApproved,
        external_reference: 'inscripcion2026-123-tutor-456',
      };

      jest.spyOn(mercadoPagoService, 'getPayment').mockResolvedValue(paymentInvalidRef);

      const result = await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(result).toEqual({ message: 'Invalid external_reference format' });
      expect(prisma.coloniaPago.findUnique).not.toHaveBeenCalled();
    });

    it('should handle null external reference', async () => {
      const paymentNullRef = {
        ...mockPaymentApproved,
        external_reference: null,
      };

      jest.spyOn(mercadoPagoService, 'getPayment').mockResolvedValue(paymentNullRef);

      const result = await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(result).toEqual({ message: 'Payment without external_reference' });
    });
  });

  describe('Payment Status Processing - APPROVED', () => {
    beforeEach(() => {
      jest.spyOn(mercadoPagoService, 'getPayment').mockResolvedValue(mockPaymentApproved);
      jest.spyOn(prisma.coloniaPago, 'findFirst').mockResolvedValue(mockColoniaPago);
      jest.spyOn(prisma.coloniaPago, 'update').mockResolvedValue({
        ...mockColoniaPago,
        estado: 'paid',
      });
    });

    it('should update pago to "paid" when payment is approved', async () => {
      await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(prisma.coloniaPago.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: {
          estado: 'paid',
          mercadopago_payment_id: '987654321',
          fecha_pago: expect.any(Date),
        },
      });
    });

    it('should return success response when payment is approved', async () => {
      const result = await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(result).toMatchObject({
        success: true,
        pagoId: '123',
        inscripcionId: 'insc-colonia-123',
        paymentStatus: 'paid',
      });
    });
  });

  describe('Payment Status Processing - REJECTED', () => {
    it('should update pago to "failed" when payment is rejected', async () => {
      const paymentRejected = {
        ...mockPaymentApproved,
        status: 'rejected',
      };

      jest.spyOn(mercadoPagoService, 'getPayment').mockResolvedValue(paymentRejected);
      jest.spyOn(prisma.coloniaPago, 'findFirst').mockResolvedValue(mockColoniaPago);
      jest.spyOn(prisma.coloniaPago, 'update').mockResolvedValue({
        ...mockColoniaPago,
        estado: 'failed',
      });

      await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(prisma.coloniaPago.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: {
          estado: 'failed',
          mercadopago_payment_id: '987654321',
          fecha_pago: undefined,
        },
      });
    });
  });

  describe('Payment Status Processing - CANCELLED', () => {
    it('should handle cancelled payment same as rejected', async () => {
      const paymentCancelled = {
        ...mockPaymentApproved,
        status: 'cancelled',
      };

      jest.spyOn(mercadoPagoService, 'getPayment').mockResolvedValue(paymentCancelled);
      jest.spyOn(prisma.coloniaPago, 'findFirst').mockResolvedValue(mockColoniaPago);
      jest.spyOn(prisma.coloniaPago, 'update').mockResolvedValue({
        ...mockColoniaPago,
        estado: 'failed',
      });

      await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(prisma.coloniaPago.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            estado: 'failed',
          }),
        }),
      );
    });
  });

  describe('Payment Status Processing - PENDING', () => {
    it('should keep estado as "pending" when payment is pending', async () => {
      const paymentPending = {
        ...mockPaymentApproved,
        status: 'pending',
      };

      jest.spyOn(mercadoPagoService, 'getPayment').mockResolvedValue(paymentPending);
      jest.spyOn(prisma.coloniaPago, 'findFirst').mockResolvedValue(mockColoniaPago);
      jest.spyOn(prisma.coloniaPago, 'update').mockResolvedValue(mockColoniaPago);

      await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(prisma.coloniaPago.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            estado: 'pending',
          }),
        }),
      );
    });

    it('should handle "in_process" status as pending', async () => {
      const paymentInProcess = {
        ...mockPaymentApproved,
        status: 'in_process',
      };

      jest.spyOn(mercadoPagoService, 'getPayment').mockResolvedValue(paymentInProcess);
      jest.spyOn(prisma.coloniaPago, 'findFirst').mockResolvedValue(mockColoniaPago);
      jest.spyOn(prisma.coloniaPago, 'update').mockResolvedValue(mockColoniaPago);

      await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(prisma.coloniaPago.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            estado: 'pending',
          }),
        }),
      );
    });
  });

  describe('Fallback to Pending Payment', () => {
    it('should fallback to first pending payment when not found by preference_id', async () => {
      jest.spyOn(mercadoPagoService, 'getPayment').mockResolvedValue(mockPaymentApproved);

      // Primera búsqueda no encuentra nada
      jest
        .spyOn(prisma.coloniaPago, 'findFirst')
        .mockResolvedValueOnce(null)
        // Segunda búsqueda (fallback) encuentra pago pendiente
        .mockResolvedValueOnce(mockColoniaPago);

      jest.spyOn(prisma.coloniaPago, 'update').mockResolvedValue({
        ...mockColoniaPago,
        estado: 'paid',
      });

      const result = await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(prisma.coloniaPago.findUnique).toHaveBeenCalledTimes(2);
      expect(prisma.coloniaPago.findUnique).toHaveBeenLastCalledWith({
        where: {
          inscripcion_id: 'insc-colonia-123',
          estado: 'pending',
        },
        orderBy: { fecha_creacion: 'asc' },
      });

      expect(result).toMatchObject({
        success: true,
        paymentStatus: 'paid',
      });
    });

    it('should return error when no pending payments found', async () => {
      jest.spyOn(mercadoPagoService, 'getPayment').mockResolvedValue(mockPaymentApproved);
      jest.spyOn(prisma.coloniaPago, 'findFirst').mockResolvedValue(null);

      const result = await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(result).toEqual({ message: 'No pending payments found' });
    });
  });

  describe('Error Handling', () => {
    it('should handle MercadoPago API errors', async () => {
      jest.spyOn(mercadoPagoService, 'getPayment').mockRejectedValue(new Error('API Error'));

      await expect(service.procesarWebhookMercadoPago(mockWebhookData)).rejects.toThrow(BadRequestException);
    });

    it('should handle database errors gracefully', async () => {
      jest.spyOn(mercadoPagoService, 'getPayment').mockResolvedValue(mockPaymentApproved);
      jest.spyOn(prisma.coloniaPago, 'findFirst').mockRejectedValue(new Error('DB Error'));

      await expect(service.procesarWebhookMercadoPago(mockWebhookData)).rejects.toThrow(BadRequestException);
    });

    it('should handle unknown payment status', async () => {
      const paymentUnknown = {
        ...mockPaymentApproved,
        status: 'unknown_status',
      };

      jest.spyOn(mercadoPagoService, 'getPayment').mockResolvedValue(paymentUnknown);
      jest.spyOn(prisma.coloniaPago, 'findFirst').mockResolvedValue(mockColoniaPago);
      jest.spyOn(prisma.coloniaPago, 'update').mockResolvedValue(mockColoniaPago);

      await service.procesarWebhookMercadoPago(mockWebhookData);

      // Debe usar 'pending' como fallback
      expect(prisma.coloniaPago.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            estado: 'pending',
          }),
        }),
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle inscripcion IDs with special characters', async () => {
      const payment = {
        ...mockPaymentApproved,
        external_reference: 'colonia-insc_2026-abc-123',
      };

      const updatedMockPago = {
        ...mockColoniaPago,
        inscripcion_id: 'insc_2026-abc-123',
      };

      jest.spyOn(mercadoPagoService, 'getPayment').mockResolvedValue(payment);
      jest.spyOn(prisma.coloniaPago, 'findFirst').mockResolvedValue(updatedMockPago);
      jest.spyOn(prisma.coloniaPago, 'update').mockResolvedValue({
        ...updatedMockPago,
        estado: 'paid',
      });

      const result = await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(result.inscripcionId).toBe('insc_2026-abc-123');
    });

    it('should handle very large payment amounts', async () => {
      const paymentLarge = {
        ...mockPaymentApproved,
        transaction_amount: 999999,
      };

      jest.spyOn(mercadoPagoService, 'getPayment').mockResolvedValue(paymentLarge);
      jest.spyOn(prisma.coloniaPago, 'findFirst').mockResolvedValue({
        ...mockColoniaPago,
        monto: 999999,
      });
      jest.spyOn(prisma.coloniaPago, 'update').mockResolvedValue(mockColoniaPago);

      const result = await service.procesarWebhookMercadoPago(mockWebhookData);

      expect(result.success).toBe(true);
    });
  });
});
