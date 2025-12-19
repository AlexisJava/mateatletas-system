/**
 * Mapeo de estados de MercadoPago PreApproval a estados internos
 *
 * MercadoPago PreApproval tiene estos estados:
 * - pending: Esperando que el usuario complete el pago inicial
 * - authorized: Suscripción activa y cobros funcionando
 * - paused: Pausada (por el usuario o por nosotros via API)
 * - cancelled: Cancelada definitivamente
 *
 * Nuestros estados internos agregan lógica de negocio:
 * - EN_GRACIA: Falló un cobro, dentro del período de gracia (3 días)
 * - MOROSA: Pasó el grace period sin pago exitoso
 */
import { EstadoSuscripcion } from '@prisma/client';

/**
 * Estados de MercadoPago PreApproval (valores lowercase como vienen de la API)
 */
export enum MpPreapprovalStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

/**
 * Set de valores válidos para validación O(1)
 */
const MP_STATUS_VALIDOS: ReadonlySet<string> = new Set(
  Object.values(MpPreapprovalStatus),
);

/**
 * Type guard para validar si un string es un MpPreapprovalStatus válido
 *
 * @param status - String a validar
 * @returns true si es un estado válido de MercadoPago
 */
export function esMpPreapprovalStatusValido(
  status: string,
): status is MpPreapprovalStatus {
  return MP_STATUS_VALIDOS.has(status);
}

/**
 * Mapeo de estado MP → estado interno
 * Usamos Partial porque el acceso puede ser con string no válido
 */
const MP_TO_ESTADO_INTERNO: Readonly<
  Record<MpPreapprovalStatus, EstadoSuscripcion>
> = {
  [MpPreapprovalStatus.PENDING]: EstadoSuscripcion.PENDIENTE,
  [MpPreapprovalStatus.AUTHORIZED]: EstadoSuscripcion.ACTIVA,
  [MpPreapprovalStatus.PAUSED]: EstadoSuscripcion.PAUSADA,
  [MpPreapprovalStatus.CANCELLED]: EstadoSuscripcion.CANCELADA,
};

/**
 * Mapea un estado de MercadoPago PreApproval a nuestro estado interno
 *
 * @param mpStatus - Estado de MercadoPago (case-insensitive)
 * @returns Estado interno de suscripción
 *
 * @example
 * mapearEstadoPreapproval('authorized') // EstadoSuscripcion.ACTIVA
 * mapearEstadoPreapproval('AUTHORIZED') // EstadoSuscripcion.ACTIVA
 * mapearEstadoPreapproval('unknown')    // EstadoSuscripcion.PENDIENTE (fallback)
 */
export function mapearEstadoPreapproval(
  mpStatus: MpPreapprovalStatus | string,
): EstadoSuscripcion {
  // Normalizar a lowercase
  const statusNormalizado = mpStatus.toLowerCase();

  // Validar y mapear usando type guard
  if (esMpPreapprovalStatusValido(statusNormalizado)) {
    return MP_TO_ESTADO_INTERNO[statusNormalizado];
  }

  // Fallback seguro para estados desconocidos
  return EstadoSuscripcion.PENDIENTE;
}

/**
 * Estados que indican acceso activo
 */
const ESTADOS_ACTIVOS: ReadonlySet<MpPreapprovalStatus> = new Set([
  MpPreapprovalStatus.AUTHORIZED,
]);

/**
 * Estados finales (no pueden cambiar)
 */
const ESTADOS_FINALES: ReadonlySet<MpPreapprovalStatus> = new Set([
  MpPreapprovalStatus.CANCELLED,
]);

/**
 * Estados que permiten reintentos de cobro
 */
const ESTADOS_CON_REINTENTOS: ReadonlySet<MpPreapprovalStatus> = new Set([
  MpPreapprovalStatus.AUTHORIZED,
  MpPreapprovalStatus.PENDING,
]);

/**
 * Verifica si un estado de MP indica que la suscripción está activa
 * (usuario tiene acceso completo)
 *
 * @param mpStatus - Estado de MercadoPago
 * @returns true si el estado indica acceso activo
 */
export function esEstadoActivo(
  mpStatus: MpPreapprovalStatus | string,
): boolean {
  const statusNormalizado = mpStatus.toLowerCase();
  if (esMpPreapprovalStatusValido(statusNormalizado)) {
    return ESTADOS_ACTIVOS.has(statusNormalizado);
  }
  return false;
}

/**
 * Verifica si un estado de MP es final (no puede cambiar a otro estado)
 *
 * @param mpStatus - Estado de MercadoPago
 * @returns true si es un estado final
 */
export function esEstadoFinal(mpStatus: MpPreapprovalStatus | string): boolean {
  const statusNormalizado = mpStatus.toLowerCase();
  if (esMpPreapprovalStatusValido(statusNormalizado)) {
    return ESTADOS_FINALES.has(statusNormalizado);
  }
  return false;
}

/**
 * Verifica si un estado de MP permite reintentos de cobro
 *
 * @param mpStatus - Estado de MercadoPago
 * @returns true si MercadoPago puede reintentar cobros
 */
export function permiteReintentos(
  mpStatus: MpPreapprovalStatus | string,
): boolean {
  const statusNormalizado = mpStatus.toLowerCase();
  if (esMpPreapprovalStatusValido(statusNormalizado)) {
    return ESTADOS_CON_REINTENTOS.has(statusNormalizado);
  }
  return false;
}

/**
 * Obtiene descripción legible de un estado de MP
 *
 * @param mpStatus - Estado de MercadoPago
 * @returns Descripción en español
 */
export function obtenerDescripcionEstadoMp(
  mpStatus: MpPreapprovalStatus | string,
): string {
  const statusNormalizado = mpStatus.toLowerCase();

  const descripciones: Record<string, string> = {
    [MpPreapprovalStatus.PENDING]: 'Pendiente de activación',
    [MpPreapprovalStatus.AUTHORIZED]: 'Activa',
    [MpPreapprovalStatus.PAUSED]: 'Pausada',
    [MpPreapprovalStatus.CANCELLED]: 'Cancelada',
  };

  return descripciones[statusNormalizado] || 'Estado desconocido';
}
