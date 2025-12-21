/**
 * SuscripcionesModule - Gestión de suscripciones recurrentes con MercadoPago
 *
 * Responsabilidades:
 * - Crear/Cancelar suscripciones (PreApproval)
 * - Procesar webhooks de MercadoPago (async con BullMQ)
 * - Verificar acceso de tutores/estudiantes
 * - Manejar estados de suscripción (ACTIVA, EN_GRACIA, MOROSA, etc.)
 *
 * REGLA DE NEGOCIO: Las suscripciones NO SE PAUSAN.
 * Si el tutor no paga, se cancela. Si quiere volver, crea una nueva.
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';

// Controllers
import { SuscripcionesWebhookController } from './presentation/suscripciones-webhook.controller';

// Services
import { PreapprovalService } from './services/preapproval.service';
import { PreapprovalWebhookService } from './services/preapproval-webhook.service';
import { SuscripcionAccesoService } from './services/suscripcion-acceso.service';
import { MercadoPagoPreApprovalClientService } from './services/mercadopago-preapproval-client.service';
import { GracePeriodService } from './services/grace-period.service';
import { SuscripcionStateTransitionService } from './services/suscripcion-state-transition.service';

// Jobs (BullMQ)
import { WEBHOOK_PREAPPROVAL_QUEUE } from './jobs/webhook-preapproval.queue';
import { WebhookPreapprovalProcessor } from './jobs/webhook-preapproval.processor';

// Shared Dependencies (from other modules)
import { PrismaService } from '../core/database/prisma.service';
import { WebhookIdempotencyService } from '../pagos/services/webhook-idempotency.service';
import { MercadoPagoWebhookGuard } from '../pagos/guards/mercadopago-webhook.guard';
import { MercadoPagoIpWhitelistService } from '../pagos/services/mercadopago-ip-whitelist.service';

@Module({
  imports: [
    ConfigModule,
    EventEmitterModule.forRoot(), // Para eventos de dominio

    // BullMQ para procesamiento async de webhooks
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: WEBHOOK_PREAPPROVAL_QUEUE,
    }),
  ],
  controllers: [SuscripcionesWebhookController],
  providers: [
    // Servicios propios del módulo
    PreapprovalService,
    PreapprovalWebhookService,
    SuscripcionAccesoService,
    MercadoPagoPreApprovalClientService,
    GracePeriodService,
    SuscripcionStateTransitionService,

    // Processors (BullMQ)
    WebhookPreapprovalProcessor,

    // Dependencias compartidas (idealmente serían imports de módulos)
    PrismaService,
    WebhookIdempotencyService,
    MercadoPagoWebhookGuard,
    MercadoPagoIpWhitelistService,
  ],
  exports: [
    // Exportar servicios para uso en otros módulos
    PreapprovalService,
    PreapprovalWebhookService,
    SuscripcionAccesoService,
  ],
})
export class SuscripcionesModule {}
