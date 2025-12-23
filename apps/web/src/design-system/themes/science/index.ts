/**
 * Mateatletas Design System - Science Themes Index
 */

export { labTheme } from './lab';
export { spaceTheme } from './space';
export { natureTheme } from './nature';
export { electricTheme } from './electric';
export { robotTheme } from './robot';

import { labTheme } from './lab';
import { spaceTheme } from './space';
import { natureTheme } from './nature';
import { electricTheme } from './electric';
import { robotTheme } from './robot';
import type { ThemeConfig, ScienceThemeId } from '../types';

export const scienceThemes: Record<ScienceThemeId, ThemeConfig> = {
  lab: labTheme,
  space: spaceTheme,
  nature: natureTheme,
  electric: electricTheme,
  robot: robotTheme,
};

export const scienceThemeList: ThemeConfig[] = Object.values(scienceThemes);
