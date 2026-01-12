/**
 * Mateatletas Design System - Typography Tokens
 *
 * Fuentes REALES en uso (alineadas con globals.css):
 * - General/Estudiante: Nunito (amigable, redondeada)
 * - Admin/Docente: Inter (profesional, legible)
 * - Código: JetBrains Mono / IBM Plex Mono (monoespaciada)
 * - Títulos especiales: Outfit (moderno, geométrico)
 *
 * NOTA: Space Grotesk, Plus Jakarta Sans y Caveat NO se usan actualmente.
 */

export const fontFamily = {
  // Fonts realmente en uso
  heading: '"Outfit", "Nunito", ui-sans-serif, system-ui, sans-serif',
  body: '"Nunito", ui-sans-serif, system-ui, sans-serif',
  mono: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',

  // Variantes por portal
  admin: '"Inter", ui-sans-serif, system-ui, sans-serif',
  docente: '"Inter", ui-sans-serif, system-ui, sans-serif',
  estudiante: '"Nunito", ui-sans-serif, system-ui, sans-serif',
} as const;

export const fontSize = {
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem', // 48px
  '6xl': '3.75rem', // 60px
} as const;

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const;

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

// Clases de Tailwind para tipografía
export const typographyClasses = {
  // Headings
  h1: 'font-heading text-4xl md:text-5xl font-bold tracking-tight',
  h2: 'font-heading text-3xl md:text-4xl font-bold tracking-tight',
  h3: 'font-heading text-2xl md:text-3xl font-semibold',
  h4: 'font-heading text-xl md:text-2xl font-semibold',
  h5: 'font-heading text-lg md:text-xl font-medium',
  h6: 'font-heading text-base md:text-lg font-medium',

  // Body
  body: 'font-body text-base leading-relaxed',
  bodySmall: 'font-body text-sm leading-relaxed',
  bodyLarge: 'font-body text-lg leading-relaxed',

  // Code
  code: 'font-mono text-sm',
  codeBlock: 'font-mono text-sm leading-relaxed',

  // Labels & Captions
  label: 'font-body text-sm font-medium',
  caption: 'font-body text-xs text-dim',

  // Special
  display: 'font-heading text-5xl md:text-6xl font-extrabold tracking-tighter',
  quote: 'font-body text-lg italic leading-relaxed',
} as const;

// Configuración para next/font (importar en layout)
export const fontImportConfig = {
  nunito: {
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-nunito',
    weight: ['400', '500', '600', '700', '800'],
  },
  inter: {
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
    weight: ['400', '500', '600', '700'],
  },
  jetbrainsMono: {
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-mono',
    weight: ['400', '500', '700'],
  },
  outfit: {
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-heading',
    weight: ['400', '500', '600', '700', '800'],
  },
} as const;

export type FontFamily = keyof typeof fontFamily;
export type FontSize = keyof typeof fontSize;
export type FontWeight = keyof typeof fontWeight;
export type LineHeight = keyof typeof lineHeight;
export type LetterSpacing = keyof typeof letterSpacing;
export type TypographyClass = keyof typeof typographyClasses;
