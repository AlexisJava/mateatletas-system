import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import {
  MercadoPagoWebhookProcessorService,
  PaymentContext,
} from '../../shared/services/mercadopago-webhook-processor.service';
import { WebhookIdempotencyService } from '../../pagos/services/webhook-idempotency.service';
import { PaymentAmountValidatorService } from '../../pagos/services/payment-amount-validator.service';
import { MercadoPagoWebhookDto } from '../../pagos/dto/mercadopago-webhook.dto';
import { TipoExternalReference } from '../../domain/constants';

/**
 * Resultado del procesamiento de webhook
 * Compatible con WebhookProcessingResult del servicio compartido
 */
export interface WebhookProcessResult {
  success: boolean;
  message?: string;
  paymentId?: string;
  pagoId?: string;
  inscripcionId?: string;
  paymentStatus?: string;
  inscripcionStatus?: string;
  error?: string;
  [key: string]: unknown;
}

/**
 * Use Case: Procesar Webhook de MercadoPago para Inscripciones 2026
 *
 * Responsabilidad única: Manejar webhooks de MercadoPago y actualizar
 * el estado de pagos e inscripciones.
 *
 * Incluye:
 * - Validación de idempotencia
 * - Validación de montos (anti-fraude)
 * - Actualización atómica de estados
 * - Historial de cambios
 */
@Injectable()
export class ProcesarWebhookInscripcionUseCase {
  private readonly logger = new Logger(ProcesarWebhookInscripcionUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly webhookProcessor: MercadoPagoWebhookProcessorService,
    private readonly webhookIdempotency: WebhookIdempotencyService,
    private readonly amountValidator: PaymentAmountValidatorService,
  ) {}

  /**
   * Ejecuta el procesamiento del webhook
   *
   * @param webhookData - Datos del webhook de MercadoPago
   * @returns Resultado del procesamiento
   */
  async execute(
    webhookData: MercadoPagoWebhookDto,
  ): Promise<WebhookProcessResult> {
    const paymentId: string = webhookData.data.id;

    // Validar que payment_id existe
    if (!paymentId) {
      this.logger.error('Webhook rechazado: payment_id faltante');
      throw new BadRequestException('payment_id is required');
    }

    this.logger.log(
      `Webhook recibido: ${webhookData.type} - ${webhookData.action}, payment_id=${paymentId}`,
    );

    // Verificar idempotencia
    const alreadyProcessed =
      await this.webhookIdempotency.wasProcessed(paymentId);
    if (alreadyProcessed) {
      this.logger.warn(`Webhook duplicado ignorado: payment_id=${paymentId}`);
      return {
        success: true,
        message: 'Already processed (idempotent)',
        paymentId,
      };
    }

    // Procesar webhook
    const result = await this.webhookProcessor.processWebhook(
      webhookData,
      TipoExternalReference.INSCRIPCION_2026,
      // Callback: Buscar pago
      async (parsed) => {
        if (!parsed) {
          throw new Error('Failed to parse external reference');
        }
        const { inscripcionId } = parsed.ids;

        const pago = await this.prisma.pagoInscripcion2026.findFirst({
          where: {
            inscripcion_id: inscripcionId,
            tipo: 'inscripcion',
          },
          include: {
            inscripcion: true,
          },
        });

        if (!pago) {
          this.logger.error(
            `Pago no encontrado para inscripción ${inscripcionId}`,
          );
        }

        return pago;
      },
      // Callback: Actualizar pago e inscripción
      async (pago, context) => {
        return this.processPaymentUpdate(pago, context);
      },
    );

    // Marcar como procesado si fue exitoso
    await this.markAsProcessedIfSuccess(result, paymentId, webhookData);

    return result as WebhookProcessResult;
  }

