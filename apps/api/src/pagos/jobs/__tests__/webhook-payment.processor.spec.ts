import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { WebhookPaymentProcessor } from '../webhook-payment.processor';
import { PaymentWebhookService } from '../../services/payment-webhook.service';
import { WebhookDLQService } from '../../services/webhook-dlq.service';
import { PrometheusService } from '../../../observability/metrics';
import {
  WebhookPaymentJobData,
  WEBHOOK_PAYMENT_JOB_OPTIONS,
} from '../webhook-payment.queue';
import { MercadoPagoWebhookDto } from '../../dto/mercadopago-webhook.dto';

describe('WebhookPaymentProcessor', () => {
  let processor: WebhookPaymentProcessor;

  const mockWebhookService = {
    procesarWebhookMercadoPago: jest.fn(),
  };

  const mockDlqService = {
    addToDLQ: jest.fn(),
  };

  const mockMetricsService = {
    recordWebhookProcessed: jest.fn(),
    recordWebhookFailed: jest.fn(),
    observeWebhookDuration: jest.fn(),
    dlqEnqueued: { inc: jest.fn() },
    jobRetries: { inc: jest.fn() },
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
    user_id: '123456',
  });

  const createMockJob = (
    overrides: Partial<Job<WebhookPaymentJobData>> = {},
  ): Job<WebhookPaymentJobData> =>
    ({
      id: 'job-123',
      data: {
        payload: createMockWebhookPayload('payment-456'),
        correlationId: 'corr-abc-123',
        receivedAt: new Date().toISOString(),
        clientIp: '209.225.49.100',
      },
      attemptsMade: 0,
      remove: jest.fn().mockResolvedValue(undefined),
      ...overrides,
    }) as unknown as Job<WebhookPaymentJobData>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookPaymentProcessor,
        {
          provide: PaymentWebhookService,
          useValue: mockWebhookService,
        },
        {
          provide: WebhookDLQService,
          useValue: mockDlqService,
        },
        {
          provide: PrometheusService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    processor = module.get<WebhookPaymentProcessor>(WebhookPaymentProcessor);
    jest.clearAllMocks();
  });

  describe('process', () => {
    it('should_process_webhook_successfully_and_return_result', async () => {
      const mockResult = {
        type: 'updated',
        inscripcionId: 'inscripcion-123',
        message: 'Payment processed successfully',
        estadoPago: 'Pagado',
      };
      mockWebhookService.procesarWebhookMercadoPago.mockResolvedValue(
        mockResult,
      );

      const job = createMockJob();

      const result = await processor.process(job);

      expect(result.success).toBe(true);
      expect(result.action).toBe('updated');
      expect(result.inscripcionId).toBe('inscripcion-123');
      expect(result.correlationId).toBe('corr-abc-123');
      expect(result.message).toBe('Payment processed successfully');
      expect(result.estadoPago).toBe('Pagado');

      expect(
        mockWebhookService.procesarWebhookMercadoPago,
      ).toHaveBeenCalledWith(job.data.payload);
    });

    it('should_record_success_metrics_on_successful_processing', async () => {
      mockWebhookService.procesarWebhookMercadoPago.mockResolvedValue({
        type: 'processed',
      });

      const job = createMockJob();

      await processor.process(job);

      expect(mockMetricsService.recordWebhookProcessed).toHaveBeenCalledWith(
        'payment',
        'processed',
      );
      expect(mockMetricsService.observeWebhookDuration).toHaveBeenCalledWith(
        'payment',
        'success',
        expect.any(Number),
      );
    });

    it('should_use_default_type_when_result_has_no_type', async () => {
      mockWebhookService.procesarWebhookMercadoPago.mockResolvedValue({});

      const job = createMockJob();

      const result = await processor.process(job);

      expect(result.action).toBe('processed');
      expect(result.type).toBe('processed');
    });

    it('should_throw_error_to_trigger_retry_when_processing_fails', async () => {
      const processingError = new Error('Database connection failed');
      mockWebhookService.procesarWebhookMercadoPago.mockRejectedValue(
        processingError,
      );

      const job = createMockJob();

      await expect(processor.process(job)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should_record_failure_metrics_when_processing_fails', async () => {
      const processingError = new Error('Service unavailable');
      processingError.name = 'ServiceError';
      mockWebhookService.procesarWebhookMercadoPago.mockRejectedValue(
        processingError,
      );

      const job = createMockJob();

      await expect(processor.process(job)).rejects.toThrow();

      expect(mockMetricsService.recordWebhookFailed).toHaveBeenCalledWith(
        'payment',
        'ServiceError',
      );
      expect(mockMetricsService.observeWebhookDuration).toHaveBeenCalledWith(
        'payment',
        'failure',
        expect.any(Number),
      );
    });

    it('should_handle_non_error_exceptions', async () => {
      mockWebhookService.procesarWebhookMercadoPago.mockRejectedValue(
        'String error',
      );

      const job = createMockJob();

      await expect(processor.process(job)).rejects.toBe('String error');

      expect(mockMetricsService.recordWebhookFailed).toHaveBeenCalledWith(
        'payment',
        'UnknownError',
      );
    });

    it('should_include_attempt_number_in_logs', async () => {
      mockWebhookService.procesarWebhookMercadoPago.mockResolvedValue({
        type: 'processed',
      });

      const job = createMockJob({ attemptsMade: 2 });
      const logSpy = jest.spyOn(processor['logger'], 'log');

      await processor.process(job);

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('intento 3'));
    });
  });

  describe('onFailed', () => {
    it('should_move_to_dlq_when_max_retries_exhausted', async () => {
      mockDlqService.addToDLQ.mockResolvedValue({ id: 'dlq-1' });

      const job = createMockJob({
        attemptsMade: WEBHOOK_PAYMENT_JOB_OPTIONS.attempts,
      });
      const error = new Error('Final failure');
      error.stack = 'Error stack trace';

      await processor.onFailed(job, error);

      expect(mockDlqService.addToDLQ).toHaveBeenCalledWith({
        paymentId: 'payment-456',
        webhookType: 'payment',
        payload: job.data.payload,
        errorMessage: 'Final failure',
        errorStack: 'Error stack trace',
        retries: WEBHOOK_PAYMENT_JOB_OPTIONS.attempts,
      });

      expect(mockMetricsService.dlqEnqueued.inc).toHaveBeenCalledWith({
        type: 'payment',
        reason: 'exhausted_retries',
      });

      expect(job.remove).toHaveBeenCalled();
    });

    it('should_not_move_to_dlq_when_retries_remaining', async () => {
      const job = createMockJob({ attemptsMade: 2 });
      const error = new Error('Temporary failure');

      await processor.onFailed(job, error);

      expect(mockDlqService.addToDLQ).not.toHaveBeenCalled();
      expect(mockMetricsService.jobRetries.inc).toHaveBeenCalledWith({
        queue: 'webhook-payment',
      });
    });

    it('should_handle_undefined_job_gracefully', async () => {
      const error = new Error('Unknown error');

      await expect(processor.onFailed(undefined, error)).resolves.not.toThrow();

      expect(mockDlqService.addToDLQ).not.toHaveBeenCalled();
    });

    it('should_not_throw_when_dlq_add_fails', async () => {
      mockDlqService.addToDLQ.mockRejectedValue(
        new Error('DLQ database error'),
      );

      const job = createMockJob({
        attemptsMade: WEBHOOK_PAYMENT_JOB_OPTIONS.attempts,
      });
      const error = new Error('Final failure');

      await expect(processor.onFailed(job, error)).resolves.not.toThrow();
    });

    it('should_log_error_when_dlq_add_fails', async () => {
      mockDlqService.addToDLQ.mockRejectedValue(new Error('DLQ unavailable'));

      const job = createMockJob({
        attemptsMade: WEBHOOK_PAYMENT_JOB_OPTIONS.attempts,
      });
      const error = new Error('Final failure');
      const logErrorSpy = jest.spyOn(processor['logger'], 'error');

      await processor.onFailed(job, error);

      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error moviendo job a DLQ'),
      );
    });
  });

  describe('onCompleted', () => {
    it('should_log_success_message_with_correlation_id', () => {
      const job = createMockJob();
      const result = {
        success: true,
        action: 'updated',
        correlationId: 'corr-abc-123',
      };
      const logSpy = jest.spyOn(processor['logger'], 'log');

      processor.onCompleted(job, result);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('corr-abc-123'),
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('action=updated'),
      );
    });
  });

  describe('onActive', () => {
    it('should_log_debug_message_when_job_becomes_active', () => {
      const job = createMockJob();
      const logDebugSpy = jest.spyOn(processor['logger'], 'debug');

      processor.onActive(job);

      expect(logDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('job-123'),
      );
      expect(logDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('corr-abc-123'),
      );
    });
  });

  describe('onError', () => {
    it('should_log_worker_error', () => {
      const error = new Error('Worker crashed');
      error.stack = 'Stack trace';
      const logErrorSpy = jest.spyOn(processor['logger'], 'error');

      processor.onError(error);

      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Worker crashed'),
        'Stack trace',
      );
    });
  });
});
