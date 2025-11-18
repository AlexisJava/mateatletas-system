import { Test, TestingModule } from '@nestjs/testing';
import { WebhookIdempotencyService } from '../webhook-idempotency.service';
import { PrismaService } from '../../../core/database/prisma.service';

describe('WebhookIdempotencyService - SECURITY CRITICAL', () => {
  let service: WebhookIdempotencyService;
  let prisma: PrismaService;

  const mockPrismaService = {
    webhookProcessed: {
      findUnique: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookIdempotencyService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WebhookIdempotencyService>(
      WebhookIdempotencyService,
    );
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('wasProcessed', () => {
    it('should return false if webhook is new (not processed before)', async () => {
      mockPrismaService.webhookProcessed.findUnique.mockResolvedValue(null);

      const result = await service.wasProcessed('payment-123');

      expect(result).toBe(false);
      expect(mockPrismaService.webhookProcessed.findUnique).toHaveBeenCalledWith(
        {
          where: { payment_id: 'payment-123' },
        },
      );
    });

    it('should return true if webhook was already processed', async () => {
      const mockProcessedWebhook = {
        id: 'webhook-1',
        payment_id: 'payment-123',
        webhook_type: 'inscripcion',
        status: 'approved',
        external_reference: 'inscripcion-1-estudiante-1-producto-1',
        processed_at: new Date('2025-01-15T10:00:00Z'),
        created_at: new Date('2025-01-15T10:00:00Z'),
      };

      mockPrismaService.webhookProcessed.findUnique.mockResolvedValue(
        mockProcessedWebhook,
      );

      const result = await service.wasProcessed('payment-123');

      expect(result).toBe(true);
    });

    it('should log warning when duplicate webhook is detected', async () => {
      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');

      mockPrismaService.webhookProcessed.findUnique.mockResolvedValue({
        id: 'webhook-1',
        payment_id: 'payment-123',
        processed_at: new Date('2025-01-15T10:00:00Z'),
      });

      await service.wasProcessed('payment-123');

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Webhook duplicado detectado'),
      );
    });
  });

  describe('markAsProcessed', () => {
    it('should mark webhook as processed successfully', async () => {
      const webhookData = {
        paymentId: 'payment-456',
        webhookType: 'membresia',
        status: 'approved',
        externalReference: 'membresia-1-tutor-1-producto-1',
      };

      const mockCreated = {
        id: 'webhook-2',
        payment_id: 'payment-456',
        webhook_type: 'membresia',
        status: 'approved',
        external_reference: 'membresia-1-tutor-1-producto-1',
        processed_at: new Date(),
        created_at: new Date(),
      };

      mockPrismaService.webhookProcessed.create.mockResolvedValue(mockCreated);

      await service.markAsProcessed(webhookData);

      expect(mockPrismaService.webhookProcessed.create).toHaveBeenCalledWith({
        data: {
          payment_id: 'payment-456',
          webhook_type: 'membresia',
          status: 'approved',
          external_reference: 'membresia-1-tutor-1-producto-1',
        },
      });
    });

    it('should handle race conditions gracefully (P2002 unique constraint violation)', async () => {
      const webhookData = {
        paymentId: 'payment-789',
        webhookType: 'inscripcion',
        status: 'approved',
        externalReference: 'inscripcion-1-estudiante-1-producto-1',
      };

      // Simular error de unique constraint (otro proceso ya guardó el registro)
      const uniqueConstraintError: any = new Error(
        'Unique constraint failed on the fields: (`payment_id`)',
      );
      uniqueConstraintError.code = 'P2002';

      mockPrismaService.webhookProcessed.create.mockRejectedValue(
        uniqueConstraintError,
      );

      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');

      // NO debe lanzar error, debe manejar gracefully
      await expect(
        service.markAsProcessed(webhookData),
      ).resolves.not.toThrow();

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Race condition detectada'),
      );
    });

    it('should throw error for non-unique-constraint database errors', async () => {
      const webhookData = {
        paymentId: 'payment-999',
        webhookType: 'inscripcion',
        status: 'approved',
        externalReference: 'inscripcion-1-estudiante-1-producto-1',
      };

      // Simular otro tipo de error (ej: conexión perdida)
      const dbError = new Error('Connection lost');

      mockPrismaService.webhookProcessed.create.mockRejectedValue(dbError);

      // Este tipo de error SÍ debe lanzarse
      await expect(service.markAsProcessed(webhookData)).rejects.toThrow(
        'Connection lost',
      );
    });

    it('should log success message when webhook is marked as processed', async () => {
      const loggerLogSpy = jest.spyOn(service['logger'], 'log');

      mockPrismaService.webhookProcessed.create.mockResolvedValue({
        id: 'webhook-3',
        payment_id: 'payment-111',
      });

      await service.markAsProcessed({
        paymentId: 'payment-111',
        webhookType: 'membresia',
        status: 'approved',
        externalReference: 'membresia-1-tutor-1-producto-1',
      });

      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Webhook marcado como procesado'),
      );
    });
  });

  describe('cleanOldRecords', () => {
    it('should delete webhooks older than 30 days', async () => {
      const mockDeleteResult = { count: 15 };

      mockPrismaService.webhookProcessed.deleteMany.mockResolvedValue(
        mockDeleteResult,
      );

      const deletedCount = await service.cleanOldRecords();

      expect(deletedCount).toBe(15);

      // Verificar que se calculó correctamente la fecha de hace 30 días
      const callArgs =
        mockPrismaService.webhookProcessed.deleteMany.mock.calls[0][0];
      const thirtyDaysAgo = callArgs.where.processed_at.lt;

      const now = new Date();
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - 30);

      // Tolerancia de 1 segundo
      expect(Math.abs(thirtyDaysAgo.getTime() - expectedDate.getTime())).toBeLessThan(
        1000,
      );
    });

    it('should return 0 if no old records exist', async () => {
      mockPrismaService.webhookProcessed.deleteMany.mockResolvedValue({
        count: 0,
      });

      const deletedCount = await service.cleanOldRecords();

      expect(deletedCount).toBe(0);
    });

    it('should log number of cleaned records', async () => {
      const loggerLogSpy = jest.spyOn(service['logger'], 'log');

      mockPrismaService.webhookProcessed.deleteMany.mockResolvedValue({
        count: 42,
      });

      await service.cleanOldRecords();

      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Limpiados 42 registros'),
      );
    });
  });

  describe('getProcessedInfo', () => {
    it('should return webhook info if it exists', async () => {
      const mockWebhook = {
        id: 'webhook-100',
        payment_id: 'payment-200',
        webhook_type: 'inscripcion',
        status: 'approved',
        external_reference: 'inscripcion-1-estudiante-1-producto-1',
        processed_at: new Date('2025-01-15T10:00:00Z'),
        created_at: new Date('2025-01-15T10:00:00Z'),
      };

      mockPrismaService.webhookProcessed.findUnique.mockResolvedValue(
        mockWebhook,
      );

      const result = await service.getProcessedInfo('payment-200');

      expect(result).toEqual(mockWebhook);
    });

    it('should return null if webhook does not exist', async () => {
      mockPrismaService.webhookProcessed.findUnique.mockResolvedValue(null);

      const result = await service.getProcessedInfo('payment-999');

      expect(result).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return aggregated statistics', async () => {
      mockPrismaService.webhookProcessed.count.mockResolvedValueOnce(100); // total
      mockPrismaService.webhookProcessed.groupBy.mockResolvedValueOnce([
        { webhook_type: 'inscripcion', _count: 60 },
        { webhook_type: 'membresia', _count: 40 },
      ]); // byType
      mockPrismaService.webhookProcessed.groupBy.mockResolvedValueOnce([
        { status: 'approved', _count: 85 },
        { status: 'rejected', _count: 15 },
      ]); // byStatus
      mockPrismaService.webhookProcessed.count.mockResolvedValueOnce(25); // last24h

      const stats = await service.getStats();

      expect(stats).toEqual({
        total: 100,
        byType: [
          { webhook_type: 'inscripcion', _count: 60 },
          { webhook_type: 'membresia', _count: 40 },
        ],
        byStatus: [
          { status: 'approved', _count: 85 },
          { status: 'rejected', _count: 15 },
        ],
        last24h: 25,
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete webhook lifecycle', async () => {
      const paymentId = 'payment-lifecycle-test';

      // 1. Primera vez: webhook no procesado
      mockPrismaService.webhookProcessed.findUnique.mockResolvedValueOnce(null);
      expect(await service.wasProcessed(paymentId)).toBe(false);

      // 2. Marcar como procesado
      mockPrismaService.webhookProcessed.create.mockResolvedValueOnce({
        id: 'webhook-lifecycle',
        payment_id: paymentId,
      });
      await service.markAsProcessed({
        paymentId,
        webhookType: 'inscripcion',
        status: 'approved',
        externalReference: 'test-ref',
      });

      // 3. Segunda vez: webhook ya procesado
      mockPrismaService.webhookProcessed.findUnique.mockResolvedValueOnce({
        id: 'webhook-lifecycle',
        payment_id: paymentId,
        processed_at: new Date(),
      });
      expect(await service.wasProcessed(paymentId)).toBe(true);
    });
  });
});
