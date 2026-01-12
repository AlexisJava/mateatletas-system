/**
 * Design Tokens - Colors
 *
 * Tokens de color para las 3 casas (houses) y las 3 áreas temáticas.
 * Cada casa tiene una paleta específica adaptada a su rango de edad.
 *
 * @see ARQUITECTURA_SISTEMA_CONTENIDO_MATEATLETAS.md - Sección 6.1, 6.2
 */

/**
 * Tokens por Casa (House)
 *
 * - QUANTUM (6-9 años): Colores brillantes, amigables
 * - VERTEX (10-12 años): Colores tech, energéticos
 * - PULSAR (13-17 años): Colores maduros, profesionales
 */
export const houseTokens = {
  quantum: {
    primary: '#8b5cf6', // Púrpura vibrante
    secondary: '#06b6d4', // Cyan
    accent: '#f59e0b', // Ámbar
    background: '#0f0a1e', // Púrpura muy oscuro
    surface: '#1a1033',
    text: '#f8fafc',
    gradient: 'from-purple-600 via-cyan-500 to-amber-400',
  },
  vertex: {
    primary: '#10b981', // Esmeralda
    secondary: '#3b82f6', // Azul
    accent: '#f97316', // Naranja
    background: '#030a0f', // Azul muy oscuro
    surface: '#0a1929',
    text: '#f8fafc',
    gradient: 'from-emerald-500 via-blue-500 to-orange-500',
  },
  pulsar: {
    primary: '#ec4899', // Rosa
    secondary: '#8b5cf6', // Púrpura
    accent: '#14b8a6', // Teal
    background: '#0a0a0a', // Casi negro
    surface: '#171717',
    text: '#f8fafc',
    gradient: 'from-pink-500 via-purple-500 to-teal-500',
  },
} as const;

export type House = keyof typeof houseTokens;
export type HouseTokens = (typeof houseTokens)[House];

/**
 * Tokens por Área Temática
 *
 * - MATH: Matemáticas - estilo blueprint, azul
 * - CODE: Programación - estilo matrix, verde
 * - SCIENCE: Ciencias - estilo orgánico, púrpura
 */
export const areaTokens = {
  math: {
    icon: '📐',
    pattern: 'blueprint', // Fondo cuadriculado
    accent: '#3b82f6', // Azul
    illustrations: 'geometric', // Estilo de ilustraciones
  },
  code: {
    icon: '💻',
    pattern: 'matrix', // Lluvia de código
    accent: '#10b981', // Verde
    illustrations: 'tech',
  },
  science: {
    icon: '🔬',
    pattern: 'molecules', // Moléculas flotantes
    accent: '#8b5cf6', // Púrpura
    illustrations: 'organic',
  },
} as const;

export type Area = keyof typeof areaTokens;
export type AreaTokens = (typeof areaTokens)[Area];

/**
 * Convierte house tokens a CSS custom properties
 */
export function houseToCSS(house: House): Record<string, string> {
  const tokens = houseTokens[house];
  return {
    '--color-primary': tokens.primary,
    '--color-secondary': tokens.secondary,
    '--color-accent': tokens.accent,
    '--color-background': tokens.background,
    '--color-surface': tokens.surface,
    '--color-text': tokens.text,
  };
}
