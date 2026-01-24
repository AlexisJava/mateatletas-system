/**
 * Constantes de colores centralizadas para el Admin Portal
 *
 * FUENTE DE VERDAD ÚNICA para colores de UI admin.
 * Reutilizar en vez de hardcodear colores en componentes.
 */

// ============================================================================
// CASAS - Colores por rango de edad
// ============================================================================

export type CasaTipo = 'QUANTUM' | 'VERTEX' | 'PULSAR';

export interface CasaColorConfig {
  /** Solid hex color for charts/graphs */
  solid: string;
  /** Tailwind bg class with opacity */
  bg: string;
  /** Tailwind text class */
  text: string;
  /** Tailwind border class */
  border: string;
  /** Glow color with alpha for effects */
  glow: string;
  /** Gradient classes */
  gradient: string;
}

export const CASA_COLORS: Record<CasaTipo, CasaColorConfig> = {
  QUANTUM: {
    solid: '#06b6d4', // cyan-500
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    glow: '#00d4ff40',
    gradient: 'from-cyan-500 to-blue-600',
  },
  VERTEX: {
    solid: '#a855f7', // purple-500
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    glow: '#8b5cf640',
    gradient: 'from-purple-500 to-violet-600',
  },
  PULSAR: {
    solid: '#f59e0b', // amber-500
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    glow: '#f59e0b40',
    gradient: 'from-amber-500 to-orange-600',
  },
} as const;

/**
 * Obtener colores de una casa de forma segura
 */
export function getCasaColors(casa: string | null | undefined): CasaColorConfig {
  const key = (casa?.toUpperCase() ?? 'VERTEX') as CasaTipo;
  return CASA_COLORS[key] ?? CASA_COLORS.VERTEX;
}

// ============================================================================
// ESTADOS - Colores semánticos para badges y estados
// ============================================================================

export type EstadoVariant = 'success' | 'warning' | 'danger' | 'info' | 'pending' | 'neutral';

export interface EstadoColorConfig {
  /** CSS variable for background (muted) */
  bg: string;
  /** CSS variable for text/accent */
  text: string;
  /** AdminBadge variant */
  variant: EstadoVariant;
}

/**
 * Mapeo de estados de pago a colores
 */
export const PAGO_ESTADO_COLORS: Record<string, EstadoColorConfig> = {
  PAGADO: { bg: 'var(--status-success-muted)', text: 'var(--status-success)', variant: 'success' },
  PENDIENTE: {
    bg: 'var(--status-warning-muted)',
    text: 'var(--status-warning)',
    variant: 'warning',
  },
  VENCIDO: { bg: 'var(--status-danger-muted)', text: 'var(--status-danger)', variant: 'danger' },
  CANCELADO: { bg: 'var(--admin-surface-1)', text: 'var(--admin-text-muted)', variant: 'neutral' },
} as const;

/**
 * Mapeo de estados de acceso a colores
 */
export const ACCESO_ESTADO_COLORS: Record<string, EstadoColorConfig> = {
  ACTIVO: { bg: 'var(--status-success-muted)', text: 'var(--status-success)', variant: 'success' },
  SUSPENDIDO: {
    bg: 'var(--status-warning-muted)',
    text: 'var(--status-warning)',
    variant: 'warning',
  },
  VENCIDO: { bg: 'var(--status-danger-muted)', text: 'var(--status-danger)', variant: 'danger' },
  BECA: { bg: 'var(--status-info-muted)', text: 'var(--status-info)', variant: 'info' },
} as const;

/**
 * Mapeo de estados de suscripción a colores
 */
export const SUSCRIPCION_ESTADO_COLORS: Record<string, EstadoColorConfig> = {
  ACTIVA: { bg: 'var(--status-success-muted)', text: 'var(--status-success)', variant: 'success' },
  PENDIENTE: {
    bg: 'var(--status-pending-muted)',
    text: 'var(--status-pending)',
    variant: 'pending',
  },
  PAUSADA: { bg: 'var(--status-warning-muted)', text: 'var(--status-warning)', variant: 'warning' },
  CANCELADA: { bg: 'var(--admin-surface-1)', text: 'var(--admin-text-muted)', variant: 'neutral' },
  VENCIDA: { bg: 'var(--status-danger-muted)', text: 'var(--status-danger)', variant: 'danger' },
} as const;

/**
 * Mapeo de estados de suscripción Mercado Pago a colores
 */
export const SUSCRIPCION_MP_ESTADO_COLORS: Record<string, EstadoColorConfig> = {
  AUTHORIZED: {
    bg: 'var(--status-success-muted)',
    text: 'var(--status-success)',
    variant: 'success',
  },
  PENDING: { bg: 'var(--status-pending-muted)', text: 'var(--status-pending)', variant: 'pending' },
  PAUSED: { bg: 'var(--status-warning-muted)', text: 'var(--status-warning)', variant: 'warning' },
  CANCELLED: { bg: 'var(--status-danger-muted)', text: 'var(--status-danger)', variant: 'danger' },
} as const;

