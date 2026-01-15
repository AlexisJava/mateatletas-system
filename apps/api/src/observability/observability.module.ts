import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { LoggerModule } from '../common/logger/logger.module';
import { RequestContextMiddleware } from './context/request-context.middleware';
import { PrometheusService, MetricsController } from './metrics';

/**
 * ObservabilityModule
 *
 * Módulo especializado en observabilidad y monitoreo de la aplicación.
 *
 * Responsabilidades:
 * - Logging estructurado global
 * - Interceptores de peticiones HTTP
 * - Request Context propagation (AsyncLocalStorage)
 * - Métricas Prometheus (Sprint 3 - Observability)
 *
 * Métricas expuestas en /metrics:
 * - mateatletas_* : Métricas por defecto de Node.js (CPU, memoria, event loop)
 * - pagos_webhooks_* : Webhooks recibidos, procesados, fallidos
 * - pagos_dlq_* : Dead Letter Queue size y operaciones
 * - pagos_payments_* : Pagos por estado y montos
 *
 * Patrón: Observability Module
 * Beneficio: Centraliza logging, métricas e instrumentación
 */
@Module({
  imports: [LoggerModule], // Logging estructurado global
  controllers: [MetricsController], // Endpoint /metrics para Prometheus
  providers: [
    RequestContextMiddleware,
    // Servicio de métricas Prometheus
    PrometheusService,
    // Aplicar logging interceptor globalmente
    // Registra todas las peticiones HTTP con duración y metadata
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [RequestContextMiddleware, PrometheusService],
})
export class ObservabilityModule implements NestModule {
  /**
   * Configura el middleware de contexto para todas las rutas
   * Esto establece el requestId antes de que cualquier otro middleware o handler se ejecute
   */
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
