/**
 * Mateatletas Design System - Chalkboard Theme
 *
 * Estética: Pizarrón verde clásico, escritura con tiza
 * Inspiración: Aulas de matemáticas, profesores, nostalgia escolar
 */

import type { ThemeConfig } from '../types';

export const chalkboardTheme: ThemeConfig = {
  id: 'chalkboard',
  area: 'math',
  name: 'Chalkboard',
  emoji: '🎓',
  description: 'Estilo de pizarrón verde con efecto de tiza',

  colors: {
    primary: '#ffffff',
    primaryGlow: '#ffffff40',
    secondary: '#fffacd',
    accent: '#ffd700',
    bgMain: '#2d4a3e',
    bgCard: '#3a5f50',
    textMain: '#ffffff',
    textDim: '#d4e4dc',
    textMuted: '#a8c4b8',
    codeBg: '#284038',
    border: '#4a6b5c',
    success: '#90ee90',
    error: '#ff8080',
    warning: '#fffacd',
    xp: '#FFD700',
  },

  syntax: {
    keyword: '#fffacd',
    string: '#98fb98',
    number: '#ffd700',
    comment: '#a8c4b8',
    function: '#ffffff',
    variable: '#e0ffe0',
    operator: '#fffacd',
  },

  borderRadius: '2px',
  borderWidth: '3px',

  shadows: {
    sm: '2px 2px 0 rgba(0, 0, 0, 0.2)',
    md: '3px 3px 0 rgba(0, 0, 0, 0.25)',
    lg: '4px 4px 0 rgba(0, 0, 0, 0.3)',
    glow: 'none',
  },

  effects: {
    chalkboard: true,
  },

  classes: {
    container: 'bg-[#2d4a3e] text-white relative',
    card: "bg-[#3a5f50] border-4 border-[#5a3825] rounded-sm shadow-[3px_3px_0_rgba(0,0,0,0.25)] relative before:absolute before:inset-0 before:bg-[url(\"data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")] before:pointer-events-none",
    button:
      'bg-[#fffacd] text-[#2d4a3e] font-bold rounded-sm hover:bg-white transition-colors duration-200 shadow-[2px_2px_0_rgba(0,0,0,0.2)] font-handwriting text-lg',
    text: 'text-white font-handwriting',
  },
};

export default chalkboardTheme;
