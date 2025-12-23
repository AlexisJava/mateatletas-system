/**
 * Mateatletas Design System - Space Theme
 *
 * Estética: Espacio profundo, nebulosas, estrellas
 * Inspiración: NASA, cosmos, ciencia ficción espacial
 */

import type { ThemeConfig } from '../types';

export const spaceTheme: ThemeConfig = {
  id: 'space',
  area: 'science',
  name: 'Space',
  emoji: '🚀',
  description: 'Estilo espacial con azul profundo y estrellas',

  colors: {
    primary: '#818cf8',
    primaryGlow: '#818cf880',
    secondary: '#6366f1',
    accent: '#f472b6',
    bgMain: '#0a0a2e',
    bgCard: '#12123d',
    textMain: '#e0e7ff',
    textDim: '#a5b4fc',
    textMuted: '#6366f1',
    codeBg: '#080820',
    border: '#2e2e6e',
    success: '#34d399',
    error: '#f87171',
    warning: '#fbbf24',
    xp: '#FFD700',
  },

  syntax: {
    keyword: '#c084fc',
    string: '#34d399',
    number: '#f472b6',
    comment: '#6366f1',
    function: '#818cf8',
    variable: '#e0e7ff',
    operator: '#a5b4fc',
  },

  borderRadius: '12px',
  borderWidth: '1px',

  shadows: {
    sm: '0 0 10px rgba(129, 140, 248, 0.2)',
    md: '0 0 20px rgba(129, 140, 248, 0.3)',
    lg: '0 0 40px rgba(129, 140, 248, 0.4)',
    glow: '0 0 60px rgba(129, 140, 248, 0.5), 0 0 100px rgba(244, 114, 182, 0.2)',
  },

  effects: {
    glow: true,
    particles: true,
  },

  classes: {
    container: 'bg-[#0a0a2e] text-indigo-100 relative',
    card: 'bg-[#12123d] border border-[#2e2e6e] rounded-xl shadow-[0_0_20px_rgba(129,140,248,0.3)] backdrop-blur-sm',
    button:
      'bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl hover:shadow-[0_0_30px_rgba(129,140,248,0.5)] transition-all duration-300',
    text: 'text-indigo-100',
  },
};

export default spaceTheme;
