/**
 * Sistema de Theming para Studio
 *
 * Proporciona temas adaptados por edad (Casa) para los 95 componentes educativos.
 *
 * @example
 * ```tsx
 * import {
 *   StudioThemeProvider,
 *   useStudioTheme,
 *   casaQuantumTheme,
 * } from '@/components/studio/theme';
 *
 * // En el layout o página
 * <StudioThemeProvider themeName="casa-quantum" initialModo="estudiante">
 *   <App />
 * </StudioThemeProvider>
 *
 * // En un componente
 * function MiBloque() {
 *   const { theme, classes, modo } = useStudioTheme();
 *
 *   return (
 *     <div className={classes.surface1}>
 *       <h1 className={`${theme.typography.displayFont} ${classes.textPrimary}`}>
 *         Título
 *       </h1>
 *       <button className={classes.buttonPrimary}>
 *         Acción Principal
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */

// Types
export type {
  CasaType,
  BloqueModo,
  AnimationIntensity,
  BorderRadius,
  ThemeColors,
  ThemeGradients,
  ThemeTypography,
  ThemeBorders,
  ThemeShadows,
  ThemeAnimations,
  StudioTheme,
  ThemeClasses,
  StudioThemeContextValue,
  StudioThemeProviderProps,
} from './types';

// Context & Hooks
export {
  StudioThemeProvider,
  useStudioTheme,
  useStudioThemeSafe,
  withStudioTheme,
} from './StudioThemeContext';

// Themes
export {
  defaultTheme,
  casaQuantumTheme,
  casaVertexTheme,
  casaPulsarTheme,
  themeRegistry,
  casaThemeMap,
  getThemeByName,
  getThemeByCasa,
  listThemeNames,
} from './themes';

// Theme utilities
export { generateThemeClasses, getTextEffectStyles, getGradientClass } from './theme-classes';
