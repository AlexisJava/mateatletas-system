import { Test, TestingModule } from '@nestjs/testing';
import { QueueMetricsController } from '../queue-metrics.controller';
import { WebhookQueueService } from '../webhook-queue.service';
import { Job } from 'bull';

describe('QueueMetricsController', () => {
  let controller: QueueMetricsController;
  let mockWebhookQueueService: Partial<WebhookQueueService>;

  beforeEach(async () => {
    // Mock WebhookQueueService
    mockWebhookQueueService = {
      getQueueStats: jest.fn(),
      getFailedJobs: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueueMetricsController],
      providers: [
        {
          provide: WebhookQueueService,
          useValue: mockWebhookQueueService,
        },
      ],
    }).compile();

    controller = module.get<QueueMetricsController>(QueueMetricsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    it('should return queue statistics with health status', async () => {
      const mockStats = {
        waiting: 10,
        active: 2,
        completed: 500,
        failed: 5,
        delayed: 0,
      };

      mockWebhookQueueService.getQueueStats = jest.fn().mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result).toMatchObject({
        waiting: 10,
        active: 2,
        completed: 500,
        failed: 5,
        delayed: 0,
        health: 'healthy',
        failedRate: '0.99%', // 5/(5+500) = 0.99%
      });
      expect(result).toHaveProperty('timestamp');
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should calculate failure rate correctly', async () => {
      const mockStats = {
        waiting: 5,
        active: 1,
        completed: 100,
        failed: 20,
        delayed: 0,
      };

      mockWebhookQueueService.getQueueStats = jest.fn().mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result.failedRate).toBe('16.67%'); // 20/(20+100) = 16.67%
    });

    it('should handle 0% failure rate (no failures)', async () => {
      const mockStats = {
        waiting: 5,
        active: 1,
        completed: 100,
        failed: 0,
        delayed: 0,
      };

      mockWebhookQueueService.getQueueStats = jest.fn().mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result.failedRate).toBe('0.00%');
    });

    it('should handle 100% failure rate (all failed)', async () => {
      const mockStats = {
        waiting: 5,
        active: 1,
        completed: 0,
        failed: 50,
        delayed: 0,
      };

      mockWebhookQueueService.getQueueStats = jest.fn().mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result.failedRate).toBe('100.00%');
    });

    it('should handle no jobs processed yet (0 total)', async () => {
      const mockStats = {
        waiting: 10,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
      };

      mockWebhookQueueService.getQueueStats = jest.fn().mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result.failedRate).toBe('0.00%'); // 0/0 = 0%
    });
  });

  describe('Health Determination', () => {
    it('should be healthy with normal metrics', async () => {
      const mockStats = {
        waiting: 10,
        active: 2,
        completed: 100,
        failed: 5,
        delayed: 0,
      };

      mockWebhookQueueService.getQueueStats = jest.fn().mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result.health).toBe('healthy');
    });

    it('should be degraded with 50+ waiting jobs', async () => {
      const mockStats = {
        waiting: 60,
        active: 2,
        completed: 100,
        failed: 5,
        delayed: 0,
      };

      mockWebhookQueueService.getQueueStats = jest.fn().mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result.health).toBe('degraded');
    });

    it('should be degraded with 10%+ failure rate', async () => {
      const mockStats = {
        waiting: 10,
        active: 2,
        completed: 100,
        failed: 12, // 12/(12+100) = 10.7%
        delayed: 0,
      };

      mockWebhookQueueService.getQueueStats = jest.fn().mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result.health).toBe('degraded');
      expect(result.failedRate).toBe('10.71%');
    });

    it('should be critical with 200+ waiting jobs', async () => {
      const mockStats = {
        waiting: 250,
        active: 2,
        completed: 100,
        failed: 5,
        delayed: 0,
      };

      mockWebhookQueueService.getQueueStats = jest.fn().mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result.health).toBe('critical');
    });

    it('should be critical with 25%+ failure rate', async () => {
      const mockStats = {
        waiting: 10,
        active: 2,
        completed: 100,
        failed: 35, // 35/(35+100) = 25.9%
        delayed: 0,
      };

      mockWebhookQueueService.getQueueStats = jest.fn().mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result.health).toBe('critical');
      expect(result.failedRate).toBe('25.93%');
    });

    it('should be healthy with exactly 10% failure rate (boundary)', async () => {
      const mockStats = {
        waiting: 10,
        active: 2,
        completed: 90,
        failed: 10, // 10/(10+90) = 10% (boundary, should be healthy not degraded)
        delayed: 0,
      };

      mockWebhookQueueService.getQueueStats = jest.fn().mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result.health).toBe('healthy'); // Threshold is >10%, so exactly 10% is still healthy
    });

    it('should be critical when both waiting and failure rate are high', async () => {
      const mockStats = {
        waiting: 300,
        active: 5,
        completed: 100,
        failed: 40, // 28.6% failure rate
        delayed: 0,
      };

      mockWebhookQueueService.getQueueStats = jest.fn().mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result.health).toBe('critical');
    });
  });

  describe('getFailedJobs', () => {
    it('should return formatted failed jobs', async () => {
      const mockFailedJobs: Partial<Job>[] = [
        {
          id: '123',
          data: {
            action: 'payment.updated',
            data: { id: '789' },
          },
          failedReason: 'Connection timeout',
          attemptsMade: 3,
          timestamp: 1700000000000,
          stacktrace: ['Error: Connection timeout', 'at processWebhook (webhook.ts:42)'],
        } as any,
        {
          id: '456',
          data: {
            action: 'payment.created',
            data: { id: '999' },
          },
          failedReason: 'Invalid payment status',
          attemptsMade: 2,
          timestamp: 1700000100000,
          stacktrace: ['Error: Invalid payment status'],
        } as any,
      ];

      mockWebhookQueueService.getFailedJobs = jest.fn().mockResolvedValue(mockFailedJobs);

      const result = await controller.getFailedJobs();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: '123',
        data: {
          action: 'payment.updated',
          data: { id: '789' },
        },
        failedReason: 'Connection timeout',
        attemptsMade: 3,
        stacktrace: 'Error: Connection timeout',
      });
      expect(result[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should request last 50 failed jobs from service', async () => {
      mockWebhookQueueService.getFailedJobs = jest.fn().mockResolvedValue([]);

      await controller.getFailedJobs();

      expect(mockWebhookQueueService.getFailedJobs).toHaveBeenCalledWith(0, 50);
    });

    it('should handle jobs without stacktrace', async () => {
      const mockFailedJobs: Partial<Job>[] = [
        {
          id: '123',
          data: { action: 'payment.updated' },
          failedReason: 'Unknown error',
          attemptsMade: 3,
          timestamp: 1700000000000,
          stacktrace: undefined,
        } as any,
      ];

      mockWebhookQueueService.getFailedJobs = jest.fn().mockResolvedValue(mockFailedJobs);

      const result = await controller.getFailedJobs();

      expect(result[0].stacktrace).toBeNull();
    });

    it('should handle jobs with empty stacktrace array', async () => {
      const mockFailedJobs: Partial<Job>[] = [
        {
          id: '123',
          data: { action: 'payment.updated' },
          failedReason: 'Unknown error',
          attemptsMade: 3,
          timestamp: 1700000000000,
          stacktrace: [],
        } as any,
      ];

      mockWebhookQueueService.getFailedJobs = jest.fn().mockResolvedValue(mockFailedJobs);

      const result = await controller.getFailedJobs();

      expect(result[0].stacktrace).toBeNull();
    });

    it('should only include first line of stacktrace', async () => {
      const mockFailedJobs: Partial<Job>[] = [
        {
          id: '123',
          data: { action: 'payment.updated' },
          failedReason: 'Error',
          attemptsMade: 3,
          timestamp: 1700000000000,
          stacktrace: [
            'Error: Something went wrong',
            'at processWebhook (webhook.ts:42)',
            'at Worker.process (worker.ts:100)',
          ],
        } as any,
      ];

      mockWebhookQueueService.getFailedJobs = jest.fn().mockResolvedValue(mockFailedJobs);

      const result = await controller.getFailedJobs();

      expect(result[0].stacktrace).toBe('Error: Something went wrong');
    });

    it('should return empty array when no failed jobs', async () => {
      mockWebhookQueueService.getFailedJobs = jest.fn().mockResolvedValue([]);

      const result = await controller.getFailedJobs();

      expect(result).toEqual([]);
    });

    it('should format timestamp as ISO string', async () => {
      const mockFailedJobs: Partial<Job>[] = [
        {
          id: '123',
          data: { action: 'payment.updated' },
          failedReason: 'Error',
          attemptsMade: 3,
          timestamp: 1700000000000, // Unix timestamp
          stacktrace: ['Error message'],
        } as any,
      ];

      mockWebhookQueueService.getFailedJobs = jest.fn().mockResolvedValue(mockFailedJobs);

      const result = await controller.getFailedJobs();

      expect(result[0].timestamp).toBe(new Date(1700000000000).toISOString());
    });
  });

  describe('API Documentation', () => {
    it('should have @ApiTags decorator', () => {
      const metadata = Reflect.getMetadata('swagger/apiUseTags', QueueMetricsController);
      expect(metadata).toEqual(['Queue Metrics']);
    });

    it('should have @Controller decorator with correct path', () => {
      const path = Reflect.getMetadata('path', QueueMetricsController);
      expect(path).toBe('queues/metrics');
    });
  });
});
