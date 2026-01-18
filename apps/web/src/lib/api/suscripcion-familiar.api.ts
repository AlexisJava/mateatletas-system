/**
 * API Client para Suscripciones Familiares 2026
 *
 * MODELO 2026: Tier por inscripción (no por familia)
 * - Cada inscripción puede tener un tier diferente
 * - Descuento 10% se aplica al producto de MENOR VALOR
 *
 * Endpoints:
 * - GET /suscripciones/familiar → Mi suscripción
 * - POST /suscripciones/familiar → Crear suscripción
 * - POST /suscripciones/familiar/inscripciones → Agregar inscripciones
 * - DELETE /suscripciones/familiar/inscripciones → Dar de baja
 * - PATCH /suscripciones/familiar/inscripciones/:id/tier → Cambiar tier de inscripción (NUEVO)
 * - PATCH /suscripciones/familiar/tier → Cambiar tier (deprecated)
 * - POST /suscripciones/familiar/cancelar → Cancelar suscripción
 * - GET /suscripciones/familiar/simular → Simular monto
 *
 * Tipos basados en: apps/api/src/suscripciones/types/suscripcion-familiar.types.ts
 */
import apiClient from '../axios';

// ============================================================================
// ENUMS (Espejo de Prisma)
// ============================================================================

export type TierNombre = 'STEAM_LIBROS' | 'STEAM_ASINCRONICO' | 'STEAM_SINCRONICO';

export type EstadoSuscripcionFamiliar =
  | 'PENDIENTE_PAGO'
  | 'ACTIVA'
  | 'EN_GRACIA'
  | 'SUSPENDIDA'
  | 'CANCELADA';

export type EstadoInscripcionActividad = 'ACTIVA' | 'PENDIENTE_BAJA' | 'BAJA' | 'CONGELADA';

// ============================================================================
// TIPOS DE REQUEST (DTOs)
// ============================================================================

/**
 * Inscripción de actividad para crear/agregar
 */
export interface InscripcionActividadRequest {
  /** ID del estudiante (CUID) */
  readonly estudianteId: string;
  /** ID del producto (CUID) */
  readonly productoId: string;
  /** ID del grupo de clase - para Clubs */
  readonly claseGrupoId?: string;
  /** ID de la comisión - para cursos temporales */
  readonly comisionId?: string;
  /**
   * Tier específico de esta inscripción (MODELO 2026)
   * Si no se especifica, usa el tier de la suscripción como fallback
   */
  readonly tier?: TierNombre;
}

/**
 * Request para crear suscripción familiar
 */
export interface CrearSuscripcionFamiliarRequest {
  /** Tier inicial de la suscripción */
  readonly tier: TierNombre;
  /** Inscripciones iniciales (opcional) */
  readonly inscripciones?: InscripcionActividadRequest[];
  /** Token de tarjeta de MercadoPago Bricks */
  readonly cardTokenId?: string;
  /** Email del pagador (requerido si cardTokenId presente) */
  readonly payerEmail?: string;
}

/**
 * Request para agregar inscripciones
 */
export interface AgregarInscripcionesRequest {
  /** Lista de inscripciones a agregar */
  readonly inscripciones: InscripcionActividadRequest[];
}

/**
 * Request para dar de baja inscripciones
 */
export interface BajaInscripcionesRequest {
  /** IDs de las inscripciones a dar de baja */
  readonly inscripcionIds: string[];
  /** Motivo de la baja */
  readonly motivo: string;
}

/**
 * Request para cambiar tier de la suscripción (toda la familia)
 * @deprecated Usar CambiarTierInscripcionRequest para cambiar tier por inscripción
 */
export interface CambiarTierRequest {
  /** Nuevo tier */
  readonly nuevoTier: TierNombre;
}

/**
 * Request para cambiar tier de una inscripción específica (MODELO 2026)
 */
export interface CambiarTierInscripcionRequest {
  /** Nuevo tier para esta inscripción */
  readonly nuevoTier: TierNombre;
}

/**
 * Request para cancelar suscripción
 */
export interface CancelarSuscripcionRequest {
  /** Motivo de la cancelación */
  readonly motivo: string;
}

// ============================================================================
// TIPOS DE RESPONSE
// ============================================================================

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
  readonly estado: EstadoInscripcionActividad;
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
   * El descuento se aplica a los productos de MENOR valor
   */
  readonly esMasCara: boolean;
  readonly ordenInscripcion: number;
  readonly fechaInicio: string;
  readonly fechaFin: string | null;
}

/**
 * Detalle completo de suscripción familiar
 */
