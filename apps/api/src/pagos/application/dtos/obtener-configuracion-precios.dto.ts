import { Decimal } from 'decimal.js';

/**
 * DTOs para Obtener Configuración de Precios
 * Application Layer
 */

/**
 * Output DTO - Configuración de Precios Actual
 * Sistema de Tiers 2026: Arcade ($30k), Arcade+ ($60k), Pro ($75k)
 */
export interface ObtenerConfiguracionPreciosOutputDTO {
  // Precios por Tier (Sistema 2026)
  readonly precioArcade: Decimal;
  readonly precioArcadePlus: Decimal;
  readonly precioPro: Decimal;
  // Descuentos familiares
  readonly descuentoHermano2: Decimal; // 12% segundo hermano
  readonly descuentoHermano3Mas: Decimal; // 20% tercer hermano en adelante
  // Configuración de notificaciones
  readonly diaVencimiento: number;
  readonly diasAntesRecordatorio: number;
  readonly notificacionesActivas: boolean;
  // Metadata
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
