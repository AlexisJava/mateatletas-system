/**
 * Tipos para integración con MercadoPago PreApproval API
 *
 * Basado en documentación oficial:
 * https://www.mercadopago.com.ar/developers/en/reference/subscriptions/_preapproval/post
 *
 * IMPORTANTE: No usar `any` ni `unknown`. Todos los tipos deben ser explícitos.
 */

/**
 * Frecuencia de cobro para suscripciones
 */
export type FrequencyType = 'days' | 'months';

/**
 * Estados posibles de una suscripción en MercadoPago
 */
export type PreApprovalStatus =
  | 'pending'
  | 'authorized'
  | 'paused'
  | 'cancelled';

/**
 * Configuración de cobro automático recurrente
 */
export interface AutoRecurring {
  /** Frecuencia de cobro (ej: 1 para mensual) */
  readonly frequency: number;
  /** Tipo de frecuencia */
  readonly frequency_type: FrequencyType;
  /** Monto a cobrar por período */
  readonly transaction_amount: number;
  /** Moneda (ARS para Argentina) */
  readonly currency_id: 'ARS' | 'BRL' | 'MXN' | 'CLP' | 'COP' | 'PEN' | 'UYU';
  /** Fecha de inicio (ISO 8601) */
  readonly start_date?: string;
  /** Fecha de fin (ISO 8601) */
  readonly end_date?: string;
  /** Configuración de período de prueba gratuito */
  readonly free_trial?: {
    readonly frequency: number;
    readonly frequency_type: FrequencyType;
  };
}

/**
 * Request body para crear una suscripción en MercadoPago
 * POST /preapproval
 */
export interface CreatePreApprovalRequest {
  /** Email del pagador (requerido) */
  readonly payer_email: string;
  /** URL de retorno después del checkout */
  readonly back_url: string;
  /** Razón/descripción de la suscripción */
  readonly reason: string;
  /** Referencia externa para vincular con nuestro sistema */
  readonly external_reference: string;
  /** Configuración de cobro automático */
  readonly auto_recurring: AutoRecurring;
  /** ID del plan de suscripción (opcional si se usa auto_recurring) */
  readonly preapproval_plan_id?: string;
  /** Token de tarjeta para cobro inmediato */
  readonly card_token_id?: string;
  /** Estado inicial de la suscripción */
  readonly status?: PreApprovalStatus;
}

/**
 * Response de MercadoPago al crear una suscripción
 */
export interface PreApprovalResponse {
  /** ID único de la suscripción en MercadoPago */
  readonly id: string;
  /** Versión del recurso */
  readonly version: number;
  /** ID de la aplicación */
  readonly application_id: number;
  /** ID del vendedor/collector */
  readonly collector_id: number;
  /** ID del plan de suscripción */
  readonly preapproval_plan_id: string | null;
  /** Razón/descripción */
  readonly reason: string;
  /** Referencia externa */
  readonly external_reference: string;
  /** URL de retorno */
  readonly back_url: string;
  /** URL de checkout para que el usuario complete el pago */
  readonly init_point: string;
  /** Configuración de cobro automático */
  readonly auto_recurring: AutoRecurring;
  /** ID del pagador */
  readonly payer_id: number;
  /** ID de la tarjeta */
  readonly card_id: number | null;
  /** Método de pago */
  readonly payment_method_id: string | null;
  /** Fecha del próximo cobro (ISO 8601) */
  readonly next_payment_date: string | null;
  /** Fecha de creación (ISO 8601) */
  readonly date_created: string;
  /** Fecha de última modificación (ISO 8601) */
  readonly last_modified: string;
  /** Estado actual de la suscripción */
  readonly status: PreApprovalStatus;
}

/**
 * Request body para actualizar una suscripción
 * PUT /preapproval/{id}
 */
export interface UpdatePreApprovalRequest {
  /** Nuevo estado */
  readonly status?: PreApprovalStatus;
  /** Nueva razón/descripción */
  readonly reason?: string;
  /** Nueva referencia externa */
  readonly external_reference?: string;
  /** Nueva URL de retorno */
  readonly back_url?: string;
  /** Nueva configuración de cobro automático */
  readonly auto_recurring?: Partial<AutoRecurring>;
}

/**
 * Datos para crear una suscripción en nuestro sistema
 *
 * Soporta dos flujos:
 * 1. Redirect: Sin card_token_id → Usuario redirigido a checkout de MP
 * 2. Bricks: Con card_token_id + payerEmail → Cobro inmediato inline
 */
export interface CrearSuscripcionInput {
  /** ID del tutor que se suscribe */
  readonly tutorId: string;
  /** ID del plan de suscripción interno */
  readonly planId: string;
  /** Email del tutor para MercadoPago */
  readonly tutorEmail: string;
  /** Nombre del tutor (para descripción) */
  readonly tutorNombre: string;
  /** Número de hijo para calcular descuento familiar (1 = primer hijo) */
  readonly numeroHijo: number;

  // === Campos opcionales para MercadoPago Bricks ===

  /**
   * Token de tarjeta generado por MercadoPago Bricks
   *
   * SEGURIDAD:
   * - Es de uso único, NO persistir en DB
   * - Solo loguear últimos 4 caracteres
   * - Si presente, payerEmail es REQUERIDO
   */
  readonly cardTokenId?: string;

  /**
   * Email del pagador para cobro con Bricks
   * REQUERIDO si cardTokenId está presente
   */
  readonly payerEmail?: string;
}

/**
 * Resultado de crear una suscripción
 *
 * Incluye información sobre el flujo utilizado:
 * - cobradoInmediatamente: true si se usó Bricks (card_token_id)
 * - checkoutUrl: URL de redirect (solo si NO es cobro inmediato)
 */
