/**
 * API Client para operaciones de tutores
 *
 * REGLAS APLICADAS:
 * ✅ Tipos explícitos importados desde schemas
 * ✅ Todas las funciones retornan Promise<TipoExplicito>
 * ✅ Validación con Zod en respuestas críticas
 * ✅ PROHIBIDO: any, unknown, casts "as"
 */

import apiClient from '../axios';
import {
  dashboardResumenResponseSchema,
  proximasClasesResponseSchema,
  alertasResponseSchema,
  misInscripcionesResponseSchema,
  crearHijoResponseSchema,
  estudianteCreadoSchema,
} from '@/lib/schemas/tutor.schema';

// ============================================================================
// TIPOS DE RESPUESTA - Basados en /apps/api/src/tutor/types/tutor-dashboard.types.ts
// ============================================================================

export type TipoAlerta = 'pagoVencido' | 'pagoPorVencer' | 'claseHoy' | 'asistenciaBaja';
export type PrioridadAlerta = 'alta' | 'media' | 'baja';

export interface AlertaDashboard {
  id: string;
  tipo: TipoAlerta;
  prioridad: PrioridadAlerta;
  titulo: string;
  mensaje: string;
  accion?: {
    label: string;
    url: string;
  };
  metadata?: {
    estudianteId?: string;
    estudianteNombre?: string;
    monto?: number;
    fechaVencimiento?: string;
    claseId?: string;
    claseHora?: string;
    porcentajeAsistencia?: number;
  };
}

export interface MetricasDashboard {
  totalHijos: number;
  clasesDelMes: number;
  totalPagadoAnio: number;
  asistenciaPromedio: number;
}

export interface HijoInfo {
  id: string;
  nombre: string;
  apellido: string;
  edad: number | null;
  nivelEscolar: string | null;
  casa: string | null;
  xpTotal: number;
  asistenciaPromedio: number;
  avatarUrl: string | null;
}

export interface PagoPendiente {
  id: string;
  monto: number;
  concepto: string;
  fechaVencimiento: string;
  diasParaVencer: number;
  estudianteId: string;
  estudianteNombre: string;
  estaVencido: boolean;
}

export interface ClaseHoy {
  id: string;
  hora: string;
  nombreClase: string;
  estudianteId: string;
  estudianteNombre: string;
  docenteNombre: string;
  fechaHoraInicio: string;
  urlReunion?: string;
  puedeUnirse: boolean;
}

export interface DashboardResumenResponse {
  metricas: MetricasDashboard;
  hijos: HijoInfo[];
  alertas: AlertaDashboard[];
  pagosPendientes: PagoPendiente[];
  clasesHoy: ClaseHoy[];
}

export interface ClaseProxima {
  id: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  duracionMinutos: number;
  nombre: string;
  docente: {
    id: string;
    nombre: string;
    apellido: string;
  };
  estudiante: {
    id: string;
    nombre: string;
    apellido: string;
  };
  estado: 'Programada' | 'EnVivo' | 'Finalizada' | 'Cancelada';
  urlReunion?: string;
  puedeUnirse: boolean;
  esHoy: boolean;
  esManana: boolean;
  labelFecha: string;
}

export interface ProximasClasesResponse {
  clases: ClaseProxima[];
  total: number;
}

export interface AlertasResponse {
  alertas: AlertaDashboard[];
  total: number;
  hayAlertas: boolean;
}

export type EstadoPagoFilter = 'Pendiente' | 'Pagado' | 'Vencido';

/**
 * Inscripción mensual con relaciones incluidas
 * El backend SIEMPRE devuelve estudiante y producto
 *
 * Nota: precioBase, descuentoAplicado, precioFinal vienen como string
 * porque el backend usa Decimal que se serializa a string en JSON
 */
