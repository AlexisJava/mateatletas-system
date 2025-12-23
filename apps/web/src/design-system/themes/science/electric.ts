/**
 * Mateatletas Design System - Electric Theme
 *
 * Estética: Electricidad, rayos, energía
 * Inspiración: Tesla, circuitos, física eléctrica
 */

import type { ThemeConfig } from '../types';

export const electricTheme: ThemeConfig = {
  id: 'electric',
  area: 'science',
  name: 'Electric',
  emoji: '⚡',
  description: 'Estilo eléctrico con amarillo energético y azul',

  colors: {
    primary: '#fbbf24',
    primaryGlow: '#fbbf2480',
    secondary: '#f59e0b',
    accent: '#3b82f6',
    bgMain: '#0c1222',
    bgCard: '#1a2744',
    textMain: '#fef3c7',
    textDim: '#fcd34d',
    textMuted: '#d97706',
    codeBg: '#0a0f1a',
    border: '#2563eb',
    success: '#34d399',
    error: '#f87171',
    warning: '#fbbf24',
    xp: '#FFD700',
  },

  syntax: {
    keyword: '#fbbf24',
    string: '#3b82f6',
    number: '#f59e0b',
    comment: '#d97706',
    function: '#60a5fa',
    variable: '#fef3c7',
    operator: '#fbbf24',
  },

  borderRadius: '8px',
  borderWidth: '2px',

  shadows: {
    sm: '0 0 10px rgba(251, 191, 36, 0.3)',
    md: '0 0 20px rgba(251, 191, 36, 0.4)',
    lg: '0 0 40px rgba(251, 191, 36, 0.5)',
    glow: '0 0 60px rgba(251, 191, 36, 0.6), 0 0 100px rgba(59, 130, 246, 0.3)',
  },

  effects: {
    glow: true,
    neon: true,
  },

  classes: {
    container: 'bg-[#0c1222] text-amber-100 relative',
    card: 'bg-[#1a2744] border-2 border-blue-600 rounded-lg shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:shadow-[0_0_40px_rgba(251,191,36,0.6)] transition-shadow duration-300',
    button:
      'bg-amber-400 text-slate-900 font-bold rounded-lg hover:bg-amber-300 hover:shadow-[0_0_30px_rgba(251,191,36,0.6)] transition-all duration-200',
    text: 'text-amber-100',
  },
};

export default electricTheme;
