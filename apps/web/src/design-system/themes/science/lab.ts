/**
 * Mateatletas Design System - Lab Theme
 *
 * Estética: Laboratorio químico, verde fluorescente, burbujas
 * Inspiración: Química, experimentos, tubos de ensayo brillantes
 */

import type { ThemeConfig } from '../types';

export const labTheme: ThemeConfig = {
  id: 'lab',
  area: 'science',
  name: 'Laboratory',
  emoji: '🧪',
  description: 'Estilo de laboratorio con verde químico brillante',

  colors: {
    primary: '#00ff88',
    primaryGlow: '#00ff8880',
    secondary: '#00cc6a',
    accent: '#ff00ff',
    bgMain: '#0a1a14',
    bgCard: '#0f261c',
    textMain: '#e0fff0',
    textDim: '#80cca0',
    textMuted: '#408060',
    codeBg: '#081510',
    border: '#1a4030',
    success: '#00ff88',
    error: '#ff4444',
    warning: '#ffcc00',
    xp: '#FFD700',
  },

  syntax: {
    keyword: '#00ff88',
    string: '#ff00ff',
    number: '#00ccff',
    comment: '#408060',
    function: '#00ffcc',
    variable: '#e0fff0',
    operator: '#ff00ff',
  },

  borderRadius: '16px',
  borderWidth: '2px',

  shadows: {
    sm: '0 0 10px rgba(0, 255, 136, 0.2)',
    md: '0 0 20px rgba(0, 255, 136, 0.3)',
    lg: '0 0 40px rgba(0, 255, 136, 0.4)',
    glow: '0 0 60px rgba(0, 255, 136, 0.5), inset 0 0 20px rgba(0, 255, 136, 0.1)',
  },

  effects: {
    glow: true,
    particles: true,
  },

  classes: {
    container: 'bg-[#0a1a14] text-emerald-50 relative overflow-hidden',
    card: 'bg-[#0f261c] border-2 border-[#1a4030] rounded-2xl shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:shadow-[0_0_40px_rgba(0,255,136,0.5)] transition-shadow duration-300 backdrop-blur-sm',
    button:
      'bg-[#00ff88] text-[#0a1a14] font-bold rounded-2xl hover:shadow-[0_0_30px_rgba(0,255,136,0.6)] transition-all duration-300',
    text: 'text-emerald-50',
  },
};

export default labTheme;
