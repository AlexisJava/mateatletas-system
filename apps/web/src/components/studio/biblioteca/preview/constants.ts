import { BloqueCategoria } from '../../blocks/types';
import { CategoryColors, CategoryColorsMap, PropType } from './types';

/**
 * Colores por categoría para el tema oscuro
 */
export const CATEGORY_COLORS: CategoryColorsMap = {
  INTERACTIVO: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    gradient: 'from-purple-500 to-violet-500',
  },
  MOTRICIDAD_FINA: {
    bg: 'bg-pink-500/20',
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    gradient: 'from-pink-500 to-rose-500',
  },
  SIMULADOR: {
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    gradient: 'from-cyan-500 to-teal-500',
  },
  EDITOR_CODIGO: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    text: 'text-green-400',
    gradient: 'from-green-500 to-emerald-500',
  },
  CREATIVO: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    gradient: 'from-amber-500 to-yellow-500',
  },
  MULTIMEDIA: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    gradient: 'from-orange-500 to-red-500',
  },
  EVALUACION: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-400',
    gradient: 'from-red-500 to-rose-500',
  },
  MULTIPLAYER: {
    bg: 'bg-indigo-500/20',
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
    gradient: 'from-indigo-500 to-blue-500',
  },
};

/**
 * Colores por defecto cuando la categoría no existe
 */
export const DEFAULT_CATEGORY_COLORS: CategoryColors = {
  bg: 'bg-slate-500/20',
  border: 'border-slate-500/30',
  text: 'text-slate-400',
  gradient: 'from-slate-500 to-gray-500',
};

/**
 * Obtener colores para una categoría
 */
export function getCategoryColors(categoria: BloqueCategoria): CategoryColors {
  return CATEGORY_COLORS[categoria] ?? DEFAULT_CATEGORY_COLORS;
}

/**
 * Colores para badges de tipo de prop
 */
export const PROP_TYPE_COLORS: Record<PropType, { bg: string; text: string }> = {
  string: { bg: 'bg-green-500/20', text: 'text-green-400' },
  number: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  boolean: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  array: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  object: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  function: { bg: 'bg-pink-500/20', text: 'text-pink-400' },
};

/**
 * Labels para categorías
 */
export const CATEGORY_LABELS: Record<BloqueCategoria, string> = {
  INTERACTIVO: 'Interactivo',
  MOTRICIDAD_FINA: 'Motricidad Fina',
  SIMULADOR: 'Simulador',
  EDITOR_CODIGO: 'Editor de Código',
  CREATIVO: 'Creativo',
  MULTIMEDIA: 'Multimedia',
  EVALUACION: 'Evaluación',
  MULTIPLAYER: 'Multiplayer',
};

/**
 * Emojis por categoría
 */
export const CATEGORY_EMOJIS: Record<BloqueCategoria, string> = {
  INTERACTIVO: '🎮',
  MOTRICIDAD_FINA: '✋',
  SIMULADOR: '🔬',
  EDITOR_CODIGO: '💻',
  CREATIVO: '🎨',
  MULTIMEDIA: '🎬',
  EVALUACION: '📝',
  MULTIPLAYER: '👥',
};
