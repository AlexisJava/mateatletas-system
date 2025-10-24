/**
 * Types para el módulo de Planificaciones Mensuales
 */

/**
 * Estado de una planificación
 */
export type EstadoPlanificacion = 'borrador' | 'publicada' | 'archivada';

/**
 * Código de grupo válido
 */
export type CodigoGrupo = 'B1' | 'B2' | 'B3';

/**
 * Filtros para la consulta de planificaciones
 */
export interface PlanificacionFilters {
  codigo_grupo?: CodigoGrupo;
  mes?: number; // 1-12
  anio?: number; // ej: 2025
  estado?: EstadoPlanificacion;
}

/**
 * Opciones de paginación
 */
export interface PaginationOptions {
  page?: number; // Default: 1
  limit?: number; // Default: 10
}

/**
 * Item de planificación en la lista
 */
export interface PlanificacionListItem {
  id: string;
  titulo: string;
  codigo_grupo: CodigoGrupo;
  mes: number;
  anio: number;
  estado: EstadoPlanificacion;
  total_actividades: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

/**
 * Respuesta paginada de planificaciones
 */
export interface PlanificacionListResponse {
  data: PlanificacionListItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * Request para crear una planificación
 */
export interface CreatePlanificacionRequest {
  titulo?: string; // Opcional, se genera auto si no se provee
  codigo_grupo: CodigoGrupo;
  mes: number; // 1-12
  anio: number;
  descripcion?: string;
}

/**
 * Request para actualizar una planificación
 */
export interface UpdatePlanificacionRequest {
  titulo?: string;
  descripcion?: string;
  estado?: EstadoPlanificacion;
}

/**
 * Componente de una actividad
 */
export type ComponenteActividad = 'juego' | 'video' | 'pdf' | 'ejercicio';

/**
 * Actividad dentro de una planificación
 */
export interface Actividad {
  id: string;
  planificacion_id: string;
  semana: number; // 1-4
  componente: ComponenteActividad;
  descripcion: string;
  props: Record<string, unknown>; // JSON con props específicas del componente
  orden: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request para crear una actividad
 */
export interface CreateActividadRequest {
  semana: number; // 1-4
  componente: ComponenteActividad;
  descripcion: string;
  props: Record<string, unknown>;
  orden: number;
}

/**
 * Planificación completa con actividades
 */
export interface PlanificacionDetalle extends PlanificacionListItem {
  descripcion?: string;
  actividades: Actividad[];
}
