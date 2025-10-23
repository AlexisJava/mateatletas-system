import { Decimal } from 'decimal.js';

/**
 * DTOs para Obtener Configuración de Precios
 * Application Layer
 */

/**
 * Output DTO - Configuración de Precios Actual
 */
export interface ObtenerConfiguracionPreciosOutputDTO {
  readonly precioClubMatematicas: Decimal;
  readonly precioCursosEspecializados: Decimal;
  readonly precioMultipleActividades: Decimal;
  readonly precioHermanosBasico: Decimal;
  readonly precioHermanosMultiple: Decimal;
  readonly descuentoAacreaPorcentaje: Decimal;
  readonly descuentoAacreaActivo: boolean;
  readonly ultimaActualizacion: Date;
}

/**
 * Output DTO - Historial de Cambios de Precios
 */
export interface HistorialCambioPreciosDTO {
  readonly id: string;
  readonly valoresAnteriores: Record<string, string>; // JSON con valores previos
  readonly valoresNuevos: Record<string, string>; // JSON con valores nuevos
  readonly adminId: string;
  readonly adminNombre: string;
  readonly motivoCambio: string | null;
  readonly fechaCambio: Date;
}

/**
 * Output DTO - Lista de Historial
 */
export interface ObtenerHistorialPreciosOutputDTO {
  readonly historial: HistorialCambioPreciosDTO[];
  readonly total: number;
}
