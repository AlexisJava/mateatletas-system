/**
 * Docente Dashboard Types - Tipos locales para el portal docente
 *
 * Sigue la misma estructura que admin-dashboard.types.ts para mantener
 * consistencia en el sistema de diseño.
 */

// =============================================================================
// ENUMS Y CONSTANTES
// =============================================================================

/**
 * Vistas disponibles en el portal docente
 * Mapea a las rutas de Next.js App Router
 */
export const DocenteView = {
  DASHBOARD: 'dashboard',
  PLANIFICACIONES: 'planificaciones',
  CALENDARIO: 'calendario',
  OBSERVACIONES: 'observaciones',
  PERFIL: 'perfil',
} as const;

export type DocenteView = (typeof DocenteView)[keyof typeof DocenteView];

// =============================================================================
// TIPOS DE NAVEGACIÓN
// =============================================================================

/**
 * Item de navegación en el tab bar del docente
 */
export interface DocenteNavItem {
  view: DocenteView;
  label: string;
  href: string;
  icon: string; // Nombre del icono de Lucide
  badge?: number;
}

/**
 * Configuración de navegación del portal docente
 */
export const DOCENTE_NAV_ITEMS: DocenteNavItem[] = [
  {
    view: DocenteView.DASHBOARD,
    label: 'Dashboard',
    href: '/docente/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    view: DocenteView.PLANIFICACIONES,
    label: 'Planificaciones',
    href: '/docente/planificaciones',
    icon: 'BookOpen',
  },
  {
    view: DocenteView.CALENDARIO,
    label: 'Calendario',
    href: '/docente/calendario',
    icon: 'Calendar',
  },
  {
    view: DocenteView.OBSERVACIONES,
    label: 'Observaciones',
    href: '/docente/observaciones',
    icon: 'FileText',
  },
  {
    view: DocenteView.PERFIL,
    label: 'Mi Perfil',
    href: '/docente/perfil',
    icon: 'User',
  },
];
