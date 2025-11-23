import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, JobOptions } from 'bull';

/**
 * DTO para webhooks de MercadoPago
 */
export interface MercadoPagoWebhookDto {
  action: string;
  api_version: string;
  data: {
    id: string;
  };
  date_created: string;
  id: number;
  live_mode: boolean;
  type: string;
  user_id: string;
}

/**
 * WebhookQueueService - Servicio de Queue Asíncrono (PASO 3.2)
 *
 * PROBLEMA QUE RESUELVE:
 * - Procesamiento síncrono de webhooks → timeouts en picos de tráfico
 * - Servidor se satura con 100+ webhooks simultáneos
 * - Webhooks perdidos → clientes sin acceso a sus pagos
 *
 * SOLUCIÓN:
 * - Agregar webhooks a queue Redis (< 10ms)
 * - Retornar 200 OK inmediatamente
 * - Worker procesa en background con retry automático
 *
 * ARQUITECTURA:
 * 1. Controller llama addWebhookJob()
 * 2. Job se agrega a queue Redis
 * 3. Retorna inmediatamente (< 50ms)
 * 4. Worker (WebhookProcessor) procesa en background
 *
 * RETRY STRATEGY:
 * - 3 intentos automáticos
 * - Exponential backoff: 2s, 4s, 8s
 * - Dead letter queue: jobs fallidos después de 3 intentos
 *
 * @injectable
 */
@Injectable()
export class WebhookQueueService {
  private readonly logger = new Logger(WebhookQueueService.name);

  constructor(
    @InjectQueue('webhooks')
    private readonly webhookQueue: Queue<MercadoPagoWebhookDto>,
  ) {}

  /**
   * Agrega webhook a la queue para procesamiento asíncrono
   *
   * @param webhookData - Datos del webhook de MercadoPago
   * @param options - Opciones del job (priority, delay, etc.)
   * @returns Promise<void>
   *
   * @example
   * await webhookQueueService.addWebhookJob(webhookData, { priority: 1 });
   */
  async addWebhookJob(
    webhookData: MercadoPagoWebhookDto,
    options?: JobOptions,
  ): Promise<void> {
    const paymentId = webhookData.data?.id;

    try {
      await this.webhookQueue.add('process-webhook', webhookData, {
        jobId: paymentId, // Usar payment_id como jobId para evitar duplicados
        priority: 1, // Alta prioridad
        attempts: 3, // 3 reintentos
        backoff: {
          type: 'exponential',
          delay: 2000, // 2s, 4s, 8s
        },
        ...options,
      });

      this.logger.log(
        `✅ Webhook agregado a queue: payment_id=${paymentId}, type=${webhookData.type}`,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `❌ Error agregando webhook a queue: payment_id=${paymentId}, error=${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de la queue
   *
   * @returns Promise con counts de jobs
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.webhookQueue.getWaitingCount(),
      this.webhookQueue.getActiveCount(),
      this.webhookQueue.getCompletedCount(),
      this.webhookQueue.getFailedCount(),
      this.webhookQueue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  /**
   * Obtiene jobs fallidos (dead letter queue)
   *
   * @param start - Índice de inicio
   * @param end - Índice de fin
   * @returns Promise<Job[]>
   */
  async getFailedJobs(start: number = 0, end: number = 100) {
    return this.webhookQueue.getFailed(start, end);
  }

  /**
   * Reintenta un job fallido manualmente
   *
   * @param jobId - ID del job a reintentar
   * @returns Promise<void>
   */
  async retryFailedJob(jobId: string): Promise<void> {
    const job = await this.webhookQueue.getJob(jobId);
    if (job) {
      await job.retry();
      this.logger.log(`🔄 Job reintentado manualmente: jobId=${jobId}`);
    } else {
      this.logger.warn(`⚠️ Job no encontrado: jobId=${jobId}`);
    }
  }

  /**
   * Limpia jobs completados antiguos (housekeeping)
   *
   * @param grace - Tiempo de gracia en ms (default: 24 horas)
   * @returns Promise<void>
   */
  async cleanCompletedJobs(grace: number = 24 * 60 * 60 * 1000): Promise<void> {
    await this.webhookQueue.clean(grace, 'completed');
    this.logger.log(`🗑️ Jobs completados antiguos limpiados (grace: ${grace}ms)`);
  }

  /**
   * Pausa la queue (útil para mantenimiento)
   *
   * @returns Promise<void>
   */
  async pauseQueue(): Promise<void> {
    await this.webhookQueue.pause();
    this.logger.warn('⏸️ Queue pausada');
  }

  /**
   * Reanuda la queue
   *
   * @returns Promise<void>
   */
  async resumeQueue(): Promise<void> {
    await this.webhookQueue.resume();
    this.logger.log('▶️ Queue reanudada');
  }
}