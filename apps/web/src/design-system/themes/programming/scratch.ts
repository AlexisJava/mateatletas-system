/**
 * Mateatletas Design System - Scratch Theme
 *
 * Estética: Friendly, colorido, infantil pero moderno
 * Inspiración: Scratch MIT, bloques de código visual, diseño amigable para niños
 */

import type { ThemeConfig } from '../types';

export const scratchTheme: ThemeConfig = {
  id: 'scratch',
  area: 'programming',
  name: 'Scratch',
  emoji: '🧩',
  description: 'Estilo amigable y colorido con animaciones bouncy',

  colors: {
    primary: '#ffab19',
    primaryGlow: '#ffab1980',
    secondary: '#ff8c1a',
    accent: '#4c97ff',
    bgMain: '#f9f9f9',
    bgCard: '#ffffff',
    textMain: '#575e75',
    textDim: '#7c8496',
    textMuted: '#a0a5b2',
    codeBg: '#fcfcfc',
    border: '#e0e0e0',
    success: '#59c059',
    error: '#ff6680',
    warning: '#ffbf00',
    xp: '#FFD700',
  },

  syntax: {
    keyword: '#9966ff',
    string: '#59c059',
    number: '#ff8c1a',
    comment: '#a0a5b2',
    function: '#4c97ff',
    variable: '#ff6680',
    operator: '#575e75',
  },

  borderRadius: '24px',
  borderWidth: '2px',

  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.08)',
    md: '0 4px 8px rgba(0, 0, 0, 0.12)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.16)',
    glow: '0 4px 20px rgba(255, 171, 25, 0.3)',
  },

  effects: {
    bouncy: true,
  },

  classes: {
    container: 'bg-[#f9f9f9] text-[#575e75] relative',
    card: 'bg-white border-2 border-[#e0e0e0] rounded-3xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300',
    button:
      'bg-[#ffab19] text-white font-bold rounded-3xl hover:bg-[#ff8c1a] hover:scale-105 active:scale-95 transition-all duration-200 shadow-md',
    text: 'text-[#575e75]',
  },
};

export default scratchTheme;
