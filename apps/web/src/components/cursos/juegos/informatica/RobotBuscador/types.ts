export type ThemeType = 'roblox' | 'minecraft' | 'gatitos' | 'musica' | 'futbol' | 'espacio';

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
