import { z } from 'zod';
import { tierNombreEnum, type TierNombre } from './enums.schema';

// ============================================================================
// TIERS DE SUSCRIPCIÓN STEAM 2026
// ============================================================================

/**
 * Precios de tiers STEAM 2026 en pesos argentinos (ARS)
 *
 * FUENTE DE VERDAD ÚNICA para precios de suscripción.
 * Cualquier cambio de precios debe hacerse aquí.
 */
export const TIERS_PRECIOS = {
  STEAM_LIBROS: 40000,
  STEAM_ASINCRONICO: 65000,
  STEAM_SINCRONICO: 95000,
} as const satisfies Record<TierNombre, number>;

/**
 * Descuento familiar STEAM 2026
 * 10% de descuento para actividades adicionales (no la más cara)
 */
export const DESCUENTO_FAMILIAR_PORCENTAJE = 10;

/**
 * Configuración visual de cada tier para UI
 */
export const TIERS_CONFIG = {
  STEAM_LIBROS: {
    id: 'STEAM_LIBROS' as const,
    nombre: 'STEAM Libros',
    descripcion: 'Plataforma completa con Matemáticas, Programación y Ciencias',
    precio: TIERS_PRECIOS.STEAM_LIBROS,
    gradient: 'from-cyan-500 to-blue-600',
    bgGradient: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    iconColor: 'text-cyan-400',
    bgIcon: 'bg-cyan-500/20',
    // Características incluidas
    caracteristicas: [
      'Acceso completo a la plataforma',
      'Contenido de Matemáticas, Programación y Ciencias',
      'Ejercicios interactivos',
      'Seguimiento de progreso',
    ],
  },
  STEAM_ASINCRONICO: {
    id: 'STEAM_ASINCRONICO' as const,
    nombre: 'STEAM Asincrónico',
    descripcion: 'Todo lo anterior + clases grabadas con explicaciones detalladas',
    precio: TIERS_PRECIOS.STEAM_ASINCRONICO,
    gradient: 'from-violet-500 to-purple-600',
    bgGradient: 'bg-gradient-to-br from-violet-500 to-purple-600',
    iconColor: 'text-violet-400',
    bgIcon: 'bg-violet-500/20',
    caracteristicas: [
      'Todo lo de STEAM Libros',
      'Clases grabadas por expertos',
      'Videos explicativos paso a paso',
      'Material complementario descargable',
    ],
  },
  STEAM_SINCRONICO: {
    id: 'STEAM_SINCRONICO' as const,
    nombre: 'STEAM Sincrónico',
    descripcion: 'Experiencia completa con clases en vivo y docente dedicado',
    precio: TIERS_PRECIOS.STEAM_SINCRONICO,
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'bg-gradient-to-br from-amber-500 to-orange-600',
    iconColor: 'text-amber-400',
    bgIcon: 'bg-amber-500/20',
    caracteristicas: [
      'Todo lo de STEAM Asincrónico',
      'Clases en vivo semanales',
      'Interacción directa con docentes',
      'Grupos reducidos (máx. 15 estudiantes)',
      'Soporte prioritario',
    ],
  },
} as const;

export type TierConfig = (typeof TIERS_CONFIG)[TierNombre];

/**
 * Array ordenado de tiers para mostrar en UI (de menor a mayor precio)
 */
export const TIERS_ARRAY = [
  TIERS_CONFIG.STEAM_LIBROS,
  TIERS_CONFIG.STEAM_ASINCRONICO,
  TIERS_CONFIG.STEAM_SINCRONICO,
] as const;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Obtiene el precio de un tier
 */
export function obtenerPrecioTier(tier: TierNombre): number {
  return TIERS_PRECIOS[tier];
}

/**
 * Obtiene la configuración completa de un tier
 */
export function obtenerConfigTier(tier: TierNombre): TierConfig {
  return TIERS_CONFIG[tier];
}

/**
 * Formatea el nombre del tier para mostrar
 */
export function formatTierNombre(tier: TierNombre): string {
  return TIERS_CONFIG[tier].nombre;
}

/**
 * Formatea un monto en pesos argentinos
 */
export function formatMonto(monto: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto);
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

/**
 * Schema para validar tier en requests
 */
export const tierSchema = tierNombreEnum;

/**
 * Schema para validar precio de tier
 */
export const tierPrecioSchema = z.number().int().positive();

/**
 * Schema para crear/actualizar inscripción con tier
 */
export const inscripcionTierSchema = z.object({
  tier: tierNombreEnum.optional(),
});
