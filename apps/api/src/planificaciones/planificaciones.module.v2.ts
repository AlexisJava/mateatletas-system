import { Module } from '@nestjs/common';
import { DatabaseModule } from '../core/database/database.module';

// Infrastructure
import { PlanificacionesV2Controller } from './infrastructure/planificaciones-v2.controller';
import { PrismaPlanificacionRepository } from './infrastructure/prisma-planificacion.repository';

// Application (Use Cases)
import { GetPlanificacionesUseCase } from './application/use-cases/get-planificaciones.use-case';
import { CreatePlanificacionUseCase } from './application/use-cases/create-planificacion.use-case';

// Legacy (to be deprecated)
import { PlanificacionesController } from './planificaciones.controller';
import { PlanificacionesService } from './planificaciones.service';

/**
 * Planificaciones Module V2
 *
 * Implements Clean Architecture:
 * - Domain layer: entities + repository interfaces
 * - Application layer: use cases + DTOs
 * - Infrastructure layer: controllers + prisma repositories
 *
 * Legacy controller/service are kept temporarily for backwards compatibility.
 */
@Module({
  imports: [DatabaseModule],
  controllers: [
    PlanificacionesV2Controller, // New clean architecture controller
    PlanificacionesController, // Legacy (will be removed)
  ],
  providers: [
    // Repository implementation
    PrismaPlanificacionRepository,
    {
      provide: 'IPlanificacionRepository',
      useExisting: PrismaPlanificacionRepository,
    },

    // Use Cases
    GetPlanificacionesUseCase,
    CreatePlanificacionUseCase, // NEW for SLICE 2

    // Legacy service (will be removed)
    PlanificacionesService,
  ],
  exports: [
    'IPlanificacionRepository',
    GetPlanificacionesUseCase,
    CreatePlanificacionUseCase,
    PlanificacionesService, // Legacy export
  ],
})
export class PlanificacionesModuleV2 {}
