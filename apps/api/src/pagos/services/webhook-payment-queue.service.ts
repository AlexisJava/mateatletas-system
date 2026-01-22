import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { MercadoPagoWebhookDto } from '../dto/mercadopago-webhook.dto';
import {
  WEBHOOK_PAYMENT_QUEUE,
  WEBHOOK_PAYMENT_JOB_OPTIONS,
  WebhookPaymentJobData,
  WebhookPaymentJobResult,
} from '../jobs/webhook-payment.queue';

/**
 * Resultado de encolar un webhook
 */
export interface EnqueueResult {
  /** Si se encoló exitosamente */
  success: boolean;

  /** ID del job en BullMQ */
  jobId?: string;

  /** ID de correlación para trazabilidad */
  correlationId: string;

  /** Mensaje de error si falló */
  error?: string;
}

/**
 * Servicio para encolar webhooks de pago para procesamiento async
 *
 * Responsabilidades:
 * - Encolar webhooks en BullMQ para procesamiento en background
 * - Generar correlationId para trazabilidad end-to-end
 * - Proporcionar estadísticas de la cola
 *
 * Beneficios del procesamiento async:
 * - Respuesta rápida (<100ms) a MercadoPago (evita reintentos)
 * - Reintentos automáticos con backoff exponencial
 * - DLQ para webhooks que fallan múltiples veces
 *
 * @injectable
 */
@Injectable()
export class WebhookPaymentQueueService {
  private readonly logger = new Logger(WebhookPaymentQueueService.name);

  constructor(
    @InjectQueue(WEBHOOK_PAYMENT_QUEUE)
    private readonly webhookQueue: Queue<
      WebhookPaymentJobData,
      WebhookPaymentJobResult
    >,
  ) {}

  /**
   * Encola un webhook para procesamiento async
   *
   * @param payload - Payload del webhook de MercadoPago
   * @param clientIp - IP del cliente que envió el webhook
   * @returns Resultado del encolado con correlationId
   */
  async enqueueWebhook(
    payload: MercadoPagoWebhookDto,
    clientIp: string,
  ): Promise<EnqueueResult> {
    const correlationId = uuidv4();
    const paymentId = payload.data.id;

    this.logger.log(
      `📨 Encolando webhook: paymentId=${paymentId}, ` +
        `correlationId=${correlationId}, ip=${clientIp}`,
    );

    try {
      const jobData: WebhookPaymentJobData = {
        payload,
        correlationId,
        receivedAt: new Date().toISOString(),
        clientIp,
      };

      // Nombre del job para identificación en dashboard
      const jobName = `payment-${paymentId}`;

      const job = await this.webhookQueue.add(
        jobName,
        jobData,
        WEBHOOK_PAYMENT_JOB_OPTIONS,
      );

      this.logger.log(
        `✅ Webhook encolado: jobId=${job.id}, paymentId=${paymentId}`,
      );

      return {
        success: true,
        jobId: job.id,
        correlationId,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `❌ Error encolando webhook: paymentId=${paymentId}, ` +
          `error=${errorMessage}`,
      );

      // Aún retornamos correlationId para logging/debugging
      return {
        success: false,
        correlationId,
        error: errorMessage,
      };
    }
  }

  /**
   * Obtiene estadísticas de la cola
   *
   * @returns Conteo de jobs por estado
   */
  async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.webhookQueue.getWaitingCount(),
      this.webhookQueue.getActiveCount(),
      this.webhookQueue.getCompletedCount(),
      this.webhookQueue.getFailedCount(),
      this.webhookQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + delayed,
    };
  }

  /**
   * Obtiene jobs fallidos (para admin dashboard)
   *
   * @param start - Índice de inicio
   * @param end - Índice de fin
   * @returns Lista de jobs fallidos
   */
  async getFailedJobs(start: number = 0, end: number = 20) {
    const jobs = await this.webhookQueue.getFailed(start, end);

    return jobs.map((job) => ({
      id: job.id,
      name: job.name,
      data: job.data,
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    }));
  }

  /**
   * Reintenta un job fallido específico
   *
   * @param jobId - ID del job a reintentar
   * @returns Job actualizado o null si no existe
   */
  async retryJob(jobId: string): Promise<Job<WebhookPaymentJobData> | null> {
    const job = await this.webhookQueue.getJob(jobId);

    if (!job) {
      this.logger.warn(`Job ${jobId} no encontrado para reintentar`);
      return null;
    }

    this.logger.log(`🔄 Reintentando job ${jobId}`);
    await job.retry();

    return job;
  }

  /**
   * Elimina un job fallido
   *
   * @param jobId - ID del job a eliminar
   * @returns true si se eliminó, false si no existía
   */
  async removeJob(jobId: string): Promise<boolean> {
    const job = await this.webhookQueue.getJob(jobId);

    if (!job) {
      return false;
    }

    await job.remove();
    this.logger.log(`🗑️ Job ${jobId} eliminado`);

    return true;
  }

  /**
   * Limpia jobs completados antiguos (manual)
   *
   * @param olderThanMs - Eliminar jobs más antiguos que X milisegundos
   * @returns Cantidad de jobs eliminados
   */
  async cleanCompletedJobs(
    olderThanMs: number = 24 * 60 * 60 * 1000,
  ): Promise<number> {
    const cleaned = await this.webhookQueue.clean(
      olderThanMs,
      1000,
      'completed',
    );
    this.logger.log(`🧹 Limpiados ${cleaned.length} jobs completados`);
    return cleaned.length;
  }

  /**
   * Verifica si la cola está saludable
   *
   * @returns Estado de salud de la cola
   */
  async healthCheck() {
    try {
      const stats = await this.getQueueStats();

      // Advertencia si hay muchos jobs en espera
      const isHealthy = stats.waiting < 100 && stats.failed < 50;

      return {
        healthy: isHealthy,
        stats,
        warnings: [
          ...(stats.waiting >= 100 ? ['High number of waiting jobs'] : []),
          ...(stats.failed >= 50 ? ['High number of failed jobs'] : []),
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      return {
        healthy: false,
        error: errorMessage,
        stats: null,
        warnings: ['Unable to connect to queue'],
      };
    }
  }
}
