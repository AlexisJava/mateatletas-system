// Shared types and utilities for Mateatletas

/**
 * User roles in the system
 */
export enum UserRole {
  ATHLETE = 'athlete',
  COACH = 'coach',
  ADMIN = 'admin',
}

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Detalle completo de un curso con su estructura y progreso
 */
export interface CursoDetalle {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: 'Curso';
  activo: boolean;
  fecha_inicio: string | Date | null;
  fecha_fin: string | Date | null;
  cupo_maximo: number | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  modulos: CursoModuloDetalle[];
  progreso?: CursoProgresoDetalle;
}

/**
 * Información de un módulo dentro de un curso
 */
export interface CursoModuloDetalle {
  id: string;
  producto_id: string;
  titulo: string;
  descripcion: string | null;
  orden: number;
  duracion_estimada_minutos: number;
  puntos_totales: number;
  publicado: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  lecciones: CursoLeccionDetalle[];
}

/**
 * Información detallada de una lección
 */
export interface CursoLeccionDetalle {
  id: string;
  modulo_id: string;
  titulo: string;
  descripcion: string | null;
  tipo_contenido: string;
  contenido: Record<string, unknown> | null;
  orden: number;
  duracion_estimada_minutos: number | null;
  puntos_por_completar: number;
  activo: boolean;
  leccion_prerequisito_id: string | null;
  logro_desbloqueable_id: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Información de progreso agregada para un curso
 */
export interface CursoProgresoDetalle {
  producto_id: string;
  total_modulos: number;
  total_lecciones: number;
  lecciones_completadas: number;
  porcentaje_completado: number;
  puntos_ganados: number;
  tiempo_total_minutos: number;
  siguiente_leccion: CursoLeccionDetalle | null;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Re-export shared contracts (Zod schemas + types) to centralize imports
// ---------------------------------------------------------------------------

export * from '@mateatletas/contracts';

// Re-export runtime constants for enum values
export { ESTADO_CLASE, ESTADO_ASISTENCIA } from '@mateatletas/contracts';

export type {
  EstadoPlanificacion,
  ComponenteActividad,
  PlanificacionListItem,
  PlanificacionListResponse,
  PlanificacionActividad,
  PlanificacionDetalle,
  CreatePlanificacionInput,
  UpdatePlanificacionInput,
  CreateActividadInput,
  PlanificacionGrupo,
  EstadoClase,
  Asistencia,
  Clase,
  ClasesList,
  InscripcionClase,
  ReservarClaseInput,
  EstadoMembresia,
  EstadoInscripcion,
  Membresia,
  InscripcionCurso,
  PreferenciaPago,
  CrearPreferenciaSuscripcionRequest,
  CrearPreferenciaCursoRequest,
  EstadoMembresiaResponse,
  MetricasDashboardResponse,
  ConfiguracionPrecios,
  HistorialCambioPrecios,
  InscripcionMensualConRelaciones,
  EstudianteConDescuento,
  ActualizarConfiguracionPreciosInput,
  DashboardGamificacion,
  ProximaClase,
  Logro,
  LogrosList,
  Puntos,
  Ranking,
  RankingIntegrante,
  RankingGlobalItem,
  EquipoResumen,
  ProgresoRuta,
  ProgresoRutaList,
  AccionPuntuable,
  AccionesPuntuablesList,
  PuntoObtenido,
  PuntosObtenidosList,
  OtorgarPuntosInput,
} from '@mateatletas/contracts';
