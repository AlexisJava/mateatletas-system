/**
 * Constantes de configuración para el sistema de suscripciones
 *
 * REGLA DE NEGOCIO: Las suscripciones NO SE PAUSAN.
 * Si el tutor no paga, se cancela. Si quiere volver, crea una nueva.
 *
 * Estas constantes definen las reglas de negocio para:
 * - Período de gracia
 * - Notificaciones
 * - Precios de planes
 */

/**
 * Días de gracia después de un cobro fallido
 * Durante este período el tutor mantiene acceso completo
 *
 * Decisión de negocio: 3 días
 */
export const GRACE_PERIOD_DIAS = 3;

/**
 * Días de anticipación para notificar antes del próximo cobro
 * Se envía email/notificación X días antes
 *
 * Decisión de negocio: 3 días antes
 */
export const NOTIFICACION_PRE_COBRO_DIAS = 3;

/**
 * Tipos de planes disponibles
 */
export enum TipoPlan {
  STEAM_LIBROS = 'STEAM_LIBROS',
  STEAM_ASINCRONICO = 'STEAM_ASINCRONICO',
  STEAM_SINCRONICO = 'STEAM_SINCRONICO',
}

/**
 * Precios base de cada plan en pesos argentinos
 *
 * STEAM_LIBROS: Plan básico con acceso a libros digitales
 * STEAM_ASINCRONICO: Plan con contenido asincrónico
 * STEAM_SINCRONICO: Plan completo con clases en vivo
 */
export const PLANES_PRECIOS: Record<TipoPlan, number> = {
  [TipoPlan.STEAM_LIBROS]: 40000,
  [TipoPlan.STEAM_ASINCRONICO]: 65000,
  [TipoPlan.STEAM_SINCRONICO]: 95000,
};

/**
 * Obtiene el precio de un plan por su tipo
 */
export function obtenerPrecioPlan(tipoPlan: TipoPlan): number {
  return PLANES_PRECIOS[tipoPlan];
}

/**
 * Set de valores válidos de TipoPlan para validación O(1)
 */
const TIPOS_PLAN_VALIDOS: ReadonlySet<string> = new Set(
  Object.values(TipoPlan),
);

/**
 * Verifica si un tipo de plan es válido (type guard)
 *
 * @param tipoPlan - String a validar
 * @returns true si es un TipoPlan válido
 */
export function esPlanValido(tipoPlan: string): tipoPlan is TipoPlan {
  return TIPOS_PLAN_VALIDOS.has(tipoPlan);
}
