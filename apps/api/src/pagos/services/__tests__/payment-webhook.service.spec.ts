import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentWebhookService } from '../payment-webhook.service';
import { PaymentStateMapperService } from '../payment-state-mapper.service';
import { PaymentCommandService } from '../payment-command.service';
import { MercadoPagoService } from '../../mercadopago.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { EstadoPago } from '../../../domain/constants';
import { MercadoPagoWebhookDto } from '../../dto/mercadopago-webhook.dto';

describe('PaymentWebhookService', () => {
  let service: PaymentWebhookService;
  let prismaService: jest.Mocked<PrismaService>;
  let stateMapper: jest.Mocked<PaymentStateMapperService>;
  let commandService: jest.Mocked<PaymentCommandService>;
  let mercadoPagoService: jest.Mocked<MercadoPagoService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentWebhookService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: PaymentStateMapperService,
          useValue: {
            mapearEstadoPago: jest.fn(),
          },
        },
        {
          provide: PaymentCommandService,
          useValue: {
            actualizarEstadoMembresia: jest.fn(),
            actualizarEstadoInscripcion: jest.fn(),
          },
        },
        {
          provide: MercadoPagoService,
          useValue: {
            getPayment: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentWebhookService>(PaymentWebhookService);
    prismaService = module.get(PrismaService);
    stateMapper = module.get(PaymentStateMapperService);
    commandService = module.get(PaymentCommandService);
    mercadoPagoService = module.get(MercadoPagoService);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('procesarWebhookMercadoPago', () => {
    it('debe ignorar webhooks que no son de tipo payment', async () => {
      const webhookData: MercadoPagoWebhookDto = {
        type: 'subscription' as any,
        action: 'updated',
        data: { id: '123' },
      };

      const result =
        await service.procesarWebhookMercadoPago(webhookData);

      expect(result.message).toBe('Webhook type not handled');
      expect(mercadoPagoService.getPayment).not.toHaveBeenCalled();
    });

    it('debe ignorar pagos sin external_reference', async () => {
      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'updated',
        data: { id: '123' },
      };

      mercadoPagoService.getPayment.mockResolvedValue({
        id: 123,
        status: 'approved',
        external_reference: null,
      } as any);

      const result =
        await service.procesarWebhookMercadoPago(webhookData);

      expect(result.message).toBe('Payment without external_reference');
    });

    it('debe procesar webhook de membresía exitosamente', async () => {
      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'updated',
        data: { id: '123' },
      };

      mercadoPagoService.getPayment.mockResolvedValue({
        id: 123,
        status: 'approved',
        external_reference: 'membresia-MEM001-tutor-TUT001-producto-PROD001',
      } as any);

      stateMapper.mapearEstadoPago.mockReturnValue(EstadoPago.PAGADO);
      commandService.actualizarEstadoMembresia.mockResolvedValue({
        id: 'MEM001',
        estado: 'Activa',
      } as any);

      const result =
        await service.procesarWebhookMercadoPago(webhookData);

      expect(result.type).toBe('membresia');
      expect(result.membresiaId).toBe('MEM001');
      expect(result.estadoPago).toBe(EstadoPago.PAGADO);
      expect(commandService.actualizarEstadoMembresia).toHaveBeenCalledWith(
        'MEM001',
        EstadoPago.PAGADO,
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'webhook.membresia.procesado',
        expect.objectContaining({
          membresiaId: 'MEM001',
          estadoPago: EstadoPago.PAGADO,
          paymentId: 123,
        }),
      );
    });

    it('debe procesar webhook de inscripción exitosamente', async () => {
      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'updated',
        data: { id: '456' },
      };

      mercadoPagoService.getPayment.mockResolvedValue({
        id: 456,
        status: 'approved',
        external_reference:
          'inscripcion-INS001-estudiante-EST001-producto-PROD001',
      } as any);

      stateMapper.mapearEstadoPago.mockReturnValue(EstadoPago.PAGADO);
      commandService.actualizarEstadoInscripcion.mockResolvedValue({
        id: 'INS001',
        estado_pago: 'Pagado',
      } as any);

      const result =
        await service.procesarWebhookMercadoPago(webhookData);

      expect(result.type).toBe('inscripcion');
      expect(result.inscripcionId).toBe('INS001');
      expect(result.estadoPago).toBe(EstadoPago.PAGADO);
      expect(commandService.actualizarEstadoInscripcion).toHaveBeenCalledWith(
        'INS001',
        EstadoPago.PAGADO,
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'webhook.inscripcion.procesado',
        expect.objectContaining({
          inscripcionId: 'INS001',
          estadoPago: EstadoPago.PAGADO,
          paymentId: 456,
        }),
      );
    });

    it('debe procesar webhook de pago rechazado', async () => {
      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'updated',
        data: { id: '789' },
      };

      mercadoPagoService.getPayment.mockResolvedValue({
        id: 789,
        status: 'rejected',
        external_reference: 'membresia-MEM002-tutor-TUT002-producto-PROD002',
      } as any);

      stateMapper.mapearEstadoPago.mockReturnValue(EstadoPago.RECHAZADO);
      commandService.actualizarEstadoMembresia.mockResolvedValue({
        id: 'MEM002',
        estado: 'Pendiente',
      } as any);

      const result =
        await service.procesarWebhookMercadoPago(webhookData);

      expect(result.type).toBe('membresia');
      expect(result.membresiaId).toBe('MEM002');
      expect(result.estadoPago).toBe(EstadoPago.RECHAZADO);
      expect(result.paymentStatus).toBe('rejected');
    });

    it('debe manejar external_reference con formato desconocido', async () => {
      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'updated',
        data: { id: '999' },
      };

      mercadoPagoService.getPayment.mockResolvedValue({
        id: 999,
        status: 'approved',
        external_reference: 'unknown-format-ABC123',
      } as any);

      const result =
        await service.procesarWebhookMercadoPago(webhookData);

      expect(result.message).toBe('Unknown external_reference format');
      expect(commandService.actualizarEstadoMembresia).not.toHaveBeenCalled();
      expect(commandService.actualizarEstadoInscripcion).not.toHaveBeenCalled();
    });

    it('debe lanzar error si getPayment falla', async () => {
      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'updated',
        data: { id: '404' },
      };

      mercadoPagoService.getPayment.mockRejectedValue(
        new Error('Payment not found'),
      );

      await expect(
        service.procesarWebhookMercadoPago(webhookData),
      ).rejects.toThrow('Payment not found');
    });

    it('debe ignorar pagos sin id o status', async () => {
      const webhookData: MercadoPagoWebhookDto = {
        type: 'payment',
        action: 'updated',
        data: { id: '555' },
      };

      mercadoPagoService.getPayment.mockResolvedValue({
        id: null as any,
        status: null as any,
        external_reference: 'membresia-MEM003-tutor-TUT003-producto-PROD003',
      } as any);

      const result =
        await service.procesarWebhookMercadoPago(webhookData);

      expect(result.message).toBe('Payment without id or status');
      expect(commandService.actualizarEstadoMembresia).not.toHaveBeenCalled();
    });
  });
});
