import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentStateMapperService } from './payment-state-mapper.service';
import { PaymentCommandService } from './payment-command.service';
import { MercadoPagoService } from '../mercadopago.service';
import { MercadoPagoWebhookDto } from '../dto/mercadopago-webhook.dto';
import { WebhookIdempotencyService } from './webhook-idempotency.service';
import { PaymentAmountValidatorService } from './payment-amount-validator.service';
import { PaymentAlertService } from './payment-alert.service';
import { EstadoPago } from '../../domain/constants';

/**
 * Datos de pago de MercadoPago (simplificado)
 */
export interface MercadoPagoPaymentData {
  id: string;
  status: string;
  external_reference: string;
  transaction_amount?: number;
  payment_type_id?: string;
}

/**
 * Servicio de procesamiento de webhooks de MercadoPago
 *
 * Responsabilidades:
 * - Procesar notificaciones de pago de MercadoPago
 * - Parsear external_reference para identificar el tipo de pago
 * - Actualizar estados de inscripciones
 * - Emitir eventos de dominio
 *
 * SEGURIDAD (v2.0):
 * ✅ Idempotencia: Previene doble procesamiento de webhooks
 * ✅ Validación de montos: Verifica que el amount coincida con precio esperado
 * ✅ Eventos de fraude: Emite alertas cuando se detecta monto inválido
 *
 * Formatos de external_reference soportados:
 * - "inscripcion-{inscripcionId}-estudiante-{estudianteId}-producto-{productoId}"
 */
@Injectable()
export class PaymentWebhookService {
  private readonly logger = new Logger(PaymentWebhookService.name);

