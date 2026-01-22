import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WebhookDLQService, AddToDLQData } from '../webhook-dlq.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { DLQStatus } from '@prisma/client';
import { MercadoPagoWebhookDto } from '../../dto/mercadopago-webhook.dto';

describe('WebhookDLQService', () => {
  let service: WebhookDLQService;

  const mockPrismaService = {
    webhookFailed: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const createMockWebhookPayload = (
    paymentId: string = '12345',
  ): MercadoPagoWebhookDto => ({
    action: 'payment.created',
    api_version: 'v1',
    data: { id: paymentId },
    date_created: new Date().toISOString(),
    id: 123456789,
    live_mode: true,
    type: 'payment',
    userId: '123456',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookDLQService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WebhookDLQService>(WebhookDLQService);
    jest.clearAllMocks();
  });

  describe('addToDLQ', () => {
    it('should_add_webhook_to_dlq_when_called_with_valid_data', async () => {
      const addData: AddToDLQData = {
        paymentId: '12345',
        webhookType: 'payment',
        payload: createMockWebhookPayload('12345'),
        errorMessage: 'Connection timeout',
        errorStack: 'Error: Connection timeout\n    at ...',
        retries: 5,
      };

      mockPrismaService.webhookFailed.create.mockResolvedValue({
        id: 'dlq-record-1',
        paymentId: addData.paymentId,
        webhookType: addData.webhookType,
        payload: addData.payload,
        errorMessage: addData.errorMessage,
        errorStack: addData.errorStack,
        retries: addData.retries,
        status: DLQStatus.PENDING,
        lastRetryAt: expect.any(Date),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.addToDLQ(addData);

      expect(result).toEqual({ id: 'dlq-record-1' });
      expect(mockPrismaService.webhookFailed.create).toHaveBeenCalledWith({
        data: {
          paymentId: addData.paymentId,
          webhookType: addData.webhookType,
          payload: addData.payload,
          errorMessage: addData.errorMessage,
          errorStack: addData.errorStack,
          retries: addData.retries,
          status: DLQStatus.PENDING,
          lastRetryAt: expect.any(Date),
        },
      });
    });

    it('should_add_webhook_without_stack_when_stack_is_undefined', async () => {
      const addData: AddToDLQData = {
        paymentId: '67890',
        webhookType: 'payment',
        payload: createMockWebhookPayload('67890'),
        errorMessage: 'Unknown error',
        retries: 3,
      };

      mockPrismaService.webhookFailed.create.mockResolvedValue({
        id: 'dlq-record-2',
      });

      await service.addToDLQ(addData);

      expect(mockPrismaService.webhookFailed.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          errorStack: undefined,
        }),
      });
    });
  });

  describe('listDLQ', () => {
    it('should_return_paginated_list_when_no_filters', async () => {
      const mockItems = [
        {
          id: 'dlq-1',
          paymentId: '111',
          status: DLQStatus.PENDING,
          createdAt: new Date(),
        },
        {
          id: 'dlq-2',
          paymentId: '222',
          status: DLQStatus.PENDING,
          createdAt: new Date(),
        },
      ];

      mockPrismaService.webhookFailed.findMany.mockResolvedValue(mockItems);
      mockPrismaService.webhookFailed.count.mockResolvedValue(2);

      const result = await service.listDLQ();

      expect(result).toEqual({
        items: mockItems,
        total: 2,
        limit: 50,
        offset: 0,
        hasMore: false,
      });
      expect(mockPrismaService.webhookFailed.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0,
      });
    });

    it('should_filter_by_status_when_provided', async () => {
      mockPrismaService.webhookFailed.findMany.mockResolvedValue([]);
      mockPrismaService.webhookFailed.count.mockResolvedValue(0);

      await service.listDLQ({ status: DLQStatus.PENDING });

      expect(mockPrismaService.webhookFailed.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: DLQStatus.PENDING },
        }),
      );
    });

    it('should_filter_by_paymentId_when_provided', async () => {
      mockPrismaService.webhookFailed.findMany.mockResolvedValue([]);
      mockPrismaService.webhookFailed.count.mockResolvedValue(0);

      await service.listDLQ({ paymentId: '12345' });

      expect(mockPrismaService.webhookFailed.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { paymentId: '12345' },
        }),
      );
    });

    it('should_filter_by_date_range_when_provided', async () => {
      mockPrismaService.webhookFailed.findMany.mockResolvedValue([]);
      mockPrismaService.webhookFailed.count.mockResolvedValue(0);

      const fromDate = new Date('2026-01-01');
      const toDate = new Date('2026-01-31');

      await service.listDLQ({ fromDate, toDate });

      expect(mockPrismaService.webhookFailed.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            createdAt: {
              gte: fromDate,
              lte: toDate,
            },
          },
        }),
      );
    });

    it('should_return_hasMore_true_when_more_records_exist', async () => {
      const mockItems = Array(50)
        .fill(null)
        .map((_, i) => ({
          id: `dlq-${i}`,
          paymentId: `${i}`,
          status: DLQStatus.PENDING,
        }));

      mockPrismaService.webhookFailed.findMany.mockResolvedValue(mockItems);
      mockPrismaService.webhookFailed.count.mockResolvedValue(100);

      const result = await service.listDLQ({}, 50, 0);

      expect(result.hasMore).toBe(true);
    });
  });

  describe('getById', () => {
    it('should_return_record_when_exists', async () => {
      const mockRecord = {
        id: 'dlq-1',
        paymentId: '12345',
        status: DLQStatus.PENDING,
      };

      mockPrismaService.webhookFailed.findUnique.mockResolvedValue(mockRecord);

      const result = await service.getById('dlq-1');

      expect(result).toEqual(mockRecord);
      expect(mockPrismaService.webhookFailed.findUnique).toHaveBeenCalledWith({
        where: { id: 'dlq-1' },
      });
    });

    it('should_return_null_when_not_exists', async () => {
      mockPrismaService.webhookFailed.findUnique.mockResolvedValue(null);

      const result = await service.getById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('markAsProcessing', () => {
    it('should_update_status_to_processing_when_record_exists', async () => {
      const mockExisting = {
        id: 'dlq-1',
        status: DLQStatus.PENDING,
      };

      mockPrismaService.webhookFailed.findUnique.mockResolvedValue(
        mockExisting,
      );
      mockPrismaService.webhookFailed.update.mockResolvedValue({
        ...mockExisting,
        status: DLQStatus.PROCESSING,
      });

      const result = await service.markAsProcessing('dlq-1');

      expect(result.status).toBe(DLQStatus.PROCESSING);
      expect(mockPrismaService.webhookFailed.update).toHaveBeenCalledWith({
        where: { id: 'dlq-1' },
        data: {
          status: DLQStatus.PROCESSING,
          lastRetryAt: expect.any(Date),
        },
      });
    });

    it('should_throw_not_found_when_record_not_exists', async () => {
      mockPrismaService.webhookFailed.findUnique.mockResolvedValue(null);

      await expect(service.markAsProcessing('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should_log_warning_when_processing_non_pending_record', async () => {
      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');

      mockPrismaService.webhookFailed.findUnique.mockResolvedValue({
        id: 'dlq-1',
        status: DLQStatus.RESOLVED,
      });
      mockPrismaService.webhookFailed.update.mockResolvedValue({
        id: 'dlq-1',
        status: DLQStatus.PROCESSING,
      });

      await service.markAsProcessing('dlq-1');

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('status RESOLVED'),
      );
    });
  });

  describe('markAsResolved', () => {
    it('should_update_status_to_resolved_when_record_exists', async () => {
      const mockExisting = {
        id: 'dlq-1',
        status: DLQStatus.PROCESSING,
      };

      mockPrismaService.webhookFailed.findUnique.mockResolvedValue(
        mockExisting,
      );
      mockPrismaService.webhookFailed.update.mockResolvedValue({
        ...mockExisting,
        status: DLQStatus.RESOLVED,
        resolvedBy: 'admin-123',
        resolutionNotes: 'Processed manually',
      });

      const result = await service.markAsResolved('dlq-1', {
        resolvedBy: 'admin-123',
        resolutionNotes: 'Processed manually',
      });

      expect(result.status).toBe(DLQStatus.RESOLVED);
      expect(mockPrismaService.webhookFailed.update).toHaveBeenCalledWith({
        where: { id: 'dlq-1' },
        data: {
          status: DLQStatus.RESOLVED,
          resolvedAt: expect.any(Date),
          resolvedBy: 'admin-123',
          resolutionNotes: 'Processed manually',
        },
      });
    });

    it('should_throw_not_found_when_record_not_exists', async () => {
      mockPrismaService.webhookFailed.findUnique.mockResolvedValue(null);

      await expect(
        service.markAsResolved('nonexistent', { resolvedBy: 'admin' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAsAbandoned', () => {
    it('should_update_status_to_abandoned_when_record_exists', async () => {
      const mockExisting = {
        id: 'dlq-1',
        status: DLQStatus.PENDING,
      };

      mockPrismaService.webhookFailed.findUnique.mockResolvedValue(
        mockExisting,
      );
      mockPrismaService.webhookFailed.update.mockResolvedValue({
        ...mockExisting,
        status: DLQStatus.ABANDONED,
        resolvedBy: 'admin-456',
        resolutionNotes: 'Invalid payment ID',
      });

      const result = await service.markAsAbandoned('dlq-1', {
        resolvedBy: 'admin-456',
        resolutionNotes: 'Invalid payment ID',
      });

      expect(result.status).toBe(DLQStatus.ABANDONED);
      expect(mockPrismaService.webhookFailed.update).toHaveBeenCalledWith({
        where: { id: 'dlq-1' },
        data: {
          status: DLQStatus.ABANDONED,
          resolvedAt: expect.any(Date),
          resolvedBy: 'admin-456',
          resolutionNotes: 'Invalid payment ID',
        },
      });
    });

    it('should_throw_not_found_when_record_not_exists', async () => {
      mockPrismaService.webhookFailed.findUnique.mockResolvedValue(null);

      await expect(
        service.markAsAbandoned('nonexistent', { resolvedBy: 'admin' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('revertToPending', () => {
    it('should_revert_status_to_pending_and_increment_retries', async () => {
      mockPrismaService.webhookFailed.update.mockResolvedValue({
        id: 'dlq-1',
        status: DLQStatus.PENDING,
        retries: 6,
      });

      const result = await service.revertToPending(
        'dlq-1',
        'New error message',
      );

      expect(result.status).toBe(DLQStatus.PENDING);
      expect(result.retries).toBe(6);
      expect(mockPrismaService.webhookFailed.update).toHaveBeenCalledWith({
        where: { id: 'dlq-1' },
        data: {
          status: DLQStatus.PENDING,
          errorMessage: 'New error message',
          lastRetryAt: expect.any(Date),
          retries: { increment: 1 },
        },
      });
    });
  });

  describe('getStats', () => {
    it('should_return_aggregated_stats_by_status', async () => {
      mockPrismaService.webhookFailed.groupBy.mockResolvedValue([
        { status: DLQStatus.PENDING, _count: 5 },
        { status: DLQStatus.RESOLVED, _count: 10 },
        { status: DLQStatus.ABANDONED, _count: 2 },
      ]);
      mockPrismaService.webhookFailed.count.mockResolvedValue(5);
      mockPrismaService.webhookFailed.findFirst.mockResolvedValue({
        id: 'oldest-1',
        createdAt: new Date('2026-01-01'),
        paymentId: '11111',
      });

      const result = await service.getStats();

      expect(result.byStatus).toEqual({
        PENDING: 5,
        RESOLVED: 10,
        ABANDONED: 2,
      });
      expect(result.totalPending).toBe(5);
      expect(result.oldestPending).toBeDefined();
      expect(result.oldestPending?.paymentId).toBe('11111');
    });

    it('should_return_empty_stats_when_no_records', async () => {
      mockPrismaService.webhookFailed.groupBy.mockResolvedValue([]);
      mockPrismaService.webhookFailed.count.mockResolvedValue(0);
      mockPrismaService.webhookFailed.findFirst.mockResolvedValue(null);

      const result = await service.getStats();

      expect(result.byStatus).toEqual({});
      expect(result.totalPending).toBe(0);
      expect(result.oldestPending).toBeNull();
    });
  });

  describe('cleanOldRecords', () => {
    it('should_delete_resolved_and_abandoned_records_older_than_30_days', async () => {
      mockPrismaService.webhookFailed.deleteMany.mockResolvedValue({
        count: 15,
      });

      const result = await service.cleanOldRecords();

      expect(result).toBe(15);
      expect(mockPrismaService.webhookFailed.deleteMany).toHaveBeenCalledWith({
        where: {
          status: {
            in: [DLQStatus.RESOLVED, DLQStatus.ABANDONED],
          },
          resolvedAt: {
            lt: expect.any(Date),
          },
        },
      });
    });

    it('should_return_zero_when_no_old_records', async () => {
      mockPrismaService.webhookFailed.deleteMany.mockResolvedValue({
        count: 0,
      });

      const result = await service.cleanOldRecords();

      expect(result).toBe(0);
    });
  });
});
