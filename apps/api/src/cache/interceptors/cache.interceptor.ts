/**
 * CacheInterceptor
 *
 * Interceptor que procesa los decoradores @Cacheable y @CacheInvalidate.
 * Se encarga de:
 * - Leer del cache antes de ejecutar métodos @Cacheable
 * - Guardar en cache el resultado de métodos @Cacheable
 * - Invalidar claves cuando se ejecutan métodos @CacheInvalidate
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from, of } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { CacheService } from '../cache.service';
import { CacheableOptions, CacheInvalidateOptions } from '../interfaces';
import {
  CACHEABLE_METADATA_KEY,
  CACHE_INVALIDATE_METADATA_KEY,
} from '../cache.constants';
import { buildCacheKey } from '../decorators/cacheable.decorator';
import {
  normalizeKeys,
  processInvalidationKeys,
} from '../decorators/cache-invalidate.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const handler = context.getHandler();
    const args = context.getArgs();

    // Obtener metadata de decoradores
    const cacheableOptions = this.reflector.get<CacheableOptions>(
      CACHEABLE_METADATA_KEY,
      handler,
    );
    const invalidateOptions = this.reflector.get<CacheInvalidateOptions>(
      CACHE_INVALIDATE_METADATA_KEY,
      handler,
    );

    // Si tiene @CacheInvalidate con beforeInvocation, invalidar antes
    if (invalidateOptions?.beforeInvocation) {
      return from(this.invalidateCache(invalidateOptions, args)).pipe(
        switchMap(() => this.handleCacheable(cacheableOptions, args, next)),
        tap((_result) => {
          // Invalidar después si también tiene invalidación sin beforeInvocation
          if (!invalidateOptions.beforeInvocation) {
            void this.invalidateCache(invalidateOptions, args);
          }
        }),
      );
    }

    // Manejar @Cacheable
    if (cacheableOptions) {
      return this.handleCacheable(cacheableOptions, args, next).pipe(
        tap(() => {
          // Si tiene @CacheInvalidate sin beforeInvocation, invalidar después
          if (invalidateOptions && !invalidateOptions.beforeInvocation) {
            void this.invalidateCache(invalidateOptions, args);
          }
        }),
      );
    }

    // Si solo tiene @CacheInvalidate (sin beforeInvocation), invalidar después
    if (invalidateOptions) {
      return next.handle().pipe(
        tap(() => {
          void this.invalidateCache(invalidateOptions, args);
        }),
      );
    }

    // Sin decoradores de cache
    return next.handle();
  }

  /**
   * Maneja la lógica de @Cacheable
   */
  private handleCacheable(
    options: CacheableOptions | undefined,
    args: unknown[],
    next: CallHandler,
  ): Observable<unknown> {
    if (!options) {
      return next.handle();
    }

    const cacheKey = buildCacheKey(options.key, args);

    return from(this.cacheService.get(cacheKey)).pipe(
      switchMap((cachedValue) => {
        if (cachedValue !== null) {
          this.logger.debug(`Cache HIT: ${cacheKey}`);
          return of(cachedValue);
        }

        this.logger.debug(`Cache MISS: ${cacheKey}`);
        return next.handle().pipe(
          tap((result) => {
            // Verificar condición si existe
            if (options.condition && !options.condition(result)) {
              this.logger.debug(`Cache SKIP (condition false): ${cacheKey}`);
              return;
            }

            // Guardar en cache
            void this.cacheService.set(cacheKey, result, {
              ttl: options.ttl,
              level: options.level,
            });
          }),
        );
      }),
    );
  }

  /**
   * Invalida claves de cache
   */
  private async invalidateCache(
    options: CacheInvalidateOptions,
    args: unknown[],
  ): Promise<void> {
    const keys = normalizeKeys(options.keys);
    const processedKeys = processInvalidationKeys(keys, args);

    for (const key of processedKeys) {
      if (key.includes('*')) {
        await this.cacheService.deleteByPattern(key);
        this.logger.debug(`Cache INVALIDATE pattern: ${key}`);
      } else {
        await this.cacheService.delete(key);
        this.logger.debug(`Cache INVALIDATE: ${key}`);
      }
    }
  }
}