  constructor(
    private readonly stateMapper: PaymentStateMapperService,
    private readonly commandService: PaymentCommandService,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly idempotency: WebhookIdempotencyService,
    private readonly amountValidator: PaymentAmountValidatorService,
    private readonly alertService: PaymentAlertService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Procesa webhook de MercadoPago CON SEGURIDAD MEJORADA
   *
   * Flujo:
   * 1. Valida que sea notificación de tipo "payment"
   * 2. ✅ NUEVO: Verifica idempotencia (previene doble procesamiento)
   * 3. Consulta detalles del pago a MercadoPago API
   * 4. Parsea external_reference para identificar el tipo
   * 5. Delega a métodos específicos según el tipo
   * 6. ✅ NUEVO: Marca webhook como procesado
   *
   * @param webhookData - Datos del webhook de MercadoPago
   * @returns Resultado del procesamiento
   */
  async procesarWebhookMercadoPago(webhookData: MercadoPagoWebhookDto) {
    this.logger.log(
      `📨 Webhook recibido: ${webhookData.type} - ${webhookData.action}`,
    );

    // Solo procesar notificaciones de tipo "payment"
    if (webhookData.type !== 'payment') {
      this.logger.log(`⏭️ Ignorando webhook de tipo: ${webhookData.type}`);
      return { message: 'Webhook type not handled' };
    }

    const paymentId = webhookData.data.id;
    this.logger.log(`💳 Procesando pago ID: ${paymentId}`);

    try {
      // ✅ PASO 1: Verificar idempotencia (prevenir doble procesamiento)
      const yaFueProcesado = await this.idempotency.wasProcessed(paymentId);

      if (yaFueProcesado) {
        this.logger.warn(
          `⏭️ Webhook duplicado ignorado: payment_id=${paymentId}`,
        );
        return {
          success: true,
          message: 'Webhook already processed (idempotent)',
          paymentId,
        };
      }

      // Consultar detalles del pago a MercadoPago
      const payment = await this.mercadoPagoService.getPayment(paymentId);

      this.logger.log(
        `💰 Pago consultado - Estado: ${payment.status} - Ref Externa: ${payment.external_reference}`,
      );

      // Validar que tenga external_reference, id y status
      const externalRef = payment.external_reference;

      if (!externalRef) {
        this.logger.warn('⚠️ Pago sin external_reference - Ignorando');
        return { message: 'Payment without external_reference' };
      }

      if (!payment.id || !payment.status) {
        this.logger.warn('⚠️ Pago sin id o status - Ignorando');
        return { message: 'Payment without id or status' };
      }

      // Parsear external_reference y delegar
      const result = await this.procesarPorTipoExternalReference({
        external_reference: externalRef,
        id: payment.id,
        status: payment.status,
        transaction_amount: payment.transaction_amount,
      });

      // ✅ PASO 2: Marcar como procesado SOLO si fue exitoso
      if (result.success !== false) {
        await this.idempotency.markAsProcessed({
          paymentId,
          webhookType: result.type || 'unknown',
          status: payment.status,
          externalReference: externalRef,
        });
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `❌ Error procesando webhook: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Procesa pago según el tipo de external_reference
   *
   * @param payment - Datos del pago con external_reference, id, status y monto
   * @returns Resultado del procesamiento
   */
  private async procesarPorTipoExternalReference(payment: {
    external_reference: string;
    id: string;
    status: string;
    transaction_amount?: number;
  }) {
    const externalRef = payment.external_reference;

    // Determinar tipo de pago (inscripción)
    if (externalRef.startsWith('inscripcion-')) {
      return this.procesarPagoInscripcion(payment);
    } else {
      this.logger.warn(
        `⚠️ Formato de external_reference desconocido: ${externalRef}`,
      );
      return {
        success: false,
        message: 'Unknown external_reference format',
        type: 'unknown',
      };
    }
  }

  /**
   * Procesa pago de inscripción a curso CON VALIDACIÓN DE MONTO
   *
   * external_reference format: "inscripcion-{inscripcionId}-estudiante-{estudianteId}-producto-{productoId}"
   *
   * @param payment - Datos del pago
   * @returns Resultado del procesamiento
   */
  private async procesarPagoInscripcion(payment: {
    external_reference: string;
    id: string;
    status: string;
    transaction_amount?: number;
  }) {
    const externalRef = payment.external_reference;
    const parts = externalRef.split('-');
    const inscripcionId = parts[1]; // "inscripcion-{ID}-estudiante-..."

    if (!inscripcionId) {
      throw new Error(
        `external_reference inválido para inscripción: "${externalRef}" - formato esperado: inscripcion-{ID}-...`,
      );
    }

    this.logger.log(`📚 Procesando pago de inscripción ID: ${inscripcionId}`);

    // ✅ VALIDAR MONTO ANTES DE PROCESAR (solo para pagos aprobados)
    if (payment.status === 'approved' && payment.transaction_amount) {
      const validation = await this.amountValidator.validateInscripcionMensual(
        inscripcionId,
        payment.transaction_amount,
      );

      if (!validation.isValid) {
        this.logger.error(
          `🚨 FRAUDE DETECTADO - Monto inválido en inscripción ${inscripcionId}: ${validation.reason}`,
        );

        // Emitir evento de fraude
        this.eventEmitter.emit('webhook.fraud_detected', {
          paymentId: payment.id,
          inscripcionId,
          validation,
          type: 'inscripcion',
        });

        // NO procesar el pago
        return {
          success: false,
          error: 'Amount validation failed',
          validation,
          type: 'inscripcion',
        };
      }

      this.logger.log(
        `✅ Monto validado correctamente para inscripción ${inscripcionId}`,
      );
    }

    // Mapear estado de MercadoPago a estado de pago
    const estadoPago = this.stateMapper.mapearEstadoPago(payment.status);

    // ✅ ALERTAR si es refund o chargeback (eventos críticos)
    if (estadoPago === EstadoPago.REEMBOLSADO) {
      const isChargeback = payment.status === 'charged_back';

      if (isChargeback) {
        await this.alertService.alertChargebackReceived({
          paymentId: payment.id,
          amount: payment.transaction_amount || 0,
          entityType: 'inscripcion',
          entityId: inscripcionId,
        });
      } else {
        await this.alertService.alertRefundProcessed({
          paymentId: payment.id,
          originalAmount: payment.transaction_amount || 0,
          refundedAmount: payment.transaction_amount || 0,
          entityType: 'inscripcion',
          entityId: inscripcionId,
        });
      }
    }

    // Actualizar inscripción usando command service
    await this.commandService.actualizarEstadoInscripcion(
      inscripcionId,
      estadoPago,
    );

    // Emitir evento específico de webhook
    this.eventEmitter.emit('webhook.inscripcion.procesado', {
      inscripcionId,
      estadoPago,
      paymentId: payment.id,
      paymentStatus: payment.status,
      amountValidated: !!payment.transaction_amount,
    });

    this.logger.log(
      `✅ Inscripción ${inscripcionId} procesada - Estado: ${estadoPago}`,
    );

    return {
      success: true,
      message: 'Webhook processed successfully',
      type: 'inscripcion',
      inscripcionId,
      estadoPago,
      paymentStatus: payment.status,
    };
  }
}
