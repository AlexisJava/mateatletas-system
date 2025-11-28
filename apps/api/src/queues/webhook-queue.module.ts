import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebhookQueueService } from './webhook-queue.service';
import { WebhookProcessor } from './processors/webhook.processor';
import { QueueMetricsController } from './queue-metrics.controller';
import { QueueHealthIndicator } from './health/queue-health.indicator';
import { Inscripciones2026Module } from '../inscripciones-2026/inscripciones-2026.module';

/**
 * WebhookQueueModule - Sistema de Queue Asíncrono con Bull (PASO 3.2 + 3.4)
 *
 * PROBLEMA QUE RESUELVE:
 * - MercadoPago envía 100+ webhooks simultáneos durante picos
 * - Procesamiento síncrono → servidor se satura → timeouts
 * - Webhooks perdidos → pagos no procesados → clientes sin acceso
 *
 * SOLUCIÓN:
 * - Queue asíncrono con Bull/Redis
 * - Endpoint retorna en <50ms (solo agrega a queue)
 * - Worker procesa webhooks en background
 * - Retry automático con exponential backoff
 * - Maneja 1000+ webhooks/min sin saturarse
 *
 * ARQUITECTURA:
 * - Controller → agrega job a queue → retorna 200 OK
 * - Worker (Processor) → procesa job en background
 * - Redis almacena jobs pendientes
 * - Concurrency: 10-20 jobs simultáneos
 * - Retry: 3 intentos con exponential backoff (2s, 4s, 8s)
 *
 * CONFIGURACIÓN:
 * - REDIS_HOST: Hostname de Redis (default: localhost)
 * - REDIS_PORT: Puerto de Redis (default: 6379)
 * - REDIS_PASSWORD: Contraseña de Redis (opcional)
 *
 * MÉTRICAS ESPERADAS:
 * - Latencia endpoint: 800-1200ms → <50ms (mejora 95%)
 * - Throughput: 100 webhooks/min → 1000+ webhooks/min (10x)
 * - Uptime en picos: 90% → 99.9%
 *
 * MONITORING (PASO 3.4):
 * - QueueMetricsController: Dashboard de métricas en /queues/metrics
 * - QueueHealthIndicator: Health check para @nestjs/terminus
 */
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // Prioridad 1: REDIS_URL (Railway, Heroku, etc.)
        const redisUrl = configService.get<string>('REDIS_URL');

        // Prioridad 2: REDIS_HOST + REDIS_PORT (desarrollo local)
        const host = configService.get<string>('REDIS_HOST', 'localhost');
        const port = configService.get<number>('REDIS_PORT', 6379);
        const password = configService.get<string>('REDIS_PASSWORD');

        return {
          redis: redisUrl
            ? redisUrl // Railway production
            : {
                // Desarrollo local
                host,
                port,
                password,
              },
          defaultJobOptions: {
            removeOnComplete: 100, // Mantener últimos 100 jobs exitosos
            removeOnFail: 500, // Mantener últimos 500 jobs fallidos para debugging
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'webhooks',
      defaultJobOptions: {
        attempts: 3, // 3 reintentos
        backoff: {
          type: 'exponential',
          delay: 2000, // 2s, 4s, 8s
        },
      },
    }),
    forwardRef(() => Inscripciones2026Module), // Romper dependencia circular
  ],
  controllers: [QueueMetricsController],
  providers: [WebhookQueueService, WebhookProcessor, QueueHealthIndicator],
  exports: [WebhookQueueService, QueueHealthIndicator],
})
export class WebhookQueueModule {}
