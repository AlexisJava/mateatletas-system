/**
 * PreapprovalWebhookService - Orquestador de webhooks de MercadoPago PreApproval
 *
 * RESPONSABILIDADES:
 * - Procesar webhooks de subscription_preapproval
 * - Verificar idempotencia
 * - Delegar transiciones a servicios especializados
 * - Emitir eventos DESPUÉS del commit exitoso
 *
 * REGLA DE NEGOCIO: Las suscripciones NO SE PAUSAN.
 * Si el tutor no paga, se cancela. Si quiere volver, crea una nueva.
 *
 * PATRÓN: Orquestador + Servicios especializados
 * - Este servicio NO tiene lógica de transiciones
 * - Delega a SuscripcionStateTransitionService y GracePeriodService
 */
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { PrismaService } from '../../core/database/prisma.service';
import { WebhookIdempotencyService } from '../../pagos/services/webhook-idempotency.service';
import { assertNever } from '../../common/utils/assert-never';
import {
  PreApprovalWebhookPayload,
  PreApprovalDetail,
  ProcessWebhookResult,
} from '../types/preapproval.types';
import {
  SuscripcionStateTransitionService,
  PendingEvent,
} from './suscripcion-state-transition.service';
import { GracePeriodService } from './grace-period.service';

@Injectable()
export class PreapprovalWebhookService {
  private readonly logger = new Logger(PreapprovalWebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly idempotencyService: WebhookIdempotencyService,
    private readonly stateTransitionService: SuscripcionStateTransitionService,
    private readonly gracePeriodService: GracePeriodService,
  ) {}

  /**
   * Procesa un webhook de subscription_preapproval de MercadoPago
   *
   * Flujo:
   * 1. Verificar idempotencia (fuera de transacción)
   * 2. Buscar suscripción (fuera de transacción)
   * 3. Delegar a servicio especializado según estado
   * 4. DESPUÉS DEL COMMIT: Emitir evento
   *
   * @param payload - Payload del webhook
   * @param detail - Detalle del preapproval obtenido de la API de MP
   * @returns Resultado del procesamiento
   */
  async processWebhook(
    payload: PreApprovalWebhookPayload,
    detail: PreApprovalDetail,
  ): Promise<ProcessWebhookResult> {
    const preapprovalId = payload.data.id;

    // 1. Verificar idempotencia (fuera de transacción)
    const wasProcessed =
      await this.idempotencyService.wasProcessed(preapprovalId);
    if (wasProcessed) {
      this.logger.warn(`⏭️ Webhook duplicado ignorado: ${preapprovalId}`);
      return {
        success: true,
        action: 'skipped',
        message: 'Webhook ya fue procesado anteriormente',
        wasDuplicate: true,
      };
    }

    // 2. Buscar suscripción (fuera de transacción - read-only)
    const suscripcion = await this.prisma.suscripcion.findFirst({
      where: {
        OR: [
          { id: detail.external_reference },
          { mp_preapproval_id: preapprovalId },
        ],
      },
    });

    if (!suscripcion) {
      this.logger.error(
        `❌ Suscripción no encontrada para preapproval: ${preapprovalId}, external_ref: ${detail.external_reference}`,
      );
      return {
        success: false,
        action: 'error',
        message: `Suscripción no encontrada para preapproval ${preapprovalId}`,
      };
    }

    // 3. Procesar según estado de MP
    const mpStatus = detail.status;
    let result: ProcessWebhookResult;
    let pendingEvent: PendingEvent | null = null;

    switch (mpStatus) {
      case 'authorized':
        ({ result, pendingEvent } =
          await this.stateTransitionService.transicionarAActiva(
            suscripcion,
            detail,
          ));
        break;

      case 'cancelled':
        ({ result, pendingEvent } =
          await this.stateTransitionService.transicionarACancelada(
            suscripcion,
            detail,
          ));
        break;

      case 'paused':
        // REGLA DE NEGOCIO: No pausamos. Tratamos paused como cancelled.
        ({ result, pendingEvent } =
          await this.stateTransitionService.transicionarPausadaACancelada(
            suscripcion,
            detail,
          ));
        break;

      case 'pending':
        // No hacer nada, suscripción sigue pendiente
        result = {
          success: true,
          action: 'skipped',
          suscripcionId: suscripcion.id,
          message: 'Estado pending, sin cambios',
        };
        break;

      default:
        // Exhaustive check: Si MP agrega un nuevo estado, TypeScript
        // marcará error aquí en COMPILE TIME
        return assertNever(mpStatus, 'Estado de MercadoPago no soportado');
    }

    // 4. Marcar como procesado y emitir evento (solo si fue exitoso)
    if (result.success && result.action !== 'skipped') {
      await this.idempotencyService.markAsProcessed({
        paymentId: preapprovalId,
        webhookType: 'subscription_preapproval',
        status: mpStatus,
        externalReference: detail.external_reference,
      });

      // DESPUÉS DEL COMMIT: Emitir evento pendiente
      if (pendingEvent) {
        this.eventEmitter.emit(pendingEvent.eventName, pendingEvent.payload);
      }
    }

    return result;
  }

  /**
   * Maneja fallo de pago → EN_GRACIA o MOROSA
   * Delega a GracePeriodService
   *
   * @param suscripcionId - ID de la suscripción
   * @param paymentStatus - Estado del pago fallido (rejected, cancelled, etc)
   */
  async handlePaymentFailed(
    suscripcionId: string,
    paymentStatus: string,
  ): Promise<ProcessWebhookResult> {
    return this.gracePeriodService.handlePaymentFailed(
      suscripcionId,
      paymentStatus,
    );
  }
}
