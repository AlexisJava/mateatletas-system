'use client';

import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './muiTheme';
import { ThemeContext } from './ThemeContext';
import { useContext } from 'react';

/**
 * Proveedor de tema Material UI integrado con nuestro ThemeContext
 */
export function MaterialThemeProvider({ children }: { children: React.ReactNode }) {
  const themeContext = useContext(ThemeContext);

  // Si no hay ThemeContext disponible, usar tema claro por defecto
  const currentTheme = themeContext?.theme || 'light';

  return (
    <MuiThemeProvider theme={currentTheme === 'dark' ? darkTheme : lightTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
