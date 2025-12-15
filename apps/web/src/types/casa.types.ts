/**
 * Tipos de Casa para el frontend
 *
 * NOTA: Internamente el backend usa "Equipo" pero en el frontend
 * lo llamamos "Casa" (QUANTUM, VERTEX, PULSAR).
 * Los tipos aquí re-exportan desde @mateatletas/contracts con alias.
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

// Re-exportar tipos con nombres de Casa
export type Casa = Equipo;
export type EstudianteEnCasa = EstudianteEnEquipo;
export type CreateCasaDto = CreateEquipoDto;
export type UpdateCasaDto = UpdateEquipoDto;
export type CasasResponse = EquiposResponse;
export type CasasEstadisticas = EquiposEstadisticas;
export type CasaRanking = EquipoRanking;
export type DeleteCasaResponse = DeleteEquipoResponse;

/**
 * Parámetros de query para filtrar casas
 */
export interface QueryCasasDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * Normaliza y valida un objeto Casa desde el backend
 * Usa el schema de Zod para garantizar que cumple el contrato
 *
 * @param raw - Objeto crudo desde la API
 * @returns Casa validada
 * @throws ZodError si el objeto no cumple el schema
 */
export function normalizarCasa(raw: Casa): Casa {
  const validado = equipoSchema.parse(raw);
  return validado;
}

/**
 * Normaliza un array de casas
 */
export function normalizarCasas(raw: Casa[]): Casa[] {
  const validados = equiposListSchema.parse(raw);
  return validados.map(normalizarCasa);
}
