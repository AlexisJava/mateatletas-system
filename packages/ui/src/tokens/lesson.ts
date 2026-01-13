/**
 * Design Tokens - Lesson System
 *
 * Tokens para el sistema de microlecciones e intents.
 * Extraídos del diseño de referencia "Mateatletas Dark Space System".
 *
 * Estos tokens son INDEPENDIENTES de la casa activa.
 * Los colores dinámicos se aplican via CSS variables (--house-primary, etc.)
 *
 * @see docs/ARQUITECTURA_SISTEMA_CONTENIDO_MATEATLETAS.md
 */

// =============================================================================
// BACKGROUNDS
// =============================================================================

export const backgrounds = {
  /** Fondo base del portal - NUNCA CAMBIAR */
  base: '#030014',

  /** Card estándar con glassmorphism */
  card: 'rgba(15, 7, 32, 0.6)',

  /** Card hover state - más opaco */
  cardHover: 'rgba(30, 27, 75, 0.5)',

  /** Surface para secciones internas */
  surface: 'rgba(30, 27, 75, 0.5)',

  /** Background para inputs/code blocks */
  input: '#0f0f22',

  /** Background para code examples */
  code: '#0a0a0f',

  /** Overlay semitransparente */
  overlay: 'rgba(0, 0, 0, 0.4)',
} as const;

// =============================================================================
// BORDERS
// =============================================================================

export const borders = {
  /** Borde sutil por defecto */
  subtle: 'rgba(255, 255, 255, 0.05)',

  /** Borde con más presencia */
  accent: 'rgba(255, 255, 255, 0.1)',

  /** Borde para estados hover/focus */
  interactive: 'rgba(255, 255, 255, 0.2)',

  /** Borde blanco tenue */
  white10: 'rgba(255, 255, 255, 0.1)',

  /** Borde blanco muy tenue */
  white5: 'rgba(255, 255, 255, 0.05)',

  /** Borde blanco visible */
  white20: 'rgba(255, 255, 255, 0.2)',
} as const;

// =============================================================================
// BLUR / GLASSMORPHISM
// =============================================================================

