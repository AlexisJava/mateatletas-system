import { Decimal } from 'decimal.js';

/**
 * DTO de entrada para actualizar la configuración de precios
 * Input del use case ActualizarConfiguracionPreciosUseCase
 */
export interface ActualizarConfiguracionPreciosInputDTO {
  /**
   * ID del administrador que realiza el cambio
   * Requerido para auditoría
   */
  readonly adminId: string;

  /**
   * Nuevos valores de precios (todos opcionales)
   * Solo se actualizan los campos enviados
   */
  readonly precioClubMatematicas?: Decimal;
  readonly precioCursosEspecializados?: Decimal;
  readonly precioMultipleActividades?: Decimal;
  readonly precioHermanosBasico?: Decimal;
  readonly precioHermanosMultiple?: Decimal;

  /**
   * Configuración de descuento AACREA
   */
  readonly descuentoAacreaPorcentaje?: Decimal;
  readonly descuentoAacreaActivo?: boolean;

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
 */
export interface ConfiguracionPreciosDTO {
  readonly precioClubMatematicas: Decimal;
  readonly precioCursosEspecializados: Decimal;
  readonly precioMultipleActividades: Decimal;
  readonly precioHermanosBasico: Decimal;
  readonly precioHermanosMultiple: Decimal;
  readonly descuentoAacreaPorcentaje: Decimal;
  readonly descuentoAacreaActivo: boolean;
  readonly diaVencimiento: number;
  readonly diasAntesRecordatorio: number;
  readonly notificacionesActivas: boolean;
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
