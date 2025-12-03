import { BloqueMetadata } from '@/components/studio/blocks/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function listarCatalogo(): Promise<BloqueMetadata[]> {
  const response = await fetch(`${API_BASE}/api/studio/catalogo`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Error al listar catálogo: ${response.status}`);
  }

  const json = (await response.json()) as { data: BloqueMetadata[] };
  return json.data;
}

export async function listarHabilitados(): Promise<BloqueMetadata[]> {
  const response = await fetch(`${API_BASE}/api/studio/catalogo/habilitados`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Error al listar habilitados: ${response.status}`);
  }

  const json = (await response.json()) as { data: BloqueMetadata[] };
  return json.data;
}

export async function toggleComponente(tipo: string, habilitado: boolean): Promise<BloqueMetadata> {
  const response = await fetch(`${API_BASE}/api/studio/catalogo/${tipo}/toggle`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ habilitado }),
  });

  if (!response.ok) {
    throw new Error(`Error al toggle componente: ${response.status}`);
  }

  const json = (await response.json()) as { data: BloqueMetadata };
  return json.data;
}
