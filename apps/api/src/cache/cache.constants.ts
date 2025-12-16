/**
 * Cache Constants
 *
 * Constantes y valores por defecto para el sistema de cache.
 *
 * @module cache/constants
 */

/** TTL por defecto en segundos (5 minutos) */
export const DEFAULT_TTL_SECONDS = 300;

/** Máximo de items en cache L1 (memoria) */
export const DEFAULT_L1_MAX_ITEMS = 1000;

/** Prefijo global para todas las claves */
export const DEFAULT_GLOBAL_PREFIX = 'mateatletas:';

/** Metadata key para @Cacheable */
export const CACHEABLE_METADATA_KEY = 'cache:cacheable';

/** Metadata key para @CacheInvalidate */
export const CACHE_INVALIDATE_METADATA_KEY = 'cache:invalidate';

/** Token de inyección para opciones del módulo */
export const CACHE_MODULE_OPTIONS = 'CACHE_MODULE_OPTIONS';

/**
 * TTLs recomendados por tipo de dato
 */
export const RECOMMENDED_TTLS = {
  /** Datos que nunca cambian (Casas, Sectores) */
  STATIC: 86400, // 24 horas
  /** Datos que cambian raramente (Mundos, Tiers, Planes) */
  RARE_CHANGE: 21600, // 6 horas
  /** Datos que cambian ocasionalmente (Productos, Config) */
  OCCASIONAL_CHANGE: 3600, // 1 hora
  /** Datos que cambian frecuentemente (Rankings, Stats) */
  FREQUENT_CHANGE: 300, // 5 minutos
  /** Datos volátiles (Sesiones, Tokens) */
  VOLATILE: 60, // 1 minuto
} as const;

/**
 * Prefijos de cache por dominio
 */
export const CACHE_PREFIXES = {
  USER: 'user:',
  ESTUDIANTE: 'estudiante:',
  DOCENTE: 'docente:',
  CASA: 'casa:',
  MUNDO: 'mundo:',
  TIER: 'tier:',
  PLAN: 'plan:',
  PRODUCTO: 'producto:',
  CLASE: 'clase:',
  CONFIG: 'config:',
  RANKING: 'ranking:',
  STATS: 'stats:',
  WEBHOOK: 'webhook:',
  PAYMENT: 'payment:',
} as const;

/**
 * Umbrales para health status
 */
export const HEALTH_THRESHOLDS = {
  /** Hit rate mínimo para status 'healthy' */
  MIN_HEALTHY_HIT_RATE: 0.5,
  /** Hit rate mínimo para no ser 'unhealthy' */
  MIN_DEGRADED_HIT_RATE: 0.3,
  /** Latencia máxima de L2 para ser 'healthy' (ms) */
  MAX_HEALTHY_L2_LATENCY_MS: 100,
} as const;
