/**
 * Definición de la cola de webhooks de PreApproval
 *
 * CONFIGURACIÓN:
 * - Reintentos: 3 intentos con backoff exponencial
 * - Backoff: 1s, 2s, 4s
 * - DLQ: Después de 3 fallos, el job se marca como failed
 */
import {
  PreApprovalWebhookPayload,
  PreApprovalDetail,
} from '../types/preapproval.types';

/** Nombre de la cola */
export const WEBHOOK_PREAPPROVAL_QUEUE = 'webhook-preapproval';

/**
 * Datos del job de webhook
 */
export interface WebhookJobData {
  /** Payload original del webhook de MercadoPago */
  payload: PreApprovalWebhookPayload;

  /** Detalle del preapproval obtenido de la API */
  detail: PreApprovalDetail;

  /** ID de correlación para trazabilidad */
  correlationId: string;

  /** Timestamp ISO de cuando se recibió el webhook */
  receivedAt: string;
}

/**
 * Resultado del procesamiento del job
 */
export interface WebhookJobResult {
  /** Si el procesamiento fue exitoso */
  success: boolean;

  /** Acción tomada */
  action: string;

  /** ID de suscripción afectada (si aplica) */
  suscripcionId?: string;

  /** ID de correlación */
  correlationId: string;

  /** Mensaje adicional */
  message?: string;
}

/**
 * Opciones por defecto para jobs de esta cola
 */
export const WEBHOOK_JOB_OPTIONS = {
  /** Intentar hasta 3 veces */
  attempts: 3,

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

  /** Mantener jobs fallidos por 7 días para debugging */
  removeOnFail: {
    age: 7 * 24 * 60 * 60, // 7 días en segundos
  },
};
