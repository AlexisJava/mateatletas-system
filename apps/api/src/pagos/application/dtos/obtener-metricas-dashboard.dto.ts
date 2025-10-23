import { Decimal } from 'decimal.js';

/**
 * DTOs para Obtener Métricas del Dashboard
 * Application Layer
 */

/**
 * Input DTO
 * No requiere parámetros de entrada (usa mes actual por defecto)
 */
export interface ObtenerMetricasDashboardInputDTO {
  readonly anio?: number; // Opcional, por defecto año actual
  readonly mes?: number; // Opcional, por defecto mes actual
  readonly tutorId?: string; // Opcional, si se quiere filtrar por tutor
}

/**
 * Output DTO - Métricas Generales
 */
export interface MetricasGeneralesDTO {
  readonly ingresosMesActual: Decimal;
  readonly pagosPendientes: Decimal;
  readonly inscripcionesActivas: number;
  readonly tasaCobroActual: Decimal; // Porcentaje (0-100)
  readonly comparacionMesAnterior: {
    readonly ingresosCambio: Decimal; // Porcentaje de cambio
    readonly pendientesCambio: Decimal;
    readonly inscripcionesCambio: number;
    readonly tasaCobroCambio: Decimal;
  };
}

/**
 * Output DTO - Evolución Mensual (para gráfico)
 */
export interface EvolucionMensualDTO {
  readonly periodo: string; // "YYYY-MM"
  readonly ingresos: Decimal;
  readonly pendientes: Decimal;
  readonly totalEsperado: Decimal;
}

/**
 * Output DTO - Distribución por Estado (para gráfico doughnut)
 */
export interface DistribucionEstadoPagoDTO {
  readonly estado: string; // "Pagado", "Pendiente", "Vencido"
  readonly cantidad: number;
  readonly monto: Decimal;
  readonly porcentaje: Decimal; // 0-100
}

/**
 * Output DTO - Completo
 */
export interface ObtenerMetricasDashboardOutputDTO {
  readonly periodo: string; // "YYYY-MM"
  readonly metricas: MetricasGeneralesDTO;
  readonly evolucionMensual: EvolucionMensualDTO[]; // Últimos 6 meses
  readonly distribucionEstados: DistribucionEstadoPagoDTO[];
}
