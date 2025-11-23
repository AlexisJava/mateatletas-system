import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WebhookQueueService } from './webhook-queue.service';

/**
 * QueueMetricsController - Dashboard de Métricas de Queue (PASO 3.4)
 *
 * ENDPOINTS:
 * - GET /queues/metrics/stats - Estadísticas en tiempo real
 * - GET /queues/metrics/failed - Jobs fallidos (dead letter queue)
 *
 * SEGURIDAD:
 * Por ahora sin autenticación para desarrollo.
 * En producción, agregar @UseGuards(AdminGuard) para restringir acceso.
 *
 * USO:
 * curl http://localhost:3001/api/queues/metrics/stats
 *
 * @controller queues/metrics
 */
@ApiTags('Queue Metrics')
@Controller('queues/metrics')
export class QueueMetricsController {
  constructor(private readonly webhookQueueService: WebhookQueueService) {}

  /**
   * Obtiene estadísticas de la queue en tiempo real
   *
   * MÉTRICAS RETORNADAS:
   * - waiting: Jobs esperando procesamiento
   * - active: Jobs siendo procesados actualmente
   * - completed: Jobs completados exitosamente
   * - failed: Jobs fallidos (dead letter queue)
   * - delayed: Jobs con delay programado
   *
   * @returns Estadísticas de la queue
   *
   * @example
   * GET /api/queues/metrics/stats
   * {
   *   "waiting": 5,
   *   "active": 2,
   *   "completed": 1543,
   *   "failed": 12,
   *   "delayed": 0,
   *   "health": "healthy",
   *   "failedRate": "0.77%"
   * }
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Obtener estadísticas de queue en tiempo real',
    description: 'Retorna métricas de waiting, active, completed, failed y delayed jobs',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas retornadas exitosamente',
    schema: {
      example: {
        waiting: 5,
        active: 2,
        completed: 1543,
        failed: 12,
        delayed: 0,
        health: 'healthy',
        failedRate: '0.77%',
      },
    },
  })
  async getStats() {
    const stats = await this.webhookQueueService.getQueueStats();

    // Calcular tasa de fallos
    const total = stats.failed + stats.completed;
    const failedRate = total > 0 ? (stats.failed / total) * 100 : 0;

    // Determinar estado de salud
    const health = this.determineHealth(stats, failedRate);

    return {
      ...stats,
      health,
      failedRate: `${failedRate.toFixed(2)}%`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Obtiene lista de jobs fallidos (dead letter queue)
   *
   * ÚTIL PARA:
   * - Debugging de webhooks que fallaron persistentemente
   * - Análisis de patrones de fallos
   * - Retry manual de webhooks específicos
   *
   * @returns Lista de jobs fallidos
   *
   * @example
   * GET /api/queues/metrics/failed
   * [
   *   {
   *     "id": "123456",
   *     "data": { "action": "payment.updated", "data": { "id": "789" } },
   *     "failedReason": "Connection timeout",
   *     "attemptsMade": 3,
   *     "timestamp": "2025-11-22T22:30:00.000Z"
   *   }
   * ]
   */
  @Get('failed')
  @ApiOperation({
    summary: 'Obtener jobs fallidos (dead letter queue)',
    description: 'Retorna últimos 50 webhooks que fallaron después de 3 reintentos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de jobs fallidos',
  })
  async getFailedJobs() {
    const failedJobs = await this.webhookQueueService.getFailedJobs(0, 50);

    return failedJobs.map((job) => ({
      id: job.id,
      data: job.data,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: new Date(job.timestamp).toISOString(),
      stacktrace: job.stacktrace?.[0] || null, // Solo primera línea del stack
    }));
  }

  /**
   * Determina el estado de salud basado en métricas
   */
  private determineHealth(
    stats: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
      delayed: number;
    },
    failedRate: number,
  ): string {
    const WAITING_WARNING = 50;
    const WAITING_CRITICAL = 200;
    const FAILED_RATE_WARNING = 10;
    const FAILED_RATE_CRITICAL = 25;

    if (stats.waiting > WAITING_CRITICAL || failedRate > FAILED_RATE_CRITICAL) {
      return 'critical';
    }

    if (stats.waiting > WAITING_WARNING || failedRate > FAILED_RATE_WARNING) {
      return 'degraded';
    }

    return 'healthy';
  }
}