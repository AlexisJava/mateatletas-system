/**
 * tokens.ts - Sistema de Tokens de Diseño Centralizado
 *
 * FUENTE DE VERDAD del design system de Mateatletas.
 * Todos los colores, tipografías, espaciados y efectos deben
 * referenciarse desde este archivo.
 *
 * USO:
 * import { colors, typography, spacing, getVariantColors } from '@/lib/tokens';
 *
 * VARIANTES:
 * - admin: Glassmorphism oscuro con violeta/azul/emerald (OS style)
 * - docente: Elegante con purple/indigo, soporte light/dark
 * - tutor: Minimalista con gradientes cálidos (orange/yellow/cyan)
 * - estudiante: Futurista espacial con cyan/blue/purple
 * - shared: Colores semánticos comunes (success, error, warning, info)
 */

// ============================================================================
// TIPOS
// ============================================================================

/** Variantes de rol/portal disponibles */
export type DesignVariant = 'admin' | 'docente' | 'tutor' | 'estudiante';

/** Modos de tema */
export type ThemeMode = 'light' | 'dark';

/** Paleta de colores para una variante */
export interface VariantColorPalette {
  /** Colores de fondo */
  background: {
    gradient: {
      from: string;
      via: string;
      to: string;
    };
    card: string;
    hover: string;
    glass: string;
  };
  /** Colores de texto */
  text: {
    primary: string;
    secondary: string;
    muted: string;
    accent: string;
  };
  /** Colores de borde */
  border: {
    default: string;
    subtle: string;
    glass: string;
    accent: string;
  };
  /** Colores de acento/brand */
  accent: {
    primary: string;
    secondary: string;
    hover: string;
    gradient: {
      from: string;
      to: string;
    };
  };
  /** Colores de sombras */
  shadow: {
    default: string;
    glow: string;
    card: string;
  };
}

// ============================================================================
// COLORES POR VARIANTE
// ============================================================================

/**
 * Paleta de colores ADMIN
 * Glassmorphism oscuro con violeta/azul/emerald estilo macOS
 */
export const adminColors = {
  light: {
    background: {
      gradient: {
        from: 'slate-950',
        via: 'slate-900',
        to: 'black',
      },
      card: 'white/5',
      hover: 'white/10',
      glass: 'white/5',
    },
    text: {
      primary: 'white',
      secondary: 'white/80',
      muted: 'white/50',
      accent: 'violet-400',
    },
    border: {
      default: 'white/10',
      subtle: 'white/5',
      glass: 'white/10',
      accent: 'violet-500/50',
    },
    accent: {
      primary: 'violet-500',
      secondary: 'purple-500',
      hover: 'violet-400',
      gradient: {
        from: 'violet-500',
        to: 'purple-600',
      },
    },
    shadow: {
      default: 'black/20',
      glow: 'violet-500/50',
      card: 'purple-900/30',
    },
  },
  // Admin es siempre oscuro, dark === light
  dark: null,
} as const;

/**
 * Paleta de colores DOCENTE
 * Elegante con purple/indigo, soporte light/dark mode
 */
export const docenteColors = {
  light: {
    background: {
      gradient: {
        from: 'indigo-50',
        via: 'purple-50/60',
        to: 'pink-50/50',
      },
      card: 'white/65',
      hover: 'purple-100/60',
      glass: 'white/65',
    },
    text: {
      primary: 'indigo-900',
      secondary: 'purple-600',
      muted: 'gray-500',
      accent: 'violet-600',
    },
    border: {
      default: 'purple-200/30',
      subtle: 'purple-100/20',
      glass: 'purple-200/30',
      accent: 'purple-500/50',
    },
    accent: {
      primary: 'violet-500',
      secondary: 'purple-600',
      hover: 'violet-600',
      gradient: {
        from: 'violet-500',
        to: 'purple-600',
      },
    },
    shadow: {
      default: 'purple-200/20',
      glow: 'purple-500/40',
      card: 'purple-200/20',
    },
  },
  dark: {
    background: {
      gradient: {
        from: '[#0f0a1f]',
        via: 'indigo-950',
        to: 'indigo-900',
      },
      card: 'indigo-950/60',
      hover: 'purple-900/40',
      glass: 'indigo-950/60',
    },
    text: {
      primary: 'white',
      secondary: 'purple-100',
      muted: 'purple-300',
      accent: 'purple-400',
    },
    border: {
      default: 'purple-700/30',
      subtle: 'purple-800/20',
      glass: 'purple-700/30',
      accent: 'purple-500/50',
    },
    accent: {
      primary: 'violet-500',
      secondary: 'purple-500',
      hover: 'violet-400',
      gradient: {
        from: 'violet-500',
        to: 'purple-600',
      },
    },
    shadow: {
      default: 'purple-900/30',
      glow: 'purple-500/40',
      card: 'purple-900/30',
    },
  },
} as const;

