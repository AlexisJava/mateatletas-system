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

/**
 * Info de comisión/clase grupal para un estudiante
 */
export interface ComisionInfo {
  id: string;
  nombre: string;
  horario: string;
  docente: {
    nombre: string;
    apellido: string;
  };
  producto?: {
    nombre: string;
  };
}

/**
 * Info de hijo para el dashboard del tutor
 * NOTA: Backend devuelve `puntosTotales` (no `xpTotal`)
 */
export interface HijoInfo {
  id: string;
  nombre: string;
  apellido: string;
  edad: number | null;
  nivelEscolar: string | null;
  casa: string | null;
  puntosTotales: number;
  asistenciaPromedio: number;
  avatarUrl: string | null;
  comisiones: ComisionInfo[];
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

  // ============================================================================
  // NOTIFICACIONES
  // ============================================================================

  /**
   * GET /tutor/notificaciones
   * Lista de notificaciones del tutor
   */
  getNotificaciones: async (params?: {
    soloNoLeidas?: boolean;
    page?: number;
    limit?: number;
  }): Promise<NotificacionesTutorResponse> => {
    return apiClient.get<NotificacionesTutorResponse>('/tutor/notificaciones', { params });
  },

  /**
   * GET /tutor/notificaciones/count
   * Contador de notificaciones no leídas
   */
  getNotificacionesCount: async (): Promise<{ count: number }> => {
    return apiClient.get<{ count: number }>('/tutor/notificaciones/count');
  },

  /**
   * PATCH /tutor/notificaciones/:id/leer
   * Marcar notificación como leída
   */
  marcarNotificacionLeida: async (id: string): Promise<NotificacionTutor> => {
    return apiClient.patch<NotificacionTutor>(`/tutor/notificaciones/${id}/leer`);
  },

  /**
   * PATCH /tutor/notificaciones/leer-todas
   * Marcar todas las notificaciones como leídas
   */
  marcarTodasNotificacionesLeidas: async (): Promise<{ updated: number }> => {
    return apiClient.patch<{ updated: number }>('/tutor/notificaciones/leer-todas');
  },

  /**
   * DELETE /tutor/notificaciones/:id
   * Eliminar una notificación
   */
  eliminarNotificacion: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/tutor/notificaciones/${id}`);
  },

  // ============================================================================
  // VERANO
  // ============================================================================

  /**
   * GET /tutor/verano/estado
   * Estado de verano: período de decisión y estudiantes
   */
  getEstadoVerano: async (): Promise<EstadoVeranoResponse> => {
    return apiClient.get<EstadoVeranoResponse>('/tutor/verano/estado');
  },

  /**
   * POST /tutor/verano/decidir
   * Tomar decisión de verano para un estudiante
   */
  decidirVerano: async (data: DecidirVeranoRequest): Promise<DecidirVeranoResponse> => {
    return apiClient.post<DecidirVeranoResponse>('/tutor/verano/decidir', data);
  },

  /**
   * POST /tutor/verano/solicitar-colonia
   * Solicitar cambio a Colonia (desde CONTINUIDAD)
   */
  solicitarColonia: async (data: SolicitarColoniaRequest): Promise<SolicitarColoniaResponse> => {
    return apiClient.post<SolicitarColoniaResponse>('/tutor/verano/solicitar-colonia', data);
  },

  /**
   * POST /tutor/verano/cancelar-colonia
   * Cancelar Colonia (volver a CONTINUIDAD, pierde matrícula)
   */
  cancelarColonia: async (data: CancelarColoniaRequest): Promise<CancelarColoniaResponse> => {
    return apiClient.post<CancelarColoniaResponse>('/tutor/verano/cancelar-colonia', data);
  },

  // ============================================================================
  // PROGRESO DE CONTENIDOS
  // ============================================================================

  /**
   * GET /tutor/estudiantes/:estudianteId/contenidos/progreso
   * Progreso de contenidos de un hijo
   */
  getProgresoContenidosHijo: async (estudianteId: string): Promise<ProgresoContenidoHijo[]> => {
    return apiClient.get<ProgresoContenidoHijo[]>(
      `/tutor/estudiantes/${estudianteId}/contenidos/progreso`,
    );
  },
};

// ============================================================================
// TIPOS ADICIONALES - Notificaciones
// ============================================================================

export interface NotificacionTutor {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  leida: boolean;
  fechaCreacion: string;
  metadata?: Record<string, unknown>;
}

export interface NotificacionesTutorResponse {
  data: NotificacionTutor[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// TIPOS ADICIONALES - Verano
// ============================================================================

export type DecisionVerano = 'COLONIA' | 'CONTINUIDAD' | 'BAJA';

export interface EstudianteVerano {
  id: string;
  nombre: string;
  decision: string | null;
  cuposColoniaDisponibles: number;
}

export interface EstadoVeranoResponse {
  puedeDecidir: boolean;
  fechaLimite: string;
  estudiantes: EstudianteVerano[];
}

export interface DecidirVeranoRequest {
  estudianteId: string;
  decision: DecisionVerano;
}

export interface DecidirVeranoResponse {
  success: boolean;
  mensaje: string;
  montoProximoCobro: number;
}

export interface SolicitarColoniaRequest {
  estudianteId: string;
  grupoPreferidoId?: string;
}

export interface SolicitarColoniaResponse {
  success: boolean;
  mensaje: string;
  cupoAsignado?: string;
}

export interface CancelarColoniaRequest {
  estudianteId: string;
  confirmaPerderMatricula: boolean;
}

export interface CancelarColoniaResponse {
  success: boolean;
  mensaje: string;
}

// ============================================================================
// TIPOS ADICIONALES - Progreso de Contenidos
// ============================================================================

export interface ProgresoContenidoHijo {
  id: string;
  contenido: {
    id: string;
    titulo: string;
    mundoTipo: string;
    imagenPortada: string | null;
    totalNodos: number;
  };
  nodoActual: {
    id: string;
    titulo: string;
    orden: number;
  } | null;
  completado: boolean;
  ultimaActividad: string;
  porcentaje: number;
}

export default tutoresApi;
