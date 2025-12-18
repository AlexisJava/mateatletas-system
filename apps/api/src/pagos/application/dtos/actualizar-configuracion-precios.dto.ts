import { Decimal } from 'decimal.js';

/**
 * DTO de entrada para actualizar la configuración de precios
 * Input del use case ActualizarConfiguracionPreciosUseCase
 *
 * Sistema STEAM 2026:
 * - STEAM_LIBROS: $40.000/mes - Plataforma completa (Mate + Progra + Ciencias)
 * - STEAM_ASINCRONICO: $65.000/mes - Todo + clases grabadas
 * - STEAM_SINCRONICO: $95.000/mes - Todo + clases en vivo con docente
 *
 * Descuento familiar simplificado:
 * - 10% para segundo hermano en adelante
 */
export interface ActualizarConfiguracionPreciosInputDTO {
  /**
   * ID del administrador que realiza el cambio
   * Requerido para auditoría
   */
  readonly adminId: string;

  /**
   * Precios por Tier STEAM (todos opcionales)
   * Solo se actualizan los campos enviados
   */
  readonly precioSteamLibros?: Decimal;
  readonly precioSteamAsincronico?: Decimal;
  readonly precioSteamSincronico?: Decimal;

  /**
   * Descuento familiar simplificado
   * 10% para segundo hermano en adelante
   */
  readonly descuentoSegundoHermano?: Decimal;

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
 * Sistema STEAM 2026
 */
export interface ConfiguracionPreciosDTO {
  // Precios por Tier STEAM
  readonly precioSteamLibros: Decimal;
  readonly precioSteamAsincronico: Decimal;
  readonly precioSteamSincronico: Decimal;
  // Descuento familiar simplificado
  readonly descuentoSegundoHermano: Decimal;
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
