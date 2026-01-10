import { Module } from '@nestjs/common';
import { LogrosService } from './services/logros.service';
import { RecursosService } from './services/recursos.service';
import { RachaService } from './services/racha.service';
import { VerificadorLogrosService } from './services/verificador-logros.service';
import { LogrosController } from './controllers/logros.controller';
import { RecursosController } from './controllers/recursos.controller';
import { GamificacionController } from './gamificacion.controller';
import { GamificacionService } from './gamificacion.service';
import { PuntosService } from './puntos.service';
import { LogrosService as LogrosServiceLegacy } from './logros.service';
import { RankingService } from './ranking.service';
import { PrismaService } from '../core/database/prisma.service';
import { AuthEventsListener } from './listeners/auth-events.listener';
import { AulaEventsListener } from './listeners/aula-events.listener';

@Module({
  controllers: [LogrosController, RecursosController, GamificacionController],
  providers: [
    LogrosService,
    RecursosService,
    RachaService,
    VerificadorLogrosService,
    PrismaService,
    // Servicios para GamificacionController
    GamificacionService,
    PuntosService,
    LogrosServiceLegacy,
    RankingService,
    // Event Listeners
    AuthEventsListener,
    AulaEventsListener,
  ],
  exports: [
    LogrosService,
    RecursosService,
    RachaService,
    VerificadorLogrosService,
    GamificacionService,
    PuntosService,
  ],
})
export class GamificacionModule {}
