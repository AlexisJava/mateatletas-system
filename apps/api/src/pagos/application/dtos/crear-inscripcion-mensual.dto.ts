import { Decimal } from 'decimal.js';
import { TipoDescuento, EstadoPago } from '../../domain/types/pagos.types';

/**
 * DTO de entrada para crear inscripciones mensuales
 * Input del use case CrearInscripcionMensualUseCase
 */
export interface CrearInscripcionMensualInputDTO {
  /**
   * ID del tutor que realiza la inscripción
   * Se usa para validar permisos
   */
  readonly tutorId: string;

  /**
   * IDs de los estudiantes a inscribir
   */
  readonly estudiantesIds: readonly string[];

  /**
   * IDs de productos por estudiante
   * Mismo formato que en CalcularPrecioInputDTO
   */
  readonly productosIdsPorEstudiante: Record<string, readonly string[]>;

  /**
   * Período de facturación
   */
  readonly anio: number;
  readonly mes: number; // 1-12

  /**
   * Indica si el grupo tiene AACREA
   */
  readonly tieneAACREA: boolean;
}

/**
 * DTO de salida con las inscripciones creadas
 * Output del use case CrearInscripcionMensualUseCase
 */
export interface CrearInscripcionMensualOutputDTO {
  /**
   * Inscripciones creadas exitosamente
   */
  readonly inscripciones: readonly InscripcionCreadaDTO[];

  /**
   * Resumen del período
   */
  readonly resumen: ResumenInscripcionDTO;

  /**
   * Mensaje de éxito
   */
  readonly mensaje: string;
}

/**
 * Representa una inscripción mensual creada
 */
export interface InscripcionCreadaDTO {
  readonly id: string;
  readonly estudianteId: string;
  readonly estudianteNombre: string;
  readonly productoId: string;
  readonly productoNombre: string;
  readonly periodo: string; // "2025-01"
  readonly precioBase: Decimal;
  readonly descuentoAplicado: Decimal;
  readonly precioFinal: Decimal;
  readonly tipoDescuento: TipoDescuento;
  readonly detalleCalculo: string;
  readonly estadoPago: EstadoPago;
}

/**
 * Resumen de las inscripciones creadas
 */
export interface ResumenInscripcionDTO {
  readonly periodo: string; // "2025-01"
  readonly cantidadInscripciones: number;
  readonly totalGeneral: Decimal;
  readonly estadoPago: EstadoPago; // Todos inician como Pendiente
}