/**
 * Paleta de colores TUTOR
 * Minimalista con gradientes cálidos (orange/yellow/cyan)
 */
export const tutorColors = {
  light: {
    background: {
      gradient: {
        from: '[#ff6b35]',
        via: '[#f7b801]',
        to: '[#00d9ff]',
      },
      card: 'white',
      hover: 'gray-50',
      glass: 'white/80',
    },
    text: {
      primary: 'gray-900',
      secondary: 'gray-600',
      muted: 'gray-500',
      accent: 'orange-600',
    },
    border: {
      default: 'gray-200',
      subtle: 'gray-100',
      glass: 'white/20',
      accent: 'orange-500/50',
    },
    accent: {
      primary: 'orange-500',
      secondary: 'yellow-500',
      hover: 'orange-600',
      gradient: {
        from: 'orange-500',
        to: 'yellow-500',
      },
    },
    shadow: {
      default: 'gray-200/50',
      glow: 'orange-500/30',
      card: 'gray-300/30',
    },
  },
  dark: {
    background: {
      gradient: {
        from: 'gray-900',
        via: 'gray-800',
        to: 'gray-900',
      },
      card: 'gray-800',
      hover: 'gray-700',
      glass: 'gray-800/80',
    },
    text: {
      primary: 'white',
      secondary: 'gray-300',
      muted: 'gray-400',
      accent: 'orange-400',
    },
    border: {
      default: 'gray-700',
      subtle: 'gray-800',
      glass: 'gray-700/50',
      accent: 'orange-500/50',
    },
    accent: {
      primary: 'orange-400',
      secondary: 'yellow-400',
      hover: 'orange-300',
      gradient: {
        from: 'orange-400',
        to: 'yellow-400',
      },
    },
    shadow: {
      default: 'black/30',
      glow: 'orange-500/30',
      card: 'black/20',
    },
  },
} as const;

/**
 * Paleta de colores ESTUDIANTE
 * Futurista espacial con cyan/blue/purple - siempre oscuro
 */
export const estudianteColors = {
  light: {
    background: {
      gradient: {
        from: 'black',
        via: 'gray-950',
        to: 'black',
      },
      card: 'gray-900/80',
      hover: 'gray-800/60',
      glass: 'black/50',
    },
    text: {
      primary: 'white',
      secondary: 'cyan-300',
      muted: 'gray-400',
      accent: 'cyan-400',
    },
    border: {
      default: 'cyan-500/30',
      subtle: 'gray-800',
      glass: 'cyan-500/20',
      accent: 'cyan-400/50',
    },
    accent: {
      primary: 'cyan-400',
      secondary: 'blue-500',
      hover: 'cyan-300',
      gradient: {
        from: 'cyan-400',
        to: 'blue-500',
      },
    },
    shadow: {
      default: 'black/50',
      glow: 'cyan-500/50',
      card: 'cyan-500/10',
    },
  },
  // Estudiante es siempre oscuro
  dark: null,
} as const;

/**
 * Colores semánticos compartidos
 * Usados consistentemente en todas las variantes
 */
