/**
 * Mateatletas Design System - Retro Theme
 *
 * Estética: Neon arcade, magenta/cyan, synthwave
 * Inspiración: Arcades de los 80s, Tron, Outrun
 */

import type { ThemeConfig } from '../types';

export const retroTheme: ThemeConfig = {
  id: 'retro',
  area: 'programming',
  name: 'Retro Arcade',
  emoji: '🕹️',
  description: 'Estilo arcade neon con magenta y cyan brillantes',

  colors: {
    primary: '#ff00ff',
    primaryGlow: '#ff00ff80',
    secondary: '#00ffff',
    accent: '#ffff00',
    bgMain: '#0d001a',
    bgCard: '#1a0033',
    textMain: '#ffffff',
    textDim: '#e0b0ff',
    textMuted: '#9966cc',
    codeBg: '#120024',
    border: '#ff00ff',
    success: '#00ff88',
    error: '#ff3366',
    warning: '#ffff00',
    xp: '#FFD700',
  },

  syntax: {
    keyword: '#ff00ff',
    string: '#00ffff',
    number: '#ffff00',
    comment: '#9966cc',
    function: '#ff66b2',
    variable: '#66ffff',
    operator: '#ffffff',
  },

  borderRadius: '12px',
  borderWidth: '2px',

  shadows: {
    sm: '0 0 10px rgba(255, 0, 255, 0.3), 0 0 10px rgba(0, 255, 255, 0.3)',
    md: '0 0 20px rgba(255, 0, 255, 0.4), 0 0 20px rgba(0, 255, 255, 0.4)',
    lg: '0 0 30px rgba(255, 0, 255, 0.5), 0 0 30px rgba(0, 255, 255, 0.5)',
    glow: '0 0 40px rgba(255, 0, 255, 0.6), 0 0 80px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(255, 0, 255, 0.1)',
  },

  effects: {
    neon: true,
    glow: true,
  },

  classes: {
    container: 'bg-[#0d001a] text-white relative',
    card: 'bg-[#1a0033] border-2 border-[#ff00ff] rounded-xl shadow-[0_0_20px_rgba(255,0,255,0.4),0_0_20px_rgba(0,255,255,0.4)] hover:shadow-[0_0_40px_rgba(255,0,255,0.6),0_0_40px_rgba(0,255,255,0.6)] transition-shadow duration-300',
    button:
      'bg-gradient-to-r from-[#ff00ff] to-[#00ffff] text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(255,0,255,0.5)] transition-all duration-300 animate-neonFlicker',
    text: 'text-white drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]',
  },
};

export default retroTheme;