export interface InscripcionMensual {
  id: string;
  tutorId: string;
  estudianteId: string;
  productoId: string;
  periodo: string;
  anio: number;
  mes: number;
  precioBase: string;
  descuentoAplicado: string;
  precioFinal: string;
  tipoDescuento: string;
  detalleCalculo: string;
  estadoPago: EstadoPagoFilter;
  fechaPago: string | null;
  metodoPago: string | null;
  comprobanteUrl: string | null;
  observaciones: string | null;
  createdAt: string;
  updatedAt: string;
  // Relaciones - siempre incluidas por el backend
  estudiante: {
    id: string;
    nombre: string;
    apellido: string;
  };
  producto: {
    id: string;
    nombre: string;
  };
}

export interface MisInscripcionesResponse {
  inscripciones: InscripcionMensual[];
  resumen: {
    totalPendiente: number;
    totalPagado: number;
    cantidadInscripciones: number;
    estudiantesUnicos: number;
  };
}

// ============================================================================
// TIPOS DE REQUEST
// ============================================================================

export interface CrearHijoRequest {
  nombre: string;
  apellido: string;
  edad: number;
  nivelEscolar: 'Primaria' | 'Secundaria' | 'Universidad';
}

export interface UpdateEstudianteRequest {
  nombre?: string;
  apellido?: string;
  edad?: number;
  nivelEscolar?: 'Primaria' | 'Secundaria' | 'Universidad';
}

export interface EstudianteCreado {
  id: string;
  nombre: string;
  apellido: string;
  edad: number;
  nivelEscolar: string;
  casaId: string | null;
}

export interface CrearHijoResponse {
  estudiante: EstudianteCreado;
  credenciales: {
    codigoAcceso: string;
    password: string;
  };
}

// ============================================================================
// API CLIENT
// ============================================================================

export const tutoresApi = {
  /**
   * POST /estudiantes
   * Crear un nuevo hijo (estudiante) asociado al tutor autenticado
   */
  crearHijo: async (data: CrearHijoRequest): Promise<CrearHijoResponse> => {
    const response = await apiClient.post<CrearHijoResponse>('/estudiantes', data);
    return crearHijoResponseSchema.parse(response);
  },

  /**
   * PATCH /estudiantes/:id
   * Actualiza los datos de un estudiante (hijo del tutor autenticado)
   * El backend verifica ownership automáticamente
   */
  updateEstudiante: async (
    id: string,
    data: UpdateEstudianteRequest,
  ): Promise<EstudianteCreado> => {
    const response = await apiClient.patch<EstudianteCreado>(`/estudiantes/${id}`, data);
    return estudianteCreadoSchema.parse(response);
  },

  /**
   * GET /tutor/dashboard-resumen
   * Dashboard completo: métricas, alertas, pagos pendientes, clases de hoy
   */
  getDashboardResumen: async (): Promise<DashboardResumenResponse> => {
    const response = await apiClient.get<DashboardResumenResponse>('/tutor/dashboard-resumen');
    return dashboardResumenResponseSchema.parse(response);
  },

  /**
   * GET /tutor/proximas-clases
   * Próximas N clases de todos los hijos
   */
  getProximasClases: async (limit: number = 5): Promise<ProximasClasesResponse> => {
    const response = await apiClient.get<ProximasClasesResponse>('/tutor/proximas-clases', {
      params: { limit },
    });
    return proximasClasesResponseSchema.parse(response);
  },

  /**
   * GET /tutor/alertas
   * Todas las alertas activas
   */
  getAlertas: async (): Promise<AlertasResponse> => {
    const response = await apiClient.get<AlertasResponse>('/tutor/alertas');
    return alertasResponseSchema.parse(response);
  },

  /**
   * GET /tutor/mis-inscripciones
   * Inscripciones mensuales con resumen financiero
   */
  getMisInscripciones: async (
    periodo?: string,
    estadoPago?: EstadoPagoFilter,
  ): Promise<MisInscripcionesResponse> => {
    const response = await apiClient.get<MisInscripcionesResponse>('/tutor/mis-inscripciones', {
      params: { periodo, estadoPago },
    });
    return misInscripcionesResponseSchema.parse(response);
  },
};

export default tutoresApi;
