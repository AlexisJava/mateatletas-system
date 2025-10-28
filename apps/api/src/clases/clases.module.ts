import { Module } from '@nestjs/common';
import { ClasesController } from './clases.controller';
import { ClaseGrupoController } from './clase-grupo.controller';
import { ClasesService } from './clases.service';
import { ClasesManagementService } from './services/clases-management.service';
import { ClasesReservasService } from './services/clases-reservas.service';
import { ClasesAsistenciaService } from './services/clases-asistencia.service';
import { GruposService } from './services/grupos.service';
import { DatabaseModule } from '../core/database/database.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [DatabaseModule, NotificacionesModule],
  controllers: [ClasesController, ClaseGrupoController],
  providers: [
    ClasesService,
    ClasesManagementService,
    ClasesReservasService,
    ClasesAsistenciaService,
    GruposService,
  ],
  exports: [ClasesService],
})
export class ClasesModule {}
