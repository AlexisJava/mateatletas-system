import { Module } from '@nestjs/common';
import { LogrosService } from './services/logros.service';
import { RecursosService } from './services/recursos.service';
import { RachaService } from './services/racha.service';
import { VerificadorLogrosService } from './services/verificador-logros.service';
import { LogrosController } from './controllers/logros.controller';
import { RecursosController } from './controllers/recursos.controller';
import { PrismaService } from '../core/database/prisma.service';
import { AuthEventsListener } from './listeners/auth-events.listener';

@Module({
  controllers: [LogrosController, RecursosController],
  providers: [
    LogrosService,
    RecursosService,
    RachaService,
    VerificadorLogrosService,
    PrismaService,
    // Event Listeners
    AuthEventsListener,
  ],
  exports: [
    LogrosService,
    RecursosService,
    RachaService,
    VerificadorLogrosService,
  ],
})
export class GamificacionModule {}
