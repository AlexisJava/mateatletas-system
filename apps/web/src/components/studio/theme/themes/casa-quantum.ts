import type { StudioTheme } from '../types';

/**
 * Tema QUANTUM - Para niños de 6-9 años
 *
 * Características:
 * - Colores vivos y alegres (emerald/teal)
 * - Bordes muy redondeados (2xl)
 * - Animaciones playful
 * - Efectos de texto 3D (text-shadow, stroke)
 * - Estilo inspirado en juegos casuales
 */
export const casaQuantumTheme: StudioTheme = {
  name: 'casa-quantum',
  casa: 'QUANTUM',
  description: 'Tema colorido y divertido para niños de 6-9 años',

  colors: {
    primary: '#10b981', // emerald-500
    secondary: '#14b8a6', // teal-500
    success: '#22c55e', // green-500
    error: '#f43f5e', // rose-500
    warning: '#fbbf24', // amber-400
    surface: {
      0: '#042f2e', // teal-950
      1: '#0d3331', // custom teal dark
      2: '#134e4a', // teal-900
      3: '#115e59', // teal-800
    },
    text: {
      primary: '#ffffff',
      secondary: '#a7f3d0', // emerald-200
      muted: '#6ee7b7', // emerald-300
    },
    border: '#059669', // emerald-600
  },

  gradients: {
    primary: 'from-emerald-500 to-teal-500',
    success: 'from-green-400 to-emerald-500',
    error: 'from-rose-500 to-pink-600',
    warning: 'from-amber-400 to-orange-500',
  },

  typography: {
    displayFont: 'font-[family-name:var(--font-lilita)]',
    bodyFont: 'font-[family-name:var(--font-nunito)]',
    useTextShadow: true,
    useTextStroke: true,
  },

  borders: {
    radius: '2xl',
    width: 4,
  },

  shadows: {
    useBrawlStyle: true,
    sm: 'shadow-[0_4px_0_rgba(0,0,0,0.3)]',
    md: 'shadow-[0_6px_0_rgba(0,0,0,0.4)]',
    lg: 'shadow-[0_8px_0_rgba(0,0,0,0.5)]',
  },

  animations: {
    useFramerMotion: true,
    intensity: 'playful',
  },
};
