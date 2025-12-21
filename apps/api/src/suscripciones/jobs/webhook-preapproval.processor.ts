/**
 * Processor BullMQ para webhooks de PreApproval
 *
 * Procesa jobs de la cola de forma asíncrona.
 * Si falla, BullMQ reintentará con backoff exponencial.
 */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { PreapprovalWebhookService } from '../services/preapproval-webhook.service';
import {
  WEBHOOK_PREAPPROVAL_QUEUE,
  WebhookJobData,
  WebhookJobResult,
} from './webhook-preapproval.queue';

@Processor(WEBHOOK_PREAPPROVAL_QUEUE)
export class WebhookPreapprovalProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookPreapprovalProcessor.name);

  constructor(private readonly webhookService: PreapprovalWebhookService) {
    super();
  }

  /**
   * Procesa un job de webhook
   *
   * @param job - Job de BullMQ con datos del webhook
   * @returns Resultado del procesamiento
   * @throws Error si falla (BullMQ reintentará)
   */
  async process(job: Job<WebhookJobData>): Promise<WebhookJobResult> {
    const { payload, detail, correlationId } = job.data;
    const attemptNumber = job.attemptsMade + 1;

    this.logger.log(
      `Processing webhook job ${job.id} (attempt ${attemptNumber}), ` +
        `correlationId=${correlationId}, preapprovalId=${payload.data.id}`,
    );

    try {
      // Procesar el webhook
      const result = await this.webhookService.processWebhook(payload, detail);

      this.logger.log(
        `Webhook job ${job.id} completed: action=${result.action}, ` +
          `suscripcionId=${result.suscripcionId ?? 'N/A'}`,
      );

      return {
        success: result.success,
        action: result.action,
        suscripcionId: result.suscripcionId,
        correlationId,
        message: result.message,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(
        `Webhook job ${job.id} failed (attempt ${attemptNumber}): ${errorMessage}`,
      );

      // Re-throw para que BullMQ reintente
      throw error;
    }
  }
}
