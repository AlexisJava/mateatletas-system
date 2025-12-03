import type { StudioTheme } from '../types';

/**
 * Tema PULSAR - Para adolescentes de 13-17 años
 *
 * Características:
 * - Colores más sobrios (purple/indigo)
 * - Bordes menos redondeados (md)
 * - Animaciones sutiles
 * - Sin efectos 3D de texto
 * - Estilo más maduro y profesional
 */
export const casaPulsarTheme: StudioTheme = {
  name: 'casa-pulsar',
  casa: 'PULSAR',
  description: 'Tema sobrio y moderno para adolescentes de 13-17 años',

  colors: {
    primary: '#8b5cf6', // violet-500
    secondary: '#6366f1', // indigo-500
    success: '#22c55e', // green-500
    error: '#dc2626', // red-600
    warning: '#d97706', // amber-600
    surface: {
      0: '#0f0a1a', // custom purple dark
      1: '#1a1425', // custom purple
      2: '#2d2440', // custom purple lighter
      3: '#3d3259', // custom purple lightest
    },
    text: {
      primary: '#fafafa',
      secondary: '#c4b5fd', // violet-300
      muted: '#a78bfa', // violet-400
    },
    border: '#4c1d95', // violet-900
  },

  gradients: {
    primary: 'from-violet-500 to-purple-600',
    success: 'from-green-500 to-emerald-600',
    error: 'from-red-600 to-rose-600',
    warning: 'from-amber-600 to-orange-600',
  },

  typography: {
    displayFont: 'font-[family-name:var(--font-inter)]',
    bodyFont: 'font-[family-name:var(--font-inter)]',
    useTextShadow: false,
    useTextStroke: false,
  },

  borders: {
    radius: 'md',
    width: 2,
  },

  shadows: {
    useBrawlStyle: false,
    sm: 'shadow-sm shadow-violet-950/40',
    md: 'shadow-md shadow-violet-950/50',
    lg: 'shadow-lg shadow-violet-950/60',
  },

  animations: {
    useFramerMotion: true,
    intensity: 'subtle',
  },
};
