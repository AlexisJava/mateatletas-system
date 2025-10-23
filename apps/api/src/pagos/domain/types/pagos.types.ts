/**
 * Tipos TypeScript estrictos para el sistema de pagos
 * Sin any, sin unknown, máxima type-safety
 */

import { Decimal } from '@prisma/client/runtime/library';

// ============================================================================
// ENUMS - Sincronizados con Prisma Schema
// ============================================================================

/**
 * Tipos de descuento aplicables
 * Debe coincidir exactamente con enum TipoDescuento en schema.prisma
 */
export enum TipoDescuento {
  NINGUNO = 'NINGUNO',
  MULTIPLE_ACTIVIDADES = 'MULTIPLE_ACTIVIDADES',
  HERMANOS_BASICO = 'HERMANOS_BASICO',
  HERMANOS_MULTIPLE = 'HERMANOS_MULTIPLE',
  AACREA = 'AACREA',
  BECA = 'BECA',
}

/**
 * Estados del pago
 * Debe coincidir exactamente con enum EstadoPago en schema.prisma
 */
export enum EstadoPago {
  Pendiente = 'Pendiente',
  Pagado = 'Pagado',
  Vencido = 'Vencido',
  Parcial = 'Parcial',
  Becado = 'Becado',
}

/**
 * Tipo de descuento en becas
 * Debe coincidir exactamente con enum DescuentoBecaTipo en schema.prisma
 */
export enum DescuentoBecaTipo {
  PORCENTAJE = 'PORCENTAJE',
  MONTO_FIJO = 'MONTO_FIJO',
}

/**
 * Tipos de producto según reglas de negocio
 */
export type TipoProducto = 'CLUB_MATEMATICAS' | 'CURSO_ESPECIALIZADO';

/**
 * Métodos de pago aceptados
 */
export type MetodoPago = 'Efectivo' | 'Transferencia' | 'MercadoPago' | 'Otro';

// ============================================================================
// INTERFACES - Configuración y Entrada de Datos
// ============================================================================

/**
 * Configuración global de precios
 * Valores que puede actualizar el administrador
 */
export interface ConfiguracionPrecios {
  readonly precioClubMatematicas: Decimal;
  readonly precioCursosEspecializados: Decimal;
  readonly precioMultipleActividades: Decimal;
  readonly precioHermanosBasico: Decimal;
  readonly precioHermanosMultiple: Decimal;
  readonly descuentoAacreaPorcentaje: Decimal;
  readonly descuentoAacreaActivo: boolean;
}

/**
 * Entrada para cálculo de precio de una actividad
 * Inmutable (readonly)
 */
export interface CalculoPrecioInput {
  readonly cantidadHermanos: number;
  readonly actividadesPorEstudiante: number;
  readonly tipoProducto: TipoProducto;
  readonly tieneAACREA: boolean;
  readonly configuracion: ConfiguracionPrecios;
}

/**
 * Resultado del cálculo de precio
 * Inmutable (readonly)
 */
export interface CalculoPrecioOutput {
  readonly precioBase: Decimal;
  readonly precioFinal: Decimal;
  readonly descuentoAplicado: Decimal;
  readonly tipoDescuento: TipoDescuento;
  readonly detalleCalculo: string;
}

/**
 * Resultado del cálculo de total mensual
 * Suma de múltiples inscripciones
 */
export interface TotalMensualOutput {
  readonly total: Decimal;
  readonly subtotal: Decimal;
  readonly descuentoTotal: Decimal;
}

// ============================================================================
// INTERFACES - DTOs (Data Transfer Objects)
// ============================================================================

/**
 * DTO para crear/actualizar configuración de precios
 */
export interface ActualizarConfiguracionPreciosDto {
  readonly precioClubMatematicas?: number;
  readonly precioCursosEspecializados?: number;
  readonly precioMultipleActividades?: number;
  readonly precioHermanosBasico?: number;
  readonly precioHermanosMultiple?: number;
  readonly descuentoAacreaPorcentaje?: number;
  readonly descuentoAacreaActivo?: boolean;
  readonly motivoCambio: string;
}

/**
 * DTO para registrar un pago
 */
export interface RegistrarPagoDto {
  readonly inscripcionMensualId: string;
  readonly metodoPago: MetodoPago;
  readonly fechaPago: Date;
  readonly comprobanteUrl?: string;
  readonly observaciones?: string;
}

/**
 * DTO para calcular precio
 */
