import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { DatabaseModule } from '../core/database/database.module';
import { RedisModule } from '../core/redis/redis.module';
import { CacheModule } from '../cache/cache.module';
import {
  RedisHealthIndicator,
  CacheHealthIndicator,
  ThrottlerHealthIndicator,
} from './indicators';

/**
 * Health Module
 *
 * Módulo para health checks del sistema.
 * Usa @nestjs/terminus para verificar:
 * - Base de datos (Prisma)
 * - Redis
 * - Cache (L1 + L2)
 * - Throttler (Rate Limiting)
 * - Memory
 */
@Module({
  imports: [
    TerminusModule,
    DatabaseModule, // Para PrismaService
    RedisModule, // Para RedisService
    CacheModule, // Para CacheService
  ],
  controllers: [HealthController],
  providers: [
    RedisHealthIndicator,
    CacheHealthIndicator,
    ThrottlerHealthIndicator,
  ],
})
export class HealthModule {}
