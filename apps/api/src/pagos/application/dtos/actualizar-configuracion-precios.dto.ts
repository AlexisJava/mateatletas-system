import { Decimal } from 'decimal.js';

/**
 * DTO de entrada para actualizar la configuración de precios
 * Input del use case ActualizarConfiguracionPreciosUseCase
 * Sistema de Tiers 2026
 */
export interface ActualizarConfiguracionPreciosInputDTO {
  /**
   * ID del administrador que realiza el cambio
   * Requerido para auditoría
   */
  readonly adminId: string;

  /**
   * Precios por Tier (todos opcionales)
   * Solo se actualizan los campos enviados
   */
  readonly precioArcade?: Decimal;
  readonly precioArcadePlus?: Decimal;
  readonly precioPro?: Decimal;

  /**
   * Descuentos familiares
   */
  readonly descuentoHermano2?: Decimal;
  readonly descuentoHermano3Mas?: Decimal;

  /**
   * Configuración de notificaciones
   */
  readonly diaVencimiento?: number;
  readonly diasAntesRecordatorio?: number;
  readonly notificacionesActivas?: boolean;

  /**
   * Motivo del cambio (opcional pero recomendado)
   * Se guarda en el historial de auditoría
   */
  readonly motivoCambio?: string;
}

/**
 * DTO de salida con la configuración actualizada
 * Output del use case ActualizarConfiguracionPreciosUseCase
 */
export interface ActualizarConfiguracionPreciosOutputDTO {
  /**
   * Configuración actualizada
   */
  readonly configuracion: ConfiguracionPreciosDTO;

  /**
   * Valores que cambiaron (para confirmación al admin)
   */
  readonly cambiosRealizados: CambioRealizadoDTO[];

  /**
   * Mensaje de éxito
   */
  readonly mensaje: string;
}

/**
 * Representa la configuración de precios completa
 * Sistema de Tiers 2026
 */
export interface ConfiguracionPreciosDTO {
  // Precios por Tier
  readonly precioArcade: Decimal;
  readonly precioArcadePlus: Decimal;
  readonly precioPro: Decimal;
  // Descuentos familiares
  readonly descuentoHermano2: Decimal;
  readonly descuentoHermano3Mas: Decimal;
  // Configuración de notificaciones
  readonly diaVencimiento: number;
  readonly diasAntesRecordatorio: number;
  readonly notificacionesActivas: boolean;
  // Metadata
  readonly actualizadoEn: Date;
}

/**
 * Representa un cambio individual realizado
 */
export interface CambioRealizadoDTO {
  readonly campo: string;
  readonly valorAnterior: Decimal | boolean | number;
  readonly valorNuevo: Decimal | boolean | number;
}
