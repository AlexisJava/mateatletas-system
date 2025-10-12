import { Module } from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { EquiposController } from './equipos.controller';

/**
 * Módulo de Equipos
 * Gestiona todo lo relacionado con los equipos de gamificación
 * PrismaService está disponible globalmente a través de DatabaseModule
 *
 * Características:
 * - CRUD completo de equipos
 * - Estadísticas y rankings
 * - Recalcular puntos desde estudiantes
 * - Validación de nombres únicos
 * - Relaciones con estudiantes
 */
@Module({
  controllers: [EquiposController],
  providers: [EquiposService],
  exports: [EquiposService], // Exportar para usar en otros módulos si es necesario
})
export class EquiposModule {}
