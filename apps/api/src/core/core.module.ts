import { Global, Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';

/**
 * CoreModule
 *
 * Módulo global que agrupa la configuración base y acceso a datos.
 *
 * Responsabilidades:
 * - Configuración de variables de entorno (ConfigModule)
 * - Conexión a base de datos (PrismaService)
 * - Caching con Redis (RedisService) - Sprint 3 PASO 3.1
 *
 * Patrón: Global Module
 * Beneficio: Disponible en toda la app sin necesidad de importar
 */
@Global()
@Module({
  imports: [
    AppConfigModule, // Variables de entorno
    DatabaseModule, // Prisma + PostgreSQL
    RedisModule, // Redis para caching (Sprint 3 - PASO 3.1)
  ],
  exports: [AppConfigModule, DatabaseModule, RedisModule],
})
export class CoreModule {}
