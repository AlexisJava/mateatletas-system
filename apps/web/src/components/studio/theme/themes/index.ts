/**
 * Índice de temas disponibles para Studio
 */

export { defaultTheme } from './default';
export { casaQuantumTheme } from './casa-quantum';
export { casaVertexTheme } from './casa-vertex';
export { casaPulsarTheme } from './casa-pulsar';

import type { StudioTheme, CasaType } from '../types';
import { defaultTheme } from './default';
import { casaQuantumTheme } from './casa-quantum';
import { casaVertexTheme } from './casa-vertex';
import { casaPulsarTheme } from './casa-pulsar';

/**
 * Registro de todos los temas disponibles por nombre
 */
export const themeRegistry: Record<string, StudioTheme> = {
  default: defaultTheme,
  'casa-quantum': casaQuantumTheme,
  'casa-vertex': casaVertexTheme,
  'casa-pulsar': casaPulsarTheme,
};

/**
 * Mapeo de Casa a tema correspondiente
 */
export const casaThemeMap: Record<CasaType, StudioTheme> = {
  QUANTUM: casaQuantumTheme,
  VERTEX: casaVertexTheme,
  PULSAR: casaPulsarTheme,
};

/**
 * Obtiene un tema por nombre
 * @param name Nombre del tema
 * @returns El tema o el tema default si no existe
 */
export function getThemeByName(name: string): StudioTheme {
  return themeRegistry[name] ?? defaultTheme;
}

/**
 * Obtiene el tema correspondiente a una Casa
 * @param casa Tipo de casa
 * @returns El tema de la casa
 */
export function getThemeByCasa(casa: CasaType): StudioTheme {
  return casaThemeMap[casa];
}

/**
 * Lista todos los nombres de temas disponibles
 */
export function listThemeNames(): string[] {
  return Object.keys(themeRegistry);
}