export const sharedColors = {
  success: {
    light: 'emerald-500',
    dark: 'emerald-400',
    bg: {
      light: 'emerald-50',
      dark: 'emerald-950/50',
    },
    border: {
      light: 'emerald-200',
      dark: 'emerald-800',
    },
  },
  error: {
    light: 'red-500',
    dark: 'red-400',
    bg: {
      light: 'red-50',
      dark: 'red-950/50',
    },
    border: {
      light: 'red-200',
      dark: 'red-800',
    },
  },
  warning: {
    light: 'amber-500',
    dark: 'amber-400',
    bg: {
      light: 'amber-50',
      dark: 'amber-950/50',
    },
    border: {
      light: 'amber-200',
      dark: 'amber-800',
    },
  },
  info: {
    light: 'blue-500',
    dark: 'blue-400',
    bg: {
      light: 'blue-50',
      dark: 'blue-950/50',
    },
    border: {
      light: 'blue-200',
      dark: 'blue-800',
    },
  },
} as const;

/**
 * Todos los colores agrupados por variante
 */
export const colors = {
  admin: adminColors,
  docente: docenteColors,
  tutor: tutorColors,
  estudiante: estudianteColors,
  shared: sharedColors,
} as const;

// ============================================================================
// TIPOGRAFÍA
// ============================================================================

/**
 * Fuentes del sistema
 * Mateatletas usa Nunito como fuente oficial
 */
export const fontFamily = {
  /** Fuente principal - Nunito (official Mateatletas) */
  sans: 'Nunito, system-ui, sans-serif',
  /** Fuente monoespaciada para código y datos */
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
} as const;

/**
 * Tamaños de fuente
 * Basados en la escala de Tailwind con ajustes para el proyecto
 */
export const fontSize = {
  /** 10px - Badges, labels muy pequeños */
  '2xs': '0.625rem',
  /** 11px - Texto terciario, metadata */
  xs: '0.6875rem',
  /** 12px - Texto secundario, captions */
  sm: '0.75rem',
  /** 13px - Texto de UI, botones pequeños */
  md: '0.8125rem',
  /** 14px - Texto base de UI */
  base: '0.875rem',
  /** 16px - Texto de lectura, párrafos */
  lg: '1rem',
  /** 18px - Subtítulos, headings pequeños */
  xl: '1.125rem',
  /** 20px - Headings nivel 4 */
  '2xl': '1.25rem',
  /** 24px - Headings nivel 3 */
  '3xl': '1.5rem',
  /** 30px - Headings nivel 2 */
  '4xl': '1.875rem',
  /** 36px - Headings nivel 1 */
  '5xl': '2.25rem',
  /** 48px - Display text */
  '6xl': '3rem',
  /** 60px - Hero text */
  '7xl': '3.75rem',
  /** 72px - Giant display */
  '8xl': '4.5rem',
} as const;

/**
 * Pesos de fuente
 */
export const fontWeight = {
  /** 400 - Texto normal */
  normal: '400',
  /** 500 - Énfasis sutil */
  medium: '500',
  /** 600 - Énfasis notable */
  semibold: '600',
  /** 700 - Headings, botones */
  bold: '700',
  /** 800 - Extra énfasis */
  extrabold: '800',
  /** 900 - Display text, heroes */
  black: '900',
} as const;

/**
 * Line heights
 */
export const lineHeight = {
  /** Para texto compacto */
  none: '1',
  /** Para headings grandes */
  tight: '1.15',
  /** Para headings */
  snug: '1.25',
  /** Para texto de UI */
  normal: '1.5',
  /** Para párrafos */
  relaxed: '1.625',
  /** Para texto muy espaciado */
  loose: '2',
} as const;

/**
 * Letter spacing
 */
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

/**
 * Objeto consolidado de tipografía
 */
export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
} as const;

// ============================================================================
// ESPACIADO
// ============================================================================

/**
 * Escala de espaciado basada en 4px
 * Usada para margin, padding, gap, etc.
 */
