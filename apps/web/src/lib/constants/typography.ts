/**
 * 🎨 SISTEMA DE TIPOGRAFÍA RESPONSIVA
 *
 * Escalas de fuente optimizadas para cada breakpoint
 * Garantiza legibilidad en todos los tamaños de pantalla
 */

export const FONT_SCALE = {
  mobile: {
    h1: 'text-3xl', // 30px
    h2: 'text-2xl', // 24px
    h3: 'text-xl', // 20px
    h4: 'text-lg', // 18px
    body: 'text-base', // 16px
    small: 'text-sm', // 14px
    tiny: 'text-xs', // 12px
  },
  tablet: {
    h1: 'text-4xl', // 36px
    h2: 'text-3xl', // 30px
    h3: 'text-2xl', // 24px
    h4: 'text-xl', // 20px
    body: 'text-lg', // 18px
    small: 'text-base', // 16px
    tiny: 'text-sm', // 14px
  },
  desktop: {
    h1: 'text-6xl', // 60px
    h2: 'text-5xl', // 48px
    h3: 'text-4xl', // 36px
    h4: 'text-3xl', // 30px
    body: 'text-xl', // 20px
    small: 'text-lg', // 18px
    tiny: 'text-base', // 16px
  },
} as const;

/**
 * Pesos de fuente (font-weight)
 */
export const FONT_WEIGHTS = {
  light: 'font-light', // 300
  normal: 'font-normal', // 400
  medium: 'font-medium', // 500
  semibold: 'font-semibold', // 600
  bold: 'font-bold', // 700
  extrabold: 'font-extrabold', // 800
  black: 'font-black', // 900
} as const;

/**
 * Familias de fuente del proyecto
 */
export const FONT_FAMILIES = {
  primary: 'font-[family-name:var(--font-geist-sans)]', // Geist Sans
  display: 'font-[family-name:var(--font-lilita)]', // Lilita One (títulos)
  mono: 'font-[family-name:var(--font-geist-mono)]', // Geist Mono (código)
} as const;

/**
 * Utilidad para generar clases de texto responsivas
 */
export function responsiveText(
  level: keyof typeof FONT_SCALE.mobile,
  weight: keyof typeof FONT_WEIGHTS = 'normal',
  family: keyof typeof FONT_FAMILIES = 'primary',
): string {
  return `
    ${FONT_SCALE.mobile[level]}
    tablet-l:${FONT_SCALE.tablet[level]}
    lg:${FONT_SCALE.desktop[level]}
    ${FONT_WEIGHTS[weight]}
    ${FONT_FAMILIES[family]}
  `
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Ejemplo de uso:
 *
 * <h1 className={responsiveText('h1', 'black', 'display')}>
 *   Título Responsivo
 * </h1>
 *
 * Genera:
 * "text-3xl tablet-l:text-4xl lg:text-6xl font-black font-[family-name:var(--font-lilita)]"
 */

/**
 * Clases de línea de altura (line-height) optimizadas
 */
export const LINE_HEIGHTS = {
  tight: 'leading-tight', // 1.25
  snug: 'leading-snug', // 1.375
  normal: 'leading-normal', // 1.5
  relaxed: 'leading-relaxed', // 1.625
  loose: 'leading-loose', // 2
} as const;

/**
 * Tracking (letter-spacing) para mayúsculas y títulos
 */
export const LETTER_SPACING = {
  tighter: 'tracking-tighter', // -0.05em
  tight: 'tracking-tight', // -0.025em
  normal: 'tracking-normal', // 0em
  wide: 'tracking-wide', // 0.025em
  wider: 'tracking-wider', // 0.05em
  widest: 'tracking-widest', // 0.1em
} as const;

/**
 * Estilos de texto comunes pre-definidos
 */
export const TEXT_STYLES = {
  // Títulos de sección
  sectionTitle: `
    ${responsiveText('h2', 'black', 'display')}
    ${LETTER_SPACING.wide}
    uppercase
  `
    .trim()
    .replace(/\s+/g, ' '),

  // Subtítulos
  subtitle: `
    ${responsiveText('h4', 'semibold', 'primary')}
    ${LINE_HEIGHTS.snug}
  `
    .trim()
    .replace(/\s+/g, ' '),

  // Cuerpo de texto
  body: `
    ${responsiveText('body', 'normal', 'primary')}
    ${LINE_HEIGHTS.normal}
  `
    .trim()
    .replace(/\s+/g, ' '),

  // Textos pequeños (labels, metadata)
  label: `
    ${responsiveText('small', 'bold', 'primary')}
    ${LETTER_SPACING.wide}
    uppercase
  `
    .trim()
    .replace(/\s+/g, ' '),

  // Botones
  button: `
    ${responsiveText('body', 'black', 'primary')}
    ${LETTER_SPACING.wide}
    uppercase
  `
    .trim()
    .replace(/\s+/g, ' '),
} as const;
