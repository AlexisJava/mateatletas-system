/**
 * 🎯 Centralized Type Definitions
 *
 * Re-export all API types for easy importing
 * Eliminates need to import from multiple API client files
 */

// Auth types
export type { AuthUser, AuthRole, RegisterData, LoginData } from '@/lib/api/auth.api';

// Estudiantes types - import from types files
export type { Estudiante, CreateEstudianteData as CrearEstudianteDto } from './estudiante';

// Clases types - import from types files
export type {
  Clase,
  InscripcionClase,
  RutaCurricular,
} from './clases.types';

// Catálogo types
export type { Producto, TipoProducto, CrearProductoDto } from '@/lib/api/catalogo.api';

// Pagos types - import from types files
export type { Membresia, InscripcionCurso } from './pago.types';

// Tutor Dashboard types - import from types files
export type {
  TipoAlerta,
  PrioridadAlerta,
  AlertaDashboard,
  MetricasDashboard,
  PagoPendiente,
  ClaseHoy,
  DashboardResumenResponse,
  ClaseProxima,
  ProximasClasesResponse,
  AlertasResponse,
} from './tutor-dashboard.types';

// Equipos types - import from types files
export type { Equipo } from './estudiante';

// Cursos types (if exists)
// export type { Curso, Modulo, Leccion } from '@/lib/api/cursos.api';

// Eventos types (if exists)
// export type { Evento, Tarea, Recordatorio, Nota } from '@/lib/api/eventos.api';

/**
 * Custom error type for API errors
 */
export interface ApiError {
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  error?: string;
}

/**
 * Helper to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    'message' in error
  );
}

/**
 * Helper to extract error message from error-like input
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: string }).message === 'string'
  ) {
    return (error as { message?: string }).message ?? 'An unknown error occurred';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'number' || typeof error === 'boolean') {
    return String(error);
  }

  return 'An unknown error occurred';
}
