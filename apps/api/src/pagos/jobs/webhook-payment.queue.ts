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
 * Calcula delay con jitter para evitar thundering herd
 *
 * Implementa "Full Jitter" strategy de AWS:
 * delay = random(0, min(cap, base * 2^attempt))
 *
 * @see https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
 *
 * @param attemptsMade - Número de intentos realizados (0-indexed)
 * @returns Delay en milisegundos con jitter aplicado
 */
export function calculateBackoffWithJitter(attemptsMade: number): number {
  const BASE_DELAY = 1000; // 1 segundo
  const MAX_DELAY = 30000; // 30 segundos máximo

  // Exponential: base * 2^attempt
  const exponentialDelay = BASE_DELAY * Math.pow(2, attemptsMade);

  // Cap at max delay
  const cappedDelay = Math.min(exponentialDelay, MAX_DELAY);

  // Full jitter: random between 0 and capped delay
  // eslint-disable-next-line sonarjs/pseudo-random -- Safe: jitter for backoff timing, not cryptographic
  const jitteredDelay = Math.floor(Math.random() * cappedDelay);

  // Ensure minimum delay of 500ms
  return Math.max(500, jitteredDelay);
}

/**
 * Opciones por defecto para jobs de esta cola
 *
 * Estrategia de reintentos con jitter:
 * - Intento 1: Falla → Espera ~0-1s (random)
 * - Intento 2: Falla → Espera ~0-2s (random)
 * - Intento 3: Falla → Espera ~0-4s (random)
 * - Intento 4: Falla → Espera ~0-8s (random)
 * - Intento 5: Falla → Espera ~0-16s (random)
 * - Después de 5 fallos: Processor mueve a DLQ manualmente
 *
 * El jitter evita "thundering herd" cuando múltiples webhooks fallan
 * simultáneamente (ej: caída de servicio externo).
 */
export const WEBHOOK_PAYMENT_JOB_OPTIONS = {
  /** Intentar hasta 5 veces */
  attempts: 5,

  /**
   * Backoff exponencial con jitter
   * Nota: BullMQ no soporta jitter nativo, pero podemos usar
   * una función personalizada en el processor si es necesario.
   * Por ahora usamos exponencial estándar - el jitter se puede
   * agregar en el processor con delay manual si hay thundering herd.
   */
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
