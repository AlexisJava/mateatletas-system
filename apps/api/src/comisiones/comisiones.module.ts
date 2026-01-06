import { Module } from '@nestjs/common';
import { ComisionesController } from './comisiones.controller';
import { ComisionLiveService } from './services/comision-live.service';
import { PrismaService } from '../core/database/prisma.service';

/**
 * Módulo para gestionar comisiones (cursos temporales)
 * Incluye funcionalidad de clases en vivo vía LiveKit
 */
@Module({
  controllers: [ComisionesController],
  providers: [ComisionLiveService, PrismaService],
  exports: [ComisionLiveService],
})
export class ComisionesModule {}
