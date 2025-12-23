/**
 * Mateatletas Design System - Robot Theme
 *
 * Estética: Robótica, metálico, LEDs
 * Inspiración: Robots, ingeniería mecánica, automatización
 */

import type { ThemeConfig } from '../types';

export const robotTheme: ThemeConfig = {
  id: 'robot',
  area: 'science',
  name: 'Robot',
  emoji: '🤖',
  description: 'Estilo robótico con metálico y LEDs cyan',

  colors: {
    primary: '#22d3ee',
    primaryGlow: '#22d3ee80',
    secondary: '#06b6d4',
    accent: '#f43f5e',
    bgMain: '#18181b',
    bgCard: '#27272a',
    textMain: '#f4f4f5',
    textDim: '#a1a1aa',
    textMuted: '#71717a',
    codeBg: '#0f0f11',
    border: '#3f3f46',
    success: '#22c55e',
    error: '#f43f5e',
    warning: '#eab308',
    xp: '#FFD700',
  },

  syntax: {
    keyword: '#22d3ee',
    string: '#4ade80',
    number: '#f43f5e',
    comment: '#71717a',
    function: '#06b6d4',
    variable: '#f4f4f5',
    operator: '#a1a1aa',
  },

  borderRadius: '6px',
  borderWidth: '1px',

  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    glow: '0 0 20px rgba(34, 211, 238, 0.4)',
  },

  effects: {
    glow: true,
  },

  classes: {
    container: 'bg-zinc-900 text-zinc-100 relative',
    card: 'bg-zinc-800 border border-zinc-700 rounded-md shadow-lg relative before:absolute before:top-2 before:right-2 before:w-2 before:h-2 before:rounded-full before:bg-cyan-400 before:animate-pulse',
    button:
      'bg-cyan-500 text-zinc-900 font-medium rounded-md hover:bg-cyan-400 transition-colors duration-200 shadow-[0_0_10px_rgba(34,211,238,0.3)]',
    text: 'text-zinc-100',
  },
};

export default robotTheme;
