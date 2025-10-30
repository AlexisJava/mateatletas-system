import { Module } from '@nestjs/common';
import { DatabaseModule } from '../core/database/database.module';
import { TiendaModule } from '../tienda/tienda.module';
import { GamificacionModule } from '../gamificacion/gamificacion.module';
import { PlanificacionesSimplesController } from './planificaciones-simples.controller';
import { PlanificacionesSimplesService } from './planificaciones-simples.service';
import { ProgresoActividadController } from './progreso-actividad.controller';
import { ProgresoActividadService } from './progreso-actividad.service';

@Module({
  imports: [DatabaseModule, TiendaModule, GamificacionModule],
  controllers: [PlanificacionesSimplesController, ProgresoActividadController],
  providers: [PlanificacionesSimplesService, ProgresoActividadService],
  exports: [PlanificacionesSimplesService, ProgresoActividadService],
})
export class PlanificacionesSimplesModule {}
