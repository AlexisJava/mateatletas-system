/**
 * 🎨 Multi-Theme Design System
 *
 * Sistema de temas para Mateatletas con identidades únicas por sección
 * pero manteniendo consistencia en principios de diseño.
 *
 * Principios compartidos:
 * - Glass-morphism (backdrop-blur + transparencia)
 * - Bordes redondeados (rounded-xl, rounded-2xl, rounded-3xl)
 * - Grids perfectamente simétricos (Material UI Grid)
 * - Animaciones sutiles (Framer Motion)
 * - Hover effects consistentes
 */

export type ThemeName = 'estudiante' | 'tutor' | 'docente' | 'admin' | 'landing';

export interface ThemeColors {
  // Colores primarios (gradientes)
  primary: string;
  primaryDark: string;
  secondary: string;
  accent: string;

  // Gradientes predefinidos
  gradientBg: string; // Background principal
  gradientCard: string; // Tarjetas destacadas
  gradientButton: string; // Botones CTA

  // Glass-morphism
  glassBg: string;
  glassBorder: string;
  glassHover: string;

  // Estados
  success: string;
  warning: string;
  error: string;
  info: string;
}

export const themes: Record<ThemeName, ThemeColors> = {
  // Estudiante: Purple-Pink-Orange (MANTENER - el usuario lo ama)
  estudiante: {
    primary: 'purple-600',
    primaryDark: 'purple-900',
    secondary: 'pink-600',
    accent: 'orange-500',

    gradientBg: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
    gradientCard: 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500',
    gradientButton: 'bg-gradient-to-r from-purple-600 to-pink-600',

    glassBg: 'bg-white/10 backdrop-blur-sm',
    glassBorder: 'border border-white/20',
    glassHover: 'hover:bg-white/20',

    success: 'green-500',
    warning: 'yellow-500',
    error: 'red-500',
    info: 'blue-500',
  },

  // Tutor: Blues-Cyans-Teals (Profesional, confiable, familiar)
  tutor: {
    primary: 'blue-600',
    primaryDark: 'blue-900',
    secondary: 'cyan-600',
    accent: 'teal-500',

    gradientBg: 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900',
    gradientCard: 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500',
    gradientButton: 'bg-gradient-to-r from-blue-600 to-cyan-600',

    glassBg: 'bg-white/10 backdrop-blur-sm',
    glassBorder: 'border border-white/20',
    glassHover: 'hover:bg-white/20',

    success: 'green-500',
    warning: 'yellow-500',
    error: 'red-500',
    info: 'cyan-500',
  },

  // Docente: Greens-Emeralds-Limes (Educación, crecimiento, expertise)
  docente: {
    primary: 'green-600',
    primaryDark: 'green-900',
    secondary: 'emerald-600',
    accent: 'lime-500',

    gradientBg: 'bg-gradient-to-br from-slate-900 via-green-900 to-slate-900',
    gradientCard: 'bg-gradient-to-r from-green-600 via-emerald-600 to-lime-500',
    gradientButton: 'bg-gradient-to-r from-green-600 to-emerald-600',

    glassBg: 'bg-white/10 backdrop-blur-sm',
    glassBorder: 'border border-white/20',
    glassHover: 'hover:bg-white/20',

    success: 'emerald-500',
    warning: 'yellow-500',
    error: 'red-500',
    info: 'blue-500',
  },

  // Admin: Reds-Oranges-Ambers (Poder, control, alertas)
  admin: {
    primary: 'red-600',
    primaryDark: 'red-900',
    secondary: 'orange-600',
    accent: 'amber-500',

    gradientBg: 'bg-gradient-to-br from-slate-900 via-red-900 to-slate-900',
    gradientCard: 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-500',
    gradientButton: 'bg-gradient-to-r from-red-600 to-orange-600',

    glassBg: 'bg-white/10 backdrop-blur-sm',
    glassBorder: 'border border-white/20',
    glassHover: 'hover:bg-white/20',

    success: 'green-500',
    warning: 'amber-500',
    error: 'red-500',
    info: 'blue-500',
  },

  // Landing: Blues-Purples-Greens (Acogedor, innovador, matemático)
  landing: {
    primary: 'blue-600',
    primaryDark: 'blue-900',
    secondary: 'purple-600',
    accent: 'green-500',

    gradientBg: 'bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900',
    gradientCard: 'bg-gradient-to-r from-blue-600 via-purple-600 to-green-500',
    gradientButton: 'bg-gradient-to-r from-blue-600 to-purple-600',

    glassBg: 'bg-white/10 backdrop-blur-sm',
    glassBorder: 'border border-white/20',
    glassHover: 'hover:bg-white/20',

    success: 'green-500',
    warning: 'yellow-500',
    error: 'red-500',
    info: 'blue-500',
  },
};

/**
 * Hook para usar el tema actual basado en la ruta
 */
export function useCurrentTheme(): ThemeColors {
  if (typeof window === 'undefined') {
    return themes.landing;
  }

  const path = window.location.pathname;

  if (path.startsWith('/estudiante')) return themes.estudiante;
  if (path.startsWith('/tutor') || path.startsWith('/dashboard')) return themes.tutor;
  if (path.startsWith('/docente')) return themes.docente;
  if (path.startsWith('/admin')) return themes.admin;

  return themes.landing;
}

/**
 * Obtener tema por nombre
 */
export function getTheme(name: ThemeName): ThemeColors {
  return themes[name];
}
