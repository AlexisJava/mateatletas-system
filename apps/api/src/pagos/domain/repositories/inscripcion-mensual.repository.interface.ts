import { Decimal } from 'decimal.js';
import { TipoDescuento, EstadoPago } from '../types/pagos.types';

/**
 * Interface del repositorio de Inscripciones Mensuales
 * Define el contrato para operaciones de persistencia
 *
 * Ubicación en Clean Architecture:
 * - Domain Layer define la interface
 * - Infrastructure Layer implementa la interface
 * - Application Layer (Use Cases) depende de la interface
 */
export interface IInscripcionMensualRepository {
  /**
   * Crea una nueva inscripción mensual
   * @returns InscripcionMensual creada
   */
  crear(datos: CrearInscripcionMensualDTO): Promise<InscripcionMensual>;

  /**
   * Busca inscripciones por estudiante y período
   * @param estudianteId - ID del estudiante
   * @param periodo - Período en formato "YYYY-MM" (ej: "2025-01")
   * @returns Array de inscripciones
   */
  buscarPorEstudianteYPeriodo(
    estudianteId: string,
    periodo: string,
  ): Promise<InscripcionMensual[]>;

  /**
   * Busca inscripciones por tutor y período
   * Útil para ver todas las cuotas de un tutor en un mes
   */
  buscarPorTutorYPeriodo(
    tutorId: string,
    periodo: string,
  ): Promise<InscripcionMensual[]>;

  /**
   * Obtiene inscripciones por estado de pago
   * Útil para reportes de pagos pendientes/vencidos
   */
  buscarPorEstadoPago(
    estado: EstadoPago,
    periodo?: string,
  ): Promise<InscripcionMensual[]>;

  /**
   * Actualiza el estado de pago de una inscripción
   */
  actualizarEstadoPago(
    inscripcionId: string,
    datos: ActualizarPagoDTO,
  ): Promise<InscripcionMensual>;

  /**
   * Obtiene el total mensual de un tutor
   * Suma de todas las inscripciones (precio_final) de un período
   */
  calcularTotalMensualTutor(
    tutorId: string,
    periodo: string,
  ): Promise<TotalMensual>;

  /**
   * Verifica si existe una inscripción para un estudiante/producto/período
   * Para evitar duplicados
   */
  existe(
    estudianteId: string,
    productoId: string,
    periodo: string,
  ): Promise<boolean>;

  /**
   * Obtiene métricas agregadas para el dashboard
   * Por período y opcionalmente por tutor
   */
  obtenerMetricasPorPeriodo(
    periodo: string,
    tutorId?: string,
  ): Promise<MetricasPeriodo>;

  /**
   * Obtiene todas las inscripciones de un período
   * Incluye información del estudiante y producto
   */
  obtenerInscripcionesPorPeriodo(
    periodo: string,
    tutorId?: string,
  ): Promise<InscripcionMensualConRelaciones[]>;

  /**
   * Obtiene inscripciones agrupadas por estudiante con descuentos
   */
  obtenerEstudiantesConDescuentos(
    periodo: string,
    tutorId?: string,
  ): Promise<EstudianteConDescuento[]>;
}

/**
 * DTO para crear una inscripción mensual
 */
export interface CrearInscripcionMensualDTO {
  readonly estudianteId: string;
  readonly productoId: string;
  readonly tutorId: string;
  readonly anio: number;
  readonly mes: number;
  readonly periodo: string;
  readonly precioBase: Decimal;
  readonly descuentoAplicado: Decimal;
  readonly precioFinal: Decimal;
  readonly tipoDescuento: TipoDescuento;
  readonly detalleCalculo: string;
}

/**
 * DTO para actualizar el estado de pago
 */
export interface ActualizarPagoDTO {
  readonly estadoPago: EstadoPago;
  readonly fechaPago?: Date;
  readonly metodoPago?: string;
  readonly comprobanteUrl?: string;
  readonly observaciones?: string;
}

/**
 * Representa una inscripción mensual
 * Para consultas desde use cases
 */
export interface InscripcionMensual {
  readonly id: string;
  readonly estudianteId: string;
  readonly productoId: string;
  readonly tutorId: string;
  readonly anio: number;
  readonly mes: number;
  readonly periodo: string;
  readonly precioBase: Decimal;
  readonly descuentoAplicado: Decimal;
  readonly precioFinal: Decimal;
  readonly tipoDescuento: TipoDescuento;
  readonly detalleCalculo: string;
  readonly estadoPago: EstadoPago;
  readonly fechaPago: Date | null;
  readonly metodoPago: string | null;
  readonly comprobanteUrl: string | null;
  readonly observaciones: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Resultado del cálculo de total mensual
 */
export interface TotalMensual {
  readonly tutorId: string;
  readonly periodo: string;
  readonly totalPendiente: Decimal;
  readonly totalPagado: Decimal;
  readonly totalGeneral: Decimal;
  readonly cantidadInscripciones: number;
}

/**
 * Métricas agregadas de un período
 */
export interface MetricasPeriodo {
  readonly periodo: string;
  readonly totalIngresos: Decimal; // Suma de inscripciones con estado Pagado
  readonly totalPendientes: Decimal; // Suma de inscripciones con estado Pendiente
  readonly totalVencidos: Decimal; // Suma de inscripciones con estado Vencido
  readonly cantidadInscripciones: number;
  readonly cantidadPagadas: number;
  readonly cantidadPendientes: number;
  readonly cantidadVencidas: number;
}

/**
 * Inscripción con relaciones cargadas
 */
export interface InscripcionMensualConRelaciones extends InscripcionMensual {
  readonly estudiante: {
    readonly id: string;
    readonly nombre: string;
    readonly apellido: string;
  };
  readonly producto: {
    readonly id: string;
    readonly nombre: string;
  };
}

/**
 * Estudiante con descuentos aplicados
 */
export interface EstudianteConDescuento {
  readonly estudianteId: string;
  readonly estudianteNombre: string;
  readonly tutorId: string;
  readonly tipoDescuento: TipoDescuento;
  readonly totalDescuento: Decimal;
  readonly cantidadInscripciones: number;
  readonly precioOriginal: Decimal;
  readonly precioFinal: Decimal;
}
