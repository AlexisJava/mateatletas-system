import { Decimal } from 'decimal.js';
import { TipoProducto, TipoDescuento } from '../../domain/types/pagos.types';

/**
 * DTO de entrada para calcular el precio de actividades
 * Input del use case CalcularPrecioUseCase
 */
export interface CalcularPrecioInputDTO {
  /**
   * ID del tutor que solicita el cálculo
   * Se usa para validar permisos y obtener estudiantes
   */
  readonly tutorId: string;

  /**
   * IDs de los estudiantes para los que se calculará el precio
   * Pueden ser hermanos o un solo estudiante
   */
  readonly estudiantesIds: readonly string[];

  /**
   * IDs de los productos/actividades por estudiante
   * Cada estudiante puede tener uno o más productos
   *
   * Estructura:
   * {
   *   "estudiante-id-1": ["producto-id-1", "producto-id-2"],
   *   "estudiante-id-2": ["producto-id-1"]
   * }
   */
  readonly productosIdsPorEstudiante: Record<string, readonly string[]>;

  /**
   * Indica si el grupo familiar tiene certificado AACREA
   * Solo aplica si: 1 estudiante, 1 actividad
   */
  readonly tieneAACREA: boolean;
}

/**
 * DTO de salida con el resultado del cálculo
 * Output del use case CalcularPrecioUseCase
 */
export interface CalcularPrecioOutputDTO {
  /**
   * Cálculos individuales por estudiante y producto
   */
  readonly calculos: readonly CalculoIndividualDTO[];

  /**
   * Resumen del total mensual
   */
  readonly resumen: ResumenCalculoDTO;
}

/**
 * Detalle de un cálculo individual (estudiante + producto)
 */
export interface CalculoIndividualDTO {
  readonly estudianteId: string;
  readonly estudianteNombre: string;
  readonly productoId: string;
  readonly productoNombre: string;
  readonly tipoProducto: TipoProducto;
  readonly precioBase: Decimal;
  readonly descuentoAplicado: Decimal;
  readonly precioFinal: Decimal;
  readonly tipoDescuento: TipoDescuento;
  readonly detalleCalculo: string;
}

/**
 * Resumen del cálculo total
 */
export interface ResumenCalculoDTO {
  readonly cantidadEstudiantes: number;
  readonly cantidadHermanos: number;
  readonly totalActividades: number;
  readonly subtotal: Decimal; // Suma de precios base
  readonly totalDescuentos: Decimal; // Suma de descuentos
  readonly totalFinal: Decimal; // Total a pagar
  readonly tieneDescuentoHermanos: boolean;
  readonly tieneDescuentoMultipleActividades: boolean;
  readonly tieneDescuentoAACREA: boolean;
}
