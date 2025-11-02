import { Logger } from '@nestjs/common';
const logger = new Logger('CacheModule');
import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import { createClient } from 'redis';

/**
 * Cache Module Global
 *
 * Configuración de Redis para cache de alto rendimiento:
 * - Usa Redis si está disponible (REDIS_URL en .env)
 * - Fallback a memoria si Redis no está disponible (desarrollo)
 * - TTL default: 5 minutos (300 segundos)
 * - Max items: 1000 (en memoria)
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
      useFactory: async () => {
        const redisUrl = process.env.REDIS_URL;
        const isProduction = process.env.NODE_ENV === 'production';

        // Configuración de Redis si está disponible
        if (redisUrl) {
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
            logger.error(error instanceof Error ? error.message : String(error));
            // Fallback a memoria
          }
        }

        // Fallback: Cache en memoria (desarrollo o si Redis falla)
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
