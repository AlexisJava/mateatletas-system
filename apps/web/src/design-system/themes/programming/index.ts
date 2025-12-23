/**
 * Mateatletas Design System - Programming Themes Index
 */

export { terminalTheme } from './terminal';
export { retroTheme } from './retro';
export { cyberTheme } from './cyber';
export { hackerTheme } from './hacker';
export { scratchTheme } from './scratch';

import { terminalTheme } from './terminal';
import { retroTheme } from './retro';
import { cyberTheme } from './cyber';
import { hackerTheme } from './hacker';
import { scratchTheme } from './scratch';
import type { ThemeConfig, ProgrammingThemeId } from '../types';

export const programmingThemes: Record<ProgrammingThemeId, ThemeConfig> = {
  terminal: terminalTheme,
  retro: retroTheme,
  cyber: cyberTheme,
  hacker: hackerTheme,
  scratch: scratchTheme,
};

export const programmingThemeList: ThemeConfig[] = Object.values(programmingThemes);
