import { Module } from '@nestjs/common';
import { GamificacionController } from './gamificacion.controller';
import { GamificacionService } from './gamificacion.service';
import { PuntosService } from './puntos.service';
import { LogrosService } from './logros.service';
import { RankingService } from './ranking.service';
import { PrismaService } from '../core/database/prisma.service';

@Module({
  controllers: [GamificacionController],
  providers: [
    GamificacionService,
    PuntosService,
    LogrosService,
    RankingService,
    PrismaService,
  ],
  exports: [GamificacionService, PuntosService, LogrosService, RankingService],
})
export class GamificacionModule {}