export const blur = {
  /** Blur mínimo (8px) */
  sm: '8px',

  /** Blur estándar para cards (12px) */
  md: '12px',

  /** Blur fuerte para overlays (24px) */
  lg: '24px',

  /** Blur extra para efectos ambient (60px) */
  xl: '60px',

  /** Blur máximo para glows (100px) */
  '2xl': '100px',
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const radius = {
  /** Botones, badges pequeños */
  sm: '0.5rem', // 8px

  /** Inputs, elementos medianos */
  md: '1rem', // 16px

  /** Botones grandes */
  lg: '1rem', // 16px

  /** Cards medianas */
  xl: '1.5rem', // 24px

  /** Cards grandes */
  '2xl': '2rem', // 32px

  /** Cards principales / slides */
  '3xl': '2.5rem', // 40px

  /** Full intent cards */
  full: '3rem', // 48px

  /** Círculos */
  round: '9999px',
} as const;

// =============================================================================
// SPACING (para padding interno de cards)
// =============================================================================

export const spacing = {
  /** Cards pequeñas */
  card: {
    sm: '1rem', // 16px - p-4
    md: '1.5rem', // 24px - p-6
    lg: '2rem', // 32px - p-8
    xl: '2.5rem', // 40px - p-10
    '2xl': '3rem', // 48px - p-12
  },
} as const;

// =============================================================================
// SHADOWS
// =============================================================================

export const shadows = {
  /** Sombra estándar para cards */
  card: '0 8px 32px rgba(0, 0, 0, 0.36)',

  /** Sombra elevada */
  elevated: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',

  /** Inner shadow para inputs */
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',

  /** Glow usando variable de casa - se aplica con var(--house-primary-alpha) */
  houseGlow: '0 0 20px var(--house-primary-alpha)',

  /** Neon glow para elementos destacados */
  neon: '0 0 10px var(--house-primary), 0 0 20px var(--house-primary-alpha)',

  /** Sombra para botones primarios */
  buttonPrimary:
    '0 10px 20px -5px var(--house-primary-alpha), inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.1)',

  /** Sombra para botones en hover */
  buttonHover:
    '0 15px 30px -5px var(--house-primary-alpha), inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.1)',

  /** Sombra para botones pressed */
  buttonPressed:
    '0 2px 5px -2px var(--house-primary-alpha), inset 0 2px 0 rgba(255,255,255,0.1), inset 0 2px 10px rgba(0,0,0,0.1)',
} as const;

// =============================================================================
// FEEDBACK COLORS (estados de quiz/interacción)
// =============================================================================

export const feedback = {
  correct: {
    bg: 'rgba(34, 197, 94, 0.2)',
    border: '#22c55e',
    text: '#dcfce7',
    solid: '#22c55e',
  },
  incorrect: {
    bg: 'rgba(239, 68, 68, 0.2)',
    border: '#ef4444',
    text: '#fee2e2',
    solid: '#ef4444',
  },
} as const;

// =============================================================================
// TYPOGRAPHY (específico para lecciones)
// =============================================================================

export const lessonTypography = {
  /** Font para títulos - Outfit */
  fontHeading: '"Outfit", sans-serif',

  /** Font para body - Nunito */
  fontBody: '"Nunito", sans-serif',

  /** Letter spacing para headings */
  trackingHeading: '-0.02em',

  /** Letter spacing para labels uppercase */
  trackingWide: '0.25em',

  /** Line height para texto de estudio */
  lineHeightRelaxed: '1.7',

  /** Font weight para dark mode readability */
  weightBody: 500,
} as const;

// =============================================================================
// MASCOT (BIT)
// =============================================================================

export const mascot = {
  /** Color de ojos - SIEMPRE CYAN */
  eyeColor: '#06b6d4',

  /** Tamaños del mascot */
  sizes: {
    sm: '4rem', // 64px - w-16 h-16
    md: '8rem', // 128px - w-32 h-32
    lg: '12rem', // 192px - w-48 h-48
  },
} as const;

// =============================================================================
// CARD STYLES (presets para diferentes tipos de cards)
// =============================================================================

export const cardStyles = {
  /** Card base con glassmorphism */
  base: {
    background: backgrounds.card,
    backdropFilter: `blur(${blur.md})`,
    border: `1px solid ${borders.subtle}`,
  },

  /** Card para intents (define, explain, etc.) */
  intent: {
    background: backgrounds.card,
    backdropFilter: `blur(${blur.md})`,
    border: `1px solid ${borders.subtle}`,
    borderRadius: radius.full,
    minHeight: '500px',
  },

  /** Card para quiz */
  quiz: {
    background: backgrounds.card,
    backdropFilter: `blur(${blur.md})`,
    border: `1px solid ${borders.subtle}`,
    borderRadius: radius.full,
  },

  /** Card para lessons/progreso */
  lesson: {
    background: backgrounds.card,
    backdropFilter: `blur(${blur.md})`,
    border: `1px solid ${borders.subtle}`,
    borderRadius: radius['3xl'],
  },

  /** Card para achievements */
  achievement: {
    background: backgrounds.card,
    backdropFilter: `blur(${blur.md})`,
    border: `1px solid ${borders.subtle}`,
    borderRadius: radius['3xl'],
  },
} as const;

// =============================================================================
// BUTTON STYLES (presets)
// =============================================================================

export const buttonStyles = {
  primary: {
    background: 'linear-gradient(135deg, var(--house-primary), var(--house-secondary))',
    boxShadow: shadows.buttonPrimary,
    border: `1px solid ${borders.interactive}`,
    color: 'white',
  },

  secondary: {
    background: backgrounds.surface,
    backdropFilter: `blur(10px)`,
    border: '1px solid var(--house-primary-alpha)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    color: 'white',
  },

  ghost: {
    background: 'transparent',
    border: 'none',
    color: '#cbd5e1', // slate-300
  },
} as const;

// =============================================================================
// ANIMATION SPRINGS (para Framer Motion) - específicos para lecciones
// =============================================================================

export const lessonSprings = {
  /** Spring rápido y crisp para botones */
  button: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 25,
    mass: 0.5,
  },

  /** Spring suave para cards */
  card: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
    mass: 1,
  },

  /** Spring para floating animations (mascot) */
  float: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
} as const;

// =============================================================================
// CSS VARIABLE NAMES
// =============================================================================

export const cssVars = {
  housePrimary: '--house-primary',
  houseSecondary: '--house-secondary',
  houseAccent: '--house-accent',
  housePrimaryAlpha: '--house-primary-alpha',
} as const;

// =============================================================================
// HELPER: Generar CSS variables desde house
// =============================================================================

export interface HouseTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export function houseToLessonCSS(house: HouseTheme): Record<string, string> {
  return {
    [cssVars.housePrimary]: house.colors.primary,
    [cssVars.houseSecondary]: house.colors.secondary,
    [cssVars.houseAccent]: house.colors.accent,
    [cssVars.housePrimaryAlpha]: `${house.colors.primary}66`, // 40% opacity
  };
}

// =============================================================================
// EXPORT TYPES
// =============================================================================

export type Background = keyof typeof backgrounds;
export type Border = keyof typeof borders;
export type Blur = keyof typeof blur;
export type Radius = keyof typeof radius;
export type Shadow = keyof typeof shadows;
export type CardStyle = keyof typeof cardStyles;
export type ButtonStyle = keyof typeof buttonStyles;
