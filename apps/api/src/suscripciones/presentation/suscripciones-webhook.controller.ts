/**
 * Controller para webhooks de suscripciones (MercadoPago PreApproval)
 *
 * Endpoint: POST /webhooks/preapproval
 *
 * REGLAS:
 * - SIEMPRE responder 200 a MercadoPago (para evitar reintentos)
 * - Validar firma con MercadoPagoWebhookGuard
 * - Encolar para procesamiento async (BullMQ)
 */
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
  Req,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Request } from 'express';

import { MercadoPagoWebhookGuard } from '../../pagos/guards/mercadopago-webhook.guard';
import { PreApprovalWebhookPayload } from '../types/preapproval.types';
import { Public } from '../../auth/decorators/public.decorator';
import {
  WEBHOOK_PREAPPROVAL_QUEUE,
  WebhookJobData,
  WEBHOOK_JOB_OPTIONS,
} from '../jobs/webhook-preapproval.queue';
import { getCorrelationId } from '../../common/middleware/correlation-id.middleware';
import { MercadoPagoPreApprovalClientService } from '../services/mercadopago-preapproval-client.service';

/**
 * Acciones posibles en respuesta a un webhook
 * - queued: Encolado para procesamiento async
 * - error: Error al encolar (pero responde 200 igual)
 */
type WebhookResponseAction = 'queued' | 'error';

/**
 * Respuesta del endpoint de webhook
 */
interface WebhookResponse {
  /** Indica que el webhook fue recibido */
  received: boolean;
  /** Acción tomada */
  action?: WebhookResponseAction;
  /** Mensaje adicional */
  message?: string;
}

@Controller('webhooks')
export class SuscripcionesWebhookController {
  private readonly logger = new Logger(SuscripcionesWebhookController.name);

  constructor(
    @InjectQueue(WEBHOOK_PREAPPROVAL_QUEUE)
    private readonly webhookQueue: Queue<WebhookJobData>,
    private readonly mpClientService: MercadoPagoPreApprovalClientService,
  ) {}

  /**
   * Recibe webhooks de subscription_preapproval de MercadoPago
   *
   * IMPORTANTE:
   * - Este endpoint es público (sin auth JWT)
   * - Validado por MercadoPagoWebhookGuard (firma HMAC + IP whitelist)
   * - SIEMPRE responde 200 para evitar reintentos de MP
   * - Encola para procesamiento async (no bloquea respuesta a MP)
   */
  @Post('preapproval')
  @Public()
  @UseGuards(MercadoPagoWebhookGuard)
  @HttpCode(HttpStatus.OK)
  async handlePreapprovalWebhook(
    @Body() payload: PreApprovalWebhookPayload,
    @Req() req: Request,
  ): Promise<WebhookResponse> {
    const correlationId = getCorrelationId(req) ?? payload.id;

    this.logger.log(
      `📥 Webhook recibido: type=${payload.type}, action=${payload.action}, ` +
        `data.id=${payload.data.id}, correlationId=${correlationId}`,
    );

    try {
      // Obtener detalle del preapproval desde la API de MP
      const detail = await this.mpClientService.get(payload.data.id);

      if (!detail) {
        this.logger.error(
          `❌ No se pudo obtener detalle del preapproval: ${payload.data.id}`,
        );
        // Responder 200 de todas formas para que MP no reintente
        return {
          received: true,
          action: 'error',
          message: 'No se pudo obtener detalle del preapproval',
        };
      }

      // Encolar para procesamiento async
      const jobData: WebhookJobData = {
        payload,
        detail,
        correlationId,
        receivedAt: new Date().toISOString(),
      };

      const job = await this.webhookQueue.add(
        `preapproval-${payload.data.id}`,
        jobData,
        WEBHOOK_JOB_OPTIONS,
      );

      this.logger.log(
        `📤 Webhook encolado: jobId=${job.id}, correlationId=${correlationId}`,
      );

      return {
        received: true,
        action: 'queued',
        message: `Webhook encolado para procesamiento async (jobId: ${job.id})`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `❌ Error encolando webhook: ${errorMessage}, correlationId=${correlationId}`,
      );

      // SIEMPRE responder 200 para que MP no reintente
      return {
        received: true,
        action: 'error',
        message: `Error interno: ${errorMessage}`,
      };
    }
  }
}
