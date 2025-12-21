/**
 * MercadoPagoPreApprovalClientService - Cliente para API de PreApproval
 *
 * Encapsula el SDK de MercadoPago para facilitar testing por inyección de dependencias.
 *
 * RESPONSABILIDADES:
 * - Obtener detalle de preapproval (GET /preapproval/{id})
 * - Proveer interfaz mockeable para tests
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PreApproval } from 'mercadopago';

import {
  PreApprovalDetail,
  AutoRecurring,
  FrequencyType,
} from '../types/preapproval.types';

/**
 * Respuesta raw del SDK de MercadoPago
 * El SDK no exporta tipos, así que definimos lo mínimo necesario
 */
interface MpPreApprovalGetResponse {
  id?: string;
  status?: string;
  external_reference?: string;
  payer_email?: string;
  payer_id?: number;
  reason?: string;
  next_payment_date?: string;
  date_created?: string;
  last_modified?: string;
  auto_recurring?: {
    frequency: number;
    frequency_type: string;
    transaction_amount: number;
    currency_id: string;
  };
}

@Injectable()
export class MercadoPagoPreApprovalClientService {
  private readonly logger = new Logger(
    MercadoPagoPreApprovalClientService.name,
  );
  private readonly client: PreApproval | null = null;

  constructor(private readonly configService: ConfigService) {
    const accessToken = this.configService.get<string>(
      'MERCADOPAGO_ACCESS_TOKEN',
    );
    if (accessToken) {
      this.client = new PreApproval({ accessToken });
      this.logger.log('Cliente MercadoPago PreApproval inicializado');
    } else {
      this.logger.warn('MERCADOPAGO_ACCESS_TOKEN no configurado');
    }
  }

  /**
   * Indica si el cliente está configurado correctamente
   */
  isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Obtiene el detalle de un preapproval desde la API de MercadoPago
   *
   * @param preapprovalId ID del preapproval en MercadoPago
   * @returns Detalle del preapproval o null si no se pudo obtener
   */
  async get(preapprovalId: string): Promise<PreApprovalDetail | null> {
    if (!this.client) {
      this.logger.warn(
        'Cliente MercadoPago no configurado, no se puede obtener detalle',
      );
      return null;
    }

    try {
      const response = await this.client.get({ id: preapprovalId });

      // Mapear respuesta raw a nuestro tipo tipado
      return this.mapResponseToDetail(
        response as MpPreApprovalGetResponse,
        preapprovalId,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error obteniendo preapproval ${preapprovalId}: ${errorMessage}`,
      );
      return null;
    }
  }

  /**
   * Mapea la respuesta raw del SDK a nuestro tipo PreApprovalDetail
   */
  private mapResponseToDetail(
    mpData: MpPreApprovalGetResponse,
    fallbackId: string,
  ): PreApprovalDetail {
    const id = typeof mpData.id === 'string' ? mpData.id : fallbackId;
    const status =
      typeof mpData.status === 'string' ? mpData.status : 'pending';
    const externalRef =
      typeof mpData.external_reference === 'string'
        ? mpData.external_reference
        : '';
    const payerEmail =
      typeof mpData.payer_email === 'string' ? mpData.payer_email : '';
    const payerId = typeof mpData.payer_id === 'number' ? mpData.payer_id : 0;
    const reason = typeof mpData.reason === 'string' ? mpData.reason : '';
    const nextPaymentDate =
      typeof mpData.next_payment_date === 'string'
        ? mpData.next_payment_date
        : null;
    const dateCreated =
      typeof mpData.date_created === 'string'
        ? mpData.date_created
        : new Date().toISOString();
    const lastModified =
      typeof mpData.last_modified === 'string'
        ? mpData.last_modified
        : new Date().toISOString();

    const defaultAutoRecurring: AutoRecurring = {
      frequency: 1,
      frequency_type: 'months' as FrequencyType,
      transaction_amount: 0,
      currency_id: 'ARS',
    };
    const autoRecurring: AutoRecurring = mpData.auto_recurring
      ? {
          frequency: mpData.auto_recurring.frequency,
          frequency_type: mpData.auto_recurring.frequency_type as FrequencyType,
          transaction_amount: mpData.auto_recurring.transaction_amount,
          currency_id: mpData.auto_recurring
            .currency_id as AutoRecurring['currency_id'],
        }
      : defaultAutoRecurring;

    return {
      id,
      status: status as PreApprovalDetail['status'],
      external_reference: externalRef,
      payer_email: payerEmail,
      payer_id: payerId,
      reason,
      next_payment_date: nextPaymentDate,
      auto_recurring: autoRecurring,
      date_created: dateCreated,
      last_modified: lastModified,
    };
  }
}
