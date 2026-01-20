/**
 * Tipos para el sistema de Suscripciones Familiares 2026
 *
 * Modelo de negocio:
 * - Una suscripción por familia (tutor)
 * - Múltiples inscripciones a actividades dentro de la suscripción
 * - Monto mensual = suma de todas las actividades con descuento 10% desde la 2da
 * - Un solo PreApproval en MercadoPago por familia
 */

import { TierNombre, EstadoSuscripcionFamiliar } from '@prisma/client';

// ============================================================================
// TIPOS DE INPUT
// ============================================================================

/**
 * Input para crear una suscripción familiar
 */
export interface CrearSuscripcionFamiliarInput {
  /** ID del tutor (se verifica que exista) */
  readonly tutorId: string;

  /** Tier inicial de la suscripción */
  readonly tier: TierNombre;

  /** Email del tutor para MercadoPago */
  readonly tutorEmail: string;

  /** Nombre completo del tutor para descripción */
  readonly tutorNombre: string;

  /**
   * Inscripciones iniciales de actividades
   * Puede estar vacío si solo se crea la suscripción
   */
  readonly inscripciones?: InscripcionActividadInput[];

  // === Campos opcionales para MercadoPago Bricks ===

  /**
   * Token de tarjeta generado por MercadoPago Bricks
   * Si presente, se cobra inmediatamente
   */
  readonly cardTokenId?: string;

  /**
   * Email del pagador para cobro con Bricks
   * REQUERIDO si cardTokenId está presente
   */
  readonly payerEmail?: string;
}

/**
 * Input para agregar una inscripción a una suscripción existente
 */
export interface InscripcionActividadInput {
  /** ID del estudiante */
  readonly estudianteId: string;

  /** ID del producto */
  readonly productoId: string;

  /** ID del grupo de clase (para Clubs) */
  readonly claseGrupoId?: string;

  /** ID de la comisión (para cursos temporales) */
  readonly comisionId?: string;

  /**
   * Tier específico de esta inscripción (MODELO 2026)
   * Si no se especifica, usa el tier de la suscripción como fallback
   */
  readonly tier?: TierNombre;
}

/**
 * Input para agregar inscripciones a una suscripción existente
 */
export interface AgregarInscripcionesInput {
  /** ID de la suscripción familiar */
  readonly suscripcionFamiliarId: string;

  /** ID del tutor (para validación de ownership) */
  readonly tutorId: string;

  /** Inscripciones a agregar */
  readonly inscripciones: InscripcionActividadInput[];
}

/**
 * Input para dar de baja inscripciones
 */
export interface BajaInscripcionesInput {
  /** ID de la suscripción familiar */
  readonly suscripcionFamiliarId: string;

  /** ID del tutor (para validación de ownership) */
  readonly tutorId: string;

  /** IDs de inscripciones a dar de baja */
  readonly inscripcionIds: string[];

  /** Motivo de la baja */
  readonly motivo: string;
}

/**
 * Input para cancelar suscripción familiar
 */
export interface CancelarSuscripcionFamiliarInput {
  /** ID de la suscripción familiar */
  readonly suscripcionFamiliarId: string;

  /** ID del tutor (para validación de ownership) */
  readonly tutorId: string;

  /** Motivo de la cancelación */
  readonly motivo: string;

  /** Quién solicita la cancelación */
  readonly canceladoPor: 'tutor' | 'admin' | 'system';
}

/**
 * Input para cambiar horario de una inscripción
 */
export interface CambiarHorarioInput {
  /** ID de la suscripción familiar */
  readonly suscripcionFamiliarId: string;

  /** ID del tutor (para validación de ownership) */
  readonly tutorId: string;

  /** ID de la inscripción a modificar */
  readonly inscripcionId: string;

  /** ID del nuevo ClaseGrupo */
  readonly nuevoClaseGrupoId: string;
}

/**
 * Input para cambiar producto de una inscripción
 */
