/**
 * Definición de la cola de webhooks de pagos
 *
 * CONFIGURACIÓN:
 * - Reintentos: 5 intentos con backoff exponencial (1s, 2s, 4s, 8s, 16s)
 * - DLQ: Después de 5 fallos, el job NO se remueve (removeOnFail: false)
 *        El processor mueve manualmente a WebhookFailed
 * - Limpieza: Jobs completados se borran después de 24h
 *
 * @module pagos/jobs
 */

import { MercadoPagoWebhookDto } from '../dto/mercadopago-webhook.dto';

/** Nombre de la cola */
export const WEBHOOK_PAYMENT_QUEUE = 'webhook-payment';

/**
 * Datos del job de webhook de pago
 */
export interface WebhookPaymentJobData {
  /** Payload original del webhook de MercadoPago */
  payload: MercadoPagoWebhookDto;

  /** ID de correlación para trazabilidad end-to-end */
  correlationId: string;

  /** Timestamp ISO de cuando se recibió el webhook */
  receivedAt: string;

  /** IP del cliente que envió el webhook (logging/debugging) */
  clientIp: string;
}

/**
 * Resultado del procesamiento del job
 */
export interface WebhookPaymentJobResult {
  /** Si el procesamiento fue exitoso */
  success: boolean;

  /** Acción tomada (processed, skipped, error) */
  action: string;

  /** ID de inscripción afectada (si aplica) */
  inscripcionId?: string;

  /** ID de correlación para trazabilidad */
  correlationId: string;

  /** Mensaje adicional */
  message?: string;

  /** Tipo de entidad procesada */
  type?: string;

  /** Estado del pago */
  estadoPago?: string;
}

/**
 * Opciones por defecto para jobs de esta cola
 *
 * Estrategia de reintentos:
 * - Intento 1: Falla → Espera 1s
 * - Intento 2: Falla → Espera 2s
 * - Intento 3: Falla → Espera 4s
 * - Intento 4: Falla → Espera 8s
 * - Intento 5: Falla → Espera 16s
 * - Después de 5 fallos: Processor mueve a DLQ manualmente
 */
export const WEBHOOK_PAYMENT_JOB_OPTIONS = {
  /** Intentar hasta 5 veces */
  attempts: 5,

  /** Backoff exponencial: 1000ms * 2^attempt */
  backoff: {
    type: 'exponential' as const,
    delay: 1000,
  },

  /** Remover jobs completados después de 24 horas */
  removeOnComplete: {
    age: 24 * 60 * 60, // 24 horas en segundos
    count: 1000, // Mantener últimos 1000
  },

  /**
   * NO remover jobs fallidos automáticamente
   * El processor los moverá a WebhookFailed (DLQ en DB)
   */
  removeOnFail: false,
};

/**
 * Nombres de eventos de la cola (para listening)
 */
export const WEBHOOK_PAYMENT_EVENTS = {
  /** Job completado exitosamente */
  COMPLETED: 'completed',

  /** Job falló (puede reintentar) */
  FAILED: 'failed',

  /** Job falló todos los intentos (va a DLQ) */
  EXHAUSTED: 'exhausted',

  /** Job agregado a la cola */
  ADDED: 'added',
} as const;
