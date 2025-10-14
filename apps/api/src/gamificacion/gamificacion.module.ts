import { Module } from '@nestjs/common';
import { GamificacionController } from './gamificacion.controller';
import { GamificacionService } from './gamificacion.service';
import { PrismaService } from '../core/database/prisma.service';

@Module({
  controllers: [GamificacionController],
  providers: [GamificacionService, PrismaService],
  exports: [GamificacionService],
})
export class GamificacionModule {}
