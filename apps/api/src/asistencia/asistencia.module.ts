import { Module } from '@nestjs/common';
import { AsistenciaController } from './asistencia.controller';
import { AsistenciaService } from './asistencia.service';
import { AsistenciaReportesService } from './asistencia-reportes.service';
import { DatabaseModule } from '../core/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AsistenciaController],
  providers: [AsistenciaService, AsistenciaReportesService],
  exports: [AsistenciaService, AsistenciaReportesService],
})
export class AsistenciaModule {}
