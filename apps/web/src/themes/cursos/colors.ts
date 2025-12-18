export type Theme = 'programacion' | 'matematicas' | 'ciencias';

export interface ColorConfig {
  name: string;
  hex: string;
  tailwind: string;
  usage: string;
}

export const programacionColors: ColorConfig[] = [
  {
    name: 'Índigo Principal',
    hex: '#6366F1',
    tailwind: 'bg-indigo-500',
    usage: 'Botones primarios, títulos principales, highlights',
  },
  {
    name: 'Púrpura Secundario',
    hex: '#A855F7',
    tailwind: 'bg-purple-500',
    usage: 'Elementos secundarios, badges, categorías',
  },
  {
    name: 'Rosa Acento',
    hex: '#EC4899',
    tailwind: 'bg-pink-500',
    usage: 'Llamadas a la acción, elementos importantes',
  },
  {
    name: 'Azul Claro',
    hex: '#3B82F6',
    tailwind: 'bg-blue-500',
    usage: 'Enlaces, información adicional',
  },
  {
    name: 'Verde Éxito',
    hex: '#10B981',
    tailwind: 'bg-emerald-500',
    usage: 'Respuestas correctas, confirmaciones',
  },
  {
    name: 'Rojo Error',
    hex: '#EF4444',
    tailwind: 'bg-red-500',
    usage: 'Respuestas incorrectas, alertas',
  },
];

export const matematicasColors: ColorConfig[] = [
  {
    name: 'Naranja Principal',
    hex: '#F97316',
    tailwind: 'bg-orange-500',
    usage: 'Botones primarios, títulos principales, highlights',
  },
  {
    name: 'Ámbar Secundario',
    hex: '#F59E0B',
    tailwind: 'bg-amber-500',
    usage: 'Elementos secundarios, badges, categorías',
  },
  {
    name: 'Amarillo Acento',
    hex: '#EAB308',
    tailwind: 'bg-yellow-500',
    usage: 'Llamadas a la acción, elementos importantes',
  },
  {
    name: 'Azul Información',
    hex: '#3B82F6',
    tailwind: 'bg-blue-500',
    usage: 'Enlaces, información adicional',
  },
  {
    name: 'Verde Éxito',
    hex: '#10B981',
    tailwind: 'bg-emerald-500',
    usage: 'Respuestas correctas, confirmaciones',
  },
  {
    name: 'Rojo Error',
    hex: '#EF4444',
    tailwind: 'bg-red-500',
    usage: 'Respuestas incorrectas, alertas',
  },
];

export const cienciasColors: ColorConfig[] = [
  {
    name: 'Esmeralda Principal',
    hex: '#10B981',
    tailwind: 'bg-emerald-500',
    usage: 'Botones primarios, títulos principales',
  },
  {
    name: 'Teal Secundario',
    hex: '#14B8A6',
    tailwind: 'bg-teal-500',
    usage: 'Elementos secundarios, badges',
  },
  {
    name: 'Cyan Acento',
    hex: '#06B6D4',
    tailwind: 'bg-cyan-500',
    usage: 'Llamadas a la acción, highlights',
  },
  {
    name: 'Lima Energía',
    hex: '#84CC16',
    tailwind: 'bg-lime-500',
    usage: 'Experimentos, actividades interactivas',
  },
  {
    name: 'Verde Éxito',
    hex: '#22C55E',
    tailwind: 'bg-green-500',
    usage: 'Respuestas correctas, confirmaciones',
  },
  {
    name: 'Rojo Error',
    hex: '#EF4444',
    tailwind: 'bg-red-500',
    usage: 'Respuestas incorrectas, alertas',
  },
];

export const themeColors = {
  programacion: programacionColors,
  matematicas: matematicasColors,
  ciencias: cienciasColors,
};

export function getThemeColors(theme: Theme): ColorConfig[] {
  return themeColors[theme];
}
