/**
 * Types para el módulo de Planificaciones Mensuales
 */

/**
 * Estado de una planificación según enums del backend
 */
export type EstadoPlanificacion = 'BORRADOR' | 'PUBLICADA' | 'ARCHIVADA';

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
 * Item de planificación en la lista (estructura normalizada para el frontend)
 */
export interface PlanificacionListItem {
  id: string;
  grupo_id: string; // UUID o CUID del grupo
  codigo_grupo: CodigoGrupo;
  grupo?: {
    id: string;
    codigo: string;
    nombre: string;
  } | null;
  mes: number;
  anio: number;
  titulo: string;
  descripcion: string | null;
  tematica_principal: string;
  objetivos_aprendizaje: string[];
  estado: EstadoPlanificacion;
  notas_docentes: string | null;
  fecha_publicacion: string | null;
  created_at: string; // ISO string
  updated_at: string; // ISO string
  total_actividades: number;
  total_asignaciones: number;
}

/**
 * Respuesta paginada de planificaciones
 */
export interface PlanificacionListResponse {
  data: PlanificacionListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number; // camelCase para consumo en UI
}

/**
 * Request para crear una planificación
 */
export interface CreatePlanificacionRequest {
  grupo_id: string;
  mes: number; // 1-12
  anio: number;
  titulo: string;
  descripcion?: string;
  tematica_principal: string;
  objetivos_aprendizaje?: string[];
  notas_docentes?: string;
}

/**
 * Request para actualizar una planificación
 */
export interface UpdatePlanificacionRequest {
  titulo?: string;
  descripcion?: string;
  tematica_principal?: string;
  objetivos_aprendizaje?: string[];
  notas_docentes?: string;
  estado?: EstadoPlanificacion;
  fecha_publicacion?: string | null;
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
  created_at: string;
  updated_at: string;
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
  actividades: Actividad[];
}