export interface CambiarProductoInput {
  /** ID de la suscripción familiar */
  readonly suscripcionFamiliarId: string;

  /** ID del tutor (para validación de ownership) */
  readonly tutorId: string;

  /** ID de la inscripción a modificar */
  readonly inscripcionId: string;

  /** ID del nuevo producto */
  readonly nuevoProductoId: string;

  /** ID del ClaseGrupo del nuevo producto (si aplica) */
  readonly nuevoClaseGrupoId?: string;

  /** ID de la comisión del nuevo producto (si aplica) */
  readonly nuevaComisionId?: string;
}

/**
 * Input para cambiar tier de la suscripción
 * @deprecated Usar CambiarTierInscripcionInput para cambiar tier por inscripción
 */
export interface CambiarTierInput {
  /** ID de la suscripción familiar */
  readonly suscripcionFamiliarId: string;

  /** ID del tutor (para validación de ownership) */
  readonly tutorId: string;

  /** Nuevo tier */
  readonly nuevoTier: TierNombre;
}

/**
 * Input para cambiar tier de una inscripción específica (MODELO 2026)
 *
 * Permite cambiar el tier de una inscripción individual sin afectar
 * las demás inscripciones de la familia.
 */
export interface CambiarTierInscripcionInput {
  /** ID de la inscripción a modificar */
  readonly inscripcionId: string;

  /** ID del tutor (para validación de ownership) */
  readonly tutorId: string;

  /** Nuevo tier para esta inscripción */
  readonly nuevoTier: TierNombre;
}

// ============================================================================
// TIPOS DE INPUT - ADMIN
// ============================================================================

/**
 * Input para pausar una suscripción (Admin)
 */
export interface PausarSuscripcionInput {
  /** ID de la suscripción familiar */
  readonly suscripcionFamiliarId: string;

  /** Motivo de la pausa */
  readonly motivo: string;
}

/**
 * Input para reactivar una suscripción pausada (Admin)
 */
export interface ReactivarSuscripcionInput {
  /** ID de la suscripción familiar */
  readonly suscripcionFamiliarId: string;

  /** Motivo de la reactivación (opcional) */
  readonly motivo?: string;
}

/**
 * Input para cambiar tier de una inscripción por admin
 */
export interface AdminCambiarTierInscripcionInput {
  /** ID de la inscripción a modificar */
  readonly inscripcionId: string;

  /** Nuevo tier para esta inscripción */
  readonly nuevoTier: TierNombre;

  /** Motivo del cambio (opcional) */
  readonly motivo?: string;
}

// ============================================================================
// TIPOS DE INPUT - TUTOR PAUSAR/REACTIVAR INSCRIPCIÓN
// ============================================================================

/**
 * Input para pausar una inscripción individual (Tutor)
 *
 * Permite al tutor pausar una inscripción específica de su suscripción familiar.
 * Solo pausa la inscripción, no toda la suscripción ni el cobro en MercadoPago.
 */
export interface PausarInscripcionInput {
  /** ID de la inscripción a pausar */
  readonly inscripcionId: string;

  /** ID del tutor (para validación de ownership) */
  readonly tutorId: string;

  /** Motivo de la pausa (opcional) */
  readonly motivo?: string;
}

/**
 * Input para reactivar una inscripción pausada (Tutor)
 */
export interface ReactivarInscripcionInput {
  /** ID de la inscripción a reactivar */
  readonly inscripcionId: string;

  /** ID del tutor (para validación de ownership) */
  readonly tutorId: string;
}

/**
 * Input para pausar suscripción completa (Tutor)
 *
 * Pausa la suscripción familiar y todas sus inscripciones activas.
 * También pausa el cobro automático en MercadoPago.
 */
export interface TutorPausarSuscripcionInput {
  /** ID del tutor (para obtener su suscripción) */
  readonly tutorId: string;

  /** Motivo de la pausa (opcional) */
  readonly motivo?: string;
}

