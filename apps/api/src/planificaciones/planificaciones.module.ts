import { Module } from '@nestjs/common';
import { PlanificacionesController } from './planificaciones.controller';
import { PlanificacionesService } from './planificaciones.service';
import { DatabaseModule } from '../core/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PlanificacionesController],
  providers: [PlanificacionesService],
  exports: [PlanificacionesService],
})
export class PlanificacionesModule {}
