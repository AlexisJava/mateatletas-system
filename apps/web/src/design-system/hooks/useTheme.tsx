'use client';

/**
 * Mateatletas Design System - useTheme Hook
 * Contexto y hook para manejar el tema activo
 */

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { ThemeConfig, ThemeId, ThemeArea } from '../types';
import { allThemes, defaultTheme } from '../themes';

interface ThemeContextValue {
  theme: ThemeConfig;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  setThemeByArea: (area: ThemeArea, id: string) => void;
  availableThemes: ThemeConfig[];
  getThemesByArea: (area: ThemeArea) => ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeId;
}

export function ThemeProvider({
  children,
  initialTheme = 'terminal',
}: ThemeProviderProps): ReactNode {
  const [themeId, setThemeId] = useState<ThemeId>(initialTheme);

  const theme = useMemo(() => {
    return allThemes[themeId] ?? defaultTheme;
  }, [themeId]);

  const setTheme = useCallback((id: ThemeId) => {
    if (allThemes[id]) {
      setThemeId(id);
    }
  }, []);

  const setThemeByArea = useCallback((area: ThemeArea, id: string) => {
    const fullId = id as ThemeId;
    const targetTheme = allThemes[fullId];
    if (targetTheme && targetTheme.area === area) {
      setThemeId(fullId);
    }
  }, []);

  const availableThemes = useMemo(() => {
    return Object.values(allThemes);
  }, []);

  const getThemesByArea = useCallback((area: ThemeArea): ThemeConfig[] => {
    return Object.values(allThemes).filter((t) => t.area === area);
  }, []);

  const value = useMemo(
    (): ThemeContextValue => ({
      theme,
      themeId,
      setTheme,
      setThemeByArea,
      availableThemes,
      getThemesByArea,
    }),
    [theme, themeId, setTheme, setThemeByArea, availableThemes, getThemesByArea],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

// Hook para usar un tema específico sin contexto
export function useThemeConfig(themeId: ThemeId): ThemeConfig {
  return allThemes[themeId] ?? defaultTheme;
}
