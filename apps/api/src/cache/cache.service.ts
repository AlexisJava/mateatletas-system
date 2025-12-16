/**
 * CacheService - Sistema de Cache Unificado L1+L2
 *
 * Arquitectura:
 * - L1: Cache en memoria (Map) - Ultra rápido (<1ms)
 * - L2: Redis - Persistente, compartido entre instancias (1-5ms)
 *
 * Estrategia: L1 → L2 → null (con fallback si Redis falla)
 */

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { RedisService } from '../core/redis/redis.service';
import {
  CacheOptions,
  CacheGetResult,
  CacheMetrics,
  CacheHealthStatus,
  CacheEntry,
  CacheLevel,
} from './interfaces';
import {
  DEFAULT_TTL_SECONDS,
  DEFAULT_L1_MAX_ITEMS,
  DEFAULT_GLOBAL_PREFIX,
  HEALTH_THRESHOLDS,
} from './cache.constants';

/**
 * Métricas internas del cache
 */
interface InternalMetrics {
  hits: number;
  misses: number;
  l1Hits: number;
  l2Hits: number;
  sets: number;
  deletes: number;
  errors: number;
  startedAt: Date;
}

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);

  /** Cache L1 en memoria */
  private readonly l1Cache: Map<string, CacheEntry<unknown>> = new Map();

  /** Métricas internas */
  private metrics: InternalMetrics;

  /** Configuración */
  private readonly config: {
    defaultTtl: number;
    l1MaxItems: number;
    globalPrefix: string;
  };

  constructor(private readonly redisService: RedisService) {
    this.config = {
      defaultTtl: DEFAULT_TTL_SECONDS,
      l1MaxItems: DEFAULT_L1_MAX_ITEMS,
      globalPrefix: DEFAULT_GLOBAL_PREFIX,
    };

    this.metrics = this.createInitialMetrics();

    this.logger.log('CacheService inicializado con L1 (memoria) + L2 (Redis)');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MÉTODOS PÚBLICOS - OPERACIONES CORE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Obtiene un valor del cache (L1 → L2 → null)
   */
  async get<T>(
    key: string,
    options?: Partial<CacheOptions>,
  ): Promise<T | null> {
    const result = await this.getWithMetadata<T>(key, options);
    return result.value;
  }

  /**
   * Obtiene un valor con metadata detallada
   */
  async getWithMetadata<T>(
    key: string,
    options?: Partial<CacheOptions>,
  ): Promise<CacheGetResult<T>> {
    const startTime = Date.now();
    const fullKey = this.buildKey(key, options?.prefix);
    const level = options?.level ?? CacheLevel.BOTH;

    // 1. Intentar L1 (si no es REDIS_ONLY)
    if (level !== CacheLevel.REDIS_ONLY) {
      const l1Entry = this.getFromL1<T>(fullKey);
      if (l1Entry !== null) {
        this.recordHit('l1');
        return {
          value: l1Entry.value,
          hit: true,
          source: 'l1',
          latencyMs: Date.now() - startTime,
        };
      }
    }

    // 2. Intentar L2 (si no es MEMORY_ONLY)
    if (level !== CacheLevel.MEMORY_ONLY) {
      try {
        const l2Value = await this.getFromL2<T>(fullKey);
        if (l2Value !== null) {
          this.recordHit('l2');

          // Promocionar a L1 si usamos BOTH
          if (level === CacheLevel.BOTH) {
            const ttl = options?.ttl ?? this.config.defaultTtl;
            this.setInL1(fullKey, l2Value, ttl);
          }

          return {
            value: l2Value,
            hit: true,
            source: 'l2',
            latencyMs: Date.now() - startTime,
          };
        }
      } catch (error) {
        this.handleRedisError('get', error);
      }
    }

    // 3. Cache miss
    this.recordMiss();
    return {
      value: null,
      hit: false,
      source: null,
      latencyMs: Date.now() - startTime,
    };
  }

  /**
   * Almacena un valor en cache
   */
  async set<T>(
    key: string,
    value: T,
    options?: Partial<CacheOptions>,
  ): Promise<void> {
    const fullKey = this.buildKey(key, options?.prefix);
    const ttl = options?.ttl ?? this.config.defaultTtl;
    const level = options?.level ?? CacheLevel.BOTH;

    // Guardar en L1 (si no es REDIS_ONLY)
    if (level !== CacheLevel.REDIS_ONLY) {
      this.setInL1(fullKey, value, ttl);
    }

    // Guardar en L2 (si no es MEMORY_ONLY)
    if (level !== CacheLevel.MEMORY_ONLY) {
      try {
        await this.setInL2(fullKey, value, ttl);
      } catch (error) {
        this.handleRedisError('set', error);
      }
    }

    this.metrics.sets++;
  }

  /**
   * Elimina una clave del cache (L1 + L2)
   */
  async delete(key: string): Promise<void> {
    const fullKey = this.buildKey(key);

    // Eliminar de L1
    this.l1Cache.delete(fullKey);

    // Eliminar de L2
    try {
      await this.redisService.del(fullKey);
    } catch (error) {
      this.handleRedisError('delete', error);
    }

    this.metrics.deletes++;
  }

  /**
   * Elimina claves que coincidan con un patrón
   */
  async deleteByPattern(pattern: string): Promise<number> {
    const fullPattern = this.buildKey(pattern);
    let deletedCount = 0;

    // Eliminar de L1 usando regex
    const regex = this.patternToRegex(fullPattern);
    for (const key of this.l1Cache.keys()) {
      if (regex.test(key)) {
        this.l1Cache.delete(key);
        deletedCount++;
      }
    }

    // Eliminar de L2 usando SCAN
    try {
      const client = this.redisService.getClient();
      let cursor = '0';

      do {
        const result = await client.scan(
          cursor,
          'MATCH',
          fullPattern,
          'COUNT',
          100,
        );
        cursor = result[0];
        const keys = result[1];

        if (keys.length > 0) {
          await client.del(...keys);
          // No sumamos aquí porque pueden ser las mismas keys que L1
        }
      } while (cursor !== '0');
    } catch (error) {
      this.handleRedisError('deleteByPattern', error);
    }

    return deletedCount;
  }

  /**
   * Verifica si una clave existe en cache
   */
  async exists(key: string): Promise<boolean> {
    const fullKey = this.buildKey(key);

    // Verificar L1 primero
    const l1Entry = this.getFromL1(fullKey);
    if (l1Entry !== null) {
      return true;
    }

    // Verificar L2
    try {
      return await this.redisService.exists(fullKey);
    } catch (error) {
      this.handleRedisError('exists', error);
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MÉTODOS PÚBLICOS - OPERACIONES AVANZADAS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get-or-Set: Obtiene del cache o ejecuta factory si no existe
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: Partial<CacheOptions>,
  ): Promise<T> {
    // Intentar obtener del cache
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - ejecutar factory
    const value = await factory();

    // Cachear el resultado
    await this.set(key, value, options);

    return value;
  }

  /**
   * Almacena múltiples valores en una operación
   */
  async setMany<T>(
    entries: Array<[string, T]>,
    options?: Partial<CacheOptions>,
  ): Promise<void> {
    for (const [key, value] of entries) {
      await this.set(key, value, options);
    }
  }

  /**
   * Obtiene múltiples valores en una operación
   */
  async getMany<T>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>();

    for (const key of keys) {
      const value = await this.get<T>(key);
      results.set(key, value);
    }

    return results;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MÉTODOS PÚBLICOS - MÉTRICAS Y SALUD
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Obtiene métricas actuales del cache
   */
  getMetrics(): CacheMetrics {
    const totalRequests = this.metrics.hits + this.metrics.misses;
    const hitRate = totalRequests > 0 ? this.metrics.hits / totalRequests : 0;
    const uptimeSeconds = Math.floor(
      (Date.now() - this.metrics.startedAt.getTime()) / 1000,
    );

    return {
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      hitRate,
      hitsByLevel: {
        l1: this.metrics.l1Hits,
        l2: this.metrics.l2Hits,
      },
      sets: this.metrics.sets,
      deletes: this.metrics.deletes,
      errors: this.metrics.errors,
      l1Size: this.l1Cache.size,
      startedAt: this.metrics.startedAt,
      uptimeSeconds,
    };
  }

  /**
   * Resetea las métricas
   */
  resetMetrics(): void {
    this.metrics = this.createInitialMetrics();
  }

  /**
   * Obtiene estado de salud del cache
   */
  async getHealthStatus(): Promise<CacheHealthStatus> {
    const metrics = this.getMetrics();
    const l2Available = this.redisService.isRedisAvailable();

    // Medir latencia de L2
    let l2LatencyMs: number | null = null;
    if (l2Available) {
      try {
        const start = Date.now();
        await this.redisService.get('health:ping');
        l2LatencyMs = Date.now() - start;
      } catch {
        l2LatencyMs = null;
      }
    }

    // Determinar status
    let status: 'healthy' | 'degraded' | 'unhealthy';
    const totalRequests = metrics.hits + metrics.misses;

    if (!l2Available) {
      status = 'degraded';
    } else if (
      totalRequests > 0 &&
      metrics.hitRate < HEALTH_THRESHOLDS.MIN_DEGRADED_HIT_RATE
    ) {
      // Solo evaluar hitRate si hay operaciones
      status = 'unhealthy';
    } else if (
      totalRequests > 0 &&
      metrics.hitRate < HEALTH_THRESHOLDS.MIN_HEALTHY_HIT_RATE
    ) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    return {
      status,
      l1: {
        available: true,
        itemCount: this.l1Cache.size,
      },
      l2: {
        available: l2Available,
        latencyMs: l2LatencyMs,
      },
      metrics: {
        hitRate: metrics.hitRate,
        totalOperations:
          metrics.hits + metrics.misses + metrics.sets + metrics.deletes,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MÉTODOS PÚBLICOS - MANTENIMIENTO
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Limpia entradas expiradas de L1
   */
  cleanExpiredL1(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.l1Cache.entries()) {
      if (entry.expiresAt <= now) {
        this.l1Cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Limpia todo el cache L1
   */
  clearL1(): void {
    this.l1Cache.clear();
  }

  /**
   * Cleanup al destruir el módulo
   */
  onModuleDestroy(): void {
    this.l1Cache.clear();
    this.logger.log('CacheService destruido, L1 limpiado');
  }

  /**
   * Obtiene el tamaño actual de L1
   */
  getL1Size(): number {
    return this.l1Cache.size;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MÉTODOS PRIVADOS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Construye la clave completa con prefijo
   */
  private buildKey(key: string, prefix?: string): string {
    if (prefix) {
      return `${prefix}${key}`;
    }
    return `${this.config.globalPrefix}${key}`;
  }

  /**
   * Obtiene de L1 (memoria), verificando expiración
   */
  private getFromL1<T>(key: string): CacheEntry<T> | null {
    const entry = this.l1Cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    // Verificar si expiró
    if (entry.expiresAt <= Date.now()) {
      this.l1Cache.delete(key);
      return null;
    }

    return entry;
  }

  /**
   * Obtiene de L2 (Redis)
   */
  private async getFromL2<T>(key: string): Promise<T | null> {
    const data = await this.redisService.get(key);

    if (data === null) {
      return null;
    }

    return this.deserialize<T>(data);
  }

  /**
   * Guarda en L1 con eviction si está lleno
   */
  private setInL1<T>(key: string, value: T, ttlSeconds: number): void {
    // Evictar si está lleno
    if (this.l1Cache.size >= this.config.l1MaxItems) {
      this.evictOldestL1();
    }

    const now = Date.now();
    const entry: CacheEntry<T> = {
      value,
      createdAt: now,
      expiresAt: now + ttlSeconds * 1000,
    };

    this.l1Cache.set(key, entry);
  }

  /**
   * Guarda en L2 (Redis)
   */
  private async setInL2<T>(
    key: string,
    value: T,
    ttlSeconds: number,
  ): Promise<void> {
    const serialized = this.serialize(value);
    await this.redisService.set(key, serialized, ttlSeconds);
  }

  /**
   * Serializa valor para Redis
   */
  private serialize<T>(value: T): string {
    return JSON.stringify(value);
  }

  /**
   * Deserializa valor de Redis
   */
  private deserialize<T>(data: string): T | null {
    try {
      return JSON.parse(data) as T;
    } catch {
      this.logger.warn(
        `Error deserializando JSON: ${data.substring(0, 50)}...`,
      );
      this.metrics.errors++;
      return null;
    }
  }

  /**
   * Evicta la entrada más antigua de L1
   */
  private evictOldestL1(): void {
    // Primero limpiar expiradas
    const cleaned = this.cleanExpiredL1();
    if (cleaned > 0) {
      return; // Ya hay espacio
    }

    // Si no hay expiradas, eliminar la más antigua por createdAt
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.l1Cache.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.l1Cache.delete(oldestKey);
    }
  }

  /**
   * Convierte patrón con wildcard a regex
   */
  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`);
  }

  /**
   * Maneja errores de Redis (fallback silencioso)
   */
  private handleRedisError(operation: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.logger.warn(
      `Redis error en ${operation}: ${message} - Fallback activo`,
    );
    this.metrics.errors++;
  }

  /**
   * Registra un cache hit
   */
  private recordHit(source: 'l1' | 'l2'): void {
    this.metrics.hits++;
    if (source === 'l1') {
      this.metrics.l1Hits++;
    } else {
      this.metrics.l2Hits++;
    }
  }

  /**
   * Registra un cache miss
   */
  private recordMiss(): void {
    this.metrics.misses++;
  }

  /**
   * Crea métricas iniciales
   */
  private createInitialMetrics(): InternalMetrics {
    return {
      hits: 0,
      misses: 0,
      l1Hits: 0,
      l2Hits: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      startedAt: new Date(),
    };
  }
}

// Re-export para conveniencia
export { CacheLevel };
