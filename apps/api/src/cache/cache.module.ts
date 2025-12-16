/**
 * CacheModule - Módulo de Cache Unificado
 *
 * Proporciona sistema de cache L1 (memoria) + L2 (Redis) con:
 * - CacheService para operaciones directas
 * - @Cacheable y @CacheInvalidate decoradores
 * - CacheInterceptor para procesamiento automático
 *
 * @example
 * // En AppModule
 * @Module({
 *   imports: [CacheModule],
 * })
 * export class AppModule {}
 *
 * // En un servicio
 * @Injectable()
 * class UserService {
 *   @Cacheable({ key: 'user:{0}', ttl: 300 })
 *   async getUser(id: string) { ... }
 *
 *   @CacheInvalidate({ keys: ['user:{0}', 'users:list'] })
 *   async updateUser(id: string, data: UpdateDto) { ... }
 * }
 */

import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheService } from './cache.service';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { RedisModule } from '../core/redis/redis.module';

@Global()
@Module({
  imports: [RedisModule],
  providers: [
    CacheService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
  exports: [CacheService],
})
export class CacheModule {}
