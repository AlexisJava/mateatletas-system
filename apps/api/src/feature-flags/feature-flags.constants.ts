/**
 * Feature Flags Constants
 *
 * Nombres de las variables de entorno para feature flags.
 * Default: true (habilitado). Solo se deshabilita si explícitamente 'false'.
 *
 * @module feature-flags
 */

export const FEATURE_FLAGS = {
  /** Habilita/deshabilita uso de Redis para cache (fallback: memoria) */
  CACHE_REDIS_ENABLED: 'FEATURE_CACHE_REDIS_ENABLED',

  /** Habilita/deshabilita uso de Redis para throttler (fallback: memoria) */
  THROTTLER_REDIS_ENABLED: 'FEATURE_THROTTLER_REDIS_ENABLED',

  /** Habilita/deshabilita cache completamente */
  CACHE_ENABLED: 'FEATURE_CACHE_ENABLED',
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;
export type FeatureFlagEnvVar = (typeof FEATURE_FLAGS)[FeatureFlagKey];
