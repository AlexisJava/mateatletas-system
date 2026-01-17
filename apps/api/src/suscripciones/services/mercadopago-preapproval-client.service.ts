/**
 * MercadoPagoPreApprovalClientService - Cliente para API de PreApproval
 *
 * Encapsula el SDK de MercadoPago para facilitar testing por inyección de dependencias.
 *
 * RESPONSABILIDADES:
 * - Crear preapproval (POST /preapproval)
 * - Obtener detalle de preapproval (GET /preapproval/{id})
 * - Cancelar preapproval (PUT /preapproval/{id})
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

/**
 * Respuesta de crear un preapproval
 */
interface MpPreApprovalCreateResponse {
  id: string;
  init_point: string;
  status: string;
}

/**
 * Body para crear un preapproval
 */
type MpPreApprovalCreateBody = Record<
  string,
  string | number | boolean | object
>;

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
   * Crea un nuevo preapproval en MercadoPago
   *
   * @param body Datos para crear el preapproval
   * @returns Respuesta con id, init_point y status
   * @throws Error si el cliente no está configurado o falla la API
   */
  async create(
    body: MpPreApprovalCreateBody,
  ): Promise<MpPreApprovalCreateResponse> {
    if (!this.client) {
      throw new Error('Cliente MercadoPago no configurado');
    }

    try {
      const response = await this.client.create({ body });

      // Extraer campos con validación de tipos
      const id = typeof response.id === 'string' ? response.id : '';
      const initPoint =
        typeof response.init_point === 'string' ? response.init_point : '';
      const status =
        typeof response.status === 'string' ? response.status : 'pending';

      if (!id) {
        throw new Error('MercadoPago no retornó ID de preapproval');
      }

      this.logger.log(`PreApproval creado: ${id}`);

      return { id, init_point: initPoint, status };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error creando preapproval: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Actualiza el monto de un preapproval existente en MercadoPago
   *
   * @param preapprovalId ID del preapproval a actualizar
   * @param nuevoMonto Nuevo monto mensual en pesos
   * @returns true si se actualizó correctamente
   * @throws Error si el cliente no está configurado o falla la API
   */
  async updateAmount(
    preapprovalId: string,
    nuevoMonto: number,
  ): Promise<boolean> {
    if (!this.client) {
      throw new Error('Cliente MercadoPago no configurado');
    }

    try {
      await this.client.update({
        id: preapprovalId,
        body: {
          auto_recurring: {
            transaction_amount: nuevoMonto,
            currency_id: 'ARS',
          },
        },
      });

      this.logger.log(
        `PreApproval ${preapprovalId} actualizado a monto: $${nuevoMonto}`,
      );
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error actualizando monto de preapproval ${preapprovalId}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Cancela un preapproval existente en MercadoPago
   *
   * @param preapprovalId ID del preapproval a cancelar
   * @returns true si se canceló correctamente
   * @throws Error si el cliente no está configurado o falla la API
   */
  async cancel(preapprovalId: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('Cliente MercadoPago no configurado');
    }

    try {
      await this.client.update({
        id: preapprovalId,
        body: { status: 'cancelled' },
      });

      this.logger.log(`PreApproval cancelado: ${preapprovalId}`);
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error cancelando preapproval ${preapprovalId}: ${errorMessage}`,
      );
      throw error;
    }
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
