/**
 * Tests TDD para WebhookPreapprovalProcessor (BullMQ)
 *
 * REGLAS:
 * - Controller encola webhook, processor lo procesa async
 * - Si falla, reintenta con backoff exponencial
 * - Después de max reintentos, va a DLQ
 */
import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

import { WebhookPreapprovalProcessor } from '../jobs/webhook-preapproval.processor';
import { PreapprovalWebhookService } from '../services/preapproval-webhook.service';
import {
  PreApprovalWebhookPayload,
  PreApprovalDetail,
} from '../types/preapproval.types';
import {
  WEBHOOK_PREAPPROVAL_QUEUE,
  WebhookJobData,
} from '../jobs/webhook-preapproval.queue';

describe('WebhookPreapprovalProcessor', () => {
  let processor: WebhookPreapprovalProcessor;
  let webhookService: PreapprovalWebhookService;

  const mockWebhookService = {
    processWebhook: jest.fn(),
  };

  const validPayload: PreApprovalWebhookPayload = {
    type: 'subscription_preapproval',
    action: 'updated',
    id: 'webhook-123',
    api_version: 'v1',
    date_created: new Date().toISOString(),
    live_mode: false,
    user_id: '12345',
    data: { id: 'mp-preapproval-123' },
  };

  const validDetail: PreApprovalDetail = {
    id: 'mp-preapproval-123',
    status: 'authorized',
    external_reference: 'suscripcion-123',
    payer_email: 'test@test.com',
    payer_id: 123,
    reason: 'Test subscription',
    next_payment_date: new Date().toISOString(),
    auto_recurring: {
      frequency: 1,
      frequency_type: 'months',
      transaction_amount: 40000,
      currency_id: 'ARS',
    },
    date_created: new Date().toISOString(),
    last_modified: new Date().toISOString(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookPreapprovalProcessor,
        { provide: PreapprovalWebhookService, useValue: mockWebhookService },
      ],
    }).compile();

    processor = module.get<WebhookPreapprovalProcessor>(
      WebhookPreapprovalProcessor,
    );
    webhookService = module.get<PreapprovalWebhookService>(
      PreapprovalWebhookService,
    );

    // Silenciar logs
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  describe('process', () => {
    it('should_call_webhookService_with_payload_and_detail', async () => {
      // Arrange
      const jobData: WebhookJobData = {
        payload: validPayload,
        detail: validDetail,
        correlationId: 'corr-123',
        receivedAt: new Date().toISOString(),
      };

      const mockJob = {
        id: 'job-123',
        data: jobData,
        attemptsMade: 0,
      } as Job<WebhookJobData>;

      mockWebhookService.processWebhook.mockResolvedValue({
        success: true,
        action: 'activated',
        suscripcionId: 'suscripcion-123',
      });

      // Act
      const result = await processor.process(mockJob);

      // Assert
      expect(webhookService.processWebhook).toHaveBeenCalledWith(
        validPayload,
        validDetail,
      );
      expect(result.success).toBe(true);
    });

    it('should_include_correlationId_in_result', async () => {
      // Arrange
      const correlationId = 'corr-456';
      const jobData: WebhookJobData = {
        payload: validPayload,
        detail: validDetail,
        correlationId,
        receivedAt: new Date().toISOString(),
      };

      const mockJob = {
        id: 'job-123',
        data: jobData,
        attemptsMade: 0,
      } as Job<WebhookJobData>;

      mockWebhookService.processWebhook.mockResolvedValue({
        success: true,
        action: 'activated',
        suscripcionId: 'suscripcion-123',
      });

      // Act
      const result = await processor.process(mockJob);

      // Assert
      expect(result.correlationId).toBe(correlationId);
    });

    it('should_throw_error_to_trigger_retry_on_failure', async () => {
      // Arrange
      const jobData: WebhookJobData = {
        payload: validPayload,
        detail: validDetail,
        correlationId: 'corr-123',
        receivedAt: new Date().toISOString(),
      };

      const mockJob = {
        id: 'job-123',
        data: jobData,
        attemptsMade: 0,
      } as Job<WebhookJobData>;

      mockWebhookService.processWebhook.mockRejectedValue(
        new Error('DB connection failed'),
      );

      // Act & Assert
      await expect(processor.process(mockJob)).rejects.toThrow(
        'DB connection failed',
      );
    });

    it('should_log_attempt_number_on_retry', async () => {
      // Arrange
      const jobData: WebhookJobData = {
        payload: validPayload,
        detail: validDetail,
        correlationId: 'corr-123',
        receivedAt: new Date().toISOString(),
      };

      const mockJob = {
        id: 'job-123',
        data: jobData,
        attemptsMade: 2, // Ya intentó 2 veces
      } as Job<WebhookJobData>;

      mockWebhookService.processWebhook.mockResolvedValue({
        success: true,
        action: 'activated',
        suscripcionId: 'suscripcion-123',
      });

      const logSpy = jest.spyOn(Logger.prototype, 'log');

      // Act
      await processor.process(mockJob);

      // Assert
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('attempt 3'));
    });
  });

  describe('Queue configuration', () => {
    it('should_have_correct_queue_name', () => {
      expect(WEBHOOK_PREAPPROVAL_QUEUE).toBe('webhook-preapproval');
    });
  });
});
