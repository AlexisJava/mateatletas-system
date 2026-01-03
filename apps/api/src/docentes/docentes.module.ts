import { Module } from '@nestjs/common';
import { DocentesController } from './docentes.controller';
import { DocentesService } from './docentes.service';
import { PrismaService } from '../core/database/prisma.service';

// CQRS Services
import { DocenteBusinessValidator } from './validators/docente-business.validator';
import { DocenteQueryService } from './services/docente-query.service';
import { DocenteCommandService } from './services/docente-command.service';
import { DocenteStatsService } from './services/docente-stats.service';
import { DocentesFacade } from './services/docentes-facade.service';
import { DocentePlanificacionesService } from './services/docente-planificaciones.service';
import { DocenteComisionQueriesService } from './services/docente-comision-queries.service';

@Module({
  controllers: [DocentesController],
  providers: [
    DocentesService,
    PrismaService,
    // CQRS services
    DocenteBusinessValidator,
    DocenteQueryService,
    DocenteCommandService,
    DocenteStatsService,
    DocentesFacade,
    // Planificaciones
    DocentePlanificacionesService,
    // Comisión Queries
    DocenteComisionQueriesService,
  ],
  exports: [DocentesService], // Exportar para uso en AuthService
})
export class DocentesModule {}
