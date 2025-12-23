/**
 * Mateatletas Design System - Blueprint Theme
 *
 * Estética: Planos técnicos, azul ingeniería, líneas blancas
 * Inspiración: Planos de arquitectura, dibujos técnicos, CAD
 */

import type { ThemeConfig } from '../types';

export const blueprintTheme: ThemeConfig = {
  id: 'blueprint',
  area: 'math',
  name: 'Blueprint',
  emoji: '📐',
  description: 'Estilo de planos técnicos con fondo azul y líneas blancas',

  colors: {
    primary: '#ffffff',
    primaryGlow: '#ffffff60',
    secondary: '#87ceeb',
    accent: '#00bfff',
    bgMain: '#1e3a5f',
    bgCard: '#234b73',
    textMain: '#ffffff',
    textDim: '#a8c8e8',
    textMuted: '#6a9bc3',
    codeBg: '#1a3352',
    border: '#3d6d99',
    success: '#90ee90',
    error: '#ff6b6b',
    warning: '#ffd93d',
    xp: '#FFD700',
  },

  syntax: {
    keyword: '#ffffff',
    string: '#87ceeb',
    number: '#00bfff',
    comment: '#6a9bc3',
    function: '#a8c8e8',
    variable: '#ffffff',
    operator: '#87ceeb',
  },

  borderRadius: '0px',
  borderWidth: '1px',

  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.2)',
    md: '0 2px 4px rgba(0, 0, 0, 0.3)',
    lg: '0 4px 8px rgba(0, 0, 0, 0.4)',
    glow: 'none',
  },

  effects: {
    blueprint: true,
  },

  classes: {
    container:
      'bg-[#1e3a5f] text-white relative bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]',
    card: 'bg-[#234b73] border border-[#3d6d99] border-dashed relative',
    button:
      'bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#1e3a5f] transition-colors duration-200 font-mono',
    text: 'text-white font-mono',
  },
};

export default blueprintTheme;
