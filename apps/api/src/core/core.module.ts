import { Global, Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';

/**
 * CoreModule
 *
 * Módulo global que agrupa la configuración base y acceso a base de datos.
 *
 * Responsabilidades:
 * - Configuración de variables de entorno (ConfigModule)
 * - Conexión a base de datos (PrismaService)
 *
 * Patrón: Global Module
 * Beneficio: Disponible en toda la app sin necesidad de importar
 */
@Global()
@Module({
  imports: [
    AppConfigModule, // Variables de entorno
    DatabaseModule,  // Prisma + PostgreSQL
  ],
  exports: [AppConfigModule, DatabaseModule],
})
export class CoreModule {}
