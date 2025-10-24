import { Module } from '@nestjs/common';
import { DatabaseModule } from '../core/database/database.module';

// Infrastructure
import { PlanificacionesControllerV2 } from './infrastructure/planificaciones.controller.v2';
import { PrismaPlanificacionRepository } from './infrastructure/prisma-planificacion.repository';

// Application (Use Cases)
import { GetPlanificacionesUseCase } from './application/use-cases/get-planificaciones.use-case';

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
    PlanificacionesControllerV2, // New clean architecture controller
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

    // Legacy service (will be removed)
    PlanificacionesService,
  ],
  exports: [
    'IPlanificacionRepository',
    GetPlanificacionesUseCase,
    PlanificacionesService, // Legacy export
  ],
})
export class PlanificacionesModuleV2 {}
