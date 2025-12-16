/**
 * RedisHealthIndicator
 *
 * Health indicator para verificar el estado de Redis.
 * Realiza un ping y mide la latencia de respuesta.
 *
 * @module health/indicators
 */

import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { RedisService } from '../../core/redis/redis.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly redisService: RedisService) {
    super();
  }

  /**
   * Verifica si Redis está saludable
   *
   * @param key - Nombre clave para identificar el check (ej: 'redis')
   * @returns HealthIndicatorResult con status y latencia
   * @throws HealthCheckError si Redis no está disponible o el ping falla
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    // Verificar disponibilidad básica
    if (!this.redisService.isRedisAvailable()) {
      throw new HealthCheckError(
        'Redis health check failed: Redis unavailable',
        this.getStatus(key, false, { error: 'Redis unavailable' }),
      );
    }

    try {
      // Medir latencia del ping
      const startTime = Date.now();
      const client = this.redisService.getClient();
      const response = await client.ping();
      const latencyMs = Date.now() - startTime;

      // Verificar respuesta válida
      if (response !== 'PONG') {
        throw new Error(`Unexpected ping response: ${String(response)}`);
      }

      return this.getStatus(key, true, {
        status: 'up',
        latencyMs,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new HealthCheckError(
        `Redis health check failed: ${message}`,
        this.getStatus(key, false, { error: message }),
      );
    }
  }
}
