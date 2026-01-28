/**
 * Temas para los 4 WorldPortalCards de "Selección de Mundos"
 * Extraídos pixel-perfect de portal_estudiante.pen
 */

export const WORLD_PORTAL_THEMES = {
  /** Matemáticas - Purple (CsI0V) */
  math: {
    bgGradient: '#1E1B4B 0%, #0F0A2E 50%, #030014 100%',
    borderGradient: '#A78BFA 0%, #7C3AED 50%, #5B21B6 100%',
    glowPrimary: 'rgba(167,139,250,0.31)',
    glowSecondary: 'rgba(124,58,237,0.19)',
    iconGradient: '#7C3AED 0%, #5B21B6 70%, #4C1D95 100%',
    iconBorder: '#A78BFA',
    iconGlow: 'rgba(167,139,250,0.5)',
    titleGlow: 'rgba(167,139,250,0.5)',
    buttonGradient: '#A78BFA 0%, #7C3AED 50%, #5B21B6 100%',
    buttonBorder: '#C4B5FD',
    buttonGlow: 'rgba(167,139,250,0.38)',
  },

  /** Programación - Green (EFY6f) */
  code: {
    bgGradient: '#064E3B 0%, #022C22 50%, #030014 100%',
    borderGradient: '#34D399 0%, #10B981 50%, #059669 100%',
    glowPrimary: 'rgba(52,211,153,0.31)',
    glowSecondary: 'rgba(16,185,129,0.19)',
    iconGradient: '#10B981 0%, #059669 70%, #047857 100%',
    iconBorder: '#34D399',
    iconGlow: 'rgba(52,211,153,0.5)',
    titleGlow: 'rgba(52,211,153,0.5)',
    buttonGradient: '#34D399 0%, #10B981 50%, #059669 100%',
    buttonBorder: '#6EE7B7',
    buttonGlow: 'rgba(52,211,153,0.38)',
  },

  /** Ciencias - Orange (DpzRf) */
  science: {
    bgGradient: '#7C2D12 0%, #431407 50%, #030014 100%',
    borderGradient: '#FB923C 0%, #F97316 50%, #EA580C 100%',
    glowPrimary: 'rgba(251,146,60,0.31)',
    glowSecondary: 'rgba(249,115,22,0.19)',
    iconGradient: '#F97316 0%, #EA580C 70%, #C2410C 100%',
    iconBorder: '#FB923C',
    iconGlow: 'rgba(251,146,60,0.5)',
    titleGlow: 'rgba(251,146,60,0.5)',
    buttonGradient: '#FB923C 0%, #F97316 50%, #EA580C 100%',
    buttonBorder: '#FDBA74',
    buttonGlow: 'rgba(251,146,60,0.38)',
  },

  /** Olimpiadas - Gold (5DBxv) */
  olympics: {
    bgGradient: '#4A3B1C 0%, #2A1F0A 50%, #030014 100%',
    borderGradient: '#FFD700 0%, #FFA500 50%, #B8860B 100%',
    glowPrimary: 'rgba(255,215,0,0.31)',
    glowSecondary: 'rgba(255,165,0,0.19)',
    iconGradient: '#FFA500 0%, #B8860B 70%, #8B6914 100%',
    iconBorder: '#FFD700',
    iconGlow: 'rgba(255,215,0,0.5)',
    titleGlow: 'rgba(255,215,0,0.5)',
    buttonGradient: '#FFD700 0%, #FFA500 50%, #B8860B 100%',
    buttonBorder: '#FFE55C',
    buttonGlow: 'rgba(255,215,0,0.38)',
  },
} as const;
