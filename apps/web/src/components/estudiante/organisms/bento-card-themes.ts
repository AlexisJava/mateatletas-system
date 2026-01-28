/**
 * Temas pre-configurados para las 5 BentoCards del Main Grid
 * Extraídos pixel-perfect de portal_estudiante.pen
 */

export const BENTO_THEMES = {
  /** Explorar Mundos - Purple (VmSP9) */
  explorar: {
    bgGradient: '#2E1B6B 0%, #1A1040 40%, #0D0820 80%, #050210 100%',
    borderGradient:
      'rgba(167,139,250,0.8) 0%, rgba(124,58,237,0.38) 50%, rgba(124,58,237,0.13) 100%',
    glowPrimary: 'rgba(167,139,250,0.38)',
    glowSecondary: 'rgba(124,58,237,0.19)',
    iconGradient: '#C4B5FD 0%, #A78BFA 30%, #7C3AED 70%, #5B21B6 100%',
    iconGlowPrimary: 'rgba(167,139,250,0.87)',
    iconGlowSecondary: 'rgba(124,58,237,0.5)',
    descColor: '#9CA3AF',
    innerGlow: 'rgba(167,139,250,0.19) 0%, rgba(124,58,237,0.08) 50%, rgba(124,58,237,0) 100%',
  },

  /** Arcade - Fuchsia/Purple (NBhip) */
  arcade: {
    bgGradient: '#581C87 0%, #3B0764 40%, #1A0530 80%, #0A0215 100%',
    borderGradient:
      'rgba(192,132,252,0.67) 0%, rgba(168,85,247,0.31) 50%, rgba(168,85,247,0.13) 100%',
    glowPrimary: 'rgba(192,132,252,0.31)',
    glowSecondary: 'rgba(168,85,247,0.15)',
    iconGradient: '#D8B4FE 0%, #C084FC 30%, #A855F7 70%, #7E22CE 100%',
    iconGlowPrimary: 'rgba(192,132,252,0.87)',
    iconGlowSecondary: 'rgba(168,85,247,0.5)',
    descColor: '#A78BFA',
    innerGlow: 'rgba(192,132,252,0.16) 0%, rgba(168,85,247,0.07) 50%, rgba(168,85,247,0) 100%',
  },

  /** Mi Progreso - Blue (WCiSs) */
  progreso: {
    bgGradient: '#1E4A7A 0%, #0F2850 40%, #081428 80%, #030810 100%',
    borderGradient:
      'rgba(96,165,250,0.67) 0%, rgba(59,130,246,0.31) 50%, rgba(59,130,246,0.13) 100%',
    glowPrimary: 'rgba(96,165,250,0.31)',
    glowSecondary: 'rgba(59,130,246,0.15)',
    iconGradient: '#93C5FD 0%, #60A5FA 30%, #3B82F6 70%, #1D4ED8 100%',
    iconGlowPrimary: 'rgba(96,165,250,0.87)',
    iconGlowSecondary: 'rgba(59,130,246,0.5)',
    descColor: '#60A5FA',
    innerGlow: 'rgba(96,165,250,0.16) 0%, rgba(59,130,246,0.07) 50%, rgba(59,130,246,0) 100%',
  },

  /** Clase en Vivo - Red (9QhbQ) */
  claseEnVivo: {
    bgGradient: '#991B1B 0%, #5C0F0F 40%, #2A0808 80%, #100305 100%',
    borderGradient: 'rgba(239,68,68,0.67) 0%, rgba(220,38,38,0.31) 50%, rgba(220,38,38,0.13) 100%',
    glowPrimary: 'rgba(239,68,68,0.31)',
    glowSecondary: 'rgba(220,38,38,0.15)',
    iconGradient: '#FCA5A5 0%, #EF4444 30%, #DC2626 70%, #B91C1C 100%',
    iconGlowPrimary: 'rgba(239,68,68,0.87)',
    iconGlowSecondary: 'rgba(220,38,38,0.5)',
    descColor: '#F87171',
    innerGlow: 'rgba(239,68,68,0.16) 0%, rgba(220,38,38,0.07) 50%, rgba(220,38,38,0) 100%',
  },

  /** Continuar - Green (PxdL3) */
  continuar: {
    bgGradient: '#0D6955 0%, #064E3B 40%, #032820 80%, #01100D 100%',
    borderGradient: 'rgba(16,185,129,0.67) 0%, rgba(5,150,105,0.31) 50%, rgba(5,150,105,0.13) 100%',
    glowPrimary: 'rgba(16,185,129,0.31)',
    glowSecondary: 'rgba(5,150,105,0.15)',
    iconGradient: '#6EE7B7 0%, #10B981 30%, #059669 70%, #047857 100%',
    iconGlowPrimary: 'rgba(16,185,129,0.87)',
    iconGlowSecondary: 'rgba(5,150,105,0.5)',
    descColor: '#34D399',
    innerGlow: 'rgba(16,185,129,0.16) 0%, rgba(5,150,105,0.07) 50%, rgba(5,150,105,0) 100%',
  },
} as const;
