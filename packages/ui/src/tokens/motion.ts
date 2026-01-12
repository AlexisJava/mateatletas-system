/**
 * Design Tokens - Motion
 *
 * Tokens de animación para Framer Motion.
 * Springs, duraciones, easings y animaciones de entrada predefinidas.
 *
 * @see ARQUITECTURA_SISTEMA_CONTENIDO_MATEATLETAS.md - Sección 6.3
 */

/**
 * Configuraciones de spring para Framer Motion
 */
export const springs = {
  /** Rápido y preciso - para UI feedback */
  snappy: { damping: 30, stiffness: 400 },
  /** Rebote suave - para elementos divertidos */
  bouncy: { damping: 15, stiffness: 300 },
  /** Suave - para transiciones de página */
  gentle: { damping: 25, stiffness: 200 },
  /** Lento y dramático - para reveals importantes */
  slow: { damping: 40, stiffness: 100 },
} as const;

export type SpringPreset = keyof typeof springs;

/**
 * Duraciones en segundos
 */
export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  dramatic: 0.8,
} as const;

export type DurationPreset = keyof typeof durations;

/**
 * Curvas de easing (cubic bezier)
 */
export const easings = {
  easeOut: [0.16, 1, 0.3, 1] as const,
  easeIn: [0.4, 0, 1, 1] as const,
  easeInOut: [0.4, 0, 0.2, 1] as const,
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
} as const;

export type EasingPreset = keyof typeof easings;

/**
 * Animaciones de entrada predefinidas para Framer Motion
 *
 * Uso:
 * ```tsx
 * <motion.div {...entrances.slideUp} />
 * ```
 */
export const entrances = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  pop: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.5 },
    transition: { type: 'spring', damping: 15, stiffness: 300 },
  },
} as const;

export type EntrancePreset = keyof typeof entrances;

/**
 * Agrupa todos los tokens de motion
 */
export const motionTokens = {
  springs,
  durations,
  easings,
  entrances,
} as const;
