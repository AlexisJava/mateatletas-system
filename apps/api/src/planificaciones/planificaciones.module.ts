import { Module } from '@nestjs/common';
import { DatabaseModule } from '../core/database/database.module';

// Infrastructure
import { PlanificacionesController } from './infrastructure/planificaciones.controller';
import { GruposController } from './infrastructure/grupos.controller';
import { PrismaPlanificacionRepository } from './infrastructure/prisma-planificacion.repository';

// Application (Use Cases)
import { GetPlanificacionesUseCase } from './application/use-cases/get-planificaciones.use-case';
import { CreatePlanificacionUseCase } from './application/use-cases/create-planificacion.use-case';
import { GetPlanificacionByIdUseCase } from './application/use-cases/get-planificacion-by-id.use-case';
import { UpdatePlanificacionUseCase } from './application/use-cases/update-planificacion.use-case';
import { DeletePlanificacionUseCase } from './application/use-cases/delete-planificacion.use-case';
import { AddActividadToPlanificacionUseCase } from './application/use-cases/add-actividad-to-planificacion.use-case';
import { UpdateActividadUseCase } from './application/use-cases/update-actividad.use-case';
import { DeleteActividadUseCase } from './application/use-cases/delete-actividad.use-case';

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
    GetPlanificacionByIdUseCase,
    UpdatePlanificacionUseCase,
    DeletePlanificacionUseCase,
    AddActividadToPlanificacionUseCase,
    UpdateActividadUseCase,
    DeleteActividadUseCase,
  ],
  exports: [
    'IPlanificacionRepository',
    GetPlanificacionesUseCase,
    CreatePlanificacionUseCase,
    GetPlanificacionByIdUseCase,
    UpdatePlanificacionUseCase,
    DeletePlanificacionUseCase,
    AddActividadToPlanificacionUseCase,
    UpdateActividadUseCase,
    DeleteActividadUseCase,
  ],
})
export class PlanificacionesModule {}
