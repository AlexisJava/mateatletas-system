import { Module } from '@nestjs/common';
import { LogrosService } from './services/logros.service';
import { RecursosService } from './services/recursos.service';
import { RachaService } from './services/racha.service';
import { VerificadorLogrosService } from './services/verificador-logros.service';
import { TiendaService } from './services/tienda.service';
import { LogrosController } from './controllers/logros.controller';
import { RecursosController } from './controllers/recursos.controller';
import { TiendaController } from './controllers/tienda.controller';
import { PrismaService } from '../core/database/prisma.service';

@Module({
  controllers: [LogrosController, RecursosController, TiendaController],
  providers: [
    LogrosService,
    RecursosService,
    RachaService,
    VerificadorLogrosService,
    TiendaService,
    PrismaService,
  ],
  exports: [
    LogrosService,
    RecursosService,
    RachaService,
    VerificadorLogrosService,
    TiendaService,
  ],
})
export class GamificacionModule {}
