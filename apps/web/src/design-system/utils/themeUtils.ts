/**
 * Mateatletas Design System - Theme Utilities
 * Utilidades para trabajar con temas
 */

import type { ThemeConfig, ThemeId } from '../types';
import {
  allThemeList,
  getThemeById,
  programmingThemeList,
  mathThemeList,
  scienceThemeList,
} from '../themes';

export type ThemeArea = 'programming' | 'math' | 'science';

export function getTheme(themeId: string): ThemeConfig | undefined {
  return getThemeById(themeId as ThemeId);
}

export function getThemesByCategory(area: ThemeArea): ThemeConfig[] {
  switch (area) {
    case 'programming':
      return programmingThemeList;
    case 'math':
      return mathThemeList;
    case 'science':
      return scienceThemeList;
    default:
      return allThemeList;
  }
}

export function getRandomTheme(area?: ThemeArea): ThemeConfig {
  const themes = area ? getThemesByCategory(area) : allThemeList;
  const randomIndex = Math.floor(Math.random() * themes.length);
  const theme = themes[randomIndex];
  if (!theme) {
    const fallback = allThemeList[0];
    if (!fallback) {
      throw new Error('No themes available');
    }
    return fallback;
  }
  return theme;
}

export function isDarkTheme(theme: ThemeConfig): boolean {
  const bgColor = theme.colors.bgMain;
  const rgb = hexToRgb(bgColor);
  if (!rgb) return false;

  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance < 0.5;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1] ?? '0', 16),
        g: parseInt(result[2] ?? '0', 16),
        b: parseInt(result[3] ?? '0', 16),
      }
    : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const adjust = (value: number) =>
    Math.min(255, Math.max(0, Math.round(value + (255 * percent) / 100)));

  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
}

export function withOpacity(hex: string, opacity: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance < 0.5 ? '#FFFFFF' : '#000000';
}

export function getCSSVariables(theme: ThemeConfig): Record<string, string> {
  return {
    '--color-bg-main': theme.colors.bgMain,
    '--color-bg-card': theme.colors.bgCard,
    '--color-primary': theme.colors.primary,
    '--color-secondary': theme.colors.secondary,
    '--color-accent': theme.colors.accent,
    '--color-text-main': theme.colors.textMain,
    '--color-text-dim': theme.colors.textDim,
    '--color-text-muted': theme.colors.textMuted,
    '--color-border': theme.colors.border,
    '--color-success': theme.colors.success,
    '--color-warning': theme.colors.warning,
    '--color-error': theme.colors.error,
    '--color-xp': theme.colors.xp,
    '--color-code-bg': theme.colors.codeBg,
    '--syntax-keyword': theme.syntax.keyword,
    '--syntax-string': theme.syntax.string,
    '--syntax-number': theme.syntax.number,
    '--syntax-comment': theme.syntax.comment,
    '--syntax-function': theme.syntax.function,
    '--syntax-operator': theme.syntax.operator,
    '--syntax-variable': theme.syntax.variable,
    '--shadow-sm': theme.shadows.sm,
    '--shadow-md': theme.shadows.md,
    '--shadow-lg': theme.shadows.lg,
    '--border-radius': theme.borderRadius,
  };
}

export function applyThemeToDocument(theme: ThemeConfig): void {
  const variables = getCSSVariables(theme);
  const root = document.documentElement;

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function createThemeStyleSheet(theme: ThemeConfig): string {
  const variables = getCSSVariables(theme);
  const cssVars = Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');

  return `:root {\n${cssVars}\n}`;
}

export default {
  getTheme,
  getThemesByCategory,
  getRandomTheme,
  isDarkTheme,
  hexToRgb,
  rgbToHex,
  adjustBrightness,
  withOpacity,
  getContrastColor,
  getCSSVariables,
  applyThemeToDocument,
  createThemeStyleSheet,
};
