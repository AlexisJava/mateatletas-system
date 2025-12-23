/**
 * Mateatletas Design System - Math Themes Index
 */

export { industrialTheme } from './industrial';
export { blueprintTheme } from './blueprint';
export { chalkboardTheme } from './chalkboard';
export { minimalTheme } from './minimal';
export { bunkerTheme } from './bunker';

import { industrialTheme } from './industrial';
import { blueprintTheme } from './blueprint';
import { chalkboardTheme } from './chalkboard';
import { minimalTheme } from './minimal';
import { bunkerTheme } from './bunker';
import type { ThemeConfig, MathThemeId } from '../types';

export const mathThemes: Record<MathThemeId, ThemeConfig> = {
  industrial: industrialTheme,
  blueprint: blueprintTheme,
  chalkboard: chalkboardTheme,
  minimal: minimalTheme,
  bunker: bunkerTheme,
};

export const mathThemeList: ThemeConfig[] = Object.values(mathThemes);
