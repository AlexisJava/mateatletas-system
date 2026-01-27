/**
 * Design Tokens extraídos de sandbox_refactorizado.pen
 * Fuente: Pencil MCP - Enero 2026
 *
 * Estilo: Dark Glassmorphism Gaming Premium
 * Inspiración: PS5 UI, Apple Liquid Glass, Microsoft Fluent Design
 */

// =============================================================================
// COLORES BASE
// =============================================================================

export const colors = {
  // Backgrounds (del más oscuro al más claro)
  bg: {
    deep: '#08080c', // Fondo principal más profundo
    canvas: '#0c0c12', // Fondo del canvas
    surface: '#14141c', // Superficies elevadas
    elevated: '#1c1c28', // Componentes elevados (cards, modals)
    glass: '#1a1a2440', // Efecto glass (40% opacity)
  },

  // Acentos principales
  accent: {
    violet: '#8b5cf6', // Acento principal violeta
    cyan: '#06b6d4', // Acento secundario cyan
    glow: '#8b5cf630', // Glow del acento (30% opacity)
  },

  // Glows para efectos de fondo
  glow: {
    violet: '#8b5cf650', // Glow violeta (50% opacity)
    cyan: '#06b6d450', // Glow cyan (50% opacity)
  },

  // Bordes
  border: {
    subtle: '#2a2a3a', // Bordes sutiles
    glow: '#8b5cf640', // Bordes con glow (40% opacity)
  },

  // Texto
  text: {
    primary: '#ffffff', // Texto principal
    secondary: '#a0a0b8', // Texto secundario
    muted: '#606078', // Texto apagado/placeholder
  },

  // Estados
  success: '#22c55e',
} as const;

// =============================================================================
// EFECTOS GLASSMORPHISM
// =============================================================================

export const glassEffects = {
  // Card glass estándar
  card: {
    background: 'rgba(26, 26, 36, 0.25)', // #1a1a2440
    backdropBlur: '16px',
    border: 'rgba(255, 255, 255, 0.06)', // #ffffff10 aprox
    shadow: '0 8px 32px rgba(0, 0, 0, 0.36)',
  },

  // Header con blur
  header: {
    background: 'rgba(12, 12, 18, 0.5)', // #0c0c1280
    backdropBlur: '20px',
    borderBottom: 'rgba(255, 255, 255, 0.03)', // #ffffff08
  },

  // Modal/Overlay
  modal: {
    background: 'rgba(26, 26, 36, 0.96)', // #1a1a24f5
    backdropBlur: '24px',
    border: 'rgba(255, 255, 255, 0.06)',
    shadow: '0 16px 60px rgba(0, 0, 0, 0.38)',
  },

  // Tooltip
  tooltip: {
    background: 'rgba(28, 28, 40, 0.94)', // #1c1c28f0
    backdropBlur: '16px',
    border: 'rgba(255, 255, 255, 0.07)',
    shadow: '0 8px 20px rgba(0, 0, 0, 0.31)',
  },

  // Overlay oscuro (para modals)
  overlay: {
    background: 'rgba(0, 0, 0, 0.5)', // #00000080
  },
} as const;

// =============================================================================
// SPACING & SIZING
// =============================================================================

export const spacing = {
  // Padding estándar
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,

  // Gaps comunes en el diseño
  gap: {
    tight: 8,
    normal: 12,
    relaxed: 16,
    loose: 24,
    section: 32,
    page: 48,
  },
} as const;

export const sizing = {
  // Header
  headerHeight: 56,

  // Border radius
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
  },

  // Iconos
  icon: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
} as const;

// =============================================================================
// TIPOGRAFÍA
// =============================================================================

export const typography = {
  fontFamily: {
    primary: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, Consolas, monospace',
  },

  fontSize: {
    xs: 11,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 24,
    '3xl': 32,
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },
} as const;

// =============================================================================
// ANIMACIONES
// =============================================================================

export const animations = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },

  easing: {
    default: 'ease-out',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// =============================================================================
// GRADIENTES DE FONDO (BG GLOWS)
// =============================================================================

export const bgGlows = {
  violet: {
    colors: ['#8b5cf612', '#8b5cf600'], // 7% a 0% opacity
    type: 'radial' as const,
    size: { width: 600, height: 600 },
    position: { x: -100, y: -100 },
  },

  cyan: {
    colors: ['#06b6d410', '#06b6d400'], // 6% a 0% opacity
    type: 'radial' as const,
    size: { width: 500, height: 500 },
    position: { x: 950, y: 450 },
  },
} as const;

// =============================================================================
// CSS VARIABLES (para usar con Tailwind o CSS-in-JS)
// =============================================================================

export const cssVariables = `
:root {
  /* Backgrounds */
  --bg-deep: #08080c;
  --bg-canvas: #0c0c12;
  --bg-surface: #14141c;
  --bg-elevated: #1c1c28;
  --bg-glass: rgba(26, 26, 36, 0.25);

  /* Accents */
  --accent-violet: #8b5cf6;
  --accent-cyan: #06b6d4;
  --accent-glow: rgba(139, 92, 246, 0.19);

  /* Glows */
  --glow-violet: rgba(139, 92, 246, 0.31);
  --glow-cyan: rgba(6, 182, 212, 0.31);

  /* Borders */
  --border-subtle: #2a2a3a;
  --border-glow: rgba(139, 92, 246, 0.25);

  /* Text */
  --text-primary: #ffffff;
  --text-secondary: #a0a0b8;
  --text-muted: #606078;

  /* States */
  --success: #22c55e;

  /* Spacing */
  --header-height: 56px;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
}
`;
