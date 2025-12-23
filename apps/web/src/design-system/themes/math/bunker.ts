/**
 * Mateatletas Design System - Bunker Theme
 *
 * Estética: Vault-Tec, concreto, señalética de advertencia
 * Inspiración: Fallout, búnkeres militares, refugios subterráneos
 */

import type { ThemeConfig } from '../types';

export const bunkerTheme: ThemeConfig = {
  id: 'bunker',
  area: 'math',
  name: 'Bunker',
  emoji: '🏗️',
  description: 'Estilo búnker con gris concreto y amarillo advertencia',

  colors: {
    primary: '#fbbf24',
    primaryGlow: '#fbbf2480',
    secondary: '#f59e0b',
    accent: '#dc2626',
    bgMain: '#292524',
    bgCard: '#3f3a36',
    textMain: '#fafaf9',
    textDim: '#d6d3d1',
    textMuted: '#a8a29e',
    codeBg: '#1c1917',
    border: '#57534e',
    success: '#4ade80',
    error: '#dc2626',
    warning: '#fbbf24',
    xp: '#FFD700',
  },

  syntax: {
    keyword: '#fbbf24',
    string: '#4ade80',
    number: '#f59e0b',
    comment: '#a8a29e',
    function: '#fbbf24',
    variable: '#fafaf9',
    operator: '#dc2626',
  },

  borderRadius: '0px',
  borderWidth: '3px',

  shadows: {
    sm: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.3)',
    md: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 8px rgba(0,0,0,0.4)',
    lg: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 16px rgba(0,0,0,0.5)',
    glow: '0 0 20px rgba(251, 191, 36, 0.3)',
  },

  effects: {
    industrial: true,
  },

  classes: {
    container: 'bg-[#292524] text-stone-50 relative',
    card: 'bg-[#3f3a36] border-3 border-[#57534e] relative before:absolute before:inset-0 before:bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.03)_10px,rgba(0,0,0,0.03)_20px)] before:pointer-events-none',
    button:
      'bg-[#fbbf24] text-[#292524] font-bold hover:bg-[#f59e0b] transition-colors duration-200 uppercase tracking-widest border-2 border-[#92400e]',
    text: 'text-stone-50',
  },
};

export default bunkerTheme;
