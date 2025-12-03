import type { StudioTheme } from '../types';

/**
 * Tema VERTEX - Para preadolescentes de 10-12 años
 *
 * Características:
 * - Colores equilibrados (blue/cyan)
 * - Bordes redondeados pero no excesivos (lg)
 * - Animaciones normales
 * - Text-shadow sutil, sin stroke
 * - Balance entre diversión y seriedad
 */
export const casaVertexTheme: StudioTheme = {
  name: 'casa-vertex',
  casa: 'VERTEX',
  description: 'Tema equilibrado para preadolescentes de 10-12 años',

  colors: {
    primary: '#3b82f6', // blue-500
    secondary: '#06b6d4', // cyan-500
    success: '#10b981', // emerald-500
    error: '#ef4444', // red-500
    warning: '#f59e0b', // amber-500
    surface: {
      0: '#0c1929', // custom blue dark
      1: '#0f2744', // custom blue
      2: '#1e3a5f', // custom blue lighter
      3: '#2563eb', // blue-600 with opacity
    },
    text: {
      primary: '#ffffff',
      secondary: '#93c5fd', // blue-300
      muted: '#60a5fa', // blue-400
    },
    border: '#2563eb', // blue-600
  },

  gradients: {
    primary: 'from-blue-500 to-cyan-500',
    success: 'from-emerald-500 to-teal-500',
    error: 'from-red-500 to-rose-500',
    warning: 'from-amber-500 to-orange-500',
  },

  typography: {
    displayFont: 'font-[family-name:var(--font-nunito)]',
    bodyFont: 'font-[family-name:var(--font-nunito)]',
    useTextShadow: true,
    useTextStroke: false,
  },

  borders: {
    radius: 'lg',
    width: 3,
  },

  shadows: {
    useBrawlStyle: false,
    sm: 'shadow-sm shadow-blue-900/30',
    md: 'shadow-md shadow-blue-900/40',
    lg: 'shadow-lg shadow-blue-900/50',
  },

  animations: {
    useFramerMotion: true,
    intensity: 'normal',
  },
};
