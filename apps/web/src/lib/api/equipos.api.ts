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
  const response = await apiClient.post<Equipo>('/equipos', data);
  return response as unknown as Equipo;
}

/**
 * Obtener todos los equipos con filtros y paginación
 * GET /api/equipos?page=1&limit=10&search=...&sortBy=...&order=...
 */
async function getAll(params?: QueryEquiposDto): Promise<EquiposResponse> {
  const response = await apiClient.get<EquiposResponse>('/equipos', { params });
  return response as unknown as EquiposResponse;
}

/**
 * Obtener un equipo por ID
 * GET /api/equipos/:id
 */
async function getById(id: string): Promise<Equipo> {
  const response = await apiClient.get<Equipo>(`/equipos/${id}`);
  return response as unknown as Equipo;
}

/**
 * Actualizar un equipo existente
 * PATCH /api/equipos/:id
 */
async function update(
  id: string,
  data: UpdateEquipoDto,
): Promise<Equipo> {
  const response = await apiClient.patch<Equipo>(`/equipos/${id}`, data);
  return response as unknown as Equipo;
}

/**
 * Eliminar un equipo
 * DELETE /api/equipos/:id
 *
 * Los estudiantes asociados NO se eliminan,
 * solo se desvinculan (equipo_id = NULL)
 */
async function deleteEquipo(id: string): Promise<DeleteEquipoResponse> {
  const response = await apiClient.delete<DeleteEquipoResponse>(`/equipos/${id}`);
  return response as unknown as DeleteEquipoResponse;
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
  const response = await apiClient.get<EquiposEstadisticas>('/equipos/estadisticas');
  return response as unknown as EquiposEstadisticas;
}

/**
 * Recalcular puntos totales de un equipo
 * POST /api/equipos/:id/recalcular-puntos
 *
 * Suma los puntos de todos los estudiantes del equipo
 * y actualiza el campo puntos_totales
 */
async function recalcularPuntos(id: string): Promise<Equipo> {
  const response = await apiClient.post<Equipo>(`/equipos/${id}/recalcular-puntos`);
  return response as unknown as Equipo;
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
