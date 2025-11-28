/**
 * Tipos para la integración con MercadoPago API
 * Basados en: https://www.mercadopago.com.ar/developers/es/reference
 */

/**
 * Estado de un pago en MercadoPago
 */
export type MercadoPagoPaymentStatus =
  | 'approved' // Pago aprobado
  | 'pending' // Esperando procesamiento
  | 'in_process' // En proceso
  | 'rejected' // Rechazado
  | 'cancelled' // Cancelado
  | 'refunded' // Devuelto
  | 'charged_back'; // Contracargo

/**
 * Respuesta de consulta de pago desde MercadoPago API
 */
export interface MercadoPagoPayment {
  id: string;
  status: MercadoPagoPaymentStatus;
  status_detail: string;
  external_reference: string | null;
  transaction_amount: number;
  date_approved: string | null;
  date_created: string;

  // Información adicional (puede incluir fallback ID)
  additional_info?: {
    items?: Array<{
      id?: string;
      title: string;
      quantity: number;
      unit_price: number;
    }>;
  };

  // Información del pagador
  payer?: {
    id?: string;
    email?: string;
    identification?: {
      type: string;
      number: string;
    };
  };
}

/**
 * Preferencia de pago creada en MercadoPago
 */
export interface MercadoPagoPreference {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
  date_created?: string;
}

/**
 * Item de una preferencia de pago
 */
export interface MercadoPagoItem {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: 'ARS';
  description?: string;
}

/**
 * URLs de retorno de una preferencia
 */
export interface MercadoPagoBackUrls {
  success: string;
  failure: string;
  pending: string;
}

/**
 * Input para crear una preferencia de pago
 */
export interface CreateMercadoPagoPreferenceDto {
  items: MercadoPagoItem[];
  back_urls?: MercadoPagoBackUrls;
  auto_return?: 'approved' | 'all';
  external_reference?: string;
  notification_url?: string;
  statement_descriptor?: string;
  payment_methods?: {
    excluded_payment_types?: Array<{ id: string }>;
    installments?: number;
  };
}

/**
 * Payload recibido en webhook de MercadoPago
 */
export interface MercadoPagoWebhookPayload {
  type:
    | 'payment'
    | 'merchant_order'
    | 'plan'
    | 'subscription'
    | 'invoice'
    | 'point_integration_wh';
  action: string;
  data: {
    id: string;
  };
  date_created: string;
  id: number;
  live_mode: boolean;
  user_id: string;
  api_version: string;
}
