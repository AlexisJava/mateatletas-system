import { Module } from '@nestjs/common';
import { PlanificacionesSimplesController } from './planificaciones-simples.controller';
import { PlanificacionesSimplesService } from './planificaciones-simples.service';

@Module({
  controllers: [PlanificacionesSimplesController],
  providers: [PlanificacionesSimplesService],
  exports: [PlanificacionesSimplesService],
})
export class PlanificacionesSimplesModule {}
