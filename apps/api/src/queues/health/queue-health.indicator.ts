import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

/**
 * QueueHealthIndicator - Health Check para Bull Queue (PASO 3.4)
 *
 * OBJETIVO:
 * Monitorear el estado de salud de la queue de webhooks para detectar
 * problemas antes de que afecten a los usuarios.
 *
 * CHECKS REALIZADOS:
 * 1. Conexión a Redis (queue.client.ping())
 * 2. Jobs en estado "active" (no debe haber starvation)
 * 3. Jobs en estado "waiting" (no debe haber acumulación excesiva)
 * 4. Jobs en estado "failed" (tasa de fallos)
 *
 * CRITERIOS DE SALUD:
 * - HEALTHY: Redis conectado, <50 jobs waiting, <10% failed rate
 * - UNHEALTHY: Redis desconectado O >200 jobs waiting O >25% failed rate
 *
 * INTEGRACIÓN:
 * Se usa con @nestjs/terminus en un endpoint /health
 *
 * @example
 * // En health.controller.ts
 * @Get('health')
 * @HealthCheck()
 * check() {
 *   return this.health.check([
 *     () => this.queueHealth.isHealthy('webhooks'),
 *   ]);
 * }
 */
@Injectable()
export class QueueHealthIndicator extends HealthIndicator {
  constructor(
    @InjectQueue('webhooks')
    private readonly webhookQueue: Queue,
  ) {
    super();
  }

  /**
   * Verifica el estado de salud de la queue
   *
   * @param key - Nombre clave para identificar el check (ej: 'webhooks')
   * @returns HealthIndicatorResult
   * @throws HealthCheckError si la queue está unhealthy
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // 1. Verificar conexión a Redis
      const isRedisConnected = await this.checkRedisConnection();
      if (!isRedisConnected) {
        throw new Error('Redis connection failed');
      }

      // 2. Obtener métricas de la queue
      const [waiting, active, failed, completed, delayed] = await Promise.all([
        this.webhookQueue.getWaitingCount(),
        this.webhookQueue.getActiveCount(),
        this.webhookQueue.getFailedCount(),
        this.webhookQueue.getCompletedCount(),
        this.webhookQueue.getDelayedCount(),
      ]);

      // 3. Calcular tasa de fallos
      const total = failed + completed;
      const failedRate = total > 0 ? (failed / total) * 100 : 0;

      // 4. Evaluar salud según thresholds
      const isHealthy = this.evaluateHealth(
        waiting,
        active,
        failed,
        failedRate,
      );

      const result = {
        redis: 'connected',
        waiting,
        active,
        failed,
        completed,
        delayed,
        failedRate: `${failedRate.toFixed(2)}%`,
        status: isHealthy ? 'healthy' : 'degraded',
      };

      if (!isHealthy) {
        throw new Error(
          `Queue unhealthy: ${waiting} waiting, ${active} active, ${failedRate.toFixed(2)}% failed`,
        );
      }

      return this.getStatus(key, true, result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new HealthCheckError(
        `Queue health check failed: ${errorMessage}`,
        this.getStatus(key, false, { error: errorMessage }),
      );
    }
  }

  /**
   * Verifica si Redis está conectado
   */
  private async checkRedisConnection(): Promise<boolean> {
    try {
      const client = this.webhookQueue.client;
      const pong = await client.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }

  /**
   * Evalúa si la queue está saludable según thresholds
   */
  private evaluateHealth(
    waiting: number,
    active: number,
    failed: number,
    failedRate: number,
  ): boolean {
    const WAITING_THRESHOLD = 200; // Jobs en espera
    const FAILED_RATE_THRESHOLD = 25; // 25% de fallos

    // Criterios de salud
    const hasExcessiveWaitingJobs = waiting > WAITING_THRESHOLD;
    const hasHighFailureRate = failedRate > FAILED_RATE_THRESHOLD;

    return !hasExcessiveWaitingJobs && !hasHighFailureRate;
  }
}
