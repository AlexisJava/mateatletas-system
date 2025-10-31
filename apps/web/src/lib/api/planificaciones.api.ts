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
  PlanificacionListItem,
  CodigoGrupo,
  EstadoPlanificacion,
} from '@/types/planificacion.types';

type PlanificacionListItemApi = {
  id: string;
  grupo_id: string;
  codigo_grupo: CodigoGrupo;
  mes: number;
  anio: number;
  titulo: string;
  descripcion: string | null;
  tematica_principal: string;
  objetivos_aprendizaje: string[] | null;
  estado: EstadoPlanificacion;
  notas_docentes: string | null;
  fecha_publicacion: string | null;
  createdAt: string;
  updatedAt: string;
  total_actividades: number;
  total_asignaciones: number;
};

type PlanificacionListResponseApi = {
  data: PlanificacionListItemApi[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

type ActividadApi = {
  id: string;
  planificacion_id: string;
  semana: number;
  componente: Actividad['componente'];
  descripcion: string;
  props: Record<string, unknown> | null;
  orden: number;
  createdAt: string;
  updatedAt: string;
};

type PlanificacionDetalleApi = PlanificacionListItemApi & {
  actividades: ActividadApi[];
};

const mapPlanificacionListItem = (
  planificacion: PlanificacionListItemApi,
): PlanificacionListItem => ({
  id: planificacion.id,
  grupo_id: planificacion.grupo_id,
  codigo_grupo: planificacion.codigo_grupo,
  grupo: {
    id: planificacion.grupo_id,
    codigo: planificacion.codigo_grupo,
    nombre: `Grupo ${planificacion.codigo_grupo}`,
  },
  mes: planificacion.mes,
  anio: planificacion.anio,
  titulo: planificacion.titulo,
  descripcion: planificacion.descripcion,
  tematica_principal: planificacion.tematica_principal,
  objetivos_aprendizaje: planificacion.objetivos_aprendizaje ?? [],
  estado: planificacion.estado,
  notas_docentes: planificacion.notas_docentes,
  fecha_publicacion: planificacion.fecha_publicacion,
  createdAt: planificacion.createdAt,
  updatedAt: planificacion.updatedAt,
  total_actividades: planificacion.total_actividades ?? 0,
  total_asignaciones: planificacion.total_asignaciones ?? 0,
});

const mapActividad = (actividad: ActividadApi): Actividad => ({
  id: actividad.id,
  planificacion_id: actividad.planificacion_id,
  semana: actividad.semana,
  componente: actividad.componente,
  descripcion: actividad.descripcion,
  props: actividad.props ?? {},
  orden: actividad.orden,
  createdAt: actividad.createdAt,
  updatedAt: actividad.updatedAt,
});

const mapPlanificacionDetalle = (
  data: PlanificacionDetalleApi,
): PlanificacionDetalle => ({
  ...mapPlanificacionListItem(data),
  actividades: data.actividades?.map(mapActividad) ?? [],
});

/**
 * Obtener lista de planificaciones con filtros y paginación
 * GET /api/planificaciones
 */
export const getPlanificaciones = async (
  filters: PlanificacionFilters = {},
  pagination: PaginationOptions = { page: 1, limit: 10 },
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

  try {
    // El interceptor ya retorna response.data directamente
    const data = await axios.get<PlanificacionListResponseApi>(
      `/planificaciones?${params.toString()}`,
    );

    return {
      data: data.data.map(mapPlanificacionListItem),
      total: data.total,
      page: data.page,
      limit: data.limit,
      total_pages: data.total_pages,
    };
  } catch (error) {
    console.error('Error al obtener las planificaciones:', error);
    throw error;
  }
};

/**
 * Obtener una planificación por ID con sus actividades
 * GET /api/planificaciones/:id
 */
export const getPlanificacionById = async (
  id: string,
): Promise<PlanificacionDetalle> => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await axios.get<PlanificacionDetalleApi>(
      `/planificaciones/${id}`,
    );
    return mapPlanificacionDetalle(response);
  } catch (error) {
    console.error('Error al obtener la planificación por ID:', error);
    throw error;
  }
};

/**
 * Crear una nueva planificación
 * POST /api/planificaciones
 */
export const createPlanificacion = async (
  data: CreatePlanificacionRequest,
): Promise<PlanificacionDetalle> => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await axios.post<PlanificacionDetalleApi>(
      '/planificaciones',
      data,
    );
    return mapPlanificacionDetalle(response);
  } catch (error) {
    console.error('Error al crear la planificación:', error);
    throw error;
  }
};

/**
 * Actualizar una planificación
 * PATCH /api/planificaciones/:id
 */
export const updatePlanificacion = async (
  id: string,
  data: UpdatePlanificacionRequest,
): Promise<PlanificacionDetalle> => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await axios.patch<PlanificacionDetalleApi>(
      `/planificaciones/${id}`,
      data,
    );
    return mapPlanificacionDetalle(response);
  } catch (error) {
    console.error('Error al actualizar la planificación:', error);
    throw error;
  }
};

/**
 * Eliminar una planificación
 * DELETE /api/planificaciones/:id
 */
export const deletePlanificacion = async (id: string): Promise<void> => {
  try {
    await axios.delete(`/planificaciones/${id}`);
  } catch (error) {
    console.error('Error al eliminar la planificación:', error);
    throw error;
  }
};

/**
 * Agregar una actividad a una planificación
 * POST /api/planificaciones/:id/actividades
 */
export const addActividadToPlanificacion = async (
  planificacionId: string,
  data: CreateActividadRequest,
): Promise<Actividad> => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await axios.post<ActividadApi>(
      `/planificaciones/${planificacionId}/actividades`,
      data,
    );
    return mapActividad(response);
  } catch (error) {
    console.error('Error al agregar la actividad a la planificación:', error);
    throw error;
  }
};

/**
 * Actualizar una actividad
 * PATCH /api/planificaciones/:planificacionId/actividades/:actividadId
 */
export const updateActividad = async (
  planificacionId: string,
  actividadId: string,
  data: Partial<CreateActividadRequest>,
): Promise<Actividad> => {
  try {
    // El interceptor ya retorna response.data directamente
    const response = await axios.patch<ActividadApi>(
      `/planificaciones/${planificacionId}/actividades/${actividadId}`,
      data,
    );
    return mapActividad(response);
  } catch (error) {
    console.error('Error al actualizar la actividad de la planificación:', error);
    throw error;
  }
};

/**
 * Eliminar una actividad
 * DELETE /api/planificaciones/:planificacionId/actividades/:actividadId
 */
export const deleteActividad = async (
  planificacionId: string,
  actividadId: string
): Promise<void> => {
  try {
    await axios.delete(`/planificaciones/${planificacionId}/actividades/${actividadId}`);
  } catch (error) {
    console.error('Error al eliminar la actividad de la planificación:', error);
    throw error;
  }
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
