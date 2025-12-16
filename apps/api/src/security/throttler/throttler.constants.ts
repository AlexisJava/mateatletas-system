/**
 * Throttler Constants
 *
 * Constantes para el sistema de rate limiting distribuido.
 *
 * @module security/throttler
 */

/** Prefijo para claves de throttler en Redis */
export const THROTTLER_PREFIX = 'mateatletas:throttle:';

/** Intervalo de limpieza del fallback en memoria (ms) - 60 segundos */
export const MEMORY_CLEANUP_INTERVAL_MS = 60_000;

/** Token de inyección para ThrottlerRedisStorage */
export const THROTTLER_REDIS_STORAGE = 'THROTTLER_REDIS_STORAGE';

/**
 * Configuración por defecto del throttler
 */
export const THROTTLER_DEFAULTS = {
  /** TTL por defecto en ms (60 segundos) */
  TTL_MS: 60_000,
  /** Límite por defecto de requests */
  LIMIT: 100,
  /** Duración del bloqueo por defecto en ms (0 = sin bloqueo adicional) */
  BLOCK_DURATION_MS: 0,
} as const;

/**
 * Nombres de throttlers predefinidos
 */
export const THROTTLER_NAMES = {
  /** Throttler global por defecto */
  DEFAULT: 'default',
  /** Throttler para webhooks */
  WEBHOOK: 'webhook',
  /** Throttler para autenticación */
  AUTH: 'auth',
  /** Throttler para MFA */
  MFA: 'mfa',
} as const;
