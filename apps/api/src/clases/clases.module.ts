import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ClasesController } from './clases.controller';
import { ClaseGrupoController } from './clase-grupo.controller';
import { ClasesService } from './clases.service';
import { ClasesReservasService } from './services/clases-reservas.service';
import { ClasesAsistenciaService } from './services/clases-asistencia.service';
import { GruposService } from './services/grupos.service';

// 🆕 Nuevos servicios CQRS + Facade
import { ClaseBusinessValidator } from './validators/clase-business.validator';
import { ClaseQueryService } from './services/clase-query.service';
import { ClaseCommandService } from './services/clase-command.service';
import { ClaseStatsService } from './services/clase-stats.service';
import { ClasesManagementFacade } from './services/clases-management-facade.service';

import { DatabaseModule } from '../core/database/database.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    DatabaseModule,
    NotificacionesModule,
    CacheModule.register({
      ttl: 600000, // 10 minutos para rutas curriculares
    }),
  ],
  controllers: [ClasesController, ClaseGrupoController],
  providers: [
    // Servicios principales
    ClasesService,
    GruposService,

    // Servicios ya refactorizados
    ClasesReservasService,
    ClasesAsistenciaService,

    // 🆕 Nuevos servicios CQRS + Facade
    ClaseBusinessValidator,
    ClaseQueryService,
    ClaseCommandService,
    ClaseStatsService,
    ClasesManagementFacade,
  ],
  exports: [ClasesService, ClasesManagementFacade],
})
export class ClasesModule {}
