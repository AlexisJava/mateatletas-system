/**
 * API Client para Planificaciones Mensuales
 *
 * Endpoints:
 * - GET    /api/planificaciones        - Listar planificaciones con filtros
 * - GET    /api/planificaciones/:id    - Obtener una planificación
 * - POST   /api/planificaciones        - Crear planificación
 * - PATCH  /api/planificaciones/:id    - Actualizar planificación
 * - DELETE /api/planificaciones/:id    - Eliminar planificación
 * - POST   /api/planificaciones/:id/actividades - Agregar actividad
 */

import axios from '../axios';
import {
  PlanificacionListResponse,
  PlanificacionFilters,
  PaginationOptions,
  PlanificacionDetalle,
  CreatePlanificacionRequest,
  UpdatePlanificacionRequest,
  CreateActividadRequest,
  Actividad,
} from '@/types/planificacion.types';

/**
 * Obtener lista de planificaciones con filtros y paginación
 * GET /api/planificaciones
 */
export const getPlanificaciones = async (
  filters: PlanificacionFilters = {},
  pagination: PaginationOptions = { page: 1, limit: 10 }
): Promise<PlanificacionListResponse> => {
  const params = new URLSearchParams();

  // Agregar filtros
  if (filters.codigo_grupo) params.append('codigo_grupo', filters.codigo_grupo);
  if (filters.mes) params.append('mes', filters.mes.toString());
  if (filters.anio) params.append('anio', filters.anio.toString());
  if (filters.estado) params.append('estado', filters.estado);

  // Agregar paginación
  if (pagination.page) params.append('page', pagination.page.toString());
  if (pagination.limit) params.append('limit', pagination.limit.toString());

  const response = await axios.get<PlanificacionListResponse>(
    `/planificaciones?${params.toString()}`
  );

  return response.data;
};

/**
 * Obtener una planificación por ID con sus actividades
 * GET /api/planificaciones/:id
 */
export const getPlanificacionById = async (id: string): Promise<PlanificacionDetalle> => {
  const response = await axios.get<PlanificacionDetalle>(`/planificaciones/${id}`);
  return response.data;
};

/**
 * Crear una nueva planificación
 * POST /api/planificaciones
 */
export const createPlanificacion = async (
  data: CreatePlanificacionRequest
): Promise<PlanificacionDetalle> => {
  const response = await axios.post<PlanificacionDetalle>('/planificaciones', data);
  return response.data;
};

/**
 * Actualizar una planificación
 * PATCH /api/planificaciones/:id
 */
export const updatePlanificacion = async (
  id: string,
  data: UpdatePlanificacionRequest
): Promise<PlanificacionDetalle> => {
  const response = await axios.patch<PlanificacionDetalle>(`/planificaciones/${id}`, data);
  return response.data;
};

/**
 * Eliminar una planificación
 * DELETE /api/planificaciones/:id
 */
export const deletePlanificacion = async (id: string): Promise<void> => {
  await axios.delete(`/planificaciones/${id}`);
};

/**
 * Agregar una actividad a una planificación
 * POST /api/planificaciones/:id/actividades
 */
export const addActividadToPlanificacion = async (
  planificacionId: string,
  data: CreateActividadRequest
): Promise<Actividad> => {
  const response = await axios.post<Actividad>(
    `/planificaciones/${planificacionId}/actividades`,
    data
  );
  return response.data;
};

/**
 * Actualizar una actividad
 * PATCH /api/planificaciones/:planificacionId/actividades/:actividadId
 */
export const updateActividad = async (
  planificacionId: string,
  actividadId: string,
  data: Partial<CreateActividadRequest>
): Promise<Actividad> => {
  const response = await axios.patch<Actividad>(
    `/planificaciones/${planificacionId}/actividades/${actividadId}`,
    data
  );
  return response.data;
};

/**
 * Eliminar una actividad
 * DELETE /api/planificaciones/:planificacionId/actividades/:actividadId
 */
export const deleteActividad = async (
  planificacionId: string,
  actividadId: string
): Promise<void> => {
  await axios.delete(`/planificaciones/${planificacionId}/actividades/${actividadId}`);
};

/**
 * Publicar una planificación (cambiar estado a "publicada")
 * PATCH /api/planificaciones/:id
 */
export const publicarPlanificacion = async (id: string): Promise<PlanificacionDetalle> => {
  return updatePlanificacion(id, { estado: 'PUBLICADA' });
};

/**
 * Archivar una planificación (cambiar estado a "archivada")
 * PATCH /api/planificaciones/:id
 */
export const archivarPlanificacion = async (id: string): Promise<PlanificacionDetalle> => {
  return updatePlanificacion(id, { estado: 'ARCHIVADA' });
};