export interface CrearSuscripcionResult {
  /** ID de la suscripción en nuestra DB */
  readonly suscripcionId: string;
  /** ID de la suscripción en MercadoPago */
  readonly mpPreapprovalId: string;
  /** URL de checkout para redirigir al usuario (null si cobro inmediato) */
  readonly checkoutUrl: string | null;
  /** Precio final con descuento aplicado */
  readonly precioFinal: number;
  /** Porcentaje de descuento aplicado */
  readonly descuentoPorcentaje: number;
  /** Indica si se cobró inmediatamente con Bricks */
  readonly cobradoInmediatamente: boolean;
}

/**
 * Datos para cancelar una suscripción
 *
 * REGLA DE NEGOCIO: No hay pausa. Si no paga, se cancela.
 * Si quiere volver, crea una nueva suscripción.
 */
export interface CancelarSuscripcionInput {
  /** ID de la suscripción en nuestra DB */
  readonly suscripcionId: string;
  /** ID del tutor (para validación de ownership) */
  readonly tutorId: string;
  /** Motivo de la cancelación */
  readonly motivo: string;
  /** Quién solicita la cancelación */
  readonly canceladoPor: 'tutor' | 'admin' | 'system';
}

/**
 * Error específico del servicio de PreApproval
 */
export class PreApprovalError extends Error {
  constructor(
    message: string,
    public readonly code: PreApprovalErrorCode,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'PreApprovalError';
  }
}

/**
 * Códigos de error para PreApproval
 */
export enum PreApprovalErrorCode {
  /** Suscripción no encontrada */
  NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND',
  /** El tutor no es dueño de la suscripción */
  UNAUTHORIZED = 'UNAUTHORIZED_ACCESS',
  /** Estado inválido para la operación */
  INVALID_STATE = 'INVALID_STATE',
  /** Error de comunicación con MercadoPago */
  MP_API_ERROR = 'MERCADOPAGO_API_ERROR',
  /** Circuito abierto (MercadoPago no disponible) */
  CIRCUIT_OPEN = 'CIRCUIT_BREAKER_OPEN',
  /** Plan no encontrado */
  PLAN_NOT_FOUND = 'PLAN_NOT_FOUND',
  /** Tutor no encontrado */
  TUTOR_NOT_FOUND = 'TUTOR_NOT_FOUND',
  /** Webhook duplicado (ya procesado) */
  WEBHOOK_DUPLICATE = 'WEBHOOK_DUPLICATE',
}

// ============================================================================
// TIPOS PARA WEBHOOKS DE SUBSCRIPTION_PREAPPROVAL
// ============================================================================

/**
 * Payload del webhook subscription_preapproval de MercadoPago
 *
 * MercadoPago envía este webhook cuando cambia el estado de una suscripción:
 * - authorized: Suscripción activa y cobros funcionando
 * - cancelled: Cancelada por usuario o sistema
 * - paused: Pausada (nosotros NO usamos, pero MP puede enviar)
 * - pending: Esperando primer pago
 */
export interface PreApprovalWebhookPayload {
  /** Tipo de webhook */
  readonly type: 'subscription_preapproval';
  /** Acción que disparó el webhook */
  readonly action: 'created' | 'updated' | 'payment.created';
  /** ID del webhook */
  readonly id: string;
  /** Versión de la API */
  readonly api_version: string;
  /** Fecha de creación del webhook */
  readonly date_created: string;
  /** Si es modo producción */
  readonly live_mode: boolean;
  /** ID del usuario/vendedor en MP */
  readonly user_id: string;
  /** Datos del recurso */
  readonly data: {
    /** ID del preapproval en MercadoPago */
    readonly id: string;
  };
}

/**
 * Detalle del preapproval obtenido de la API de MercadoPago
 * GET /preapproval/{id}
 */
export interface PreApprovalDetail {
  /** ID del preapproval */
  readonly id: string;
  /** Estado actual */
  readonly status: PreApprovalStatus;
  /** Referencia externa (nuestro suscripcionId) */
  readonly external_reference: string;
  /** Email del pagador */
  readonly payer_email: string;
  /** ID del pagador en MP */
  readonly payer_id: number;
  /** Razón/descripción */
  readonly reason: string;
  /** Fecha del próximo pago */
  readonly next_payment_date: string | null;
  /** Fecha del último pago exitoso */
  readonly last_payment_date?: string | null;
  /** Configuración de cobro automático */
  readonly auto_recurring: AutoRecurring;
  /** Fecha de creación */
  readonly date_created: string;
  /** Fecha de última modificación */
  readonly last_modified: string;
  /** Información del pago más reciente */
  readonly summarized?: {
    /** Cantidad de pagos aprobados */
    readonly quotas: number;
    /** Total cobrado */
    readonly charged_amount: number;
    /** Último pago */
    readonly last_charged_date?: string;
    /** Último error de pago */
    readonly last_charged_error_date?: string;
  };
}

/**
 * Resultado de procesar un webhook de preapproval
 */
export interface ProcessWebhookResult {
  /** Si el webhook fue procesado exitosamente */
  readonly success: boolean;
  /** Acción tomada */
  readonly action:
    | 'activated'
    | 'cancelled'
    | 'grace_period'
    | 'morosa'
    | 'skipped'
    | 'error';
  /** ID de la suscripción afectada */
  readonly suscripcionId?: string;
  /** Mensaje descriptivo */
  readonly message: string;
  /** Si era un webhook duplicado */
  readonly wasDuplicate?: boolean;
}
