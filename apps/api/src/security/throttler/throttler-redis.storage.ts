/**
 * ThrottlerRedisStorage
 *
 * Storage distribuido para @nestjs/throttler usando Redis.
 * Proporciona rate limiting compartido entre instancias con fallback a memoria.
 *
 * Características:
 * - Operaciones atómicas con Lua script
 * - Fallback automático a memoria si Redis no está disponible
 * - Cleanup periódico de entradas expiradas en memoria
 * - Métricas y health status
 * - Feature flag para deshabilitar Redis (FEATURE_THROTTLER_REDIS_ENABLED)
 *
 * @module security/throttler
 */

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import { RedisService } from '../../core/redis/redis.service';
import { FEATURE_FLAGS } from '../../feature-flags/feature-flags.constants';
import {
  MemoryFallbackEntry,
  ThrottlerStorageMetrics,
  ThrottlerStorageHealth,
} from './throttler.interfaces';
import {
  THROTTLER_PREFIX,
  MEMORY_CLEANUP_INTERVAL_MS,
} from './throttler.constants';

@Injectable()
export class ThrottlerRedisStorage
  implements ThrottlerStorage, OnModuleDestroy
{
  private readonly logger = new Logger(ThrottlerRedisStorage.name);
  private readonly memoryFallback: Map<string, MemoryFallbackEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private metrics: {
    redisOperations: number;
    memoryOperations: number;
    redisErrors: number;
    startedAt: Date;
  };

  /**
   * Lua script atómico: INCR + PTTL + PEXPIRE condicional
   *
   * KEYS[1] = clave del throttler
   * ARGV[1] = TTL en milliseconds
   *
   * Retorna: [totalHits, timeToExpire]
   */
  private readonly INCR_SCRIPT = `
    local current = redis.call('INCR', KEYS[1])
    local ttl = redis.call('PTTL', KEYS[1])
    if ttl == -1 then
      redis.call('PEXPIRE', KEYS[1], ARGV[1])
      ttl = tonumber(ARGV[1])
    end
    return {current, ttl}
  `;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.metrics = {
      redisOperations: 0,
      memoryOperations: 0,
      redisErrors: 0,
      startedAt: new Date(),
    };

    // Iniciar cleanup periódico de memoria
    this.cleanupInterval = setInterval(() => {
      this.cleanExpiredMemoryEntries();
    }, MEMORY_CLEANUP_INTERVAL_MS);

    this.logger.log(
      'ThrottlerRedisStorage initialized with Redis + memory fallback',
    );
  }

  /**
   * Verifica si Redis para throttler está habilitado por feature flag.
   * Default: true. Solo false si FEATURE_THROTTLER_REDIS_ENABLED=false
   */
  private isThrottlerRedisEnabled(): boolean {
    const value = this.configService.get<string>(
      FEATURE_FLAGS.THROTTLER_REDIS_ENABLED,
    );
    return value?.toLowerCase() !== 'false';
  }

  /**
   * Incrementa el contador de rate limiting
   *
   * Flujo:
   * 1. Si feature flag deshabilitado → usar memoria
   * 2. Si Redis está disponible → usar Redis (distribuido)
   * 3. Si Redis falla → fallback a memoria (local)
   */
  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const fullKey = `${THROTTLER_PREFIX}${throttlerName}:${key}`;

    // Verificar feature flag primero
    if (!this.isThrottlerRedisEnabled()) {
      this.logger.debug('Redis throttler disabled by feature flag');
      return this.incrementInMemory(fullKey, ttl, limit, blockDuration);
    }

    // Verificar disponibilidad de Redis
    if (!this.redisService.isRedisAvailable()) {
      this.logger.warn(
        'Redis unavailable, using memory fallback for throttling',
      );
      return this.incrementInMemory(fullKey, ttl, limit, blockDuration);
    }

    try {
      const client = this.redisService.getClient();

      // Ejecutar script Lua atómico
      const result = (await client.eval(
        this.INCR_SCRIPT,
        1,
        fullKey,
        ttl.toString(),
      )) as [number, number];

      const [totalHits, timeToExpire] = result;
      const isBlocked = totalHits > limit;

      // Si excede límite y hay blockDuration, extender TTL
      if (isBlocked && blockDuration > 0) {
        await client.pexpire(fullKey, blockDuration);
      }

      this.metrics.redisOperations++;

      return {
        totalHits,
        timeToExpire: Math.max(0, timeToExpire),
        isBlocked,
        timeToBlockExpire: isBlocked ? blockDuration : 0,
      };
    } catch (error) {
      this.handleRedisError('increment', error);
      return this.incrementInMemory(fullKey, ttl, limit, blockDuration);
    }
  }

  /**
   * Incrementa contador en memoria (fallback)
   */
  incrementInMemory(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
  ): ThrottlerStorageRecord {
    const now = Date.now();
    const existing = this.memoryFallback.get(key);

    // Si existe y no expiró, incrementar
    if (existing && existing.expiresAt > now) {
      existing.totalHits++;
      existing.isBlocked = existing.totalHits > limit;

      // Si está bloqueado y hay blockDuration, extender expiración
      if (existing.isBlocked && blockDuration > 0) {
        existing.blockExpiresAt = now + blockDuration;
        existing.expiresAt = now + blockDuration;
      }

      this.metrics.memoryOperations++;

      return {
        totalHits: existing.totalHits,
        timeToExpire: Math.max(0, existing.expiresAt - now),
        isBlocked: existing.isBlocked,
        timeToBlockExpire: existing.isBlocked
          ? Math.max(0, existing.blockExpiresAt - now)
          : 0,
      };
    }

    // Nueva entrada
    const entry: MemoryFallbackEntry = {
      totalHits: 1,
      expiresAt: now + ttl,
      isBlocked: false,
      blockExpiresAt: 0,
    };

    this.memoryFallback.set(key, entry);
    this.metrics.memoryOperations++;

    return {
      totalHits: 1,
      timeToExpire: ttl,
      isBlocked: false,
      timeToBlockExpire: 0,
    };
  }

  /**
   * Limpia entradas expiradas del fallback en memoria
   */
  cleanExpiredMemoryEntries(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.memoryFallback.entries()) {
      if (entry.expiresAt <= now) {
        this.memoryFallback.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned ${cleaned} expired throttler memory entries`);
    }

    return cleaned;
  }

  /**
   * Obtiene métricas del storage
   */
  getMetrics(): ThrottlerStorageMetrics {
    return {
      redisOperations: this.metrics.redisOperations,
      memoryOperations: this.metrics.memoryOperations,
      redisErrors: this.metrics.redisErrors,
      memoryFallbackSize: this.memoryFallback.size,
      startedAt: this.metrics.startedAt,
    };
  }

  /**
   * Obtiene estado de salud del storage
   */
  getHealthStatus(): ThrottlerStorageHealth {
    const featureFlagEnabled = this.isThrottlerRedisEnabled();
    const redisAvailable =
      featureFlagEnabled && this.redisService.isRedisAvailable();
    const totalOperations =
      this.metrics.redisOperations + this.metrics.memoryOperations;
    const errorRate =
      totalOperations > 0 ? this.metrics.redisErrors / totalOperations : 0;

    let status: 'healthy' | 'degraded' | 'unhealthy';

    if (!featureFlagEnabled) {
      // Feature flag deshabilitado = degraded (funciona pero solo local)
      status = 'degraded';
    } else if (redisAvailable && errorRate < 0.1) {
      status = 'healthy';
    } else if (redisAvailable || this.metrics.memoryOperations > 0) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      redisAvailable,
      memoryFallbackEntries: this.memoryFallback.size,
      metrics: {
        redisOperations: this.metrics.redisOperations,
        memoryOperations: this.metrics.memoryOperations,
        errorRate,
      },
    };
  }

  /**
   * Obtiene tamaño del fallback en memoria
   */
  getMemoryFallbackSize(): number {
    return this.memoryFallback.size;
  }

  /**
   * Maneja errores de Redis
   */
  private handleRedisError(operation: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.logger.warn(`Redis error in throttler ${operation}: ${message}`);
    this.metrics.redisErrors++;
  }

  /**
   * Limpia el storage al destruir el módulo
   */
  onModuleDestroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.memoryFallback.clear();
    this.logger.log('ThrottlerRedisStorage destroyed');
  }
}
