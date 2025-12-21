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
  dia_semana: string;
}

/**
 * Estudiante en suscripción
 */
export interface EstudianteSuscripcionDto {
  id: string;
  nombre: string;
  apellido: string;
  casa: string | null;
  clase_grupo?: ClaseGrupoResponseDto;
}

/**
 * Alerta de suscripción (gracia, próximo cobro, etc.)
 */
export interface AlertaSuscripcionDto {
  tipo: 'EN_GRACIA' | 'PROXIMO_COBRO' | 'MOROSA';
  mensaje: string;
  dias_restantes: number;
}

/**
 * Suscripción en listado
 */
export interface SuscripcionListItemDto {
  id: string;
  estado: EstadoSuscripcion;
  plan: PlanResponseDto;
  monto_final: number;
  descuento_aplicado: number;
  fecha_inicio: Date | null;
  proximo_cobro: Date | null;
  dias_restantes: number | null;
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
  metodo_pago: string;
}

/**
 * Detalle completo de suscripción (incluye pagos)
 */
export interface SuscripcionDetalleDto extends SuscripcionListItemDto {
  pagos: PagoSuscripcionDto[];
  historial_estados: HistorialEstadoDto[];
}

/**
 * Historial de cambio de estado
 */
export interface HistorialEstadoDto {
  fecha: Date;
  estado_anterior: EstadoSuscripcion | null;
  estado_nuevo: EstadoSuscripcion;
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
  suscripcion_id: string;
  /** URL de checkout de MercadoPago (null si se cobró con Bricks) */
  init_point: string | null;
  monto_final: number;
  descuento_aplicado: number;
  /** Indica si se cobró inmediatamente con Bricks */
  cobrado_inmediatamente: boolean;
}

/**
 * Respuesta de cancelación
 */
export interface CancelarSuscripcionResponseDto {
  mensaje: string;
  fecha_fin_acceso: Date;
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
