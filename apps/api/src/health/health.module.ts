import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { DatabaseModule } from '../core/database/database.module';

/**
 * Health Module
 *
 * Módulo para health checks del sistema
 * Usa @nestjs/terminus para verificar:
 * - Base de datos
 * - Estado del proceso
 */
@Module({
  imports: [
    TerminusModule,
    DatabaseModule, // Para PrismaService
  ],
  controllers: [HealthController],
})
export class HealthModule {}
