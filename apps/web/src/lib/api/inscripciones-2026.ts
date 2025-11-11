/**
 * API Client para sistema de inscripciones 2026
 */

import {
  CreateInscripcion2026Request,
  CreateInscripcion2026Response,
  Inscripcion2026,
} from '@/types/inscripciones-2026';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Crea una nueva inscripción 2026
 */
export async function createInscripcion2026(
  data: CreateInscripcion2026Request
): Promise<CreateInscripcion2026Response> {
  const response = await fetch(`${API_BASE_URL}/inscripciones-2026`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtiene una inscripción por ID
 */
export async function getInscripcionById(
  id: string,
  token?: string
): Promise<Inscripcion2026> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/inscripciones-2026/${id}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Lista inscripciones del tutor autenticado
 */
export async function getMisInscripciones(token: string): Promise<Inscripcion2026[]> {
  const response = await fetch(`${API_BASE_URL}/inscripciones-2026/mis-inscripciones`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Actualiza el estado de una inscripción (admin only)
 */
export async function updateEstadoInscripcion(
  id: string,
  estado: string,
  razon: string,
  token: string
): Promise<Inscripcion2026> {
  const response = await fetch(`${API_BASE_URL}/inscripciones-2026/${id}/estado`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ estado, razon }),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
