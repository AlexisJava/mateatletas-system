import { ComponentType } from 'react';

/** Estado de un bloque durante interacción */
export type BloqueEstado = 'idle' | 'en-progreso' | 'completado' | 'error';

/** Modo de renderizado */
export type BloqueModo = 'preview' | 'estudiante' | 'editor';

/** Categorías del catálogo */
export type BloqueCategoria =
  | 'INTERACTIVO'
  | 'CONTENIDO'
  | 'EDITOR_CODIGO'
  | 'MULTIMEDIA'
  | 'GAMIFICACION'
  | 'EVALUACION';

/** Resultado al completar un bloque */
export interface BloqueResultado {
  completado: boolean;
  puntuacion: number;
  respuesta: unknown;
  tiempoMs: number;
  intentos: number;
}

/** Props base para TODOS los componentes de bloque */
export interface StudioBlockProps<TConfig = Record<string, unknown>> {
  id: string;
  config: TConfig;
  modo: BloqueModo;
  onComplete?: (resultado: BloqueResultado) => void;
  onProgress?: (progreso: number) => void;
  onConfigChange?: (nuevoConfig: TConfig) => void;
  estadoInicial?: Partial<BloqueResultado>;
  disabled?: boolean;
}

/** Metadata de un componente en el catálogo */
export interface BloqueMetadata {
  tipo: string;
  nombre: string;
  descripcion: string;
  categoria: BloqueCategoria;
  icono: string;
  configSchema: Record<string, unknown>;
  ejemploConfig: Record<string, unknown>;
  propiedades?: Record<string, unknown>;
  implementado: boolean;
  habilitado: boolean;
  orden: number;
}

/** Tipo para componentes registrados */
export type BloqueComponent<TConfig = Record<string, unknown>> = ComponentType<
  StudioBlockProps<TConfig>
>;

/** Bloque tal como viene del JSON */
export interface BloqueJson {
  id: string;
  orden: number;
  componente: string;
  titulo: string;
  contenido: Record<string, unknown>;
  minimoParaAprobar?: number;
}

/** Metadata de la semana */
export interface SemanaMetadata {
  titulo: string;
  descripcion?: string;
  objetivos?: string[];
}
