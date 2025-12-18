export const matematicasTheme = {
  name: 'matematicas',

  colors: {
    // Primarios - MÁS SÓLIDOS
    primary: '#DC2626',
    primaryHover: '#B91C1C',
    primaryLight: '#F87171',

    // Secundarios
    secondary: '#2563EB',
    secondaryHover: '#1D4ED8',

    // Accent
    accent: '#F59E0B',
    accentHover: '#D97706',

    // Fondos - MÁS SÓLIDOS
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceHover: '#FEE2E2',

    // Texto - MÁS CONTRASTE
    text: '#0F172A',
    textMuted: '#475569',
    textOnPrimary: '#FFFFFF',

    // Estados
    success: '#059669',
    successLight: '#D1FAE5',
    error: '#DC2626',
    errorLight: '#FEE2E2',
    warning: '#D97706',
    warningLight: '#FEF3C7',

    // Sombras
    darkShade: '#7F1D1D',
  },

  typography: {
    fontFamily: {
      display: "'Outfit', sans-serif",
      body: "'Outfit', sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },

  spacing: {
    1: '8px',
    2: '16px',
    3: '24px',
    4: '32px',
    5: '40px',
    6: '48px',
    8: '64px',
  },

  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    full: '9999px',
  },

  shadows: {
    button: '0 4px 0 0 #7F1D1D',
    buttonHover: '0 6px 0 0 #7F1D1D',
    buttonPressed: '0 2px 0 0 #7F1D1D',
    card: '0 4px 12px rgba(0, 0, 0, 0.1)',
    cardHover: '0 8px 24px rgba(0, 0, 0, 0.15)',
  },
} as const;

export type MatematicasTheme = typeof matematicasTheme;
