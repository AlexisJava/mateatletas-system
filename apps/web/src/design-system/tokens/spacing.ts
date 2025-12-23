/**
 * Mateatletas Design System - Spacing Tokens
 *
 * Sistema de espaciado basado en múltiplos de 4px
 * Escala: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128
 */

export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
} as const;

// Gap presets para layouts
export const gaps = {
  none: '0',
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
} as const;

// Padding presets para componentes
export const componentPadding = {
  none: '0',
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '2.5rem', // 40px
} as const;

// Container max-widths
export const containerSizes = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
} as const;

// Border radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem', // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
} as const;

// Border width
export const borderWidth = {
  0: '0',
  DEFAULT: '1px',
  2: '2px',
  3: '3px',
  4: '4px',
  8: '8px',
} as const;

// Z-index scale
export const zIndex = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  dropdown: '100',
  sticky: '200',
  fixed: '300',
  modal: '400',
  popover: '500',
  tooltip: '600',
  toast: '700',
  overlay: '800',
  max: '9999',
} as const;

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export type Spacing = keyof typeof spacing;
export type Gap = keyof typeof gaps;
export type ComponentPadding = keyof typeof componentPadding;
export type ContainerSize = keyof typeof containerSizes;
export type BorderRadius = keyof typeof borderRadius;
export type BorderWidth = keyof typeof borderWidth;
export type ZIndex = keyof typeof zIndex;
export type Breakpoint = keyof typeof breakpoints;
