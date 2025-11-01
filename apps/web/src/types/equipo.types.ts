/**
 * Re-exportación de tipos de Equipo desde el contrato oficial
 *
 * IMPORTANTE: Este archivo NO define tipos propios, solo re-exporta
 * los tipos canónicos desde @mateatletas/contracts
 */

import type {
  Equipo,
  EstudianteEnEquipo,
  CreateEquipoDto,
  UpdateEquipoDto,
  EquiposResponse,
  EquiposEstadisticas,
  EquipoRanking,
  DeleteEquipoResponse,
} from '@mateatletas/contracts';
import { equipoSchema, equiposListSchema } from '@mateatletas/contracts';

// Re-exportar tipos del contrato (source of truth)
export type {
  Equipo,
  EstudianteEnEquipo,
  CreateEquipoDto,
  UpdateEquipoDto,
  EquiposResponse,
  EquiposEstadisticas,
  EquipoRanking,
  DeleteEquipoResponse,
};

/**
 * Parámetros de query para filtrar equipos (definido localmente, no en contracts)
 */
export interface QueryEquiposDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * Normaliza y valida un objeto Equipo desde el backend
 * Usa el schema de Zod para garantizar que cumple el contrato
 *
 * @param raw - Objeto crudo desde la API
 * @returns Equipo validado
 * @throws ZodError si el objeto no cumple el schema
 */
export function normalizarEquipo(raw: Equipo): Equipo {
  // Validar con zod que efectivamente cumple el contrato
  const validado = equipoSchema.parse(raw);

  // Si necesitamos conversiones (ej: string datetime → Date), las hacemos acá
  // Por ahora lo devolvemos tal cual porque el backend ya cumple el contrato
  return validado;
}

/**
 * Normaliza un array de equipos
 */
export function normalizarEquipos(raw: Equipo[]): Equipo[] {
  const validados = equiposListSchema.parse(raw);
  return validados.map(normalizarEquipo);
}
