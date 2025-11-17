import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { LoggerModule } from '../common/logger/logger.module';

/**
 * ObservabilityModule
 *
 * Módulo especializado en observabilidad y monitoreo de la aplicación.
 *
 * Responsabilidades:
 * - Logging estructurado global
 * - Interceptores de peticiones HTTP
 * - Métricas y trazabilidad
 *
 * Patrón: Observability Module
 * Beneficio: Centraliza todo el logging e instrumentación
 */
@Module({
  imports: [LoggerModule], // Logging estructurado global
  providers: [
    // Aplicar logging interceptor globalmente
    // Registra todas las peticiones HTTP con duración y metadata
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class ObservabilityModule {}
