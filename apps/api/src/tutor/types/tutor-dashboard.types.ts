/**
 * Tipos de respuesta para endpoints del dashboard del tutor
 * Estos tipos definen la estructura de datos que se devuelve al frontend
 */

/**
 * Tipo de alerta para el dashboard
 */
export type TipoAlerta = 'pago_vencido' | 'pago_por_vencer' | 'clase_hoy' | 'asistencia_baja';

/**
 * Prioridad de alerta (para ordenamiento)
 */
export type PrioridadAlerta = 'alta' | 'media' | 'baja';

/**
 * Alerta individual del dashboard
 */
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
    fechaVencimiento?: Date;
    claseId?: string;
    claseHora?: string;
    porcentajeAsistencia?: number;
  };
}

/**
 * Métricas del dashboard
 */
export interface MetricasDashboard {
  totalHijos: number;
  clasesDelMes: number;
  totalPagadoAnio: number;
  asistenciaPromedio: number;
}

/**
 * Info de pago pendiente
 */
export interface PagoPendiente {
  id: string;
  monto: number;
  concepto: string;
  fechaVencimiento: Date;
  diasParaVencer: number; // Negativo si ya venció
  estudianteId: string;
  estudianteNombre: string;
  estaVencido: boolean;
}

/**
 * Clase de hoy simplificada
 */
export interface ClaseHoy {
  id: string;
  hora: string; // HH:MM formato
  nombreRuta: string;
  colorRuta?: string;
  estudianteId: string;
  estudianteNombre: string;
  docenteNombre: string;
  fechaHoraInicio: Date;
  urlReunion?: string;
  puedeUnirse: boolean; // true si falta menos de 10 minutos
}

/**
 * Response completo del dashboard
 */
export interface DashboardResumenResponse {
  metricas: MetricasDashboard;
  alertas: AlertaDashboard[];
  pagosPendientes: PagoPendiente[];
  clasesHoy: ClaseHoy[];
}

/**
 * Clase próxima (para endpoint /proximas-clases)
 */
export interface ClaseProxima {
  id: string;
  fechaHoraInicio: Date;
  fechaHoraFin: Date;
  duracionMinutos: number;
  rutaCurricular: {
    id: string;
    nombre: string;
    color?: string;
  };
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
  estado: 'Programada' | 'Cancelada';
  urlReunion?: string;
  puedeUnirse: boolean;
  esHoy: boolean;
  esManana: boolean;
  labelFecha: string; // "HOY", "MAÑANA", "LUN 15/02"
}

/**
 * Response de próximas clases
 */
export interface ProximasClasesResponse {
  clases: ClaseProxima[];
  total: number;
}

/**
 * Response de alertas
 */
export interface AlertasResponse {
  alertas: AlertaDashboard[];
  total: number;
  hayAlertas: boolean;
}