export const spacing = {
  /** 0px */
  0: '0',
  /** 1px */
  px: '1px',
  /** 2px */
  0.5: '0.125rem',
  /** 4px - Mínimo */
  1: '0.25rem',
  /** 6px */
  1.5: '0.375rem',
  /** 8px - Espaciado pequeño */
  2: '0.5rem',
  /** 10px */
  2.5: '0.625rem',
  /** 12px - Espaciado medio-pequeño */
  3: '0.75rem',
  /** 14px */
  3.5: '0.875rem',
  /** 16px - Espaciado base */
  4: '1rem',
  /** 20px */
  5: '1.25rem',
  /** 24px - Espaciado medio */
  6: '1.5rem',
  /** 28px */
  7: '1.75rem',
  /** 32px - Espaciado grande */
  8: '2rem',
  /** 36px */
  9: '2.25rem',
  /** 40px */
  10: '2.5rem',
  /** 44px */
  11: '2.75rem',
  /** 48px - Espaciado XL */
  12: '3rem',
  /** 56px */
  14: '3.5rem',
  /** 64px - Espaciado 2XL */
  16: '4rem',
  /** 80px */
  20: '5rem',
  /** 96px - Espaciado 3XL */
  24: '6rem',
  /** 128px */
  32: '8rem',
  /** 160px */
  40: '10rem',
  /** 192px */
  48: '12rem',
  /** 256px */
  64: '16rem',
} as const;

// ============================================================================
// BORDES
// ============================================================================

/**
 * Border radius
 */
export const borderRadius = {
  /** 0px */
  none: '0',
  /** 2px */
  sm: '0.125rem',
  /** 4px */
  DEFAULT: '0.25rem',
  /** 6px */
  md: '0.375rem',
  /** 8px */
  lg: '0.5rem',
  /** 12px */
  xl: '0.75rem',
  /** 16px */
  '2xl': '1rem',
  /** 24px */
  '3xl': '1.5rem',
  /** 9999px */
  full: '9999px',
} as const;

/**
 * Border widths
 */
export const borderWidth = {
  /** 0px */
  0: '0',
  /** 1px - Default */
  DEFAULT: '1px',
  /** 2px - Énfasis */
  2: '2px',
  /** 4px - Fuerte */
  4: '4px',
  /** 8px - Muy fuerte */
  8: '8px',
} as const;

/**
 * Objeto consolidado de bordes
 */
export const borders = {
  radius: borderRadius,
  width: borderWidth,
} as const;

// ============================================================================
// SOMBRAS
// ============================================================================

/**
 * Sombras por variante
 * Cada variante tiene su estilo único de sombras
 */
export const shadows = {
  /** Sombras estándar de Tailwind */
  base: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
  },
  /** Sombras con glow para admin (glassmorphism) */
  admin: {
    card: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    glow: {
      violet: '0 0 40px rgba(139, 92, 246, 0.5)',
      emerald: '0 0 40px rgba(16, 185, 129, 0.5)',
      blue: '0 0 40px rgba(59, 130, 246, 0.5)',
    },
    button: '0 10px 25px -5px rgba(139, 92, 246, 0.4)',
  },
  /** Sombras sutiles para docente */
  docente: {
    card: {
      light: '0 25px 50px -12px rgba(139, 92, 246, 0.1)',
      dark: '0 25px 50px -12px rgba(139, 92, 246, 0.3)',
    },
    glow: '0 0 30px rgba(139, 92, 246, 0.4)',
    button: '0 10px 20px -5px rgba(139, 92, 246, 0.3)',
  },
  /** Sombras minimalistas para tutor */
  tutor: {
    card: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    subtle: '0 4px 12px rgba(0, 0, 0, 0.05)',
    button: '0 4px 14px rgba(0, 0, 0, 0.1)',
  },
  /** Sombras con glow neón para estudiante */
  estudiante: {
    card: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
    glow: {
      cyan: '0 0 40px rgba(34, 211, 238, 0.5)',
      blue: '0 0 40px rgba(59, 130, 246, 0.5)',
      purple: '0 0 40px rgba(168, 85, 247, 0.5)',
    },
    text: '0 0 20px rgba(34, 211, 238, 0.8)',
    neon: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor',
  },
} as const;

