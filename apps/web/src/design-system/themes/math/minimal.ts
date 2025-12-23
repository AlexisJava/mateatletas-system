/**
 * Mateatletas Design System - Minimal Theme
 *
 * Estética: Limpio, moderno, máxima legibilidad
 * Inspiración: Diseño suizo, tipografía matemática, claridad
 */

import type { ThemeConfig } from '../types';

export const minimalTheme: ThemeConfig = {
  id: 'minimal',
  area: 'math',
  name: 'Minimal',
  emoji: '📝',
  description: 'Estilo limpio con fondo blanco y acentos naranja',

  colors: {
    primary: '#ff6b00',
    primaryGlow: '#ff6b0040',
    secondary: '#ff8c33',
    accent: '#0066cc',
    bgMain: '#ffffff',
    bgCard: '#fafafa',
    textMain: '#1a1a1a',
    textDim: '#4a4a4a',
    textMuted: '#8a8a8a',
    codeBg: '#f5f5f5',
    border: '#e5e5e5',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    xp: '#FFD700',
  },

  syntax: {
    keyword: '#d73a49',
    string: '#22863a',
    number: '#005cc5',
    comment: '#8a8a8a',
    function: '#6f42c1',
    variable: '#24292e',
    operator: '#d73a49',
  },

  borderRadius: '8px',
  borderWidth: '1px',

  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    glow: '0 0 20px rgba(255, 107, 0, 0.15)',
  },

  effects: {},

  classes: {
    container: 'bg-white text-gray-900 relative',
    card: 'bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200',
    button:
      'bg-[#ff6b00] text-white font-medium rounded-lg hover:bg-[#e65c00] transition-colors duration-200',
    text: 'text-gray-900',
  },
};

export default minimalTheme;
