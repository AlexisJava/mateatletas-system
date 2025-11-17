import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentStateMapperService } from './payment-state-mapper.service';
import { PaymentCommandService } from './payment-command.service';
import { MercadoPagoService } from '../mercadopago.service';
import { MercadoPagoWebhookDto } from '../dto/mercadopago-webhook.dto';

/**
 * Datos de pago de MercadoPago (simplificado)
 */
export interface MercadoPagoPaymentData {
  id: number;
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
 * - Actualizar estados de membresías e inscripciones
 * - Emitir eventos de dominio
 *
 * Formatos de external_reference soportados:
 * - "membresia-{membresiaId}-tutor-{tutorId}-producto-{productoId}"
 * - "inscripcion-{inscripcionId}-estudiante-{estudianteId}-producto-{productoId}"
 */
@Injectable()
export class PaymentWebhookService {
  private readonly logger = new Logger(PaymentWebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stateMapper: PaymentStateMapperService,
    private readonly commandService: PaymentCommandService,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Procesa webhook de MercadoPago
   *
   * Flujo:
   * 1. Valida que sea notificación de tipo "payment"
   * 2. Consulta detalles del pago a MercadoPago API
   * 3. Parsea external_reference para identificar el tipo
   * 4. Delega a métodos específicos según el tipo
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
      return await this.procesarPorTipoExternalReference({
        external_reference: externalRef,
        id: payment.id,
        status: payment.status,
      });
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
   * @param payment - Datos del pago con external_reference, id y status
   * @returns Resultado del procesamiento
   */
  private async procesarPorTipoExternalReference(payment: {
    external_reference: string;
    id: number;
    status: string;
  }) {
    const externalRef = payment.external_reference;

    // Determinar tipo de pago (membresía o inscripción)
    if (externalRef.startsWith('membresia-')) {
      return this.procesarPagoMembresia(payment);
    } else if (externalRef.startsWith('inscripcion-')) {
      return this.procesarPagoInscripcion(payment);
    } else {
      this.logger.warn(
        `⚠️ Formato de external_reference desconocido: ${externalRef}`,
      );
      return { message: 'Unknown external_reference format' };
    }
  }

  /**
   * Procesa pago de membresía
   *
   * external_reference format: "membresia-{membresiaId}-tutor-{tutorId}-producto-{productoId}"
   *
   * @param payment - Datos del pago
   * @returns Resultado del procesamiento
   */
  private async procesarPagoMembresia(payment: {
    external_reference: string;
    id: number;
    status: string;
  }) {
    const externalRef = payment.external_reference;
    const parts = externalRef.split('-');
    const membresiaId = parts[1]; // "membresia-{ID}-tutor-..."

    this.logger.log(`🎫 Procesando pago de membresía ID: ${membresiaId}`);

    // Mapear estado de MercadoPago a estado de pago
    const estadoPago = this.stateMapper.mapearEstadoPago(payment.status);

    // Actualizar membresía usando command service
    await this.commandService.actualizarEstadoMembresia(
      membresiaId,
      estadoPago,
    );

    // Emitir evento específico de webhook
    this.eventEmitter.emit('webhook.membresia.procesado', {
      membresiaId,
      estadoPago,
      paymentId: payment.id,
      paymentStatus: payment.status,
    });

    this.logger.log(
      `✅ Membresía ${membresiaId} procesada - Estado: ${estadoPago}`,
    );

    return {
      message: 'Webhook processed successfully',
      type: 'membresia',
      membresiaId,
      estadoPago,
      paymentStatus: payment.status,
    };
  }

  /**
   * Procesa pago de inscripción a curso
   *
   * external_reference format: "inscripcion-{inscripcionId}-estudiante-{estudianteId}-producto-{productoId}"
   *
   * @param payment - Datos del pago
   * @returns Resultado del procesamiento
   */
  private async procesarPagoInscripcion(payment: {
    external_reference: string;
    id: number;
    status: string;
  }) {
    const externalRef = payment.external_reference;
    const parts = externalRef.split('-');
    const inscripcionId = parts[1]; // "inscripcion-{ID}-estudiante-..."

    this.logger.log(`📚 Procesando pago de inscripción ID: ${inscripcionId}`);

    // Mapear estado de MercadoPago a estado de pago
    const estadoPago = this.stateMapper.mapearEstadoPago(payment.status);

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
    });

    this.logger.log(
      `✅ Inscripción ${inscripcionId} procesada - Estado: ${estadoPago}`,
    );

    return {
      message: 'Webhook processed successfully',
      type: 'inscripcion',
      inscripcionId,
      estadoPago,
      paymentStatus: payment.status,
    };
  }
}