export interface SuscripcionFamiliarDetalle {
  readonly id: string;
  readonly tutorId: string;
  readonly tutorNombre: string;
  readonly estado: EstadoSuscripcionFamiliar;
  readonly tier: TierNombre;
  readonly montoMensual: number;
  readonly fechaProximoCobro: string | null;
  readonly fechaGracia: string | null;
  readonly inscripciones: InscripcionActividadDetalle[];
  readonly cantidadEstudiantes: number;
  readonly cantidadActividades: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Response de crear suscripción
 */
export interface CrearSuscripcionResponse {
  readonly suscripcionId: string;
  readonly mpPreapprovalId: string;
  readonly checkoutUrl: string | null;
  readonly montoMensual: number;
  readonly tier: TierNombre;
  readonly cobradoInmediatamente: boolean;
}

/**
 * Response de agregar inscripciones
 */
export interface AgregarInscripcionesResponse {
  readonly inscripcionesCreadas: string[];
  readonly nuevoMontoMensual: number;
  readonly montoAnterior: number;
  readonly diferenciaMonto: number;
}

/**
 * Response de dar de baja inscripciones
 */
export interface BajaInscripcionesResponse {
  readonly inscripcionesBaja: string[];
  readonly nuevoMontoMensual: number;
  readonly montoAnterior: number;
}

/**
 * Response de cambiar tier de suscripción
 * @deprecated Usar CambiarTierInscripcionResponse
 */
export interface CambiarTierResponse {
  readonly tierAnterior: TierNombre;
  readonly nuevoTier: TierNombre;
  readonly montoAnterior: number;
  readonly nuevoMontoMensual: number;
  readonly diferenciaMonto: number;
}

/**
 * Response de cambiar tier de una inscripción específica (MODELO 2026)
 */
export interface CambiarTierInscripcionResponse {
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

/**
 * Response de simular monto
 */
export interface SimularMontoResponse {
  readonly montoSinDescuento: number;
  readonly montoConDescuento: number;
  readonly ahorroTotal: number;
  readonly detalleInscripciones: Array<{
    readonly inscripcionId: string;
    readonly productoNombre: string;
    readonly precioBase: number;
    readonly descuentoPorcentaje: number;
    readonly precioFinal: number;
  }>;
}

/**
 * Response de cancelar suscripción
 */
export interface CancelarSuscripcionResponse {
  readonly mensaje: string;
  readonly fechaCancelacion: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const suscripcionFamiliarApi = {
  /**
   * GET /suscripciones/familiar
   * Obtiene la suscripción familiar del tutor autenticado
   *
   * @returns Detalle de la suscripción o null si no existe
   */
  getMiSuscripcion: async (): Promise<SuscripcionFamiliarDetalle | null> => {
    try {
      return await apiClient.get<SuscripcionFamiliarDetalle>('/suscripciones/familiar');
    } catch (error) {
      // 404 significa que no tiene suscripción
      if (isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * POST /suscripciones/familiar
   * Crea una nueva suscripción familiar
   *
   * @param data - Datos para crear la suscripción
   * @returns Resultado con URL de checkout o confirmación de cobro
   */
  crearSuscripcion: async (
    data: CrearSuscripcionFamiliarRequest,
  ): Promise<CrearSuscripcionResponse> => {
    return apiClient.post<CrearSuscripcionResponse>('/suscripciones/familiar', data);
  },

  /**
   * POST /suscripciones/familiar/inscripciones
   * Agrega inscripciones a una suscripción existente
   *
   * @param data - Inscripciones a agregar
   * @returns Resultado con nuevo monto mensual
   */
  agregarInscripciones: async (
    data: AgregarInscripcionesRequest,
  ): Promise<AgregarInscripcionesResponse> => {
    return apiClient.post<AgregarInscripcionesResponse>(
      '/suscripciones/familiar/inscripciones',
      data,
    );
  },

  /**
   * DELETE /suscripciones/familiar/inscripciones
   * Da de baja inscripciones de una suscripción
   *
   * @param data - IDs de inscripciones y motivo
   * @returns Resultado con nuevo monto mensual
   */
  bajaInscripciones: async (data: BajaInscripcionesRequest): Promise<BajaInscripcionesResponse> => {
    return apiClient.delete<BajaInscripcionesResponse>('/suscripciones/familiar/inscripciones', {
      data,
    });
  },

  /**
   * PATCH /suscripciones/familiar/inscripciones/:id/tier
   * Cambia el tier de una inscripción específica (MODELO 2026)
   *
   * El monto mensual se recalcula aplicando el descuento del 10%
   * al producto de MENOR valor (no al segundo cronológicamente).
   *
   * @param inscripcionId - ID de la inscripción a modificar
   * @param data - Nuevo tier para la inscripción
   * @returns Resultado con comparación de montos
   */
  cambiarTierInscripcion: async (
    inscripcionId: string,
    data: CambiarTierInscripcionRequest,
  ): Promise<CambiarTierInscripcionResponse> => {
    return apiClient.patch<CambiarTierInscripcionResponse>(
      `/suscripciones/familiar/inscripciones/${inscripcionId}/tier`,
      data,
    );
  },

  /**
   * PATCH /suscripciones/familiar/tier
   * Cambia el tier de la suscripción
   *
   * @deprecated Usar cambiarTierInscripcion para cambiar tier de inscripciones individuales
   * @param data - Nuevo tier
   * @returns Resultado con comparación de montos
   */
  cambiarTier: async (data: CambiarTierRequest): Promise<CambiarTierResponse> => {
    return apiClient.patch<CambiarTierResponse>('/suscripciones/familiar/tier', data);
  },

  /**
   * POST /suscripciones/familiar/cancelar
   * Cancela la suscripción familiar
   *
   * @param data - Motivo de cancelación
   * @returns Confirmación de cancelación
   */
  cancelarSuscripcion: async (
    data: CancelarSuscripcionRequest,
  ): Promise<CancelarSuscripcionResponse> => {
    return apiClient.post<CancelarSuscripcionResponse>('/suscripciones/familiar/cancelar', data);
  },

  /**
   * GET /suscripciones/familiar/simular
   * Simula el monto mensual para una lista de productos
   *
   * @param productoIds - Array de IDs de productos
   * @returns Cálculo de monto con descuentos
   */
  simularMonto: async (productoIds: string[]): Promise<SimularMontoResponse> => {
    return apiClient.get<SimularMontoResponse>('/suscripciones/familiar/simular', {
      params: { productoIds: productoIds.join(',') },
    });
  },
} as const;

// ============================================================================
// UTILS
// ============================================================================

/**
 * Type guard para errores de Axios
 */
function isAxiosError(error: unknown): error is { response?: { status: number } } {
  return typeof error === 'object' && error !== null && 'response' in error;
}

export default suscripcionFamiliarApi;
