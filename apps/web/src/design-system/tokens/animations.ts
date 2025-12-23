/**
 * Mateatletas Design System - Animation Tokens
 *
 * Definiciones de animaciones y transiciones
 * Los keyframes están en global.css
 */

// Duraciones de animación
export const duration = {
  instant: '0ms',
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '700ms',
  slowest: '1000ms',
} as const;

// Curvas de easing
export const easing = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

// Clases de animación (corresponden a keyframes en global.css)
export const animationClasses = {
  // Fade animations
  fadeIn: 'animate-fadeIn',
  fadeInUp: 'animate-fadeInUp',
  fadeInDown: 'animate-fadeInDown',
  fadeInLeft: 'animate-fadeInLeft',
  fadeInRight: 'animate-fadeInRight',
  fadeOut: 'animate-fadeOut',

  // Scale animations
  scaleIn: 'animate-scaleIn',
  scaleInBounce: 'animate-scaleInBounce',
  scaleOut: 'animate-scaleOut',

  // Float animations
  float: 'animate-float',
  floatRotate: 'animate-floatRotate',
  floatSlow: 'animate-floatSlow',

  // Pulse animations
  pulse: 'animate-pulse',
  pulseSoft: 'animate-pulseSoft',
  pulseGlow: 'animate-pulseGlow',

  // Bounce animations
  bounce: 'animate-bounce',
  bounceSoft: 'animate-bounceSoft',
  bounceIn: 'animate-bounceIn',

  // Special effects
  shimmer: 'animate-shimmer',
  gradientShift: 'animate-gradientShift',
  shake: 'animate-shake',
  wiggle: 'animate-wiggle',

  // Glow & Neon
  glow: 'animate-glow',
  neonFlicker: 'animate-neonFlicker',

  // Glitch (para tema Hacker)
  glitch: 'animate-glitch',
  glitchText: 'animate-glitchText',

  // CRT (para tema Terminal)
  crtFlicker: 'animate-crtFlicker',
  scanline: 'animate-scanline',

  // Success/Achievement
  confetti: 'animate-confetti',
  successPop: 'animate-successPop',
  celebrate: 'animate-celebrate',

  // Typing
  blink: 'animate-blink',
  typewriter: 'animate-typewriter',

  // Spin
  spin: 'animate-spin',
  spinSlow: 'animate-spinSlow',

  // Slide
  slideInUp: 'animate-slideInUp',
  slideInDown: 'animate-slideInDown',
  slideInLeft: 'animate-slideInLeft',
  slideInRight: 'animate-slideInRight',
} as const;

// Transiciones predefinidas
export const transitions = {
  all: 'transition-all',
  colors: 'transition-colors',
  opacity: 'transition-opacity',
  shadow: 'transition-shadow',
  transform: 'transition-transform',
  none: 'transition-none',
} as const;

// Delays de animación
export const delays = {
  none: '0ms',
  75: '75ms',
  100: '100ms',
  150: '150ms',
  200: '200ms',
  300: '300ms',
  500: '500ms',
  700: '700ms',
  1000: '1000ms',
} as const;

// Helpers para crear clases de animación con delay
export function withDelay(animationClass: string, delay: keyof typeof delays): string {
  return `${animationClass} delay-[${delays[delay]}]`;
}

// Helpers para crear clases de animación con duración custom
export function withDuration(animationClass: string, dur: keyof typeof duration): string {
  return `${animationClass} duration-[${duration[dur]}]`;
}

// Configuración de animación completa
export interface AnimationConfig {
  name: keyof typeof animationClasses;
  duration?: keyof typeof duration;
  delay?: keyof typeof delays;
  easing?: keyof typeof easing;
  iterations?: number | 'infinite';
}

export function buildAnimationClass(config: AnimationConfig): string {
  const classes: string[] = [animationClasses[config.name]];

  if (config.duration) {
    classes.push(`duration-${config.duration}`);
  }

  if (config.delay && config.delay !== 'none') {
    classes.push(`delay-[${delays[config.delay]}]`);
  }

  return classes.join(' ');
}

export type Duration = keyof typeof duration;
export type Easing = keyof typeof easing;
export type AnimationClass = keyof typeof animationClasses;
export type Transition = keyof typeof transitions;
export type Delay = keyof typeof delays;

// Aliases for compatibility
export const durations = duration;
export const easings = easing;
