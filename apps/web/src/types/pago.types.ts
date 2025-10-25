/**
 * Types para el módulo de Pagos
 */

import { Producto } from './catalogo.types';

/**
 * Estados de membresía
 */
export enum EstadoMembresia {
  Pendiente = 'Pendiente',
  Activa = 'Activa',
  Atrasada = 'Atrasada',
  Cancelada = 'Cancelada',
}

/**
 * Estados de inscripción a curso
 */
export enum EstadoInscripcion {
  PreInscrito = 'PreInscrito',
  Activo = 'Activo',
  Finalizado = 'Finalizado',
}

/**
 * Membresía activa del tutor
 */
export interface Membresia {
  id: string;
  tutor_id: string;
  producto_id: string;
  estado: EstadoMembresia;
  fecha_inicio: string | null;
  fecha_proximo_pago: string | null;
  preferencia_id: string | null;
  createdAt: string;
  updatedAt: string;
  producto?: Producto;
}

/**
 * Inscripción a curso
 */
export interface InscripcionCurso {
  id: string;
  estudiante_id: string;
  producto_id: string;
  estado: EstadoInscripcion;
  fecha_inscripcion: string | null;
  preferencia_id: string | null;
  createdAt: string;
  updatedAt: string;
  producto?: Producto;
}

/**
 * Pago registrado
 */
export interface Pago {
  id: string;
  tutor_id: string;
  monto: number;
  metodo_pago: string;
  estado_pago: string;
  mercado_pago_id: string | null;
  mercado_pago_status: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Preferencia de pago de MercadoPago
 */
export interface PreferenciaPago {
  id: string;
  init_point: string; // URL de MercadoPago para pagar
  sandbox_init_point?: string;
}

/**
 * Request para crear preferencia de suscripción
 */
export interface CrearPreferenciaSuscripcionRequest {
  producto_id: string;
}

/**
 * Request para crear preferencia de curso
 */
export interface CrearPreferenciaCursoRequest {
  producto_id: string;
  estudiante_id: string;
}

/**
 * Response de estado de membresía
 */
export interface EstadoMembresiaResponse {
  tiene_membresia: boolean;
  membresia: Membresia | null;
}

/**
 * =====================================================
 * TIPOS PARA DASHBOARD DE MÉTRICAS
 * =====================================================
 */

/**
 * Métricas generales del dashboard
 */
export interface MetricasGenerales {
  ingresosMesActual: string; // Decimal en formato string
  pagosPendientes: string; // Decimal en formato string
  inscripcionesActivas: number;
  tasaCobroActual: string; // Decimal en formato string (porcentaje 0-100)
  comparacionMesAnterior: {
    ingresosCambio: string; // Decimal en formato string (porcentaje)
    pendientesCambio: string; // Decimal en formato string (porcentaje)
    inscripcionesCambio: number; // Cambio en cantidad
    tasaCobroCambio: string; // Decimal en formato string (diferencia de porcentaje)
  };
}

/**
 * Evolución mensual para gráficos
 */
export interface EvolucionMensual {
  periodo: string; // "YYYY-MM"
  ingresos: string; // Decimal en formato string
  pendientes: string; // Decimal en formato string
  totalEsperado: string; // Decimal en formato string
}

/**
 * Distribución por estado de pago para gráfico doughnut
 */
export interface DistribucionEstadoPago {
  estado: string; // "Pagado", "Pendiente", "Vencido"
  cantidad: number;
  monto: string; // Decimal en formato string
  porcentaje: string; // Decimal en formato string (0-100)
}

/**
 * Response completa de métricas del dashboard
 */
export interface MetricasDashboardResponse {
  periodo: string; // "YYYY-MM"
  metricas: MetricasGenerales;
  evolucionMensual: EvolucionMensual[]; // Últimos 6 meses
  distribucionEstados: DistribucionEstadoPago[];
}

/**
 * Configuración de precios
 */
export interface ConfiguracionPrecios {
  precioClubMatematicas: string;
  precioCursosEspecializados: string;
  precioMultipleActividades: string;
  precioHermanosBasico: string;
  precioHermanosMultiple: string;
  descuentoAacreaPorcentaje: string;
  descuentoAacreaActivo: boolean;
}

/**
 * Historial de cambio de precios
 */
export interface HistorialCambioPrecios {
  id: string;
  valoresAnteriores: Record<string, string>;
  valoresNuevos: Record<string, string>;
  adminId: string;
  motivoCambio: string | null;
  fechaCambio: string;
}

/**
 * Inscripción mensual con relaciones
 */
export interface InscripcionMensualConRelaciones {
  id: string;
  estudianteId: string;
  productoId: string;
  tutorId: string;
  periodo: string;
  precioBase: string;
  descuentoAplicado: string;
  precioFinal: string;
  tipoDescuento: string;
  estadoPago: string;
  fechaPago: string | null;
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

/**
 * Estudiante con descuentos
 */
export interface EstudianteConDescuento {
  estudianteId: string;
  estudianteNombre: string;
  tutorId: string;
  tipoDescuento: string;
  totalDescuento: string;
  cantidadInscripciones: number;
  precioOriginal: string;
  precioFinal: string;
}

/**
 * Request para actualizar configuración de precios
 */
export interface ActualizarConfiguracionRequest {
  adminId: string;
  precioClubMatematicas?: number;
  precioCursosEspecializados?: number;
  precioMultipleActividades?: number;
  precioHermanosBasico?: number;
  precioHermanosMultiple?: number;
  descuentoAacreaPorcentaje?: number;
  descuentoAacreaActivo?: boolean;
  diaVencimiento?: number;
  diasAntesRecordatorio?: number;
  notificacionesActivas?: boolean;
  motivoCambio?: string;
}