// ============================================================================
// ANIMACIONES
// ============================================================================

/**
 * Duraciones de animación
 */
export const animationDuration = {
  /** 75ms - Micro interacciones */
  fastest: '75ms',
  /** 100ms - Respuesta instantánea */
  fast: '100ms',
  /** 150ms - Transiciones rápidas */
  quick: '150ms',
  /** 200ms - Transiciones normales */
  normal: '200ms',
  /** 300ms - Transiciones suaves */
  smooth: '300ms',
  /** 500ms - Animaciones lentas */
  slow: '500ms',
  /** 700ms - Animaciones muy lentas */
  slower: '700ms',
  /** 1000ms - Animaciones dramáticas */
  slowest: '1000ms',
} as const;

/**
 * Funciones de timing (easing)
 */
export const animationEasing = {
  /** Movimiento lineal */
  linear: 'linear',
  /** Entrada suave */
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  /** Salida suave */
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  /** Entrada y salida suave */
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Spring effect (rebote) */
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  /** Bounce */
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

/**
 * Animaciones predefinidas
 */
export const animations = {
  duration: animationDuration,
  easing: animationEasing,
  /** Clases de animación comunes */
  presets: {
    fadeIn: 'animate-in fade-in',
    fadeOut: 'animate-out fade-out',
    slideInFromTop: 'animate-in slide-in-from-top',
    slideInFromBottom: 'animate-in slide-in-from-bottom',
    slideInFromLeft: 'animate-in slide-in-from-left',
    slideInFromRight: 'animate-in slide-in-from-right',
    spin: 'animate-spin',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    ping: 'animate-ping',
  },
} as const;

// ============================================================================
// BLUR Y BACKDROP
// ============================================================================

/**
 * Valores de blur para efectos glassmorphism
 */
export const blur = {
  none: '0',
  sm: '4px',
  DEFAULT: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '40px',
  '3xl': '64px',
} as const;

/**
 * Opacidades comunes para glassmorphism
 */
export const glassOpacity = {
  /** Casi transparente */
  subtle: '0.05',
  /** Sutil */
  light: '0.1',
  /** Normal */
  medium: '0.2',
  /** Visible */
  strong: '0.4',
  /** Prominente */
  heavy: '0.6',
  /** Casi opaco */
  solid: '0.8',
} as const;

// ============================================================================
// Z-INDEX
// ============================================================================

/**
 * Escala de z-index para layering consistente
 */
export const zIndex = {
  /** Elementos por debajo del contenido normal */
  behind: '-1',
  /** Nivel base */
  base: '0',
  /** Contenido elevado ligeramente */
  raised: '10',
  /** Dropdowns, tooltips */
  dropdown: '20',
  /** Elementos sticky */
  sticky: '30',
  /** Headers fijos */
  fixed: '40',
  /** Overlays, backdrops */
  overlay: '50',
  /** Modales */
  modal: '60',
  /** Popovers sobre modales */
  popover: '70',
  /** Toasts, notificaciones */
  toast: '80',
  /** Tooltips de máxima prioridad */
  tooltip: '90',
  /** Máximo - evitar usar */
  max: '9999',
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

/**
 * Breakpoints para responsive design
 * Consistentes con Tailwind CSS
 */
export const breakpoints = {
  /** 640px - Mobile landscape */
  sm: '640px',
  /** 768px - Tablets */
  md: '768px',
  /** 1024px - Laptops */
  lg: '1024px',
  /** 1280px - Desktops */
  xl: '1280px',
  /** 1536px - Large desktops */
  '2xl': '1536px',
} as const;

// ============================================================================
// HELPERS / UTILITIES
// ============================================================================

/**
 * Obtiene la paleta de colores para una variante específica
 * @param variant - La variante de diseño (admin, docente, tutor, estudiante)
 * @param mode - El modo de tema (light, dark). Default: 'light'
 * @returns La paleta de colores correspondiente
 *
 * @example
 * const adminPalette = getVariantColors('admin');
 * const docenteDark = getVariantColors('docente', 'dark');
 */
export function getVariantColors(
  variant: DesignVariant,
  mode: ThemeMode = 'light',
): VariantColorPalette {
  const variantColors = colors[variant];

  // Admin y estudiante son siempre oscuros
  if (variant === 'admin' || variant === 'estudiante') {
    return variantColors.light as VariantColorPalette;
  }

  // Docente y tutor soportan light/dark
  const palette = mode === 'dark' ? variantColors.dark : variantColors.light;
  return palette as VariantColorPalette;
}

/**
 * Genera clases de Tailwind para un gradiente de fondo
 * @param variant - La variante de diseño
 * @param mode - El modo de tema
 * @returns String con clases de Tailwind para el gradiente
 *
 * @example
 * <div className={getBackgroundGradient('docente', 'dark')}>
 */
export function getBackgroundGradient(variant: DesignVariant, mode: ThemeMode = 'light'): string {
  const palette = getVariantColors(variant, mode);
  const { from, via, to } = palette.background.gradient;
  return `bg-gradient-to-br from-${from} via-${via} to-${to}`;
}

/**
 * Genera clases de Tailwind para glassmorphism
 * @param variant - La variante de diseño
 * @param mode - El modo de tema
 * @returns String con clases de Tailwind para efecto glass
 *
 * @example
 * <div className={getGlassEffect('admin')}>
 */
export function getGlassEffect(variant: DesignVariant, mode: ThemeMode = 'light'): string {
  const palette = getVariantColors(variant, mode);
  return `backdrop-blur-xl bg-${palette.background.glass} border border-${palette.border.glass}`;
}

/**
 * Genera clases de Tailwind para texto según el nivel
 * @param variant - La variante de diseño
 * @param level - Nivel de texto (primary, secondary, muted, accent)
 * @param mode - El modo de tema
 * @returns String con la clase de color de texto
 *
 * @example
 * <p className={getTextColor('docente', 'secondary', 'dark')}>
 */
export function getTextColor(
  variant: DesignVariant,
  level: 'primary' | 'secondary' | 'muted' | 'accent' = 'primary',
  mode: ThemeMode = 'light',
): string {
  const palette = getVariantColors(variant, mode);
  return `text-${palette.text[level]}`;
}

/**
 * Genera clases para un botón con el estilo de la variante
 * @param variant - La variante de diseño
 * @param mode - El modo de tema
 * @returns String con clases de Tailwind para el botón
 *
 * @example
 * <button className={getButtonStyles('admin')}>Click me</button>
 */
export function getButtonStyles(variant: DesignVariant, mode: ThemeMode = 'light'): string {
  const palette = getVariantColors(variant, mode);
  const { from, to } = palette.accent.gradient;
  return `bg-gradient-to-r from-${from} to-${to} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200`;
}

/**
 * Obtiene las sombras específicas de una variante
 * @param variant - La variante de diseño
 * @returns Objeto con las sombras de la variante
 */
export function getVariantShadows(variant: DesignVariant) {
  return shadows[variant];
}

/**
 * Genera un color semántico con soporte de tema
 * @param semantic - Tipo semántico (success, error, warning, info)
 * @param mode - El modo de tema
 * @returns La clase de color
 *
 * @example
 * <span className={`text-${getSemanticColor('success', 'dark')}`}>
 */
export function getSemanticColor(
  semantic: 'success' | 'error' | 'warning' | 'info',
  mode: ThemeMode = 'light',
): string {
  return sharedColors[semantic][mode];
}

// ============================================================================
// EXPORT DEFAULT - Todo consolidado
// ============================================================================

const tokens = {
  colors,
  typography,
  spacing,
  borders,
  shadows,
  animations,
  blur,
  glassOpacity,
  zIndex,
  breakpoints,
  // Helpers
  getVariantColors,
  getBackgroundGradient,
  getGlassEffect,
  getTextColor,
  getButtonStyles,
  getVariantShadows,
  getSemanticColor,
} as const;

export default tokens;
