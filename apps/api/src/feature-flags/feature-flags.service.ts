/**
 * FeatureFlagsService
 *
 * Servicio centralizado para feature flags basado en env vars.
 * Lee las variables en cada llamada (no cachea) para permitir cambios en runtime.
 *
 * Default: true (habilitado). Solo se deshabilita si explícitamente 'false'.
 *
 * @module feature-flags
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FEATURE_FLAGS } from './feature-flags.constants';

export interface AllFeatureFlags {
  cacheRedisEnabled: boolean;
  throttlerRedisEnabled: boolean;
  cacheEnabled: boolean;
}

@Injectable()
export class FeatureFlagsService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Verifica si el uso de Redis para cache está habilitado.
   * Default: true. Se deshabilita con FEATURE_CACHE_REDIS_ENABLED=false
   */
  isCacheRedisEnabled(): boolean {
    return this.isEnabled(FEATURE_FLAGS.CACHE_REDIS_ENABLED);
  }

  /**
   * Verifica si el uso de Redis para throttler está habilitado.
   * Default: true. Se deshabilita con FEATURE_THROTTLER_REDIS_ENABLED=false
   */
  isThrottlerRedisEnabled(): boolean {
    return this.isEnabled(FEATURE_FLAGS.THROTTLER_REDIS_ENABLED);
  }

  /**
   * Verifica si el cache está habilitado completamente.
   * Default: true. Se deshabilita con FEATURE_CACHE_ENABLED=false
   */
  isCacheEnabled(): boolean {
    return this.isEnabled(FEATURE_FLAGS.CACHE_ENABLED);
  }

  /**
   * Retorna el estado de todos los feature flags.
   */
  getAllFlags(): AllFeatureFlags {
    return {
      cacheRedisEnabled: this.isCacheRedisEnabled(),
      throttlerRedisEnabled: this.isThrottlerRedisEnabled(),
      cacheEnabled: this.isCacheEnabled(),
    };
  }

  /**
   * Evalúa si un feature flag está habilitado.
   * Default: true. Solo retorna false si el valor es explícitamente 'false' (case insensitive).
   */
  private isEnabled(envVar: string): boolean {
    const value = this.configService.get<string>(envVar);

    if (value === undefined || value === null) {
      return true;
    }

    return value.toLowerCase() !== 'false';
  }
}
