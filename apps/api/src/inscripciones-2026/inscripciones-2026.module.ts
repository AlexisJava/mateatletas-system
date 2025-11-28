import { Module, forwardRef } from '@nestjs/common';
import { Inscripciones2026Controller } from './inscripciones-2026.controller';
import { Inscripciones2026Service } from './inscripciones-2026.service';
import { InscripcionOwnershipGuard } from './guards/inscripcion-ownership.guard';
import { WebhookRateLimitGuard } from './guards/webhook-rate-limit.guard';
import { DatabaseModule } from '../core/database/database.module';
import { PagosModule } from '../pagos/pagos.module';
import { WebhookQueueModule } from '../queues/webhook-queue.module';
import {
  ValidarInscripcionUseCase,
  ProcesarWebhookInscripcionUseCase,
} from './use-cases';

@Module({
  imports: [DatabaseModule, PagosModule, forwardRef(() => WebhookQueueModule)],
  controllers: [Inscripciones2026Controller],
  providers: [
    // Use-cases
    ValidarInscripcionUseCase,
    ProcesarWebhookInscripcionUseCase,
    // Service (facade)
    Inscripciones2026Service,
    // Guards
    InscripcionOwnershipGuard,
    WebhookRateLimitGuard,
  ],
  exports: [Inscripciones2026Service],
})
export class Inscripciones2026Module {}
