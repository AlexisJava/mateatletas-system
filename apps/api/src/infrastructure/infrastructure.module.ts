import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheConfigModule } from '../common/cache/cache.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

/**
 * InfrastructureModule
 *
 * Módulo global que agrupa servicios transversales de infraestructura.
 *
 * Responsabilidades:
 * - Sistema de eventos (desacoplamiento de módulos)
 * - Cache global (Redis/memoria)
 * - Sistema de notificaciones
 *
 * Patrón: Global Module + Infrastructure
 * Beneficio: Servicios compartidos disponibles en toda la app
 */
@Global()
@Module({
  imports: [
    // Event Emitter: Sistema de eventos para desacoplar módulos
    // - Permite comunicación async entre módulos sin dependencias circulares
    // - Usado para resolver Auth ↔ Gamificación circular dependency
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    CacheConfigModule, // Cache global con Redis (fallback a memoria)
    NotificacionesModule, // Sistema de notificaciones para docentes
  ],
  exports: [EventEmitterModule, CacheConfigModule, NotificacionesModule],
})
export class InfrastructureModule {}
