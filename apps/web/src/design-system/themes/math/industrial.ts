/**
 * Mateatletas Design System - Industrial Theme
 *
 * Estética: Half-Life industrial, negro/naranja, señalética de fábrica
 * Inspiración: Black Mesa, instalaciones industriales, metal pesado
 */

import type { ThemeConfig } from '../types';

export const industrialTheme: ThemeConfig = {
  id: 'industrial',
  area: 'math',
  name: 'Industrial',
  emoji: '🏭',
  description: 'Estilo industrial con negro y naranja de advertencia',

  colors: {
    primary: '#ff6b00',
    primaryGlow: '#ff6b0080',
    secondary: '#ff8c33',
    accent: '#ffa500',
    bgMain: '#1a1a1a',
    bgCard: '#242424',
    textMain: '#f5f5f5',
    textDim: '#b0b0b0',
    textMuted: '#707070',
    codeBg: '#1f1f1f',
    border: '#3d3d3d',
    success: '#4ade80',
    error: '#ef4444',
    warning: '#ff6b00',
    xp: '#FFD700',
  },

  syntax: {
    keyword: '#ff6b00',
    string: '#ffa500',
    number: '#ffcc00',
    comment: '#707070',
    function: '#ff8c33',
    variable: '#f5f5f5',
    operator: '#ffa500',
  },

  borderRadius: '4px',
  borderWidth: '2px',

  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.4)',
    md: '0 4px 8px rgba(0, 0, 0, 0.5)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.6)',
    glow: '0 0 20px rgba(255, 107, 0, 0.3)',
  },

  effects: {
    industrial: true,
  },

  classes: {
    container: 'bg-[#1a1a1a] text-gray-100 relative',
    card: 'bg-[#242424] border-2 border-[#3d3d3d] rounded shadow-lg relative before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-[#ff6b00] before:to-[#ffa500]',
    button:
      'bg-[#ff6b00] text-white font-bold rounded hover:bg-[#ff8c33] transition-colors duration-200 uppercase tracking-wide border-b-4 border-[#cc5500] active:border-b-0 active:mt-1',
    text: 'text-gray-100',
  },
};

export default industrialTheme;
