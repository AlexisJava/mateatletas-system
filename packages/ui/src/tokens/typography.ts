/**
 * Design Tokens - Typography
 *
 * Sistema de tipografía fluida con clamp() para responsive.
 * Escalas tipográficas para diferentes contextos.
 *
 * @see ARQUITECTURA_SISTEMA_CONTENIDO_MATEATLETAS.md - Sección 2.2
 */

/**
 * Escalas tipográficas fluidas usando clamp()
 *
 * Formato: clamp(min, preferred, max)
 * - min: Tamaño mínimo en mobile
 * - preferred: Tamaño relativo al viewport
 * - max: Tamaño máximo en desktop
 */
export const fontSizes = {
  /** Display gigante - Hero slides */
  hero: 'clamp(2rem, 5vw, 4rem)',
  /** Títulos principales */
  title: 'clamp(1.5rem, 3vw, 2.5rem)',
  /** Subtítulos */
  subtitle: 'clamp(1.25rem, 2.5vw, 2rem)',
  /** Texto de cuerpo */
  body: 'clamp(1rem, 2vw, 1.25rem)',
  /** Texto pequeño - labels, captions */
  small: 'clamp(0.75rem, 1.5vw, 0.875rem)',
  /** Texto muy pequeño - badges, metadata */
  tiny: 'clamp(0.625rem, 1vw, 0.75rem)',
} as const;

export type FontSizePreset = keyof typeof fontSizes;

/**
 * Pesos de fuente
 */
export const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const;

export type FontWeightPreset = keyof typeof fontWeights;

/**
 * Alturas de línea
 */
export const lineHeights = {
  /** Para títulos */
  tight: 1.1,
  /** Para subtítulos */
  snug: 1.25,
  /** Para cuerpo de texto */
  normal: 1.5,
  /** Para texto con mucho espacio */
  relaxed: 1.75,
} as const;

export type LineHeightPreset = keyof typeof lineHeights;

/**
 * Espaciado entre letras
 */
export const letterSpacings = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

export type LetterSpacingPreset = keyof typeof letterSpacings;

/**
 * Familias de fuentes recomendadas (NO genéricas)
 *
 * Nota: Estas son sugerencias. La implementación final
 * depende de las fuentes cargadas en la app.
 */
export const fontFamilies = {
  /** Para títulos y display - debe ser distintiva */
  display: '"Space Grotesk", "Outfit", system-ui, sans-serif',
  /** Para cuerpo de texto */
  body: '"Inter", "DM Sans", system-ui, sans-serif',
  /** Para código y fórmulas */
  mono: '"JetBrains Mono", "Fira Code", monospace',
} as const;

export type FontFamilyPreset = keyof typeof fontFamilies;

/**
 * Agrupa todos los tokens de tipografía
 */
export const typographyTokens = {
  sizes: fontSizes,
  weights: fontWeights,
  lineHeights,
  letterSpacings,
  families: fontFamilies,
} as const;
