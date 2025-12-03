import type { StudioTheme } from '../types';

/**
 * Tema Default - Neutro para Preview/Editor
 *
 * Diseñado para ser limpio y profesional, sin distracciones.
 * Usado en el panel de administración y modo editor.
 */
export const defaultTheme: StudioTheme = {
  name: 'default',
  description: 'Tema neutro para preview y editor',

  colors: {
    primary: '#3b82f6', // blue-500
    secondary: '#6b7280', // gray-500
    success: '#22c55e', // green-500
    error: '#ef4444', // red-500
    warning: '#f59e0b', // amber-500
    surface: {
      0: '#09090b', // zinc-950
      1: '#18181b', // zinc-900
      2: '#27272a', // zinc-800
      3: '#3f3f46', // zinc-700
    },
    text: {
      primary: '#fafafa', // zinc-50
      secondary: '#a1a1aa', // zinc-400
      muted: '#71717a', // zinc-500
    },
    border: '#27272a', // zinc-800
  },

  gradients: {
    primary: 'from-blue-500 to-blue-600',
    success: 'from-green-500 to-emerald-600',
    error: 'from-red-500 to-rose-600',
    warning: 'from-amber-500 to-orange-500',
  },

  typography: {
    displayFont: 'font-[family-name:var(--font-inter)]',
    bodyFont: 'font-[family-name:var(--font-inter)]',
    useTextShadow: false,
    useTextStroke: false,
  },

  borders: {
    radius: 'lg',
    width: 1,
  },

  shadows: {
    useBrawlStyle: false,
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  },

  animations: {
    useFramerMotion: false,
    intensity: 'subtle',
  },
};
