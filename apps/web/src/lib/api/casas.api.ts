/**
 * API Client para operaciones de casas
 *
 * NOTA: El backend usa endpoints /equipos pero el frontend
 * expone la API como "casas" para consistencia de nomenclatura.
 *
 * REGLAS APLICADAS:
 * ✅ Tipos explícitos importados desde types/casa.types.ts
 * ✅ Todas las funciones retornan Promise<TipoExplicito>
 * ✅ Todas las respuestas pasan por normalizarCasa()
 * ✅ PROHIBIDO: any, unknown, casts "as"
 * ✅ Validación con Zod en cada respuesta
 */

import apiClient from '../axios';
import type {
  Casa,
  CreateCasaDto,
  UpdateCasaDto,
  QueryCasasDto,
  CasasResponse,
  CasasEstadisticas,
  DeleteCasaResponse,
} from '@/types/casa.types';
import { normalizarCasa, normalizarCasas } from '@/types/casa.types';
import {
  equipoSchema,
  equiposResponseSchema,
  equiposEstadisticasSchema,
  deleteEquipoResponseSchema,
} from '@mateatletas/contracts';

/**
 * Cliente API para operaciones CRUD de Casas
 * Todas las llamadas requieren autenticación (token JWT)
 *
 * IMPORTANTE: El interceptor de axios ya extrae response.data automáticamente,
 * por lo que NO debemos hacer .data aquí para evitar undefined.
 */

/**
 * Crear una nueva casa
 * POST /api/equipos
 */
async function create(data: CreateCasaDto): Promise<Casa> {
  try {
    const response = await apiClient.post<Casa>('/equipos', data);
    const validado = equipoSchema.parse(response);
    return normalizarCasa(validado);
  } catch (error) {
    console.error('Error al crear la casa:', error);
    throw error;
  }
}

/**
 * Obtener todas las casas con filtros y paginación
 * GET /api/equipos?page=1&limit=10&search=...&sortBy=...&order=...
 */
async function getAll(params?: QueryCasasDto): Promise<CasasResponse> {
  try {
    const response = await apiClient.get<CasasResponse>('/equipos', { params });
    const validado = equiposResponseSchema.parse(response);
    return {
      ...validado,
      data: normalizarCasas(validado.data),
    };
  } catch (error) {
    console.error('Error al obtener las casas:', error);
    throw error;
  }
}

/**
 * Obtener una casa por ID
 * GET /api/equipos/:id
 */
async function getById(id: string): Promise<Casa> {
  try {
    const response = await apiClient.get<Casa>(`/equipos/${id}`);
    const validado = equipoSchema.parse(response);
    return normalizarCasa(validado);
  } catch (error) {
    console.error('Error al obtener la casa por ID:', error);
    throw error;
  }
}

/**
 * Actualizar una casa existente
 * PATCH /api/equipos/:id
 */
async function update(id: string, data: UpdateCasaDto): Promise<Casa> {
  try {
    const response = await apiClient.patch<Casa>(`/equipos/${id}`, data);
    const validado = equipoSchema.parse(response);
    return normalizarCasa(validado);
  } catch (error) {
    console.error('Error al actualizar la casa:', error);
    throw error;
  }
}

/**
 * Eliminar una casa
 * DELETE /api/equipos/:id
 *
 * Los estudiantes asociados NO se eliminan,
 * solo se desvinculan (equipo_id = NULL)
 */
async function deleteCasa(id: string): Promise<DeleteCasaResponse> {
  try {
    const response = await apiClient.delete<DeleteCasaResponse>(`/equipos/${id}`);
    return deleteEquipoResponseSchema.parse(response);
  } catch (error) {
    console.error('Error al eliminar la casa:', error);
    throw error;
  }
}

/**
 * Obtener estadísticas generales de casas
 * GET /api/equipos/estadisticas
 *
 * Incluye:
 * - Total de casas
 * - Total de estudiantes
 * - Promedio de estudiantes por casa
 * - Ranking de casas por puntos
 */
async function getEstadisticas(): Promise<CasasEstadisticas> {
  try {
    const response = await apiClient.get<CasasEstadisticas>('/equipos/estadisticas');
    return equiposEstadisticasSchema.parse(response);
  } catch (error) {
    console.error('Error al obtener las estadísticas de casas:', error);
    throw error;
  }
}

/**
 * Recalcular puntos totales de una casa
 * POST /api/equipos/:id/recalcular-puntos
 *
 * Suma los puntos de todos los estudiantes de la casa
 * y actualiza el campo puntos_totales
 */
async function recalcularPuntos(id: string): Promise<Casa> {
  try {
    const response = await apiClient.post<Casa>(`/equipos/${id}/recalcular-puntos`);
    const validado = equipoSchema.parse(response);
    return normalizarCasa(validado);
  } catch (error) {
    console.error('Error al recalcular los puntos de la casa:', error);
    throw error;
  }
}

// Exportar como objeto con métodos
export const casasApi = {
  create,
  getAll,
  getById,
  update,
  delete: deleteCasa,
  getEstadisticas,
  recalcularPuntos,
};
