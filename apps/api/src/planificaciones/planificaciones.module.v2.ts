import { Module } from '@nestjs/common';
import { DatabaseModule } from '../core/database/database.module';

// Infrastructure
import { PlanificacionesController } from './infrastructure/planificaciones.controller';
import { GruposController } from './infrastructure/grupos.controller';
import { PrismaPlanificacionRepository } from './infrastructure/prisma-planificacion.repository';

// Application (Use Cases)
import { GetPlanificacionesUseCase } from './application/use-cases/get-planificaciones.use-case';
import { CreatePlanificacionUseCase } from './application/use-cases/create-planificacion.use-case';

/**
 * Planificaciones Module (Clean Architecture)
 *
 * Implements Clean Architecture:
 * - Domain layer: entities + repository interfaces
 * - Application layer: use cases + DTOs
 * - Infrastructure layer: controllers + prisma repositories
 *
 * SLICE 1: GET /planificaciones (listar con filtros)
 * SLICE 2: POST /planificaciones (crear planificación)
 */
@Module({
  imports: [DatabaseModule],
  controllers: [
    PlanificacionesController, // Clean Architecture controller
    GruposController, // Grupos pedagógicos endpoint
  ],
  providers: [
    // Repository implementation
    PrismaPlanificacionRepository,
    {
      provide: 'IPlanificacionRepository',
      useExisting: PrismaPlanificacionRepository,
    },

    // Use Cases
    GetPlanificacionesUseCase, // SLICE 1
    CreatePlanificacionUseCase, // SLICE 2
  ],
  exports: [
    'IPlanificacionRepository',
    GetPlanificacionesUseCase,
    CreatePlanificacionUseCase,
  ],
})
export class PlanificacionesModuleV2 {}
