/**
 * Temas para las CategoryCards de "Mundo Matemáticas"
 * Extraídos pixel-perfect de portal_estudiante.pen
 */

export const CATEGORY_THEMES = {
  /** Aritmética - Blue (fUX2r) */
  arithmetic: {
    bgGradient: '#1E3A5F 0%, #0F172A 100%',
    borderColor: '#60A5FA',
    glowPrimary: 'rgba(96,165,250,0.31)',
    glowSecondary: 'rgba(96,165,250,0.19)',
    iconGradient: '#60A5FA 0%, #3B82F6 100%',
    iconGlowPrimary: '#3B82F6',
    iconGlowSecondary: 'rgba(96,165,250,0.8)',
    descColor: '#60A5FA',
  },

  /** Geometría - Purple/Fuchsia (lkFwg) */
  geometry: {
    bgGradient: '#4A1D5E 0%, #1A0A2E 100%',
    borderColor: '#C084FC',
    glowPrimary: 'rgba(168,85,247,0.31)',
    glowSecondary: 'rgba(168,85,247,0.19)',
    iconGradient: '#C084FC 0%, #A855F7 100%',
    iconGlowPrimary: '#A855F7',
    iconGlowSecondary: 'rgba(192,132,252,0.8)',
    descColor: '#C084FC',
  },

  /** Álgebra - Amber (c4g3P) */
  algebra: {
    bgGradient: '#5C3D1E 0%, #1A1207 100%',
    borderColor: '#FBBF24',
    glowPrimary: 'rgba(245,158,11,0.31)',
    glowSecondary: 'rgba(245,158,11,0.19)',
    iconGradient: '#FBBF24 0%, #F59E0B 100%',
    iconGlowPrimary: '#F59E0B',
    iconGlowSecondary: 'rgba(251,191,36,0.8)',
    descColor: '#FBBF24',
  },

  /** Combinatoria - Teal (5v9Fy) */
  combinatorics: {
    bgGradient: '#1E4A4A 0%, #0A1A1A 100%',
    borderColor: '#2DD4BF',
    glowPrimary: 'rgba(20,184,166,0.31)',
    glowSecondary: 'rgba(20,184,166,0.19)',
    iconGradient: '#2DD4BF 0%, #14B8A6 100%',
    iconGlowPrimary: '#14B8A6',
    iconGlowSecondary: 'rgba(45,212,191,0.8)',
    descColor: '#2DD4BF',
  },
} as const;
