'use client';

import { createTheme, alpha } from '@mui/material/styles';

/**
 * TEMA BRUTAL PARA PORTAL DOCENTE
 *
 * Características:
 * - Gradientes vibrantes y profundos
 * - Sombras dramáticas con blur intenso
 * - Colores saturados pero elegantes
 * - Tipografía moderna y legible
 * - Efectos glassmorphism mejorados
 */

const PRIMARY_GRADIENT = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
const SECONDARY_GRADIENT = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
      light: '#8599f3',
      dark: '#4d5fd1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#764ba2',
      light: '#9168b8',
      dark: '#5c3a81',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f0f4f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c',
      secondary: '#4a5568',
    },
    success: {
      main: '#00f2fe',
      light: '#4facfe',
      dark: '#00d9e8',
    },
    warning: {
      main: '#fee140',
      light: '#ffed73',
      dark: '#e5ca00',
    },
    error: {
      main: '#f5576c',
      light: '#f7798a',
      dark: '#dc3545',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 800,
      letterSpacing: '-0.02em',
      background: PRIMARY_GRADIENT,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0 2px 8px rgba(0,0,0,0.05)',
    '0 4px 16px rgba(0,0,0,0.08)',
    '0 8px 24px rgba(0,0,0,0.12)',
    '0 12px 32px rgba(0,0,0,0.15)',
    '0 16px 48px rgba(102,126,234,0.25)', // Primary shadow
    '0 20px 60px rgba(118,75,162,0.3)', // Secondary shadow
    '0 24px 72px rgba(0,0,0,0.25)',
    '0 32px 96px rgba(0,0,0,0.3)',
    // Sombras más intensas para efectos especiales
    '0 8px 32px rgba(102,126,234,0.4)',
    '0 12px 48px rgba(118,75,162,0.45)',
    '0 16px 64px rgba(0,242,254,0.35)',
    '0 20px 80px rgba(245,87,108,0.4)',
    '0 24px 96px rgba(102,126,234,0.5)',
    '0 32px 128px rgba(118,75,162,0.55)',
    '0 40px 160px rgba(0,0,0,0.4)',
    '0 48px 192px rgba(0,0,0,0.45)',
    '0 56px 224px rgba(0,0,0,0.5)',
    '0 64px 256px rgba(0,0,0,0.55)',
    '0 72px 288px rgba(0,0,0,0.6)',
    '0 80px 320px rgba(0,0,0,0.65)',
    '0 88px 352px rgba(0,0,0,0.7)',
    '0 96px 384px rgba(0,0,0,0.75)',
    '0 104px 416px rgba(0,0,0,0.8)',
    '0 112px 448px rgba(0,0,0,0.85)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 32px',
          fontSize: '1rem',
          boxShadow: '0 4px 16px rgba(102,126,234,0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 32px rgba(102,126,234,0.5)',
          },
        },
        contained: {
          background: PRIMARY_GRADIENT,
          '&:hover': {
            background: 'linear-gradient(135deg, #7a8ff5 0%, #8659b3 100%)',
          },
        },
        containedSecondary: {
          background: SECONDARY_GRADIENT,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        },
        elevation2: {
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        },
        elevation3: {
          boxShadow: '0 12px 48px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          backdropFilter: 'blur(20px) saturate(180%)',
          backgroundColor: alpha('#ffffff', 0.85),
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: '0 20px 20px 0',
          background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
          boxShadow: '4px 0 32px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          fontSize: '0.875rem',
        },
        filled: {
          background: PRIMARY_GRADIENT,
          color: '#ffffff',
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          background: SECONDARY_GRADIENT,
          color: '#ffffff',
          fontWeight: 700,
          boxShadow: '0 2px 8px rgba(245,87,108,0.4)',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8599f3',
      light: '#a3b4f7',
      dark: '#667eea',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#9168b8',
      light: '#a987c7',
      dark: '#764ba2',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0f1419',
      paper: '#1a1f2e',
    },
    text: {
      primary: '#f7fafc',
      secondary: '#a0aec0',
    },
    success: {
      main: '#4facfe',
      light: '#7dc3ff',
      dark: '#00f2fe',
    },
    warning: {
      main: '#ffed73',
      light: '#fff59d',
      dark: '#fee140',
    },
    error: {
      main: '#f7798a',
      light: '#f99aa8',
      dark: '#f5576c',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 800,
      letterSpacing: '-0.02em',
      background: 'linear-gradient(135deg, #8599f3 0%, #9168b8 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0 2px 8px rgba(0,0,0,0.2)',
    '0 4px 16px rgba(0,0,0,0.3)',
    '0 8px 24px rgba(0,0,0,0.4)',
    '0 12px 32px rgba(0,0,0,0.5)',
    '0 16px 48px rgba(133,153,243,0.3)',
    '0 20px 60px rgba(145,104,184,0.35)',
    '0 24px 72px rgba(0,0,0,0.5)',
    '0 32px 96px rgba(0,0,0,0.6)',
    '0 8px 32px rgba(133,153,243,0.5)',
    '0 12px 48px rgba(145,104,184,0.55)',
    '0 16px 64px rgba(79,172,254,0.45)',
    '0 20px 80px rgba(247,121,138,0.5)',
    '0 24px 96px rgba(133,153,243,0.6)',
    '0 32px 128px rgba(145,104,184,0.65)',
    '0 40px 160px rgba(0,0,0,0.7)',
    '0 48px 192px rgba(0,0,0,0.75)',
    '0 56px 224px rgba(0,0,0,0.8)',
    '0 64px 256px rgba(0,0,0,0.85)',
    '0 72px 288px rgba(0,0,0,0.9)',
    '0 80px 320px rgba(0,0,0,0.95)',
    '0 88px 352px rgba(0,0,0,0.95)',
    '0 96px 384px rgba(0,0,0,0.95)',
    '0 104px 416px rgba(0,0,0,0.95)',
    '0 112px 448px rgba(0,0,0,0.95)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 32px',
          fontSize: '1rem',
          boxShadow: '0 4px 16px rgba(133,153,243,0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 32px rgba(133,153,243,0.5)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #8599f3 0%, #9168b8 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #9eaef6 0%, #a580c7 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          background: alpha('#1a1f2e', 0.6),
          border: `1px solid ${alpha('#8599f3', 0.1)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 16px 48px rgba(133,153,243,0.3)',
            border: `1px solid ${alpha('#8599f3', 0.2)}`,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
          backgroundColor: '#1a1f2e',
        },
        elevation1: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        },
        elevation2: {
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        },
        elevation3: {
          boxShadow: '0 12px 48px rgba(0,0,0,0.45)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(20px) saturate(180%)',
          backgroundColor: alpha('#1a1f2e', 0.85),
          borderBottom: `1px solid ${alpha('#8599f3', 0.1)}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: '0 20px 20px 0',
          background: 'linear-gradient(180deg, #1a1f2e 0%, #0f1419 100%)',
          boxShadow: '4px 0 32px rgba(0,0,0,0.5)',
          borderRight: `1px solid ${alpha('#8599f3', 0.1)}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          fontSize: '0.875rem',
        },
        filled: {
          background: 'linear-gradient(135deg, #8599f3 0%, #9168b8 100%)',
          color: '#ffffff',
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: '#ffffff',
          fontWeight: 700,
          boxShadow: '0 2px 8px rgba(247,121,138,0.5)',
        },
      },
    },
  },
});
