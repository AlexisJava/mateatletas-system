import { Module } from '@nestjs/common';
import { TutorController } from './tutor.controller';
import { TutorNotificacionesController } from './tutor-notificaciones.controller';
import { TutorVeranoController } from './tutor-verano.controller';
import { TutorService } from './tutor.service';
import { PagosModule } from '../pagos/pagos.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { PrismaService } from '../core/database/prisma.service';

// 🆕 CQRS Services
import { TutorBusinessValidator } from './validators/tutor-business.validator';
import { TutorQueryService } from './services/tutor-query.service';
import { TutorStatsService } from './services/tutor-stats.service';
import { TutorFacade } from './services/tutor-facade.service';

// Verano Services (CQRS)
import { VeranoQueryService } from './services/verano-query.service';
import { VeranoCommandService } from './services/verano-command.service';
import { VeranoCronService } from './services/verano-cron.service';

@Module({
  imports: [PagosModule, NotificacionesModule],
  controllers: [
    TutorController,
    TutorNotificacionesController,
    TutorVeranoController,
  ],
  providers: [
    TutorService,
    PrismaService,
    // 🆕 CQRS services
    TutorBusinessValidator,
    TutorQueryService,
    TutorStatsService,
    TutorFacade,
    // Verano services
    VeranoQueryService,
    VeranoCommandService,
    VeranoCronService,
  ],
  exports: [TutorService, VeranoQueryService],
})
export class TutorModule {}
