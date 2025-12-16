import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { LoggerModule } from '../common/logger/logger.module';
import { RequestContextMiddleware } from './context/request-context.middleware';

/**
 * ObservabilityModule
 *
 * Módulo especializado en observabilidad y monitoreo de la aplicación.
 *
 * Responsabilidades:
 * - Logging estructurado global
 * - Interceptores de peticiones HTTP
 * - Request Context propagation (AsyncLocalStorage)
 * - Métricas y trazabilidad
 *
 * Patrón: Observability Module
 * Beneficio: Centraliza todo el logging e instrumentación
 */
@Module({
  imports: [LoggerModule], // Logging estructurado global
  providers: [
    RequestContextMiddleware,
    // Aplicar logging interceptor globalmente
    // Registra todas las peticiones HTTP con duración y metadata
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [RequestContextMiddleware],
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
