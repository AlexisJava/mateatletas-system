/**
 * Mateatletas Design System - Cyber Theme
 *
 * Estética: Glassmorphism, holográfico, futurista
 * Inspiración: Cyberpunk 2077, interfaces holográficas, UI de ciencia ficción
 */

import type { ThemeConfig } from '../types';

export const cyberTheme: ThemeConfig = {
  id: 'cyber',
  area: 'programming',
  name: 'Cyber',
  emoji: '🔮',
  description: 'Estilo futurista con glassmorphism y efectos holográficos',

  colors: {
    primary: '#22d3ee',
    primaryGlow: '#22d3ee80',
    secondary: '#8b5cf6',
    accent: '#f472b6',
    bgMain: '#0f0f23',
    bgCard: 'rgba(30, 41, 59, 0.7)',
    textMain: '#f8fafc',
    textDim: '#94a3b8',
    textMuted: '#64748b',
    codeBg: 'rgba(15, 23, 42, 0.9)',
    border: 'rgba(34, 211, 238, 0.3)',
    success: '#34d399',
    error: '#f87171',
    warning: '#fbbf24',
    xp: '#FFD700',
  },

  syntax: {
    keyword: '#c084fc',
    string: '#22d3ee',
    number: '#f472b6',
    comment: '#64748b',
    function: '#a78bfa',
    variable: '#67e8f9',
    operator: '#f8fafc',
  },

  borderRadius: '20px',
  borderWidth: '1px',

  shadows: {
    sm: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 0 10px rgba(34, 211, 238, 0.1)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 0 20px rgba(34, 211, 238, 0.15)',
    lg: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(34, 211, 238, 0.2)',
    glow: '0 0 50px rgba(34, 211, 238, 0.3), 0 0 100px rgba(139, 92, 246, 0.2)',
  },

  effects: {
    glassmorphism: true,
    glow: true,
  },

  classes: {
    container: 'bg-[#0f0f23] text-slate-50 relative',
    card: 'bg-slate-800/70 backdrop-blur-xl border border-cyan-400/30 rounded-[20px] shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:border-cyan-400/50 transition-all duration-300',
    button:
      'bg-gradient-to-r from-cyan-400 to-violet-500 text-white rounded-[20px] backdrop-blur-sm hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all duration-300',
    text: 'text-slate-50',
  },
};

export default cyberTheme;
