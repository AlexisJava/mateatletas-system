/**
 * Processor BullMQ para webhooks de pagos
 *
 * Procesa jobs de la cola de forma asíncrona.
 * Si falla todos los intentos, mueve el webhook a DLQ.
 *
 * @module pagos/jobs
 */

import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, Optional } from '@nestjs/common';
import { Job } from 'bullmq';
import { PaymentWebhookService } from '../services/payment-webhook.service';
import { WebhookDLQService } from '../services/webhook-dlq.service';
import { PrometheusService } from '../../observability/metrics';
import {
  WEBHOOK_PAYMENT_QUEUE,
  WebhookPaymentJobData,
  WebhookPaymentJobResult,
  WEBHOOK_PAYMENT_JOB_OPTIONS,
} from './webhook-payment.queue';

@Processor(WEBHOOK_PAYMENT_QUEUE)
export class WebhookPaymentProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookPaymentProcessor.name);

  constructor(
    private readonly webhookService: PaymentWebhookService,
    private readonly dlqService: WebhookDLQService,
    @Optional() private readonly metricsService?: PrometheusService,
  ) {
    super();
  }

  /**
   * Procesa un job de webhook de pago
   *
   * @param job - Job de BullMQ con datos del webhook
   * @returns Resultado del procesamiento
   * @throws Error si falla (BullMQ reintentará)
   */
  async process(
    job: Job<WebhookPaymentJobData>,
  ): Promise<WebhookPaymentJobResult> {
    const { payload, correlationId, clientIp } = job.data;
    const attemptNumber = job.attemptsMade + 1;
    const paymentId = payload.data.id;
    const webhookType = payload.type;

    // Iniciar timer de métricas
    const startTime = Date.now();

    this.logger.log(
      `🔄 Procesando webhook job ${job.id} (intento ${attemptNumber}/${WEBHOOK_PAYMENT_JOB_OPTIONS.attempts}), ` +
        `correlationId=${correlationId}, paymentId=${paymentId}, ip=${clientIp}`,
    );

    try {
      // Delegar al servicio de webhooks existente
      const result =
        await this.webhookService.procesarWebhookMercadoPago(payload);

      // Extraer propiedades con valores por defecto para manejar union types
      const resultAny = result as Record<string, unknown>;
      const resultType = (resultAny.type as string) || 'processed';
      const resultMessage = resultAny.message as string | undefined;
      const resultInscripcionId = resultAny.inscripcionId as string | undefined;
      const resultEstadoPago = resultAny.estadoPago as string | undefined;

      // Registrar métricas de éxito
      const durationSeconds = (Date.now() - startTime) / 1000;
      this.metricsService?.recordWebhookProcessed(webhookType, resultType);
      this.metricsService?.observeWebhookDuration(
        webhookType,
        'success',
        durationSeconds,
      );

      this.logger.log(
        `✅ Webhook job ${job.id} completado: action=${resultType}, ` +
          `correlationId=${correlationId}, duration=${durationSeconds.toFixed(3)}s`,
      );

      return {
        success: true,
        action: resultType,
        inscripcionId: resultInscripcionId,
        correlationId,
        message: resultMessage,
        type: resultType,
        estadoPago: resultEstadoPago,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorType = error instanceof Error ? error.name : 'UnknownError';

      // Registrar métricas de fallo
      const durationSeconds = (Date.now() - startTime) / 1000;
      this.metricsService?.recordWebhookFailed(webhookType, errorType);
      this.metricsService?.observeWebhookDuration(
        webhookType,
        'failure',
        durationSeconds,
      );

      this.logger.error(
        `❌ Webhook job ${job.id} falló (intento ${attemptNumber}): ${errorMessage}`,
      );

      // Re-throw para que BullMQ reintente
      throw error;
    }
  }

  /**
   * Evento: Job completado exitosamente
   */
  @OnWorkerEvent('completed')
  onCompleted(
    job: Job<WebhookPaymentJobData>,
    result: WebhookPaymentJobResult,
  ): void {
    this.logger.log(
      `✅ Job ${job.id} completado exitosamente: ` +
        `correlationId=${result.correlationId}, action=${result.action}`,
    );
  }

  /**
   * Evento: Job falló (puede reintentar)
   */
  @OnWorkerEvent('failed')
  async onFailed(
    job: Job<WebhookPaymentJobData> | undefined,
    error: Error,
  ): Promise<void> {
    if (!job) {
      this.logger.error('Job failed but job is undefined');
      return;
    }

    const { payload, correlationId } = job.data;
    const attemptNumber = job.attemptsMade;
    const maxAttempts = WEBHOOK_PAYMENT_JOB_OPTIONS.attempts;

    this.logger.warn(
      `⚠️ Job ${job.id} falló (intento ${attemptNumber}/${maxAttempts}): ` +
        `${error.message}, correlationId=${correlationId}`,
    );

    // Si agotó todos los reintentos, mover a DLQ
    if (attemptNumber >= maxAttempts) {
      this.logger.error(
        `🚨 Job ${job.id} agotó reintentos, moviendo a DLQ: ` +
          `paymentId=${payload.data.id}, correlationId=${correlationId}`,
      );

      try {
        await this.dlqService.addToDLQ({
          paymentId: payload.data.id,
          webhookType: payload.type,
          payload: payload,
          errorMessage: error.message,
          errorStack: error.stack,
          retries: attemptNumber,
        });

        // Registrar métrica de webhook movido a DLQ
        this.metricsService?.dlqEnqueued.inc({
          type: payload.type,
          reason: 'exhausted_retries',
        });

        // Remover el job de la cola después de moverlo a DLQ
        await job.remove();

        this.logger.log(`📦 Webhook movido a DLQ y job removido: ${job.id}`);
      } catch (dlqError) {
        const dlqErrorMessage =
          dlqError instanceof Error ? dlqError.message : String(dlqError);

        this.logger.error(`❌ Error moviendo job a DLQ: ${dlqErrorMessage}`);
        // No lanzar error - el job ya falló, no queremos loops infinitos
      }
    } else {
      // Registrar métrica de reintento
      this.metricsService?.jobRetries.inc({ queue: WEBHOOK_PAYMENT_QUEUE });
    }
  }

  /**
   * Evento: Worker activo (conectado a la cola)
   */
  @OnWorkerEvent('active')
  onActive(job: Job<WebhookPaymentJobData>): void {
    this.logger.debug(
      `▶️ Job ${job.id} activo, correlationId=${job.data.correlationId}`,
    );
  }

  /**
   * Evento: Error en el worker
   */
  @OnWorkerEvent('error')
  onError(error: Error): void {
    this.logger.error(`❌ Error en worker: ${error.message}`, error.stack);
  }
}