/**
 * Input para reactivar suscripción pausada (Tutor)
 */
export interface TutorReactivarSuscripcionInput {
  /** ID del tutor (para obtener su suscripción) */
  readonly tutorId: string;
}

// ============================================================================
// TIPOS DE OUTPUT
// ============================================================================

/**
 * Resultado de crear una suscripción familiar
 */
export interface CrearSuscripcionFamiliarResult {
  /** ID de la suscripción en nuestra DB */
  readonly suscripcionId: string;

  /** ID del PreApproval en MercadoPago */
  readonly mpPreapprovalId: string;

  /** URL de checkout (null si cobro inmediato) */
  readonly checkoutUrl: string | null;

  /** Monto mensual calculado */
  readonly montoMensual: number;

  /** Tier seleccionado */
  readonly tier: TierNombre;

  /** Indica si se cobró inmediatamente */
  readonly cobradoInmediatamente: boolean;
}

/**
 * Resultado de agregar inscripciones
 */
export interface AgregarInscripcionesResult {
  /** IDs de las nuevas inscripciones creadas */
  readonly inscripcionesCreadas: string[];

  /** Nuevo monto mensual de la suscripción */
  readonly nuevoMontoMensual: number;

  /** Monto anterior */
  readonly montoAnterior: number;

  /** Diferencia de monto */
  readonly diferenciaMonto: number;
}

/**
 * Resultado de dar de baja inscripciones
 */
export interface BajaInscripcionesResult {
  /** IDs de las inscripciones dadas de baja */
  readonly inscripcionesBaja: string[];

  /** Nuevo monto mensual */
  readonly nuevoMontoMensual: number;

  /** Monto anterior */
  readonly montoAnterior: number;
}

/**
 * Resultado de cambiar horario
 */
export interface CambiarHorarioResult {
  /** ID de la inscripción modificada */
  readonly inscripcionId: string;

  /** ID del ClaseGrupo anterior */
  readonly claseGrupoAnteriorId: string;

  /** ID del nuevo ClaseGrupo */
  readonly nuevoClaseGrupoId: string;

  /** Nombre del nuevo horario */
  readonly nuevoHorarioNombre: string;
}

/**
 * Resultado de cambiar producto
 */
export interface CambiarProductoResult {
  /** ID de la inscripción modificada */
  readonly inscripcionId: string;

  /** ID del producto anterior */
  readonly productoAnteriorId: string;

  /** ID del nuevo producto */
  readonly nuevoProductoId: string;

  /** Nombre del nuevo producto */
  readonly nuevoProductoNombre: string;

  /** Nuevo monto mensual */
  readonly nuevoMontoMensual: number;

  /** Monto anterior */
  readonly montoAnterior: number;
}

/**
 * Resultado de cambiar tier
 * @deprecated Usar CambiarTierInscripcionResult
 */
export interface CambiarTierResult {
  /** Tier anterior */
  readonly tierAnterior: TierNombre;

  /** Nuevo tier */
  readonly nuevoTier: TierNombre;

  /** Monto anterior */
  readonly montoAnterior: number;

  /** Nuevo monto mensual */
  readonly nuevoMontoMensual: number;

  /** Diferencia de monto */
  readonly diferenciaMonto: number;
}

/**
 * Resultado de cambiar tier de una inscripción específica (MODELO 2026)
 */
export interface CambiarTierInscripcionResult {
  /** ID de la inscripción modificada */
  readonly inscripcionId: string;

  /** Tier anterior de la inscripción */
  readonly tierAnterior: TierNombre | null;

  /** Nuevo tier de la inscripción */
  readonly nuevoTier: TierNombre;

  /** Monto mensual anterior de la suscripción */
  readonly montoAnterior: number;

  /** Nuevo monto mensual de la suscripción */
  readonly nuevoMontoMensual: number;

  /** Diferencia de monto */
  readonly diferenciaMonto: number;

