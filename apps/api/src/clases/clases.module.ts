import { Module } from '@nestjs/common';
import { ClasesController } from './clases.controller';
import { ClaseGrupoController } from './clase-grupo.controller';
import { ClasesService } from './clases.service';
import { ClasesManagementService } from './services/clases-management.service';
import { ClasesReservasService } from './services/clases-reservas.service';
import { ClasesAsistenciaService } from './services/clases-asistencia.service';
import { DatabaseModule } from '../core/database/database.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { PlanificacionesModule } from '../planificaciones/planificaciones.module';

@Module({
  imports: [DatabaseModule, NotificacionesModule, PlanificacionesModule],
  controllers: [ClasesController, ClaseGrupoController],
  providers: [
    ClasesService,
    ClasesManagementService,
    ClasesReservasService,
    ClasesAsistenciaService,
  ],
  exports: [ClasesService],
})
export class ClasesModule {}
