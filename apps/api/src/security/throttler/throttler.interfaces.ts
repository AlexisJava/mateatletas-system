/**
 * Throttler Interfaces
 *
 * Tipos e interfaces para el sistema de rate limiting distribuido.
 *
 * @module security/throttler
 */

/**
 * Entrada en el fallback de memoria
 */
export interface MemoryFallbackEntry {
  /** Contador de hits actual */
  totalHits: number;
  /** Timestamp de expiración (ms desde epoch) */
  expiresAt: number;
  /** Si está bloqueado por exceder límite */
  isBlocked: boolean;
  /** Timestamp de expiración del bloqueo (ms desde epoch) */
  blockExpiresAt: number;
}

/**
 * Métricas del ThrottlerRedisStorage
 */
export interface ThrottlerStorageMetrics {
  /** Total de operaciones en Redis */
  redisOperations: number;
  /** Total de operaciones en memoria (fallback) */
  memoryOperations: number;
  /** Total de errores de Redis */
  redisErrors: number;
  /** Tamaño actual del fallback en memoria */
  memoryFallbackSize: number;
  /** Timestamp de inicio */
  startedAt: Date;
}

/**
 * Estado de salud del ThrottlerRedisStorage
 */
export interface ThrottlerStorageHealth {
  /** Estado general */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** Si Redis está disponible */
  redisAvailable: boolean;
  /** Cantidad de entradas en memoria fallback */
  memoryFallbackEntries: number;
  /** Métricas resumidas */
  metrics: {
    redisOperations: number;
    memoryOperations: number;
    errorRate: number;
  };
}
