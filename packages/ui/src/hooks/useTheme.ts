/**
 * Hook: useTheme
 *
 * Hook para obtener tokens de tema basados en casa (house) y área.
 * Retorna colores, patrones, motion y CSS variables.
 */

import { useMemo } from 'react';
import { houseTokens, areaTokens, type House, type Area } from '../tokens/colors';
import { motionTokens } from '../tokens/motion';

export interface UseThemeOptions {
  /** Casa del estudiante (quantum, vertex, pulsar) */
  house: House;
  /** Área temática (math, code, science) */
  area: Area;
}

export interface UseThemeReturn {
  /** Colores combinados de casa + área */
  colors: (typeof houseTokens)[House] & { areaAccent: string };
  /** Patrón de fondo del área */
  pattern: string;
  /** Tokens de motion */
  motion: typeof motionTokens;
  /** CSS custom properties listas para aplicar */
  cssVars: Record<string, string>;
}

export function useTheme(options: UseThemeOptions): UseThemeReturn {
  return useMemo(() => {
    const house = houseTokens[options.house];
    const area = areaTokens[options.area];

    return {
      colors: {
        ...house,
        areaAccent: area.accent,
      },
      pattern: area.pattern,
      motion: motionTokens,
      cssVars: {
        '--color-primary': house.primary,
        '--color-secondary': house.secondary,
        '--color-accent': house.accent,
        '--color-background': house.background,
        '--color-surface': house.surface,
        '--color-text': house.text,
        '--color-area-accent': area.accent,
      },
    };
  }, [options.house, options.area]);
}
