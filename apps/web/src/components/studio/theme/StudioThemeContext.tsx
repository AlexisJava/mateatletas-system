'use client';

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  StudioTheme,
  BloqueModo,
  StudioThemeContextValue,
  StudioThemeProviderProps,
  ThemeClasses,
} from './types';
import { defaultTheme } from './themes/default';
import { getThemeByName } from './themes';
import { generateThemeClasses } from './theme-classes';

/**
 * Contexto de tema de Studio
 * Provee tema y modo a todos los componentes de bloques educativos
 */
const StudioThemeContext = createContext<StudioThemeContextValue | undefined>(undefined);

/**
 * Provider del sistema de theming de Studio
 *
 * @example
 * ```tsx
 * // Con tema por nombre
 * <StudioThemeProvider themeName="casa-quantum" initialModo="estudiante">
 *   <MiComponente />
 * </StudioThemeProvider>
 *
 * // Con tema directo
 * <StudioThemeProvider initialTheme={customTheme}>
 *   <MiComponente />
 * </StudioThemeProvider>
 * ```
 */
export function StudioThemeProvider({
  initialTheme,
  initialModo = 'preview',
  themeName,
  children,
}: StudioThemeProviderProps): ReactNode {
  // Determinar tema inicial
  const resolvedInitialTheme = useMemo(() => {
    if (initialTheme) return initialTheme;
    if (themeName) return getThemeByName(themeName);
    return defaultTheme;
  }, [initialTheme, themeName]);

  const [theme, setThemeState] = useState<StudioTheme>(resolvedInitialTheme);
  const [modo, setModo] = useState<BloqueModo>(initialModo);

  // Generar clases pre-computadas cuando cambia el tema
  const classes = useMemo<ThemeClasses>(() => generateThemeClasses(theme), [theme]);

  // Callbacks memoizados
  const setTheme = useCallback((newTheme: StudioTheme) => {
    setThemeState(newTheme);
  }, []);

  const setThemeByName = useCallback((name: string) => {
    const newTheme = getThemeByName(name);
    setThemeState(newTheme);
  }, []);

  // Valor del contexto memoizado
  const contextValue = useMemo<StudioThemeContextValue>(
    () => ({
      theme,
      modo,
      classes,
      setTheme,
      setThemeByName,
      setModo,
    }),
    [theme, modo, classes, setTheme, setThemeByName],
  );

  return <StudioThemeContext.Provider value={contextValue}>{children}</StudioThemeContext.Provider>;
}

/**
 * Hook para consumir el tema de Studio
 *
 * @throws Error si se usa fuera del StudioThemeProvider
 *
 * @example
 * ```tsx
 * function MiBloque() {
 *   const { theme, classes, modo } = useStudioTheme();
 *
 *   return (
 *     <div className={classes.surface1}>
 *       <button className={classes.buttonPrimary}>
 *         Acción
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useStudioTheme(): StudioThemeContextValue {
  const context = useContext(StudioThemeContext);

  if (context === undefined) {
    throw new Error('useStudioTheme debe usarse dentro de un StudioThemeProvider');
  }

  return context;
}

/**
 * Hook seguro que retorna undefined si no hay provider
 * Útil para componentes que pueden renderizarse fuera del contexto
 */
export function useStudioThemeSafe(): StudioThemeContextValue | undefined {
  return useContext(StudioThemeContext);
}

/**
 * HOC para proveer tema a un componente
 *
 * @example
 * ```tsx
 * const ThemedComponent = withStudioTheme(MyComponent, 'casa-quantum');
 * ```
 */
export function withStudioTheme<P extends object>(
  Component: React.ComponentType<P>,
  themeName: string,
  modo: BloqueModo = 'preview',
): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props) => (
    <StudioThemeProvider themeName={themeName} initialModo={modo}>
      <Component {...props} />
    </StudioThemeProvider>
  );

  WrappedComponent.displayName = `withStudioTheme(${Component.displayName ?? Component.name ?? 'Component'})`;

  return WrappedComponent;
}
