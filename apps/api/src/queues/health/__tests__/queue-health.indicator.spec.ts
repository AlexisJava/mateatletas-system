import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckError } from '@nestjs/terminus';
import { Queue } from 'bull';
import { QueueHealthIndicator } from '../queue-health.indicator';
import { getQueueToken } from '@nestjs/bull';

describe('QueueHealthIndicator', () => {
  let healthIndicator: QueueHealthIndicator;
  let mockQueue: Partial<Queue>;
  let mockRedisClient: any;

  beforeEach(async () => {
    // Mock Redis client
    mockRedisClient = {
      ping: jest.fn().mockResolvedValue('PONG'),
    };

    // Mock Bull Queue - client es accedido directamente (no es una Promise)
    mockQueue = {
      client: mockRedisClient,
      getWaitingCount: jest.fn().mockResolvedValue(10),
      getActiveCount: jest.fn().mockResolvedValue(2),
      getFailedCount: jest.fn().mockResolvedValue(5),
      getCompletedCount: jest.fn().mockResolvedValue(100),
      getDelayedCount: jest.fn().mockResolvedValue(0),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueHealthIndicator,
        {
          provide: getQueueToken('webhooks'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    healthIndicator = module.get<QueueHealthIndicator>(QueueHealthIndicator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isHealthy', () => {
    it('should return healthy status when all metrics are good', async () => {
      const result = await healthIndicator.isHealthy('webhooks');

      expect(result).toHaveProperty('webhooks');
      expect(result.webhooks).toMatchObject({
        redis: 'connected',
        waiting: 10,
        active: 2,
        failed: 5,
        completed: 100,
        delayed: 0,
        status: 'healthy',
      });
      expect(result.webhooks.failedRate).toBe('4.76%'); // 5/(5+100) = 4.76%
    });

    it('should check Redis connection', async () => {
      await healthIndicator.isHealthy('webhooks');

      expect(mockRedisClient.ping).toHaveBeenCalled();
    });

    it('should throw HealthCheckError when Redis is disconnected', async () => {
      mockRedisClient.ping.mockRejectedValue(new Error('Connection refused'));

      await expect(healthIndicator.isHealthy('webhooks')).rejects.toThrow(
        HealthCheckError,
      );
    });

    it('should throw HealthCheckError when Redis ping fails', async () => {
      mockRedisClient.ping.mockResolvedValue('FAIL');

      await expect(healthIndicator.isHealthy('webhooks')).rejects.toThrow(
        HealthCheckError,
      );
    });
  });

  describe('Health Evaluation - Waiting Jobs Threshold', () => {
    it('should be healthy with <200 waiting jobs', async () => {
      mockQueue.getWaitingCount = jest.fn().mockResolvedValue(150);
      mockQueue.getFailedCount = jest.fn().mockResolvedValue(5);
      mockQueue.getCompletedCount = jest.fn().mockResolvedValue(100);

      const result = await healthIndicator.isHealthy('webhooks');

      expect(result.webhooks.status).toBe('healthy');
    });

    it('should be degraded with exactly 200 waiting jobs', async () => {
      mockQueue.getWaitingCount = jest.fn().mockResolvedValue(200);
      mockQueue.getFailedCount = jest.fn().mockResolvedValue(5);
      mockQueue.getCompletedCount = jest.fn().mockResolvedValue(100);

      const result = await healthIndicator.isHealthy('webhooks');

      expect(result.webhooks.status).toBe('healthy'); // exactly at threshold
    });

    it('should throw error with >200 waiting jobs (excessive backlog)', async () => {
      mockQueue.getWaitingCount = jest.fn().mockResolvedValue(250);
      mockQueue.getFailedCount = jest.fn().mockResolvedValue(5);
      mockQueue.getCompletedCount = jest.fn().mockResolvedValue(100);

      await expect(healthIndicator.isHealthy('webhooks')).rejects.toThrow(
        HealthCheckError,
      );
      await expect(healthIndicator.isHealthy('webhooks')).rejects.toThrow(
        '250 waiting',
      );
    });
  });

  describe('Health Evaluation - Failed Rate Threshold', () => {
    it('should be healthy with <25% failure rate', async () => {
      mockQueue.getWaitingCount = jest.fn().mockResolvedValue(10);
      mockQueue.getFailedCount = jest.fn().mockResolvedValue(20);
      mockQueue.getCompletedCount = jest.fn().mockResolvedValue(100);

      const result = await healthIndicator.isHealthy('webhooks');

      expect(result.webhooks.status).toBe('healthy');
      expect(result.webhooks.failedRate).toBe('16.67%'); // 20/(20+100)
    });

    it('should be healthy with exactly 25% failure rate', async () => {
      mockQueue.getWaitingCount = jest.fn().mockResolvedValue(10);
      mockQueue.getFailedCount = jest.fn().mockResolvedValue(25);
      mockQueue.getCompletedCount = jest.fn().mockResolvedValue(75);

      const result = await healthIndicator.isHealthy('webhooks');

      expect(result.webhooks.status).toBe('healthy'); // exactly at threshold
      expect(result.webhooks.failedRate).toBe('25.00%');
    });

    it('should throw error with >25% failure rate', async () => {
      mockQueue.getWaitingCount = jest.fn().mockResolvedValue(10);
      mockQueue.getFailedCount = jest.fn().mockResolvedValue(30);
      mockQueue.getCompletedCount = jest.fn().mockResolvedValue(70);

      await expect(healthIndicator.isHealthy('webhooks')).rejects.toThrow(
        HealthCheckError,
      );
      await expect(healthIndicator.isHealthy('webhooks')).rejects.toThrow(
        '30.00% failed',
      );
    });

    it('should handle 0% failure rate (no failed jobs)', async () => {
      mockQueue.getWaitingCount = jest.fn().mockResolvedValue(10);
      mockQueue.getFailedCount = jest.fn().mockResolvedValue(0);
      mockQueue.getCompletedCount = jest.fn().mockResolvedValue(100);

      const result = await healthIndicator.isHealthy('webhooks');

      expect(result.webhooks.status).toBe('healthy');
      expect(result.webhooks.failedRate).toBe('0.00%');
    });

    it('should handle 100% failure rate (all jobs failed)', async () => {
      mockQueue.getWaitingCount = jest.fn().mockResolvedValue(10);
      mockQueue.getFailedCount = jest.fn().mockResolvedValue(100);
      mockQueue.getCompletedCount = jest.fn().mockResolvedValue(0);

      await expect(healthIndicator.isHealthy('webhooks')).rejects.toThrow(
        HealthCheckError,
      );
      await expect(healthIndicator.isHealthy('webhooks')).rejects.toThrow(
        '100.00% failed',
      );
    });

    it('should handle no jobs processed yet (0 total)', async () => {
      mockQueue.getWaitingCount = jest.fn().mockResolvedValue(10);
      mockQueue.getFailedCount = jest.fn().mockResolvedValue(0);
      mockQueue.getCompletedCount = jest.fn().mockResolvedValue(0);

      const result = await healthIndicator.isHealthy('webhooks');

      expect(result.webhooks.status).toBe('healthy');
      expect(result.webhooks.failedRate).toBe('0.00%'); // 0/0 = 0%
    });
  });

  describe('Health Evaluation - Combined Thresholds', () => {
    it('should throw error when BOTH waiting and failed rate exceed thresholds', async () => {
      mockQueue.getWaitingCount = jest.fn().mockResolvedValue(250); // >200
      mockQueue.getFailedCount = jest.fn().mockResolvedValue(30); // 30% failure rate
      mockQueue.getCompletedCount = jest.fn().mockResolvedValue(70);

      await expect(healthIndicator.isHealthy('webhooks')).rejects.toThrow(
        HealthCheckError,
      );
    });

    it('should be healthy when waiting is high but failure rate is low', async () => {
      mockQueue.getWaitingCount = jest.fn().mockResolvedValue(150);
      mockQueue.getFailedCount = jest.fn().mockResolvedValue(5);
      mockQueue.getCompletedCount = jest.fn().mockResolvedValue(100);

      const result = await healthIndicator.isHealthy('webhooks');

      expect(result.webhooks.status).toBe('healthy');
    });

    it('should be healthy when failure rate is moderate but waiting is low', async () => {
      mockQueue.getWaitingCount = jest.fn().mockResolvedValue(10);
      mockQueue.getFailedCount = jest.fn().mockResolvedValue(15);
      mockQueue.getCompletedCount = jest.fn().mockResolvedValue(100);

      const result = await healthIndicator.isHealthy('webhooks');

      expect(result.webhooks.status).toBe('healthy');
    });
  });

  describe('Metrics Retrieval', () => {
    it('should retrieve all queue metrics', async () => {
      const result = await healthIndicator.isHealthy('webhooks');

      expect(mockQueue.getWaitingCount).toHaveBeenCalled();
      expect(mockQueue.getActiveCount).toHaveBeenCalled();
      expect(mockQueue.getFailedCount).toHaveBeenCalled();
      expect(mockQueue.getCompletedCount).toHaveBeenCalled();
      expect(mockQueue.getDelayedCount).toHaveBeenCalled();

      expect(result.webhooks).toHaveProperty('waiting');
      expect(result.webhooks).toHaveProperty('active');
      expect(result.webhooks).toHaveProperty('failed');
      expect(result.webhooks).toHaveProperty('completed');
      expect(result.webhooks).toHaveProperty('delayed');
    });

    it('should include delayed jobs in metrics', async () => {
      mockQueue.getDelayedCount = jest.fn().mockResolvedValue(15);

      const result = await healthIndicator.isHealthy('webhooks');

      expect(result.webhooks.delayed).toBe(15);
    });

    it('should include active jobs in metrics', async () => {
      mockQueue.getActiveCount = jest.fn().mockResolvedValue(8);

      const result = await healthIndicator.isHealthy('webhooks');

      expect(result.webhooks.active).toBe(8);
    });
  });

  describe('Error Handling', () => {
    it('should throw HealthCheckError when queue metrics fail', async () => {
      mockQueue.getWaitingCount = jest
        .fn()
        .mockRejectedValue(new Error('Queue unavailable'));

      await expect(healthIndicator.isHealthy('webhooks')).rejects.toThrow(
        HealthCheckError,
      );
      await expect(healthIndicator.isHealthy('webhooks')).rejects.toThrow(
        'Queue health check failed',
      );
    });

    it('should include error message in HealthCheckError', async () => {
      mockQueue.getFailedCount = jest
        .fn()
        .mockRejectedValue(new Error('Database timeout'));

      try {
        await healthIndicator.isHealthy('webhooks');
      } catch (error) {
        expect(error).toBeInstanceOf(HealthCheckError);
        expect(error.message).toContain('Database timeout');
      }
    });

    it('should handle non-Error exceptions', async () => {
      mockQueue.getCompletedCount = jest.fn().mockRejectedValue('String error');

      await expect(healthIndicator.isHealthy('webhooks')).rejects.toThrow(
        HealthCheckError,
      );
    });
  });

  describe('Integration with @nestjs/terminus', () => {
    it('should return HealthIndicatorResult format', async () => {
      const result = await healthIndicator.isHealthy('webhooks');

      // HealthIndicatorResult is { [key: string]: any }
      expect(result).toHaveProperty('webhooks');
      expect(typeof result.webhooks).toBe('object');
    });

    it('should use custom key name', async () => {
      const result = await healthIndicator.isHealthy('custom-queue-name');

      expect(result).toHaveProperty('custom-queue-name');
      expect(result).not.toHaveProperty('webhooks');
    });

    it('should throw HealthCheckError for terminus integration', async () => {
      mockQueue.getWaitingCount = jest.fn().mockResolvedValue(300);

      try {
        await healthIndicator.isHealthy('webhooks');
        fail('Should have thrown HealthCheckError');
      } catch (error) {
        expect(error).toBeInstanceOf(HealthCheckError);
        expect(error.causes).toBeDefined();
      }
    });
  });
});
