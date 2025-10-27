// Shared types and utilities for Mateatletas

/**
 * API response wrapper used across the platform when a REST endpoint
 * returns a success or failure payload.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ---------------------------------------------------------------------------
// Re-export shared contracts (Zod schemas + types) to centralize imports
// ---------------------------------------------------------------------------

export * from '@mateatletas/contracts';

// Re-export runtime constants for enum values
export { ESTADO_CLASE, ESTADO_ASISTENCIA } from '@mateatletas/contracts';

/**
 * Curated list of contract types frequently used by front-end and testing
 * packages. Re-exporting them here keeps imports stable even if the
 * underlying contract package is reorganized.
 */
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
  CursoDetalle,
  Modulo,
  Leccion,
  ProgresoCurso,
  Producto,
} from '@mateatletas/contracts';
