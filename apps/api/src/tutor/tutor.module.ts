import { Module } from '@nestjs/common';
import { TutorController } from './tutor.controller';
import { TutorService } from './tutor.service';
import { PagosModule } from '../pagos/pagos.module';
import { PrismaService } from '../core/database/prisma.service';

// 🆕 CQRS Services
import { TutorBusinessValidator } from './validators/tutor-business.validator';
import { TutorQueryService } from './services/tutor-query.service';
import { TutorStatsService } from './services/tutor-stats.service';
import { TutorFacade } from './services/tutor-facade.service';

@Module({
  imports: [PagosModule],
  controllers: [TutorController],
  providers: [
    TutorService,
    PrismaService,
    // 🆕 CQRS services
    TutorBusinessValidator,
    TutorQueryService,
    TutorStatsService,
    TutorFacade,
  ],
  exports: [TutorService],
})
export class TutorModule {}