  /** Nombre del producto de la inscripción */
  readonly productoNombre: string;

  /** Nombre del estudiante */
  readonly estudianteNombre: string;
}

// ============================================================================
// TIPOS DE OUTPUT - ADMIN
// ============================================================================

/**
 * Resultado de pausar una suscripción
 */
export interface PausarSuscripcionResult {
  /** ID de la suscripción pausada */
  readonly suscripcionId: string;

  /** Estado anterior */
  readonly estadoAnterior: EstadoSuscripcionFamiliar;

  /** Mensaje descriptivo */
  readonly mensaje: string;
}

/**
 * Resultado de reactivar una suscripción
 */
export interface ReactivarSuscripcionResult {
  /** ID de la suscripción reactivada */
  readonly suscripcionId: string;

  /** Estado anterior */
  readonly estadoAnterior: EstadoSuscripcionFamiliar;

  /** Mensaje descriptivo */
  readonly mensaje: string;
}

/**
 * Resultado de cambiar tier por admin
 */
export interface AdminCambiarTierResult {
  /** ID de la inscripción modificada */
  readonly inscripcionId: string;

  /** Tier anterior de la inscripción */
  readonly tierAnterior: TierNombre | null;

  /** Nuevo tier de la inscripción */
  readonly nuevoTier: TierNombre;

  /** Monto mensual anterior de la suscripción */
  readonly montoAnterior: number;

  /** Nuevo monto mensual de la suscripción */
  readonly nuevoMontoMensual: number;

  /** Diferencia de monto */
  readonly diferenciaMonto: number;
}

// ============================================================================
// TIPOS DE OUTPUT - TUTOR PAUSAR/REACTIVAR INSCRIPCIÓN
// ============================================================================

/**
 * Resultado de pausar una inscripción individual
 */
export interface PausarInscripcionResult {
  /** ID de la inscripción pausada */
  readonly inscripcionId: string;

  /** Nombre del estudiante */
  readonly estudianteNombre: string;

  /** Nombre del producto/actividad */
  readonly productoNombre: string;

  /** Nuevo monto mensual (sin la inscripción pausada) */
  readonly nuevoMontoMensual: number;

  /** Monto anterior */
  readonly montoAnterior: number;

  /** Mensaje descriptivo */
  readonly mensaje: string;
}

/**
 * Resultado de reactivar una inscripción
 */
export interface ReactivarInscripcionResult {
  /** ID de la inscripción reactivada */
  readonly inscripcionId: string;

  /** Nombre del estudiante */
  readonly estudianteNombre: string;

  /** Nombre del producto/actividad */
  readonly productoNombre: string;

  /** Nuevo monto mensual (con la inscripción reactivada) */
  readonly nuevoMontoMensual: number;

  /** Monto anterior */
  readonly montoAnterior: number;

  /** Mensaje descriptivo */
  readonly mensaje: string;
}

/**
 * Resultado de pausar suscripción completa (Tutor)
 */
export interface TutorPausarSuscripcionResult {
  /** ID de la suscripción pausada */
  readonly suscripcionId: string;

  /** Cantidad de inscripciones pausadas */
  readonly inscripcionesPausadas: number;

  /** Mensaje descriptivo */
  readonly mensaje: string;
}

/**
 * Resultado de reactivar suscripción (Tutor)
 */
export interface TutorReactivarSuscripcionResult {
  /** ID de la suscripción reactivada */
  readonly suscripcionId: string;

  /** Cantidad de inscripciones reactivadas */
  readonly inscripcionesReactivadas: number;

  /** Monto mensual reactivado */
  readonly montoMensual: number;

  /** Mensaje descriptivo */
  readonly mensaje: string;
}

/**
 * Detalle de una inscripción de actividad
 */
