/**
 * Re-exportación de tipos de Estudiante desde el contrato oficial
 *
 * IMPORTANTE: Este archivo NO define tipos propios, solo re-exporta
 * los tipos canónicos desde @mateatletas/contracts
 */

import type {
  Estudiante,
  CreateEstudianteDto,
  UpdateEstudianteDto,
  EstudiantesResponse,
  EstadisticasEstudiantes,
  Equipo,
} from '@mateatletas/contracts';
import { estudianteSchema } from '@mateatletas/contracts';

// Re-exportar tipos del contrato (source of truth)
export type {
  Estudiante,
  CreateEstudianteDto,
  UpdateEstudianteDto,
  EstudiantesResponse,
  EstadisticasEstudiantes,
  Equipo,
};

// Alias para compatibilidad con código legacy
export type CreateEstudianteData = CreateEstudianteDto;
export type UpdateEstudianteData = UpdateEstudianteDto;

/**
 * Parámetros de query para filtrar estudiantes
 */
export interface QueryEstudiantesParams {
  equipo_id?: string;
  nivel_escolar?: string;
  page?: number;
  limit?: number;
}

/**
 * Normaliza y valida un objeto Estudiante desde el backend
 * Usa el schema de Zod para garantizar que cumple el contrato
 *
 * @param raw - Objeto crudo desde la API
 * @returns Estudiante validado
 * @throws ZodError si el objeto no cumple el schema
 */
export function normalizarEstudiante(raw: Estudiante): Estudiante {
  // Validar con zod que efectivamente cumple el contrato
  const validado = estudianteSchema.parse(raw);

  // Si necesitamos conversiones (ej: string datetime → Date), las hacemos acá
  // Por ahora lo devolvemos tal cual porque el backend ya cumple el contrato
  return validado;
}

/**
 * Normaliza un array de estudiantes
 */
export function normalizarEstudiantes(raw: Estudiante[]): Estudiante[] {
  return raw.map(normalizarEstudiante);
}
