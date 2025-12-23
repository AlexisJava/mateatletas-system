export type ThemeType = 'roblox' | 'minecraft' | 'gatitos' | 'musica' | 'futbol' | 'espacio';

// --- Array Helper Functions ---

/**
 * Acceso seguro a array con fallback
 */
export function safeGet<T>(arr: T[], index: number, fallback: T): T {
  if (index < 0 || index >= arr.length) {
    return fallback;
  }
  return arr[index] ?? fallback;
}

/**
 * Swap seguro de elementos en array (muta el array)
 */
export function safeSwap<T>(arr: T[], i: number, j: number): void {
  if (i < 0 || i >= arr.length || j < 0 || j >= arr.length) {
    return;
  }
  const temp = arr[i];
  const itemJ = arr[j];
  if (temp !== undefined && itemJ !== undefined) {
    arr[i] = itemJ;
    arr[j] = temp;
  }
}

export interface ThemeConfig {
  nombre: string;
  emoji: string;
  color: string;
}

export interface Video {
  id: string;
  titulo: string;
  emoji: string;
  relevancia: number;
  ordenado: boolean;
}

export type SortStepType =
  | 'comparando'
  | 'intercambiando'
  | 'sin-cambio'
  | 'posicionado'
  | 'completado';

export interface SortStep {
  tipo: SortStepType;
  indices: number[];
  videos: Video[];
  mensaje: string;
}

export type FaseSimulacion = 'inicio' | 'seleccion-tema' | 'ordenando' | 'resultado';

export interface SimulationState {
  tema: ThemeType | null;
  videos: Video[];
  pasoActual: SortStep | null;
  estadisticas: {
    comparaciones: number;
    intercambios: number;
  };
  fase: FaseSimulacion;
  velocidad: number;
  pausado: boolean;
}