export interface CalcularPrecioDto {
  readonly tutorId: string;
  readonly inscripciones: ReadonlyArray<{
    readonly estudianteId: string;
    readonly tipoProducto: TipoProducto;
  }>;
}

/**
 * DTO para crear inscripción mensual
 */
export interface CrearInscripcionMensualDto {
  readonly estudianteId: string;
  readonly productoId: string;
  readonly tutorId: string;
  readonly periodo: string; // "2025-01"
}

/**
 * DTO para crear una beca
 */
export interface CrearBecaDto {
  readonly estudianteId: string;
  readonly tipoBeca: string;
  readonly descuentoTipo: DescuentoBecaTipo;
  readonly descuentoValor: number;
  readonly productosAplica: ReadonlyArray<string>;
  readonly fechaInicio: Date;
  readonly fechaFin: Date;
  readonly motivoBeca?: string;
  readonly observaciones?: string;
}

// ============================================================================
// INTERFACES - Responses (API)
// ============================================================================

/**
 * Response del cálculo de precio
 */
export interface CalculoPrecioResponse {
  readonly totalMensual: number;
  readonly subtotal: number;
  readonly descuentoTotal: number;
  readonly detallePorInscripcion: ReadonlyArray<{
    readonly estudianteId: string;
    readonly productoId: string;
    readonly precioBase: number;
    readonly precioFinal: number;
    readonly descuentoAplicado: number;
    readonly tipoDescuento: TipoDescuento;
    readonly detalleCalculo: string;
  }>;
}

/**
 * Response de dashboard de pagos
 */
export interface DashboardPagosResponse {
  readonly metricas: {
    readonly ingresosMes: number;
    readonly pagosPendientes: number;
    readonly tasaCobro: number;
    readonly morosidad: number;
    readonly ingresosAnio: number;
    readonly estudiantesActivos: number;
    readonly estudiantesBecados: number;
    readonly ingresoEstimadoProximoMes: number;
  };
  readonly graficos: {
    readonly ingresosPorMes: ReadonlyArray<{
      readonly mes: string;
      readonly real: number;
      readonly estimado: number;
    }>;
    readonly ingresosPorProducto: ReadonlyArray<{
      readonly producto: string;
      readonly monto: number;
    }>;
    readonly distribucionEstados: ReadonlyArray<{
      readonly estado: EstadoPago;
      readonly cantidad: number;
      readonly monto: number;
    }>;
  };
}

/**
 * Response de inscripción mensual
 */
export interface InscripcionMensualResponse {
  readonly id: string;
  readonly estudiante: {
    readonly id: string;
    readonly nombre: string;
    readonly apellido: string;
  };
  readonly producto: {
    readonly id: string;
    readonly nombre: string;
    readonly tipo: string;
  };
  readonly tutor: {
    readonly id: string;
    readonly nombre: string;
    readonly apellido: string;
  };
  readonly periodo: string;
  readonly precioBase: number;
  readonly descuentoAplicado: number;
  readonly precioFinal: number;
  readonly tipoDescuento: TipoDescuento;
  readonly detalleCalculo: string;
  readonly estadoPago: EstadoPago;
  readonly fechaPago: string | null;
  readonly metodoPago: string | null;
  readonly comprobanteUrl: string | null;
}

// ============================================================================
// TYPE GUARDS - Validación de tipos en runtime
// ============================================================================

/**
 * Type guard para TipoProducto
 */
export function isTipoProducto(value: string): value is TipoProducto {
  return value === 'CLUB_MATEMATICAS' || value === 'CURSO_ESPECIALIZADO';
}

/**
 * Type guard para MetodoPago
 */
export function isMetodoPago(value: string): value is MetodoPago {
  return ['Efectivo', 'Transferencia', 'MercadoPago', 'Otro'].includes(value);
}

/**
 * Type guard para TipoDescuento
 */
export function isTipoDescuento(value: string): value is TipoDescuento {
  return Object.values(TipoDescuento).includes(value as TipoDescuento);
}

/**
 * Type guard para EstadoPago
 */
export function isEstadoPago(value: string): value is EstadoPago {
  return Object.values(EstadoPago).includes(value as EstadoPago);
}

// ============================================================================
// UTILITY TYPES - Helpers de tipo
// ============================================================================

/**
 * Hace todos los campos de un tipo mutable
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Extrae el tipo de una Promise
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Tipo para campos requeridos
 */
export type Required<T> = {
  [P in keyof T]-?: T[P];
};

/**
 * Tipo para campos opcionales
 */
export type Optional<T> = {
  [P in keyof T]?: T[P];
};
