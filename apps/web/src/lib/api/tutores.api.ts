import apiClient from '../axios';

// ============================================================================
// TIPOS DE RESPUESTA - Basados en /apps/api/src/tutor/types/tutor-dashboard.types.ts
// ============================================================================

export type TipoAlerta = 'pago_vencido' | 'pago_por_vencer' | 'clase_hoy' | 'asistencia_baja';
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
  puntosTotales: number;
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
// API CLIENT
// ============================================================================

export const tutoresApi = {
  /**
   * GET /tutor/dashboard-resumen
   * Dashboard completo: métricas, alertas, pagos pendientes, clases de hoy
   */
  getDashboardResumen: async (): Promise<DashboardResumenResponse> => {
    return apiClient.get<DashboardResumenResponse>('/tutor/dashboard-resumen');
  },

  /**
   * GET /tutor/proximas-clases
   * Próximas N clases de todos los hijos
   */
  getProximasClases: async (limit: number = 5): Promise<ProximasClasesResponse> => {
    return apiClient.get<ProximasClasesResponse>('/tutor/proximas-clases', {
      params: { limit },
    });
  },

  /**
   * GET /tutor/alertas
   * Todas las alertas activas
   */
  getAlertas: async (): Promise<AlertasResponse> => {
    return apiClient.get<AlertasResponse>('/tutor/alertas');
  },

  /**
   * GET /tutor/mis-inscripciones
   * Inscripciones mensuales con resumen financiero
   */
  getMisInscripciones: async (
    periodo?: string,
    estadoPago?: EstadoPagoFilter,
  ): Promise<MisInscripcionesResponse> => {
    return apiClient.get<MisInscripcionesResponse>('/tutor/mis-inscripciones', {
      params: { periodo, estadoPago },
    });
  },
};

export default tutoresApi;
