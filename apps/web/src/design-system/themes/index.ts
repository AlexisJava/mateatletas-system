/**
 * Mateatletas Design System - Themes Index
 * Exporta todos los temas organizados por área
 */

// Re-export types
export type {
  ThemeArea,
  ThemeId,
  ProgrammingThemeId,
  MathThemeId,
  ScienceThemeId,
  ThemeConfig,
  ThemeColors,
  SyntaxColors,
  ThemeShadows,
  ThemeEffects,
  ThemeClasses,
} from './types';

// Programming themes
export {
  terminalTheme,
  retroTheme,
  cyberTheme,
  hackerTheme,
  scratchTheme,
  programmingThemes,
  programmingThemeList,
} from './programming';

// Math themes
export {
  industrialTheme,
  blueprintTheme,
  chalkboardTheme,
  minimalTheme,
  bunkerTheme,
  mathThemes,
  mathThemeList,
} from './math';

// Science themes
export {
  labTheme,
  spaceTheme,
  natureTheme,
  electricTheme,
  robotTheme,
  scienceThemes,
  scienceThemeList,
} from './science';

// Imports for combined exports
import { programmingThemes, programmingThemeList } from './programming';
import { mathThemes, mathThemeList } from './math';
import { scienceThemes, scienceThemeList } from './science';
import type { ThemeConfig, ThemeId } from './types';

// All themes combined
export const allThemes: Record<ThemeId, ThemeConfig> = {
  ...programmingThemes,
  ...mathThemes,
  ...scienceThemes,
};

export const allThemeList: ThemeConfig[] = [
  ...programmingThemeList,
  ...mathThemeList,
  ...scienceThemeList,
];

// Helper to get theme by ID
export function getThemeById(id: ThemeId): ThemeConfig | undefined {
  return allThemes[id];
}

// Default theme
export const defaultTheme = programmingThemes.terminal;
