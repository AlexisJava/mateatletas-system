import { EstadoSuscripcion } from '@prisma/client';

/**
 * DTOs de respuesta para endpoints de suscripciones
 */

/**
 * Plan básico para respuestas
 */
export interface PlanResponseDto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  features?: string[];
}

/**
 * Clase grupo asociada a un estudiante
 */
export interface ClaseGrupoResponseDto {
  id: string;
  nombre: string;
  horario: string;
  diaSemana: string;
}

/**
 * Estudiante en suscripción
 */
export interface EstudianteSuscripcionDto {
  id: string;
  nombre: string;
  apellido: string;
  casa: string | null;
  claseGrupo?: ClaseGrupoResponseDto;
}

/**
 * Alerta de suscripción (gracia, próximo cobro, etc.)
 */
export interface AlertaSuscripcionDto {
  tipo: 'EN_GRACIA' | 'PROXIMO_COBRO' | 'MOROSA';
  mensaje: string;
  diasRestantes: number;
}

/**
 * Suscripción en listado
 */
export interface SuscripcionListItemDto {
  id: string;
  estado: EstadoSuscripcion;
  plan: PlanResponseDto;
  montoFinal: number;
  descuentoAplicado: number;
  fechaInicio: Date | null;
  proximoCobro: Date | null;
  diasRestantes: number | null;
  estudiantes: EstudianteSuscripcionDto[];
  alerta?: AlertaSuscripcionDto;
}

/**
 * Respuesta de listado de suscripciones del tutor
 */
export interface MisSuscripcionesResponseDto {
  suscripciones: SuscripcionListItemDto[];
}

/**
 * Pago individual
 */
export interface PagoSuscripcionDto {
  id: string;
  fecha: Date;
  monto: number;
  estado: string;
  metodoPago: string;
}

/**
 * Detalle completo de suscripción (incluye pagos)
 */
export interface SuscripcionDetalleDto extends SuscripcionListItemDto {
  pagos: PagoSuscripcionDto[];
  historialEstados: HistorialEstadoDto[];
}

/**
 * Historial de cambio de estado
 */
export interface HistorialEstadoDto {
  fecha: Date;
  estadoAnterior: EstadoSuscripcion | null;
  estadoNuevo: EstadoSuscripcion;
  motivo: string | null;
}

/**
 * Respuesta de creación de suscripción
 *
 * Soporta dos flujos:
 * 1. Redirect: init_point contiene URL de checkout
 * 2. Bricks: cobrado_inmediatamente=true, init_point es null
 */
export interface CrearSuscripcionResponseDto {
  suscripcionId: string;
  /** URL de checkout de MercadoPago (null si se cobró con Bricks) */
  init_point: string | null;
  montoFinal: number;
  descuentoAplicado: number;
  /** Indica si se cobró inmediatamente con Bricks */
  cobradoInmediatamente: boolean;
}

/**
 * Respuesta de cancelación
 */
export interface CancelarSuscripcionResponseDto {
  mensaje: string;
  fechaFinAcceso: Date;
}

/**
 * Respuesta de listado de planes
 */
export interface PlanesResponseDto {
  planes: PlanResponseDto[];
}

/**
 * Respuesta de historial de pagos
 */
export interface HistorialPagosResponseDto {
  pagos: PagoSuscripcionDto[];
  total: number;
}
