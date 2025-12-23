/**
 * Mateatletas Design System - Nature Theme
 *
 * Estética: Naturaleza, bosque, biología
 * Inspiración: Documentales de naturaleza, botánica, ecosistemas
 */

import type { ThemeConfig } from '../types';

export const natureTheme: ThemeConfig = {
  id: 'nature',
  area: 'science',
  name: 'Nature',
  emoji: '🌿',
  description: 'Estilo natural con verdes orgánicos y tierra',

  colors: {
    primary: '#22c55e',
    primaryGlow: '#22c55e80',
    secondary: '#16a34a',
    accent: '#84cc16',
    bgMain: '#f0fdf4',
    bgCard: '#ffffff',
    textMain: '#14532d',
    textDim: '#166534',
    textMuted: '#4ade80',
    codeBg: '#ecfdf5',
    border: '#86efac',
    success: '#22c55e',
    error: '#dc2626',
    warning: '#ca8a04',
    xp: '#FFD700',
  },

  syntax: {
    keyword: '#16a34a',
    string: '#84cc16',
    number: '#ca8a04',
    comment: '#4ade80',
    function: '#15803d',
    variable: '#14532d',
    operator: '#166534',
  },

  borderRadius: '16px',
  borderWidth: '2px',

  shadows: {
    sm: '0 2px 4px rgba(34, 197, 94, 0.1)',
    md: '0 4px 8px rgba(34, 197, 94, 0.15)',
    lg: '0 8px 16px rgba(34, 197, 94, 0.2)',
    glow: '0 0 20px rgba(34, 197, 94, 0.25)',
  },

  effects: {},

  classes: {
    container: 'bg-green-50 text-green-900 relative',
    card: 'bg-white border-2 border-green-300 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300',
    button:
      'bg-green-500 text-white font-medium rounded-2xl hover:bg-green-600 transition-colors duration-200',
    text: 'text-green-900',
  },
};

export default natureTheme;
