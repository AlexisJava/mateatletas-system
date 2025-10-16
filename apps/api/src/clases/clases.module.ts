import { Module } from '@nestjs/common';
import { ClasesController } from './clases.controller';
import { ClasesService } from './clases.service';
import { ClasesManagementService } from './services/clases-management.service';
import { ClasesReservasService } from './services/clases-reservas.service';
import { ClasesAsistenciaService } from './services/clases-asistencia.service';
import { DatabaseModule } from '../core/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ClasesController],
  providers: [
    ClasesService,
    ClasesManagementService,
    ClasesReservasService,
    ClasesAsistenciaService,
  ],
  exports: [ClasesService],
})
export class ClasesModule {}
