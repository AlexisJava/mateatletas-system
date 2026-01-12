/**
 * Hook: useTheme
 *
 * Hook para obtener tokens de tema basados en casa (house) y área.
 * Retorna colores, patrones, motion y CSS variables.
 */

import { useMemo } from 'react';
import { houseTokens, areaTokens, houseToCSS, type HouseType, type Area } from '../tokens/colors';
import { motionTokens } from '../tokens/motion';

export interface UseThemeOptions {
  /** Casa del estudiante (quantum, vertex, pulsar) */
  house: HouseType;
  /** Área temática (math, code, science) */
  area: Area;
}

export interface UseThemeReturn {
  /** Colores de la casa */
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    areaAccent: string;
  };
  /** Metadatos de la casa */
  houseMeta: {
    id: string;
    name: string;
    ageRange: string;
  };
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
        primary: house.colors.primary,
        secondary: house.colors.secondary,
        accent: house.colors.accent,
        areaAccent: area.accent,
      },
      houseMeta: {
        id: house.id,
        name: house.name,
        ageRange: house.ageRange,
      },
      pattern: area.pattern,
      motion: motionTokens,
      cssVars: {
        ...houseToCSS(options.house),
        '--color-area-accent': area.accent,
      },
    };
  }, [options.house, options.area]);
}
