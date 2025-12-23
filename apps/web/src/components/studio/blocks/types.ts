/**
 * Tipos para el sistema de bloques del Studio
 */

export interface BloqueMetadata {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  categoria: string;
  icono?: string;
  habilitado: boolean;
}

export interface BloqueJson {
  id: string;
  tipo?: string;
  componente?: string;
  orden: number;
  titulo?: string;
  props?: Record<string, unknown>;
  contenido?: Record<string, unknown>;
  children?: BloqueJson[];
}

export interface SemanaMetadata {
  titulo: string;
  descripcion: string;
  objetivos: string[];
  duracion_estimada?: number;
}