export interface InscripcionActividadDetalle {
  readonly id: string;
  readonly estudianteId: string;
  readonly estudianteNombre: string;
  readonly productoId: string;
  readonly productoNombre: string;
  readonly claseGrupoId: string | null;
  readonly claseGrupoNombre: string | null;
  readonly comisionId: string | null;
  readonly comisionNombre: string | null;
  readonly estado: string;
  /**
   * Tier específico de esta inscripción (MODELO 2026)
   * Cada inscripción puede tener un tier diferente
   */
  readonly tier: TierNombre | null;
  readonly precioBase: number;
  readonly precioConDescuento: number;
  readonly descuentoAplicado: number;
  /**
   * Indica si esta inscripción es la más cara (no tiene descuento)
   */
  readonly esMasCara: boolean;
  readonly ordenInscripcion: number;
  readonly fechaInicio: Date;
  readonly fechaFin: Date | null;
}

/**
 * Detalle completo de una suscripción familiar
 */
export interface SuscripcionFamiliarDetalle {
  readonly id: string;
  readonly tutorId: string;
  readonly tutorNombre: string;
  readonly estado: EstadoSuscripcionFamiliar;
  readonly tier: TierNombre;
  readonly montoMensual: number;
  readonly fechaProximoCobro: Date | null;
  readonly fechaGracia: Date | null;
  readonly inscripciones: InscripcionActividadDetalle[];
  readonly cantidadEstudiantes: number;
  readonly cantidadActividades: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// ============================================================================
// ERRORES
// ============================================================================

/**
 * Códigos de error para SuscripcionFamiliar
 */
export enum SuscripcionFamiliarErrorCode {
  /** Suscripción no encontrada */
  NOT_FOUND = 'SUSCRIPCION_FAMILIAR_NOT_FOUND',

  /** Ya existe una suscripción para este tutor */
  ALREADY_EXISTS = 'SUSCRIPCION_FAMILIAR_ALREADY_EXISTS',

  /** No autorizado para esta operación */
  UNAUTHORIZED = 'UNAUTHORIZED_ACCESS',

  /** Estado inválido para la operación */
  INVALID_STATE = 'INVALID_STATE',

  /** Tutor no encontrado */
  TUTOR_NOT_FOUND = 'TUTOR_NOT_FOUND',

  /** Estudiante no encontrado o no pertenece al tutor */
  ESTUDIANTE_NOT_FOUND = 'ESTUDIANTE_NOT_FOUND',

  /** Producto no encontrado o no disponible */
  PRODUCTO_NOT_FOUND = 'PRODUCTO_NOT_FOUND',

  /** Inscripción duplicada */
  INSCRIPCION_DUPLICADA = 'INSCRIPCION_DUPLICADA',

  /** Error de comunicación con MercadoPago */
  MP_API_ERROR = 'MERCADOPAGO_API_ERROR',

  /** Circuito abierto (MercadoPago no disponible) */
  CIRCUIT_OPEN = 'CIRCUIT_BREAKER_OPEN',
}

/**
 * Error específico del servicio de SuscripcionFamiliar
 */
export class SuscripcionFamiliarError extends Error {
  constructor(
    message: string,
    public readonly code: SuscripcionFamiliarErrorCode,
    public readonly details?: Record<string, string | number | boolean | null>,
  ) {
    super(message);
    this.name = 'SuscripcionFamiliarError';
  }
}

// ============================================================================
// CÁLCULO DE PRECIOS
// ============================================================================

/**
 * Resultado del cálculo de precio mensual
 */
export interface CalculoMontoMensualResult {
  /** Monto total sin descuentos */
  readonly montoSinDescuento: number;

  /** Monto total con descuentos aplicados */
  readonly montoConDescuento: number;

  /** Ahorro total */
  readonly ahorroTotal: number;

  /** Detalle por inscripción */
  readonly detalleInscripciones: {
    readonly inscripcionId: string;
    readonly productoNombre: string;
    readonly precioBase: number;
    readonly descuentoPorcentaje: number;
    readonly precioFinal: number;
  }[];
}
