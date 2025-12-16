/**
 * CacheHealthIndicator
 *
 * Health indicator para verificar el estado del CacheService (L1 + L2).
 * Obtiene métricas y estado de salud del sistema de cache unificado.
 *
 * @module health/indicators
 */

import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class CacheHealthIndicator extends HealthIndicator {
  constructor(private readonly cacheService: CacheService) {
    super();
  }

  /**
   * Verifica si el cache está saludable
   *
   * @param key - Nombre clave para identificar el check (ej: 'cache')
   * @returns HealthIndicatorResult con métricas del cache
   * @throws HealthCheckError si el CacheService falla
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const health = await this.cacheService.getHealthStatus();

      return this.getStatus(key, true, {
        status: 'up',
        cacheStatus: health.status,
        l1Available: health.l1.available,
        l1ItemCount: health.l1.itemCount,
        l2Available: health.l2.available,
        l2LatencyMs: health.l2.latencyMs,
        hitRate: `${(health.metrics.hitRate * 100).toFixed(1)}%`,
        totalOperations: health.metrics.totalOperations,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new HealthCheckError(
        `Cache health check failed: ${message}`,
        this.getStatus(key, false, { error: message }),
      );
    }
  }
}
