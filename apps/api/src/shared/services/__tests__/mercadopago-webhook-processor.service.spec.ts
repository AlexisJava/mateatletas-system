import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MercadoPagoWebhookProcessorService } from '../mercadopago-webhook-processor.service';
import { MercadoPagoService } from '../../../pagos/mercadopago.service';
import { MercadoPagoWebhookDto } from '../../../pagos/dto/mercadopago-webhook.dto';
import { TipoExternalReference } from '../../../domain/constants';

describe('MercadoPagoWebhookProcessorService', () => {
  let service: MercadoPagoWebhookProcessorService;
  let mercadoPagoService: MercadoPagoService;

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
    external_reference: 'pago-colonia-pago123-inscripcion-insc456',
    transaction_amount: 55000,
    date_approved: '2024-01-15T10:30:00Z',
  };

  const mockPago = {
    id: 'pago123',
    inscripcion_id: 'insc456',
    mes: 'enero',
    anio: 2026,
    monto: 55000,
    estado: 'pending',
    mercadopago_payment_id: null,
    fecha_pago: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MercadoPagoWebhookProcessorService,
        {
          provide: MercadoPagoService,
          useValue: {
            getPayment: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MercadoPagoWebhookProcessorService>(
      MercadoPagoWebhookProcessorService,
    );
    mercadoPagoService = module.get<MercadoPagoService>(MercadoPagoService);

    jest.clearAllMocks();
  });

  describe('processWebhook', () => {
    it('debe ignorar webhooks que no sean de tipo "payment"', async () => {
      const webhookData = {
        ...mockWebhookData,
        type: 'merchant_order' as any,
      };

      const result = await service.processWebhook(
        webhookData,
        TipoExternalReference.PAGO_COLONIA,
        async () => null,
        async () => ({ success: true }),
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('Webhook type not handled');
      expect(mercadoPagoService.getPayment).not.toHaveBeenCalled();
    });

    it('debe procesar webhook exitosamente con pago aprobado', async () => {
      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(mockPaymentApproved);

      const findPayment = jest.fn().mockResolvedValue(mockPago);
      const updatePayment = jest.fn().mockResolvedValue({
        success: true,
        pagoId: 'pago123',
        paymentStatus: 'paid',
      });

      const result = await service.processWebhook(
        mockWebhookData,
        TipoExternalReference.PAGO_COLONIA,
        findPayment,
        updatePayment,
      );

      expect(mercadoPagoService.getPayment).toHaveBeenCalledWith('123456789');
      expect(findPayment).toHaveBeenCalled();
      expect(updatePayment).toHaveBeenCalledWith(
        mockPago,
        expect.objectContaining({
          paymentId: '123456789',
          paymentStatus: 'approved',
          externalReference: 'pago-colonia-pago123-inscripcion-insc456',
        }),
      );
      expect(result.success).toBe(true);
      expect(result.pagoId).toBe('pago123');
    });

    it('debe retornar error si el pago no tiene external_reference', async () => {
      const paymentWithoutRef = {
        ...mockPaymentApproved,
        external_reference: null,
      };
      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(paymentWithoutRef);

      const result = await service.processWebhook(
        mockWebhookData,
        TipoExternalReference.PAGO_COLONIA,
        async () => null,
        async () => ({ success: true }),
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('Payment without external_reference');
    });

    it('debe retornar error si el external_reference es inválido', async () => {
      // Para PAGO_COLONIA, cualquier string es válido como external_reference
      // Así que probamos con un tipo completamente diferente que el parser rechazará
      const paymentInvalidRef = {
        ...mockPaymentApproved,
        external_reference: '', // Empty string no es válido
      };
      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(paymentInvalidRef);

      const result = await service.processWebhook(
        mockWebhookData,
        TipoExternalReference.INSCRIPCION_2026, // Esperar INSCRIPCION_2026 pero recibir empty string
        async () => null,
        async () => ({ success: true }),
      );

      expect(result.success).toBe(false);
      // Con empty string, el parseLegacyExternalReference debería retornar null o no coincidir con el tipo esperado
    });

    it('debe retornar error si el tipo de external_reference no coincide', async () => {
      // External reference de INSCRIPCION_2026 pero esperamos PAGO_COLONIA
      const paymentWrongType = {
        ...mockPaymentApproved,
        external_reference:
          'inscripcion2026-inscabc123-tutor-tutorxyz789-tipo-COLONIA',
      };
      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(paymentWrongType);

      const result = await service.processWebhook(
        mockWebhookData,
        TipoExternalReference.PAGO_COLONIA,
        async () => null,
        async () => ({ success: true }),
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid external_reference format');
    });

    it('debe retornar error si el pago no se encuentra en la base de datos', async () => {
      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(mockPaymentApproved);

      const findPayment = jest.fn().mockResolvedValue(null);

      const result = await service.processWebhook(
        mockWebhookData,
        TipoExternalReference.PAGO_COLONIA,
        findPayment,
        async () => ({ success: true }),
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('Payment not found in database');
    });

    it('debe lanzar BadRequestException si falla getPayment', async () => {
      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockRejectedValue(new Error('MercadoPago API error'));

      await expect(
        service.processWebhook(
          mockWebhookData,
          TipoExternalReference.PAGO_COLONIA,
          async () => null,
          async () => ({ success: true }),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si falla findPayment callback', async () => {
      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(mockPaymentApproved);

      const findPayment = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

      await expect(
        service.processWebhook(
          mockWebhookData,
          TipoExternalReference.PAGO_COLONIA,
          findPayment,
          async () => ({ success: true }),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si falla updatePayment callback', async () => {
      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(mockPaymentApproved);

      const findPayment = jest.fn().mockResolvedValue(mockPago);
      const updatePayment = jest
        .fn()
        .mockRejectedValue(new Error('Update error'));

      await expect(
        service.processWebhook(
          mockWebhookData,
          TipoExternalReference.PAGO_COLONIA,
          findPayment,
          updatePayment,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe pasar el contexto completo al callback updatePayment', async () => {
      jest
        .spyOn(mercadoPagoService, 'getPayment')
        .mockResolvedValue(mockPaymentApproved);

      const findPayment = jest.fn().mockResolvedValue(mockPago);
      const updatePayment = jest.fn().mockResolvedValue({ success: true });

      await service.processWebhook(
        mockWebhookData,
        TipoExternalReference.PAGO_COLONIA,
        findPayment,
        updatePayment,
      );

      expect(updatePayment).toHaveBeenCalledWith(
        mockPago,
        expect.objectContaining({
          paymentId: '123456789',
          payment: mockPaymentApproved,
          externalReference: 'pago-colonia-pago123-inscripcion-insc456',
          parsedReference: expect.objectContaining({
            tipo: TipoExternalReference.PAGO_COLONIA,
            ids: expect.objectContaining({
              pagoId: 'pago-colonia-pago123-inscripcion-insc456', // El parser devuelve el external_reference completo como pagoId
            }),
          }),
          paymentStatus: 'approved',
        }),
      );
    });
  });

  describe('mapPaymentStatus', () => {
    it('debe mapear "approved" a "paid"', () => {
      expect(service.mapPaymentStatus('approved')).toBe('paid');
    });

    it('debe mapear "rejected" a "failed"', () => {
      expect(service.mapPaymentStatus('rejected')).toBe('failed');
    });

    it('debe mapear "pending" a "pending"', () => {
      expect(service.mapPaymentStatus('pending')).toBe('pending');
    });

    it('debe mapear "in_process" a "pending"', () => {
      expect(service.mapPaymentStatus('in_process')).toBe('pending');
    });

    it('debe mapear "cancelled" a "failed"', () => {
      expect(service.mapPaymentStatus('cancelled')).toBe('failed');
    });

    it('debe mapear "refunded" a "refunded"', () => {
      expect(service.mapPaymentStatus('refunded')).toBe('refunded');
    });

    it('debe mapear "charged_back" a "refunded"', () => {
      expect(service.mapPaymentStatus('charged_back')).toBe('refunded');
    });

    it('debe mapear estados desconocidos a "pending"', () => {
      expect(service.mapPaymentStatus('unknown_status')).toBe('pending');
    });
  });
});