  /**
   * Procesa la actualización del pago e inscripción
   */
  private async processPaymentUpdate(
    pago: {
      id: string;
      inscripcion_id: string;
      inscripcion: { estado: string };
    },
    context: PaymentContext,
  ): Promise<WebhookProcessResult> {
    if (!context.parsedReference) {
      throw new Error('Invalid parsed reference');
    }

    const inscripcionId = context.parsedReference.ids.inscripcionId;
    if (!inscripcionId) {
      throw new Error('inscripcionId no encontrado en parsed reference');
    }

    // Mapear estado de pago
    const nuevoEstadoPago = this.webhookProcessor.mapPaymentStatus(
      context.paymentStatus,
    );

    // Validar monto si es aprobado
    if (
      context.paymentStatus === 'approved' &&
      context.payment.transaction_amount !== undefined
    ) {
      await this.validatePaymentAmount(
        pago.id,
        Number(context.payment.transaction_amount),
      );
    }

    // Determinar nuevo estado de inscripción
    const nuevoEstadoInscripcion =
      this.mapPaymentToInscripcionStatus(nuevoEstadoPago);

    // Actualizar en transacción atómica
    await this.prisma.$transaction(async (tx) => {
      // Actualizar pago
      await tx.pagoInscripcion2026.update({
        where: { id: pago.id },
        data: {
          estado: nuevoEstadoPago,
          mercadopago_payment_id: context.payment.id?.toString(),
          fecha_pago:
            context.paymentStatus === 'approved' ? new Date() : undefined,
        },
      });

      // Actualizar inscripción si cambió el estado
      if (nuevoEstadoInscripcion !== pago.inscripcion.estado) {
        const inscripcion = await tx.inscripcion2026.findUnique({
          where: { id: inscripcionId },
        });

        if (!inscripcion) {
          throw new BadRequestException('Inscripción no encontrada');
        }

        await tx.inscripcion2026.update({
          where: { id: inscripcionId },
          data: { estado: nuevoEstadoInscripcion },
        });

        // Crear historial
        await tx.historialEstadoInscripcion2026.create({
          data: {
            inscripcion_id: inscripcionId,
            estado_anterior: inscripcion.estado,
            estado_nuevo: nuevoEstadoInscripcion,
            razon: `Pago ${nuevoEstadoPago} - MercadoPago Payment ID: ${context.payment.id}`,
            realizado_por: 'mercadopago-webhook',
          },
        });
      }
    });

    this.logger.log(
      `Pago procesado - Inscripción ${inscripcionId} → Estado: ${nuevoEstadoInscripcion}`,
    );

    return {
      success: true,
      inscripcionId,
      paymentStatus: nuevoEstadoPago,
      inscripcionStatus: nuevoEstadoInscripcion,
    };
  }

  /**
   * Valida el monto del pago contra lo esperado
   */
  private async validatePaymentAmount(
    pagoId: string,
    receivedAmount: number,
  ): Promise<void> {
    const validation = await this.amountValidator.validatePagoInscripcion2026(
      pagoId,
      receivedAmount,
    );

    if (!validation.isValid) {
      this.logger.error(
        `FRAUDE DETECTADO - Monto inválido en pago ${pagoId}\n` +
          `  Esperado: $${validation.expectedAmount.toFixed(2)}\n` +
          `  Recibido: $${validation.receivedAmount.toFixed(2)}\n` +
          `  Diferencia: $${validation.difference?.toFixed(2)}\n` +
          `  Razón: ${validation.reason}`,
      );

      throw new BadRequestException(
        `Payment amount validation failed: ${validation.reason}`,
      );
    }

    this.logger.log(
      `Validación de monto exitosa: pago_id=${pagoId}, ` +
        `esperado=$${validation.expectedAmount.toFixed(2)}, ` +
        `recibido=$${validation.receivedAmount.toFixed(2)}`,
    );
  }

  /**
   * Mapea estado de pago a estado de inscripción
   */
  private mapPaymentToInscripcionStatus(paymentStatus: string): string {
    switch (paymentStatus) {
      case 'paid':
        return 'active';
      case 'failed':
        return 'payment_failed';
      case 'pending':
      default:
        return 'pending';
    }
  }

  /**
   * Marca el webhook como procesado si fue exitoso
   */
  private async markAsProcessedIfSuccess(
    result: unknown,
    paymentId: string,
    webhookData: MercadoPagoWebhookDto,
  ): Promise<void> {
    if (
      result &&
      typeof result === 'object' &&
      'success' in result &&
      (result as { success?: boolean }).success !== false
    ) {
      const externalRef =
        'externalReference' in result &&
        typeof (result as { externalReference?: string }).externalReference ===
          'string'
          ? (result as { externalReference: string }).externalReference
          : paymentId;

      try {
        await this.webhookIdempotency.markAsProcessed({
          paymentId,
          webhookType: 'inscripcion2026',
          status: webhookData.action || 'unknown',
          externalReference: externalRef,
        });

        this.logger.log(
          `Webhook marcado como procesado: payment_id=${paymentId}`,
        );
      } catch (error: unknown) {
        // Race condition (P2002) es OK
        if (
          error &&
          typeof error === 'object' &&
          'code' in error &&
          (error as { code: string }).code === 'P2002'
        ) {
          this.logger.warn(
            `Race condition al marcar webhook: payment_id=${paymentId}`,
          );
        } else {
          const message =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `Error al marcar webhook como procesado: ${message}, payment_id=${paymentId}`,
          );
        }
      }
    }
  }
}