/**
 * Mapeo de estados de suscripción Mercado Pago a labels en español
 */
export const SUSCRIPCION_MP_ESTADO_LABELS: Record<string, string> = {
  AUTHORIZED: 'Activa',
  PENDING: 'Pendiente',
  PAUSED: 'Pausada',
  CANCELLED: 'Cancelada',
} as const;

/**
 * Obtener variant de badge para un estado genérico
 */
export function getEstadoVariant(estado: string): EstadoVariant {
  const upper = estado.toUpperCase();

  // Success states
  if (['ACTIVO', 'ACTIVA', 'PAGADO', 'COMPLETADO', 'APROBADO'].includes(upper)) {
    return 'success';
  }

  // Warning states
  if (['PENDIENTE', 'PAUSADA', 'PAUSADO', 'SUSPENDIDO', 'EN_PROCESO'].includes(upper)) {
    return 'warning';
  }

  // Danger states
  if (['VENCIDO', 'VENCIDA', 'RECHAZADO', 'ERROR', 'FALLIDO'].includes(upper)) {
    return 'danger';
  }

  // Info states
  if (['BECA', 'NUEVO', 'INFO'].includes(upper)) {
    return 'info';
  }

  // Pending states
  if (['ESPERANDO', 'PROCESANDO'].includes(upper)) {
    return 'pending';
  }

  return 'neutral';
}

// ============================================================================
// PLANES - Colores por tipo de plan
// ============================================================================

export type PlanTipo = 'STEAM_SINCRONICO' | 'STEAM_ASINCRONICO' | 'STEAM_LIBROS' | 'SIN_PLAN';

export interface PlanColorConfig {
  bg: string;
  text: string;
}

export const PLAN_COLORS: Record<PlanTipo, PlanColorConfig> = {
  STEAM_SINCRONICO: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
  },
  STEAM_ASINCRONICO: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
  },
  STEAM_LIBROS: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
  },
  SIN_PLAN: {
    bg: 'bg-gray-500/20',
    text: 'text-gray-400',
  },
} as const;

/**
 * Obtener colores de un plan de forma segura
 */
export function getPlanColors(planNombre: string | null | undefined): PlanColorConfig {
  if (!planNombre) return PLAN_COLORS.SIN_PLAN;
  const key = planNombre.toUpperCase() as PlanTipo;
  return PLAN_COLORS[key] ?? PLAN_COLORS.SIN_PLAN;
}

// ============================================================================
// MUNDOS - Colores por área temática
// ============================================================================

export type MundoTipo = 'MATEMATICAS' | 'PROGRAMACION' | 'CIENCIAS';

export interface MundoColorConfig {
  solid: string;
  bg: string;
  text: string;
  gradient: string;
}

export const MUNDO_COLORS: Record<MundoTipo, MundoColorConfig> = {
  MATEMATICAS: {
    solid: '#3b82f6', // blue-500
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    gradient: 'from-blue-500 to-indigo-600',
  },
  PROGRAMACION: {
    solid: '#10b981', // emerald-500
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    gradient: 'from-emerald-500 to-teal-600',
  },
  CIENCIAS: {
    solid: '#f97316', // orange-500
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    gradient: 'from-orange-500 to-red-600',
  },
} as const;

/**
 * Obtener colores de un mundo de forma segura
 * Maneja variantes: MATEMATICA/MATEMATICAS, PROGRAMACION, CIENCIAS/CIENCIA
 */
export function getMundoColors(mundo: string | null | undefined): MundoColorConfig {
  if (!mundo) return MUNDO_COLORS.MATEMATICAS;

  const normalized = mundo.toUpperCase();

  // Normalizar variantes
  if (normalized === 'MATEMATICA' || normalized === 'MATEMATICAS') {
    return MUNDO_COLORS.MATEMATICAS;
  }
  if (normalized === 'CIENCIA' || normalized === 'CIENCIAS') {
    return MUNDO_COLORS.CIENCIAS;
  }

  const key = normalized as MundoTipo;
  return MUNDO_COLORS[key] ?? MUNDO_COLORS.MATEMATICAS;
}

// ============================================================================
// CHART COLORS - Paleta consistente para gráficos
// ============================================================================

export const CHART_COLORS = {
  primary: 'var(--admin-accent)',
  secondary: '#a855f7',
  tertiary: '#f59e0b',
  quaternary: '#06b6d4',
  success: 'var(--status-success)',
  warning: 'var(--status-warning)',
  danger: 'var(--status-danger)',
  muted: 'var(--admin-text-muted)',
} as const;

/**
 * Array de colores para charts con múltiples series
 */
export const CHART_PALETTE = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.tertiary,
  CHART_COLORS.quaternary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
] as const;
