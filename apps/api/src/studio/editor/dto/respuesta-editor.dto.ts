import { SemanaStudio } from '@prisma/client';

export interface BloqueEditorResponse {
  id: string;
  orden: number;
  componente: string;
  titulo: string;
  contenido: Record<string, unknown>;
  minimoParaAprobar?: number;
}

export interface MetadataEditorResponse {
  titulo: string;
  descripcion?: string;
  objetivos?: string[];
}

export interface SemanaEditorResponse {
  semana: SemanaStudio;
  metadata: MetadataEditorResponse;
  bloques: BloqueEditorResponse[];
  componentesDisponibles: string[];
}

export interface ValidacionResponse {
  valido: boolean;
  errores: string[];
}
