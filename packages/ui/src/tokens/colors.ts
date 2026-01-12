/**
 * Design Tokens - Colors
 *
 * Tokens de color para las 3 casas (houses) y las 3 áreas temáticas.
 * Cada casa tiene una paleta específica adaptada a su rango de edad.
 *
 * COLORES APROBADOS - NO MODIFICAR SIN AUTORIZACIÓN
 * Fuente de verdad: PORTAL_ESTUDIANTE_DESIGN_SYSTEM.md
 *
 * @see docs/frontend/PORTAL_ESTUDIANTE_DESIGN_SYSTEM.md
 */

/**
 * Tokens por Casa (House)
 *
 * - QUANTUM (6-9 años): Rosa/Pink - Colores cálidos y amigables para los más pequeños
 * - VERTEX (10-12 años): Azul/Blue - Colores tech y energéticos para pre-adolescentes
 * - PULSAR (13-17 años): Verde/Emerald - Colores maduros y profesionales para adolescentes
 */
export const houseTokens = {
  quantum: {
    id: 'quantum',
    name: 'Quantum',
    ageRange: '6-9 años',
    colors: {
      primary: '#F472B6', // Pink-400
      secondary: '#EC4899', // Pink-500
      accent: '#FBCFE8', // Pink-200
    },
    // Colores legacy (para compatibilidad)
    background: '#030014',
    surface: '#0f0720',
    text: '#f1f5f9',
    gradient: 'from-pink-400 via-pink-500 to-pink-200',
  },
  vertex: {
    id: 'vertex',
    name: 'Vertex',
    ageRange: '10-12 años',
    colors: {
      primary: '#60A5FA', // Blue-400
      secondary: '#3B82F6', // Blue-500
      accent: '#BFDBFE', // Blue-200
    },
    background: '#030014',
    surface: '#0f0720',
    text: '#f1f5f9',
    gradient: 'from-blue-400 via-blue-500 to-blue-200',
  },
  pulsar: {
    id: 'pulsar',
    name: 'Pulsar',
    ageRange: '13-17 años',
    colors: {
      primary: '#34D399', // Emerald-400
      secondary: '#10B981', // Emerald-500
      accent: '#A7F3D0', // Emerald-200
    },
    background: '#030014',
    surface: '#0f0720',
    text: '#f1f5f9',
    gradient: 'from-emerald-400 via-emerald-500 to-emerald-200',
  },
} as const;

export type HouseType = keyof typeof houseTokens;
export type HouseTokens = (typeof houseTokens)[HouseType];

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
export function houseToCSS(house: HouseType): Record<string, string> {
  const tokens = houseTokens[house];
  return {
    '--house-primary': tokens.colors.primary,
    '--house-secondary': tokens.colors.secondary,
    '--house-accent': tokens.colors.accent,
    '--house-primary-alpha': `${tokens.colors.primary}66`, // 40% opacity
    '--color-background': tokens.background,
    '--color-surface': tokens.surface,
    '--color-text': tokens.text,
  };
}

/**
 * Portal Estudiante - Colores base
 * Estos NUNCA cambian, independiente de la casa
 */
export const estudianteBaseColors = {
  background: '#030014',
  backgroundCard: 'rgba(15, 7, 32, 0.6)',
  backgroundSurface: 'rgba(30, 27, 75, 0.5)',
  border: 'rgba(255, 255, 255, 0.05)',
  borderAccent: 'rgba(255, 255, 255, 0.1)',
  text: {
    primary: '#f1f5f9', // slate-100
    secondary: '#e2e8f0', // slate-200
    tertiary: '#cbd5e1', // slate-300
    muted: '#94a3b8', // slate-400
    subtle: '#64748b', // slate-500
  },
  // BIT mascota - ojos siempre cyan
  bitEyes: '#06b6d4',
  // Gamificación
  xp: '#fbbf24', // amber
  streak: '#f97316', // orange
  achievement: '#a855f7', // purple
  // Feedback
  correct: '#22c55e', // green
  incorrect: '#ef4444', // red
} as const;
