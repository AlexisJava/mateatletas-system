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

// Refactored stats services (split from DocenteStatsService)
import { DocenteDashboardQueriesService } from './services/docente-dashboard-queries.service';
import { DocenteEstudiantesStatsService } from './services/docente-estudiantes-stats.service';
import { DocenteCalendarioQueriesService } from './services/docente-calendario-queries.service';
import { DocenteDashboardGraphsService } from './services/docente-dashboard-graphs.service';

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
    // Refactored stats services (delegated from DocenteStatsService)
    DocenteDashboardQueriesService,
    DocenteEstudiantesStatsService,
    DocenteCalendarioQueriesService,
    DocenteDashboardGraphsService,
  ],
  exports: [DocentesService], // Exportar para uso en AuthService
})
export class DocentesModule {}
