/**
 * Mateatletas Design System - Hacker Theme
 *
 * Estética: Black ops, glitch, rojo sobre negro
 * Inspiración: Mr. Robot, Watch Dogs, interfaces de hacking
 */

import type { ThemeConfig } from '../types';

export const hackerTheme: ThemeConfig = {
  id: 'hacker',
  area: 'programming',
  name: 'Hacker',
  emoji: '👾',
  description: 'Estilo oscuro con efectos glitch y acentos rojos',

  colors: {
    primary: '#f43f5e',
    primaryGlow: '#f43f5e80',
    secondary: '#e11d48',
    accent: '#fb7185',
    bgMain: '#050505',
    bgCard: '#0a0a0a',
    textMain: '#ffffff',
    textDim: '#a3a3a3',
    textMuted: '#525252',
    codeBg: '#080808',
    border: '#262626',
    success: '#22c55e',
    error: '#f43f5e',
    warning: '#eab308',
    xp: '#FFD700',
  },

  syntax: {
    keyword: '#f43f5e',
    string: '#fb7185',
    number: '#fda4af',
    comment: '#525252',
    function: '#ffffff',
    variable: '#e5e5e5',
    operator: '#f43f5e',
  },

  borderRadius: '4px',
  borderWidth: '1px',

  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px rgba(0, 0, 0, 0.6), 0 0 10px rgba(244, 63, 94, 0.1)',
    lg: '0 10px 25px rgba(0, 0, 0, 0.7), 0 0 20px rgba(244, 63, 94, 0.15)',
    glow: '0 0 30px rgba(244, 63, 94, 0.3)',
  },

  effects: {
    glitch: true,
    glow: true,
  },

  classes: {
    container: 'bg-[#050505] text-white font-mono relative',
    card: 'bg-[#0a0a0a] border border-neutral-800 rounded hover:border-rose-500/50 transition-colors duration-300',
    button:
      'bg-[#f43f5e] text-white rounded hover:bg-[#e11d48] hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all duration-200 font-mono uppercase tracking-widest text-sm',
    text: 'text-white font-mono',
  },
};

export default hackerTheme;
