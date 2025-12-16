/**
 * Cache Module - Public API
 *
 * Sistema de cache unificado L1 (memoria) + L2 (Redis)
 */

// Módulo principal
export * from './cache.module';

// Servicio
export * from './cache.service';

// Constantes
export * from './cache.constants';

// Interfaces
export * from './interfaces';

// Decoradores
export * from './decorators';

// Interceptor (para uso avanzado)
export * from './interceptors';
