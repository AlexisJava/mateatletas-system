/**
 * Cache Options Interface
 *
 * Tipos e interfaces para el sistema de cache unificado L1+L2.
 *
 * @module cache/interfaces
 */

/**
 * Niveles de cache disponibles
 */
export enum CacheLevel {
  /** Solo memoria local (L1) - más rápido, no persistente */
  MEMORY_ONLY = 'memory_only',
  /** Solo Redis (L2) - persistente, compartido entre instancias */
  REDIS_ONLY = 'redis_only',
  /** Ambos niveles: L1 primero, L2 como respaldo */
  BOTH = 'both',
}

/**
 * Opciones para operaciones de cache
 */
export interface CacheOptions {
  /** Tiempo de vida en segundos */
  ttl: number;
  /** Prefijo para la clave (ej: 'user:', 'producto:') */
  prefix?: string;
  /** Nivel de cache a usar */
  level?: CacheLevel;
}

/**
 * Opciones específicas para el decorador @Cacheable
 */
export interface CacheableOptions {
  /**
   * Clave de cache. Puede incluir placeholders:
   * - {0}, {1}, etc. para argumentos por posición
   * @example key: 'user:{0}' con args=['123'] → 'user:123'
   */
  key: string;
  /** Tiempo de vida en segundos (default: 300 = 5 min) */
  ttl?: number;
  /** Nivel de cache (default: BOTH) */
  level?: CacheLevel;
  /**
   * Condición para cachear. Recibe el resultado del método.
   * Si retorna false, no se cachea.
   * @example condition: (result) => result !== null
   */
  condition?: (result: unknown) => boolean;
}

/**
 * Opciones para el decorador @CacheInvalidate
 */
export interface CacheInvalidateOptions {
  /**
   * Claves a invalidar. Soporta:
   * - Clave exacta: 'user:123'
   * - Patrón con wildcard: 'user:*'
   * - Múltiples claves: ['user:123', 'users:list']
   */
  keys: string | string[];
  /** Si true, invalida antes de ejecutar el método. Default: false (después) */
  beforeInvocation?: boolean;
}

/**
 * Origen del dato en cache
 */
export type CacheSource = 'l1' | 'l2' | 'source';

/**
 * Entrada almacenada en cache (estructura interna)
 */
export interface CacheEntry<T> {
  /** Valor almacenado */
  value: T;
  /** Timestamp de creación (ms desde epoch) */
  createdAt: number;
  /** Timestamp de expiración (ms desde epoch) */
  expiresAt: number;
}

/**
 * Resultado de una operación get con metadata
 */
export interface CacheGetResult<T> {
  /** Valor encontrado o null si no existe */
  value: T | null;
  /** Si fue hit o miss */
  hit: boolean;
  /** De dónde vino el dato */
  source: CacheSource | null;
  /** Tiempo de respuesta en ms */
  latencyMs: number;
}

/**
 * Métricas de cache
 */
export interface CacheMetrics {
  /** Total de hits (encontrados en cache) */
  hits: number;
  /** Total de misses (no encontrados) */
  misses: number;
  /** Ratio de hits: hits / (hits + misses) */
  hitRate: number;
  /** Hits por nivel */
  hitsByLevel: {
    l1: number;
    l2: number;
  };
  /** Total de operaciones set */
  sets: number;
  /** Total de operaciones delete */
  deletes: number;
  /** Total de errores */
  errors: number;
  /** Tamaño actual de L1 (items en memoria) */
  l1Size: number;
  /** Timestamp de inicio de métricas */
  startedAt: Date;
  /** Uptime en segundos */
  uptimeSeconds: number;
}

/**
 * Configuración del módulo de cache
 */
export interface CacheModuleOptions {
  /** TTL default en segundos (default: 300) */
  defaultTtl?: number;
  /** Máximo de items en L1 (default: 1000) */
  l1MaxItems?: number;
  /** Habilitar métricas (default: true) */
  enableMetrics?: boolean;
  /** Prefijo global para todas las claves (default: 'mateatletas:') */
  globalPrefix?: string;
}

/**
 * Estado de salud del cache
 */
export interface CacheHealthStatus {
  /** Estado general: 'healthy' | 'degraded' | 'unhealthy' */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** Estado de L1 (memoria) */
  l1: {
    available: boolean;
    itemCount: number;
  };
  /** Estado de L2 (Redis) */
  l2: {
    available: boolean;
    latencyMs: number | null;
  };
  /** Métricas resumidas */
  metrics: {
    hitRate: number;
    totalOperations: number;
  };
}
