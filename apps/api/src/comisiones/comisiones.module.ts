import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ComisionesController } from './comisiones.controller';
import { ComisionLiveService } from './services/comision-live.service';
import { ClaseEstadoCronService } from './services/clase-estado-cron.service';
import { PrismaService } from '../core/database/prisma.service';

/**
 * Módulo para gestionar comisiones (cursos temporales)
 * Incluye funcionalidad de clases en vivo vía LiveKit
 * Cron job para reiniciar clases finalizadas automáticamente (12h)
 */
@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [ComisionesController],
  providers: [ComisionLiveService, ClaseEstadoCronService, PrismaService],
  exports: [ComisionLiveService],
})
export class ComisionesModule {}
