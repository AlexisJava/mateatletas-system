import { Logger } from '@nestjs/common';
const logger = new Logger('CacheModule');
import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import { createClient } from 'redis';
import { FEATURE_FLAGS } from '../../feature-flags/feature-flags.constants';

/**
 * Cache Module Global
 *
 * Configuración de Redis para cache de alto rendimiento:
 * - Usa Redis si está disponible (REDIS_URL en .env)
 * - Fallback a memoria si Redis no está disponible (desarrollo)
 * - TTL default: 5 minutos (300 segundos)
 * - Max items: 1000 (en memoria)
 *
 * Feature Flags:
 * - FEATURE_CACHE_ENABLED=false → Deshabilita cache completamente
 * - FEATURE_CACHE_REDIS_ENABLED=false → Fuerza uso de memoria
 *
 * Endpoints que se benefician de cache:
 * - GET /api/catalogo (productos)
 * - GET /api/clases/rutas-curriculares
 * - GET /api/gamificacion/ranking
 * - GET /api/admin/stats (dashboard)
 */
@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';

        // Feature flags - default true, solo false si explícitamente 'false'
        const cacheEnabled =
          configService
            .get<string>(FEATURE_FLAGS.CACHE_ENABLED)
            ?.toLowerCase() !== 'false';
        const cacheRedisEnabled =
          configService
            .get<string>(FEATURE_FLAGS.CACHE_REDIS_ENABLED)
            ?.toLowerCase() !== 'false';

        // Si cache está deshabilitado, retornar config mínima (TTL muy bajo)
        if (!cacheEnabled) {
          logger.warn('⚠️  Cache DESHABILITADO por feature flag');
          return {
            ttl: 0, // No cachear
            max: 1,
            isGlobal: true,
          };
        }

        // Configuración de Redis si está disponible Y habilitado por feature flag
        if (redisUrl && cacheRedisEnabled) {
          try {
            // Crear cliente Redis con logging de eventos
            const redisClient = createClient({ url: redisUrl });

            // Event handlers para monitoreo
            redisClient.on('error', (err: Error) => {
              logger.error('❌ Redis connection error:', err.message);
            });

            redisClient.on('connect', () => {
              logger.log('✅ Redis connected successfully');
            });

            redisClient.on('reconnecting', () => {
              logger.warn('🔄 Redis reconnecting...');
            });

            redisClient.on('ready', () => {
              logger.log('🚀 Redis ready to accept commands');
            });

            // Conectar al cliente
            await redisClient.connect();

            const keyv = new Keyv({
              store: new KeyvRedis(redisClient),
            });

            // Log de éxito
            logger.log('💾 Cache configurado con Redis');

            return {
              store: keyv,
              ttl: 300000, // 5 minutos (en milisegundos)
              isGlobal: true,
            };
          } catch (error) {
            logger.warn('⚠️  Redis no disponible, usando cache en memoria');
            logger.error(
              error instanceof Error ? error.message : String(error),
            );
            // Fallback a memoria
          }
        }

        // Log si Redis está deshabilitado por feature flag
        if (redisUrl && !cacheRedisEnabled) {
          logger.warn(
            '⚠️  Redis DESHABILITADO por feature flag, usando memoria',
          );
        }

        // Fallback: Cache en memoria (desarrollo o si Redis falla/deshabilitado)
        logger.log(
          `🗄️  Cache en memoria (${isProduction ? 'Redis no configurado' : 'modo desarrollo'})`,
        );
        return {
          ttl: 300, // 5 minutos (en segundos para cache en memoria)
          max: 1000, // Máximo 1000 items en memoria
          isGlobal: true,
        };
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheConfigModule {}
