/**
 * Mateatletas Design System - Terminal Theme
 *
 * Estética: CRT verde fósforo clásico, scanlines, glow
 * Inspiración: Terminales de los años 80, Matrix, monitores antiguos
 */

import type { ThemeConfig } from '../types';

export const terminalTheme: ThemeConfig = {
  id: 'terminal',
  area: 'programming',
  name: 'Terminal',
  emoji: '💻',
  description: 'Estilo retro de terminal con efecto CRT y verde fósforo',

  colors: {
    primary: '#10b981',
    primaryGlow: '#10b98180',
    secondary: '#059669',
    accent: '#34d399',
    bgMain: '#0a0a0a',
    bgCard: '#111111',
    textMain: '#10b981',
    textDim: '#059669',
    textMuted: '#047857',
    codeBg: '#0d0d0d',
    border: '#1a3a2a',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    xp: '#FFD700',
  },

  syntax: {
    keyword: '#34d399',
    string: '#86efac',
    number: '#4ade80',
    comment: '#047857',
    function: '#10b981',
    variable: '#6ee7b7',
    operator: '#a7f3d0',
  },

  borderRadius: '0px',
  borderWidth: '1px',

  shadows: {
    sm: '0 0 5px rgba(16, 185, 129, 0.3)',
    md: '0 0 10px rgba(16, 185, 129, 0.4)',
    lg: '0 0 20px rgba(16, 185, 129, 0.5)',
    glow: '0 0 30px rgba(16, 185, 129, 0.6), 0 0 60px rgba(16, 185, 129, 0.3)',
  },

  effects: {
    scanlines: true,
    glow: true,
  },

  classes: {
    container: 'bg-[#0a0a0a] text-[#10b981] font-mono relative overflow-hidden',
    card: 'bg-[#111111] border border-[#1a3a2a] shadow-[0_0_10px_rgba(16,185,129,0.4)] relative before:absolute before:inset-0 before:bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] before:bg-[length:100%_4px] before:pointer-events-none before:animate-scanline',
    button:
      'bg-transparent border border-[#10b981] text-[#10b981] hover:bg-[#10b981] hover:text-black hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-300 font-mono uppercase tracking-wider',
    text: 'text-[#10b981] font-mono tracking-wide',
  },
};

export default terminalTheme;
