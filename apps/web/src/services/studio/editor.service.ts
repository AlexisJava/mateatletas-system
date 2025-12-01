import { BloqueJson, SemanaMetadata } from '@/components/studio/blocks/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface SemanaEditorResponse {
  semana: {
    id: string;
    numero: number;
    estado: string;
  };
  metadata: SemanaMetadata;
  bloques: BloqueJson[];
  componentesDisponibles: string[];
}

export interface ValidacionResponse {
  valido: boolean;
  errores: string[];
}

export async function cargarSemana(
  cursoId: string,
  semanaNum: number,
): Promise<SemanaEditorResponse> {
  const response = await fetch(`${API_BASE}/studio/editor/cursos/${cursoId}/semanas/${semanaNum}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Error al cargar semana: ${response.status}`);
  }

  return response.json() as Promise<SemanaEditorResponse>;
}

export async function guardarSemana(
  cursoId: string,
  semanaNum: number,
  data: { metadata: SemanaMetadata; bloques: BloqueJson[] },
): Promise<SemanaEditorResponse> {
  const response = await fetch(`${API_BASE}/studio/editor/cursos/${cursoId}/semanas/${semanaNum}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message ?? `Error al guardar: ${response.status}`);
  }

  return response.json() as Promise<SemanaEditorResponse>;
}

export async function validarSemana(data: {
  metadata: SemanaMetadata;
  bloques: BloqueJson[];
}): Promise<ValidacionResponse> {
  const response = await fetch(`${API_BASE}/studio/editor/validar`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Error al validar: ${response.status}`);
  }

  return response.json() as Promise<ValidacionResponse>;
}
