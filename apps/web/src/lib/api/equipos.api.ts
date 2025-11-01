/**
 * API Client para operaciones de equipos
 *
 * REGLAS APLICADAS:
 * ✅ Tipos explícitos importados desde @mateatletas/contracts
 * ✅ Todas las funciones retornan Promise<TipoExplicito>
 * ✅ Todas las respuestas pasan por normalizarEquipo()
 * ✅ PROHIBIDO: any, unknown, casts "as"
 * ✅ Validación con Zod en cada respuesta
 */

import apiClient from '../axios';
import type {
  Equipo,
  CreateEquipoDto,
  UpdateEquipoDto,
  QueryEquiposDto,
  EquiposResponse,
  EquiposEstadisticas,
  DeleteEquipoResponse,
} from '@/types/equipo.types';
import { normalizarEquipo, normalizarEquipos } from '@/types/equipo.types';
import {
  equipoSchema,
  equiposResponseSchema,
  equiposEstadisticasSchema,
  deleteEquipoResponseSchema,
} from '@mateatletas/contracts';

/**
 * Cliente API para operaciones CRUD de Equipos
 * Todas las llamadas requieren autenticación (token JWT)
 *
 * IMPORTANTE: El interceptor de axios ya extrae response.data automáticamente,
 * por lo que NO debemos hacer .data aquí para evitar undefined.
 */

/**
 * Crear un nuevo equipo
 * POST /api/equipos
 */
async function create(data: CreateEquipoDto): Promise<Equipo> {
  try {
    const response = await apiClient.post<Equipo>('/equipos', data);
    const validado = equipoSchema.parse(response);
    return normalizarEquipo(validado);
  } catch (error) {
    console.error('Error al crear el equipo:', error);
    throw error;
  }
}

/**
 * Obtener todos los equipos con filtros y paginación
 * GET /api/equipos?page=1&limit=10&search=...&sortBy=...&order=...
 */
async function getAll(params?: QueryEquiposDto): Promise<EquiposResponse> {
  try {
    const response = await apiClient.get<EquiposResponse>('/equipos', { params });
    const validado = equiposResponseSchema.parse(response);
    // Normalizar cada equipo del array data
    return {
      ...validado,
      data: normalizarEquipos(validado.data),
    };
  } catch (error) {
    console.error('Error al obtener los equipos:', error);
    throw error;
  }
}

/**
 * Obtener un equipo por ID
 * GET /api/equipos/:id
 */
async function getById(id: string): Promise<Equipo> {
  try {
    const response = await apiClient.get<Equipo>(`/equipos/${id}`);
    const validado = equipoSchema.parse(response);
    return normalizarEquipo(validado);
  } catch (error) {
    console.error('Error al obtener el equipo por ID:', error);
    throw error;
  }
}

/**
 * Actualizar un equipo existente
 * PATCH /api/equipos/:id
 */
async function update(
  id: string,
  data: UpdateEquipoDto,
): Promise<Equipo> {
  try {
    const response = await apiClient.patch<Equipo>(`/equipos/${id}`, data);
    const validado = equipoSchema.parse(response);
    return normalizarEquipo(validado);
  } catch (error) {
    console.error('Error al actualizar el equipo:', error);
    throw error;
  }
}

/**
 * Eliminar un equipo
 * DELETE /api/equipos/:id
 *
 * Los estudiantes asociados NO se eliminan,
 * solo se desvinculan (equipo_id = NULL)
 */
async function deleteEquipo(id: string): Promise<DeleteEquipoResponse> {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await apiClient.delete<DeleteEquipoResponse>(`/equipos/${id}`);
    return deleteEquipoResponseSchema.parse(response);
  } catch (error) {
    console.error('Error al eliminar el equipo:', error);
    throw error;
  }
}

/**
 * Obtener estadísticas generales de equipos
 * GET /api/equipos/estadisticas
 *
 * Incluye:
 * - Total de equipos
 * - Total de estudiantes
 * - Promedio de estudiantes por equipo
 * - Ranking de equipos por puntos
 */
async function getEstadisticas(): Promise<EquiposEstadisticas> {
  // El interceptor ya retorna response.data directamente
  try {
    const response = await apiClient.get<EquiposEstadisticas>('/equipos/estadisticas');
    return equiposEstadisticasSchema.parse(response);
  } catch (error) {
    console.error('Error al obtener las estadísticas de equipos:', error);
    throw error;
  }
}

/**
 * Recalcular puntos totales de un equipo
 * POST /api/equipos/:id/recalcular-puntos
 *
 * Suma los puntos de todos los estudiantes del equipo
 * y actualiza el campo puntos_totales
 */
async function recalcularPuntos(id: string): Promise<Equipo> {
  try {
    const response = await apiClient.post<Equipo>(`/equipos/${id}/recalcular-puntos`);
    const validado = equipoSchema.parse(response);
    return normalizarEquipo(validado);
  } catch (error) {
    console.error('Error al recalcular los puntos del equipo:', error);
    throw error;
  }
}

// Exportar como objeto con métodos
export const equiposApi = {
  create,
  getAll,
  getById,
  update,
  delete: deleteEquipo,
  getEstadisticas,
  recalcularPuntos,
};
