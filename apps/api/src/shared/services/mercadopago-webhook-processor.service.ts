import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { MercadoPagoService } from '../../pagos/mercadopago.service';
import { MercadoPagoWebhookDto } from '../../pagos/dto/mercadopago-webhook.dto';
import {
  parseLegacyExternalReference,
  TipoExternalReference,
} from '../../domain/constants';

/**
 * Resultado del procesamiento de un webhook de MercadoPago
 */
export interface WebhookProcessingResult {
  success: boolean;
  pagoId?: string;
  paymentStatus?: string;
  message?: string;
  [key: string]: any;
}

/**
 * Contexto de pago parseado desde MercadoPago
 */
export interface PaymentContext {
  paymentId: string;
  payment: any;
  externalReference: string;
  parsedReference: any;
  paymentStatus: string;
}

/**
 * Callback para buscar el pago en la base de datos
 */
export type FindPaymentCallback<T = any> = (
  parsedReference: any,
) => Promise<T | null>;

/**
 * Callback para actualizar el pago en la base de datos
 */
export type UpdatePaymentCallback<T = any> = (
  pago: T,
  context: PaymentContext,
) => Promise<WebhookProcessingResult>;

/**
 * Servicio compartido para procesar webhooks de MercadoPago
 *
 * Este servicio proporciona una abstracción reutilizable para procesar
 * webhooks de MercadoPago, eliminando duplicación entre ColoniaService
 * e Inscripciones2026Service.
 *
 * Responsabilidades:
 * - Validar tipo de webhook (solo 'payment')
 * - Consultar detalles del pago a MercadoPago API
 * - Parsear external_reference usando el parser centralizado
 * - Validar que el external_reference sea del tipo correcto
 * - Delegar búsqueda y actualización a callbacks específicos del dominio
 *
 * @example
 * ```typescript
 * const result = await webhookProcessor.processWebhook(
 *   webhookData,
 *   TipoExternalReference.PAGO_COLONIA,
 *   async (parsed) => {
 *     return await prisma.coloniaPago.findUnique({
 *       where: { id: parsed.ids.pagoId }
 *     });
 *   },
 *   async (pago, context) => {
 *     const nuevoEstado = mapPaymentStatus(context.paymentStatus);
 *     await prisma.coloniaPago.update({
 *       where: { id: pago.id },
 *       data: { estado: nuevoEstado }
 *     });
 *     return { success: true, pagoId: pago.id };
 *   }
 * );
 * ```
 */
@Injectable()
export class MercadoPagoWebhookProcessorService {
  private readonly logger = new Logger(MercadoPagoWebhookProcessorService.name);

  constructor(private readonly mercadoPagoService: MercadoPagoService) {}

  /**
   * Procesa un webhook de MercadoPago de forma genérica
   *
   * @param webhookData - Datos del webhook recibido
   * @param expectedType - Tipo de external_reference esperado
   * @param findPayment - Callback para buscar el pago en la DB
   * @param updatePayment - Callback para actualizar el pago
   * @returns Resultado del procesamiento
   */
  async processWebhook<T = any>(
    webhookData: MercadoPagoWebhookDto,
    expectedType: TipoExternalReference,
    findPayment: FindPaymentCallback<T>,
    updatePayment: UpdatePaymentCallback<T>,
  ): Promise<WebhookProcessingResult> {
    this.logger.log('Webhook recibido', {
      type: webhookData.type,
      action: webhookData.action,
    });

    // 1. Validar tipo de webhook
    if (webhookData.type !== 'payment') {
      this.logger.log(`Webhook ignorado: tipo ${webhookData.type}`);
      return { success: false, message: 'Webhook type not handled' };
    }

    const paymentId = webhookData.data.id;
    this.logger.log('Procesando pago', { paymentId });

    try {
      // 2. Consultar detalles del pago a MercadoPago
      const payment = await this.mercadoPagoService.getPayment(paymentId);

      this.logger.log('Pago consultado', {
        status: payment.status,
        externalReference: payment.external_reference,
      });

      // 3. Validar y parsear external_reference
      const externalRef = payment.external_reference;

      if (!externalRef) {
        this.logger.warn('Pago sin external_reference', { paymentId });
        return { success: false, message: 'Payment without external_reference' };
      }

      // 4. Parsear external_reference usando parser centralizado
      const parsed = parseLegacyExternalReference(externalRef);

      if (!parsed || parsed.tipo !== expectedType) {
        this.logger.warn('External reference inválida', {
          externalRef,
          expectedType,
          actualType: parsed?.tipo,
        });
        return { success: false, message: 'Invalid external_reference format' };
      }

      // 5. Crear contexto de pago
      const context: PaymentContext = {
        paymentId,
        payment,
        externalReference: externalRef,
        parsedReference: parsed,
        paymentStatus: payment.status,
      };

      // 6. Buscar el pago usando callback del dominio
      const pago = await findPayment(parsed);

      if (!pago) {
        this.logger.warn('Pago no encontrado en base de datos', {
          paymentId,
          parsedReference: parsed,
        });
        return { success: false, message: 'Payment not found in database' };
      }

      this.logger.log('Pago encontrado en base de datos', {
        pagoId: (pago as any).id,
      });

      // 7. Actualizar pago usando callback del dominio
      const result = await updatePayment(pago, context);

      this.logger.log('Webhook procesado exitosamente', {
        paymentId,
        paymentStatus: payment.status,
      });

      return result;
    } catch (error) {
      this.logger.error('Error procesando webhook', {
        paymentId,
        error: error.message,
        stack: error.stack,
      });

      throw new BadRequestException(
        `Error procesando webhook: ${error.message}`,
      );
    }
  }

  /**
   * Mapea el estado de MercadoPago a un estado interno del sistema
   *
   * @param mercadoPagoStatus - Estado del pago en MercadoPago
   * @returns Estado mapeado para el sistema interno
   */
  mapPaymentStatus(mercadoPagoStatus: string): string {
    const statusMap: Record<string, string> = {
      approved: 'paid',
      rejected: 'failed',
      cancelled: 'failed',
      pending: 'pending',
      in_process: 'pending',
      refunded: 'refunded',
      charged_back: 'refunded',
    };

    return statusMap[mercadoPagoStatus] || 'pending';
  }
}
