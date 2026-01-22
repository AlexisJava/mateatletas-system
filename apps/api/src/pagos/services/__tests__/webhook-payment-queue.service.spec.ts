import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { WebhookPaymentQueueService } from '../webhook-payment-queue.service';
import { WEBHOOK_PAYMENT_QUEUE } from '../../jobs/webhook-payment.queue';
import { MercadoPagoWebhookDto } from '../../dto/mercadopago-webhook.dto';

describe('WebhookPaymentQueueService', () => {
  let service: WebhookPaymentQueueService;

  const mockQueue = {
    add: jest.fn(),
    getWaitingCount: jest.fn(),
    getActiveCount: jest.fn(),
    getCompletedCount: jest.fn(),
    getFailedCount: jest.fn(),
    getDelayedCount: jest.fn(),
    getFailed: jest.fn(),
    getJob: jest.fn(),
    clean: jest.fn(),
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
        WebhookPaymentQueueService,
        {
          provide: getQueueToken(WEBHOOK_PAYMENT_QUEUE),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<WebhookPaymentQueueService>(
      WebhookPaymentQueueService,
    );
    jest.clearAllMocks();
  });

  describe('enqueueWebhook', () => {
    it('should_enqueue_webhook_successfully_and_return_job_id', async () => {
      const mockJob = { id: 'job-123' };
      mockQueue.add.mockResolvedValue(mockJob);

      const payload = createMockWebhookPayload('payment-456');
      const clientIp = '209.225.49.100';

      const result = await service.enqueueWebhook(payload, clientIp);

      expect(result.success).toBe(true);
      expect(result.jobId).toBe('job-123');
      expect(result.correlationId).toBeDefined();
      expect(result.correlationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(result.error).toBeUndefined();

      expect(mockQueue.add).toHaveBeenCalledWith(
        'payment-payment-456',
        expect.objectContaining({
          payload,
          clientIp,
          correlationId: result.correlationId,
          receivedAt: expect.any(String),
        }),
        expect.any(Object),
      );
    });

    it('should_generate_unique_correlation_ids_for_each_call', async () => {
      mockQueue.add.mockResolvedValue({ id: 'job-1' });

      const payload = createMockWebhookPayload();

      const result1 = await service.enqueueWebhook(payload, '1.2.3.4');
      const result2 = await service.enqueueWebhook(payload, '1.2.3.4');

      expect(result1.correlationId).not.toBe(result2.correlationId);
    });

    it('should_return_error_result_when_queue_add_fails', async () => {
      mockQueue.add.mockRejectedValue(new Error('Redis connection failed'));

      const payload = createMockWebhookPayload();

      const result = await service.enqueueWebhook(payload, '1.2.3.4');

      expect(result.success).toBe(false);
      expect(result.jobId).toBeUndefined();
      expect(result.correlationId).toBeDefined();
      expect(result.error).toBe('Redis connection failed');
    });

    it('should_handle_non_error_exceptions', async () => {
      mockQueue.add.mockRejectedValue('String error');

      const payload = createMockWebhookPayload();

      const result = await service.enqueueWebhook(payload, '1.2.3.4');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });
  });

  describe('getQueueStats', () => {
    it('should_return_all_queue_statistics', async () => {
      mockQueue.getWaitingCount.mockResolvedValue(10);
      mockQueue.getActiveCount.mockResolvedValue(2);
      mockQueue.getCompletedCount.mockResolvedValue(100);
      mockQueue.getFailedCount.mockResolvedValue(5);
      mockQueue.getDelayedCount.mockResolvedValue(3);

      const stats = await service.getQueueStats();

      expect(stats).toEqual({
        waiting: 10,
        active: 2,
        completed: 100,
        failed: 5,
        delayed: 3,
        total: 15,
      });
    });

    it('should_calculate_total_as_sum_of_waiting_active_delayed', async () => {
      mockQueue.getWaitingCount.mockResolvedValue(5);
      mockQueue.getActiveCount.mockResolvedValue(3);
      mockQueue.getCompletedCount.mockResolvedValue(50);
      mockQueue.getFailedCount.mockResolvedValue(2);
      mockQueue.getDelayedCount.mockResolvedValue(7);

      const stats = await service.getQueueStats();

      expect(stats.total).toBe(5 + 3 + 7);
    });
  });

  describe('getFailedJobs', () => {
    it('should_return_formatted_list_of_failed_jobs', async () => {
      const mockFailedJobs = [
        {
          id: 'job-1',
          name: 'payment-111',
          data: { paymentId: '111', correlationId: 'corr-1' },
          attemptsMade: 5,
          failedReason: 'Connection timeout',
          timestamp: 1704067200000,
          processedOn: 1704067201000,
          finishedOn: 1704067202000,
        },
        {
          id: 'job-2',
          name: 'payment-222',
          data: { paymentId: '222', correlationId: 'corr-2' },
          attemptsMade: 3,
          failedReason: 'Invalid response',
          timestamp: 1704067300000,
          processedOn: 1704067301000,
          finishedOn: 1704067302000,
        },
      ];

      mockQueue.getFailed.mockResolvedValue(mockFailedJobs);

      const result = await service.getFailedJobs(0, 20);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'job-1',
        name: 'payment-111',
        data: { paymentId: '111', correlationId: 'corr-1' },
        attemptsMade: 5,
        failedReason: 'Connection timeout',
        timestamp: 1704067200000,
        processedOn: 1704067201000,
        finishedOn: 1704067202000,
      });
      expect(mockQueue.getFailed).toHaveBeenCalledWith(0, 20);
    });

    it('should_use_default_pagination_values', async () => {
      mockQueue.getFailed.mockResolvedValue([]);

      await service.getFailedJobs();

      expect(mockQueue.getFailed).toHaveBeenCalledWith(0, 20);
    });

    it('should_return_empty_array_when_no_failed_jobs', async () => {
      mockQueue.getFailed.mockResolvedValue([]);

      const result = await service.getFailedJobs();

      expect(result).toEqual([]);
    });
  });

  describe('retryJob', () => {
    it('should_retry_job_when_exists', async () => {
      const mockJob = {
        id: 'job-123',
        retry: jest.fn().mockResolvedValue(undefined),
      };
      mockQueue.getJob.mockResolvedValue(mockJob);

      const result = await service.retryJob('job-123');

      expect(result).toBe(mockJob);
      expect(mockJob.retry).toHaveBeenCalled();
      expect(mockQueue.getJob).toHaveBeenCalledWith('job-123');
    });

    it('should_return_null_when_job_not_found', async () => {
      mockQueue.getJob.mockResolvedValue(null);

      const result = await service.retryJob('nonexistent-job');

      expect(result).toBeNull();
    });
  });

  describe('removeJob', () => {
    it('should_remove_job_and_return_true_when_exists', async () => {
      const mockJob = {
        remove: jest.fn().mockResolvedValue(undefined),
      };
      mockQueue.getJob.mockResolvedValue(mockJob);

      const result = await service.removeJob('job-123');

      expect(result).toBe(true);
      expect(mockJob.remove).toHaveBeenCalled();
    });

    it('should_return_false_when_job_not_found', async () => {
      mockQueue.getJob.mockResolvedValue(null);

      const result = await service.removeJob('nonexistent-job');

      expect(result).toBe(false);
    });
  });

  describe('cleanCompletedJobs', () => {
    it('should_clean_completed_jobs_older_than_specified_time', async () => {
      mockQueue.clean.mockResolvedValue(['job-1', 'job-2', 'job-3']);

      const result = await service.cleanCompletedJobs(12 * 60 * 60 * 1000);

      expect(result).toBe(3);
      expect(mockQueue.clean).toHaveBeenCalledWith(
        12 * 60 * 60 * 1000,
        1000,
        'completed',
      );
    });

    it('should_use_default_24_hours_when_no_time_specified', async () => {
      mockQueue.clean.mockResolvedValue([]);

      await service.cleanCompletedJobs();

      expect(mockQueue.clean).toHaveBeenCalledWith(
        24 * 60 * 60 * 1000,
        1000,
        'completed',
      );
    });
  });

  describe('healthCheck', () => {
    it('should_return_healthy_true_when_queue_is_ok', async () => {
      mockQueue.getWaitingCount.mockResolvedValue(10);
      mockQueue.getActiveCount.mockResolvedValue(2);
      mockQueue.getCompletedCount.mockResolvedValue(100);
      mockQueue.getFailedCount.mockResolvedValue(5);
      mockQueue.getDelayedCount.mockResolvedValue(3);

      const result = await service.healthCheck();

      expect(result.healthy).toBe(true);
      expect(result.stats).toBeDefined();
      expect(result.warnings).toEqual([]);
    });

    it('should_return_warning_when_too_many_waiting_jobs', async () => {
      mockQueue.getWaitingCount.mockResolvedValue(150);
      mockQueue.getActiveCount.mockResolvedValue(2);
      mockQueue.getCompletedCount.mockResolvedValue(100);
      mockQueue.getFailedCount.mockResolvedValue(5);
      mockQueue.getDelayedCount.mockResolvedValue(3);

      const result = await service.healthCheck();

      expect(result.healthy).toBe(false);
      expect(result.warnings).toContain('High number of waiting jobs');
    });

    it('should_return_warning_when_too_many_failed_jobs', async () => {
      mockQueue.getWaitingCount.mockResolvedValue(10);
      mockQueue.getActiveCount.mockResolvedValue(2);
      mockQueue.getCompletedCount.mockResolvedValue(100);
      mockQueue.getFailedCount.mockResolvedValue(60);
      mockQueue.getDelayedCount.mockResolvedValue(3);

      const result = await service.healthCheck();

      expect(result.healthy).toBe(false);
      expect(result.warnings).toContain('High number of failed jobs');
    });

    it('should_return_unhealthy_when_queue_connection_fails', async () => {
      mockQueue.getWaitingCount.mockRejectedValue(
        new Error('Connection refused'),
      );

      const result = await service.healthCheck();

      expect(result.healthy).toBe(false);
      expect(result.error).toBe('Connection refused');
      expect(result.stats).toBeNull();
      expect(result.warnings).toContain('Unable to connect to queue');
    });
  });
});
