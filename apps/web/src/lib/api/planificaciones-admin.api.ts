/**
 * Planificaciones Admin API Client
 *
 * Cliente para gestión de planificaciones desde el panel de admin/sandbox.
 * Endpoints para CRUD de planificaciones, clases y tareas.
 */

import axios from '@/lib/axios';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type CasaTipo = 'QUANTUM' | 'VERTEX' | 'PULSAR';
export type MundoTipo = 'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS';
export type EstadoContenido = 'BORRADOR' | 'PUBLICADO' | 'ARCHIVADO';

export interface ContenidoSimple {
  id: string;
  titulo: string;
  estado: EstadoContenido;
}

export interface TareaClase {
  id: string;
  contenidoId: string;
  orden: number;
  obligatoria: boolean;
  contenido: {
    id: string;
    titulo: string;
  };
}

export interface ClasePlanificacion {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string | null;
  teoriaId: string;
  practicaId: string;
  teoria?: ContenidoSimple;
  practica?: ContenidoSimple;
  tareas?: TareaClase[];
}

export interface Planificacion {
  id: string;
  titulo: string;
  descripcion: string | null;
  cantidadClases: number;
  casaTipo: CasaTipo;
  mundoTipo: MundoTipo;
  estado: EstadoContenido;
  createdAt: string;
  updatedAt: string;
  clases: ClasePlanificacion[];
}

export interface PlanificacionesListResponse {
  data: Planificacion[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DTOs
// ─────────────────────────────────────────────────────────────────────────────

export interface CrearPlanificacionDto {
  titulo: string;
  descripcion?: string;
  cantidadClases: number;
  casaTipo: CasaTipo;
  mundoTipo: MundoTipo;
}

export interface ActualizarPlanificacionDto {
  titulo?: string;
  descripcion?: string;
}

export interface ActualizarClaseDto {
  titulo?: string;
  descripcion?: string;
  teoriaId?: string;
  practicaId?: string;
}

export interface AgregarTareaDto {
  contenidoId: string;
  orden?: number;
  obligatoria?: boolean;
}

export interface QueryPlanificacionesParams {
  page?: number;
  limit?: number;
  estado?: EstadoContenido;
  casaTipo?: CasaTipo;
  mundoTipo?: MundoTipo;
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crear nueva planificación con clases vacías
 */
export const crearPlanificacion = async (dto: CrearPlanificacionDto): Promise<Planificacion> => {
  return axios.post<Planificacion>('/admin/planificaciones', dto);
};

/**
 * Listar planificaciones con filtros y paginación
 */
export const listarPlanificaciones = async (
  params?: QueryPlanificacionesParams,
): Promise<PlanificacionesListResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.estado) searchParams.append('estado', params.estado);
  if (params?.casaTipo) searchParams.append('casaTipo', params.casaTipo);
  if (params?.mundoTipo) searchParams.append('mundoTipo', params.mundoTipo);

  const query = searchParams.toString();
  return axios.get<PlanificacionesListResponse>(
    `/admin/planificaciones${query ? `?${query}` : ''}`,
  );
};

/**
 * Obtener planificación por ID con todas sus clases
 */
export const obtenerPlanificacion = async (id: string): Promise<Planificacion> => {
  return axios.get<Planificacion>(`/admin/planificaciones/${id}`);
};

/**
 * Actualizar metadata de planificación
 */
export const actualizarPlanificacion = async (
  id: string,
  dto: ActualizarPlanificacionDto,
): Promise<Planificacion> => {
  return axios.patch<Planificacion>(`/admin/planificaciones/${id}`, dto);
};

/**
 * Eliminar planificación (solo borradores)
 */
export const eliminarPlanificacion = async (
  id: string,
): Promise<{ success: boolean; mensaje: string }> => {
  return axios.delete(`/admin/planificaciones/${id}`);
};

/**
 * Actualizar una clase de planificación
 */
export const actualizarClase = async (
  claseId: string,
  dto: ActualizarClaseDto,
): Promise<Planificacion> => {
  return axios.patch<Planificacion>(`/admin/planificaciones/clases/${claseId}`, dto);
};

/**
 * Agregar tarea a una clase
 */
export const agregarTarea = async (
  claseId: string,
  dto: AgregarTareaDto,
): Promise<Planificacion> => {
  return axios.post<Planificacion>(`/admin/planificaciones/clases/${claseId}/tareas`, dto);
};

/**
 * Eliminar tarea de una clase
 */
export const eliminarTarea = async (claseId: string, tareaId: string): Promise<Planificacion> => {
  return axios.delete<Planificacion>(`/admin/planificaciones/clases/${claseId}/tareas/${tareaId}`);
};

/**
 * Publicar planificación
 */
export const publicarPlanificacion = async (id: string): Promise<Planificacion> => {
  return axios.post<Planificacion>(`/admin/planificaciones/${id}/publicar`);
};

// ─────────────────────────────────────────────────────────────────────────────
// API OBJECT (para uso consistente con otros módulos)
// ─────────────────────────────────────────────────────────────────────────────

export const planificacionesAdminApi = {
  crear: crearPlanificacion,
  listar: listarPlanificaciones,
  obtener: obtenerPlanificacion,
  actualizar: actualizarPlanificacion,
  eliminar: eliminarPlanificacion,
  actualizarClase,
  agregarTarea,
  eliminarTarea,
  publicar: publicarPlanificacion,
};
