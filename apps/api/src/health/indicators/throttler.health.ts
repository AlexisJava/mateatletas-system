/**
 * ThrottlerHealthIndicator
 *
 * Health indicator para el rate limiting (Throttler).
 * Verifica disponibilidad de Redis para rate limiting distribuido.
 *
 * Nota: El throttler tiene fallback a memoria, así que nunca está
 * completamente "unhealthy" - solo "degraded" si Redis no está disponible.
 *
 * @module health/indicators
 */

import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { RedisService } from '../../core/redis/redis.service';

@Injectable()
export class ThrottlerHealthIndicator extends HealthIndicator {
  constructor(private readonly redisService: RedisService) {
    super();
  }

  /**
   * Verifica si el throttler está saludable
   *
   * @param key - Nombre clave para identificar el check (ej: 'throttler')
   * @returns HealthIndicatorResult - Nunca falla porque tiene fallback
   */
  isHealthy(key: string): Promise<HealthIndicatorResult> {
    const redisAvailable = this.redisService.isRedisAvailable();

    if (redisAvailable) {
      // Redis disponible = rate limiting distribuido funcionando
      return Promise.resolve(
        this.getStatus(key, true, {
          status: 'up',
          throttlerStatus: 'healthy',
          redisAvailable: true,
          message: 'Distributed rate limiting active',
        }),
      );
    }

    // Redis no disponible = usando fallback a memoria
    // Sigue siendo "up" porque el throttler funciona (con limitaciones)
    return Promise.resolve(
      this.getStatus(key, true, {
        status: 'up',
        throttlerStatus: 'degraded',
        redisAvailable: false,
        message: 'Using memory fallback - rate limiting is local only',
      }),
    );
  }
}
