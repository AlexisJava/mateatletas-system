import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  PaymentAlertService,
  AlertSeverity,
  PaymentAlertType,
  PAYMENT_ALERT_EVENT,
} from '../payment-alert.service';
import { PrismaService } from '../../../core/database/prisma.service';

describe('PaymentAlertService', () => {
  let service: PaymentAlertService;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockPrismaService = {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentAlertService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<PaymentAlertService>(PaymentAlertService);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('alertChargebackReceived', () => {
    it('debe crear alerta CRITICAL para chargeback', async () => {
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-1' });

      await service.alertChargebackReceived({
        paymentId: 'pay-123',
        amount: 5000,
        entityType: 'membresia',
        entityId: 'memb-456',
        tutorId: 'tutor-789',
      });

      // Verificar que se emitió el evento
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        PAYMENT_ALERT_EVENT,
        expect.objectContaining({
          type: PaymentAlertType.CHARGEBACK_RECEIVED,
          severity: AlertSeverity.CRITICAL,
          message: expect.stringContaining('CHARGEBACK'),
        }),
      );

      // Verificar que se guardó en audit log
      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: `PAYMENT_ALERT:${PaymentAlertType.CHARGEBACK_RECEIVED}`,
          severity: 'CRITICAL',
          category: 'SECURITY',
        }),
      });
    });
  });

  describe('alertRefundProcessed', () => {
    it('debe crear alerta WARNING para refund', async () => {
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-2' });

      await service.alertRefundProcessed({
        paymentId: 'pay-123',
        originalAmount: 5000,
        refundedAmount: 5000,
        entityType: 'inscripcion',
        entityId: 'insc-456',
      });

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        PAYMENT_ALERT_EVENT,
        expect.objectContaining({
          type: PaymentAlertType.REFUND_PROCESSED,
          severity: AlertSeverity.WARNING,
        }),
      );

      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
    });
  });

  describe('alertAmountMismatch', () => {
    it('debe crear alerta CRITICAL para discrepancia de monto', async () => {
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-3' });

      await service.alertAmountMismatch({
        paymentId: 'pay-123',
        expectedAmount: 5000,
        actualAmount: 4000,
        difference: 1000,
        percentageDiff: 20,
        externalReference: 'membresia-123-tutor-456',
      });

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        PAYMENT_ALERT_EVENT,
        expect.objectContaining({
          type: PaymentAlertType.AMOUNT_MISMATCH,
          severity: AlertSeverity.CRITICAL,
          message: expect.stringContaining('Discrepancia'),
        }),
      );
    });
  });

  describe('alertSuspiciousIP', () => {
    it('debe crear alerta CRITICAL para IP sospechosa', async () => {
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-4' });

      await service.alertSuspiciousIP({
        ip: '192.168.1.100',
        paymentId: 'pay-123',
        webhookType: 'payment',
      });

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        PAYMENT_ALERT_EVENT,
        expect.objectContaining({
          type: PaymentAlertType.SUSPICIOUS_IP,
          severity: AlertSeverity.CRITICAL,
        }),
      );
    });
  });

  describe('alertWebhookError', () => {
    it('debe crear alerta WARNING para error de webhook', async () => {
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-5' });

      await service.alertWebhookError({
        paymentId: 'pay-123',
        error: 'Connection timeout',
        webhookData: { type: 'payment' },
      });

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        PAYMENT_ALERT_EVENT,
        expect.objectContaining({
          type: PaymentAlertType.WEBHOOK_PROCESSING_ERROR,
          severity: AlertSeverity.WARNING,
        }),
      );
    });
  });

  describe('alertDuplicatePayment', () => {
    it('debe crear alerta WARNING para pago duplicado', async () => {
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-6' });

      await service.alertDuplicatePayment({
        paymentId: 'pay-124',
        previousPaymentId: 'pay-123',
        amount: 5000,
        externalReference: 'membresia-123',
      });

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        PAYMENT_ALERT_EVENT,
        expect.objectContaining({
          type: PaymentAlertType.DUPLICATE_PAYMENT,
          severity: AlertSeverity.WARNING,
        }),
      );
    });
  });

  describe('alertHighFailureRate', () => {
    it('debe crear alerta WARNING para alta tasa de fallos', async () => {
      mockPrismaService.auditLog.create.mockResolvedValue({ id: 'audit-7' });

      await service.alertHighFailureRate({
        period: '2024-01-15',
        totalPayments: 100,
        failedPayments: 25,
        failureRate: 25,
        threshold: 10,
      });

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        PAYMENT_ALERT_EVENT,
        expect.objectContaining({
          type: PaymentAlertType.HIGH_FAILURE_RATE,
          severity: AlertSeverity.WARNING,
          message: expect.stringContaining('25.0%'),
        }),
      );
    });
  });

  describe('getRecentAlerts', () => {
    it('debe retornar alertas recientes del audit log', async () => {
      const mockAlerts = [
        {
          id: 'audit-1',
          action: 'PAYMENT_ALERT:CHARGEBACK_RECEIVED',
          severity: 'CRITICAL',
          description: 'Chargeback recibido',
          timestamp: new Date(),
          metadata: { paymentId: 'pay-123' },
        },
        {
          id: 'audit-2',
          action: 'PAYMENT_ALERT:REFUND_PROCESSED',
          severity: 'WARNING',
          description: 'Refund procesado',
          timestamp: new Date(),
          metadata: { paymentId: 'pay-124' },
        },
      ];

      mockPrismaService.auditLog.findMany.mockResolvedValue(mockAlerts);

      const alerts = await service.getRecentAlerts({ limit: 10 });

      expect(alerts).toHaveLength(2);
      expect(alerts[0].type).toBe('CHARGEBACK_RECEIVED');
      expect(alerts[1].type).toBe('REFUND_PROCESSED');
    });

    it('debe filtrar por severidad si se especifica', async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([]);

      await service.getRecentAlerts({ severity: AlertSeverity.CRITICAL });

      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            severity: AlertSeverity.CRITICAL,
          }),
        }),
      );
    });
  });

  describe('manejo de errores en audit log', () => {
    it('no debe fallar si audit log falla', async () => {
      mockPrismaService.auditLog.create.mockRejectedValue(
        new Error('DB connection failed'),
      );

      // No debe lanzar error
      await expect(
        service.alertChargebackReceived({
          paymentId: 'pay-123',
          amount: 5000,
          entityType: 'membresia',
          entityId: 'memb-456',
        }),
      ).resolves.not.toThrow();

      // Pero sí debe emitir el evento
      expect(mockEventEmitter.emit).toHaveBeenCalled();
    });
  });
});
