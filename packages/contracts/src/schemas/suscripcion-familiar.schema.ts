import { z } from 'zod';
import { tierNombreEnum } from './enums.schema';

// ============================================================================
// SUSCRIPCION FAMILIAR SCHEMAS (Sistema 2026)
// ============================================================================

/**
 * Estado de suscripción familiar
 * (Definido aquí porque es específico de este modelo, no compartido)
 */
export const estadoSuscripcionFamiliarEnum = z.enum([
  'PENDING', // Esperando autorización de MP
  'AUTHORIZED', // Activa y cobrando
  'PAUSED', // Pausada por fallo de pago
  'CANCELLED', // Cancelada por tutor o admin
]);

export type EstadoSuscripcionFamiliar = z.infer<typeof estadoSuscripcionFamiliarEnum>;

/**
 * Schema base de SuscripcionFamiliar
 */
export const suscripcionFamiliarSchema = z.object({
  id: z.string(),
  tutorId: z.string(),

  // MercadoPago
  preapprovalId: z.string().nullable().optional(),
  preapprovalPlanId: z.string().nullable().optional(),

  // Estado
  estado: estadoSuscripcionFamiliarEnum,

  // Facturación
  tier: tierNombreEnum,
  montoMensual: z.number().int().nonnegative(),
  fechaProximoCobro: z.string().datetime().nullable().optional(),
  fechaGracia: z.string().datetime().nullable().optional(),

  // Timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SuscripcionFamiliar = z.infer<typeof suscripcionFamiliarSchema>;

/**
 * Schema para crear suscripción familiar
 */
export const createSuscripcionFamiliarSchema = z.object({
  tier: tierNombreEnum.default('STEAM_LIBROS'),
});

export type CreateSuscripcionFamiliarDto = z.infer<typeof createSuscripcionFamiliarSchema>;

/**
 * Schema para actualizar suscripción familiar
 */
export const updateSuscripcionFamiliarSchema = z.object({
  tier: tierNombreEnum.optional(),
  estado: estadoSuscripcionFamiliarEnum.optional(),
});

export type UpdateSuscripcionFamiliarDto = z.infer<typeof updateSuscripcionFamiliarSchema>;

/**
 * Schema con relaciones incluidas (para responses)
 */
export const suscripcionFamiliarWithRelationsSchema = suscripcionFamiliarSchema.extend({
  tutor: z
    .object({
      id: z.string(),
      nombre: z.string(),
      apellido: z.string(),
      email: z.string().email(),
    })
    .optional(),
  inscripciones: z
    .array(
      z.object({
        id: z.string(),
        estudianteId: z.string(),
        productoId: z.string(),
        estado: z.string(),
      }),
    )
    .optional(),
  _count: z
    .object({
      inscripciones: z.number(),
      historialCambios: z.number(),
    })
    .optional(),
});

export type SuscripcionFamiliarWithRelations = z.infer<
  typeof suscripcionFamiliarWithRelationsSchema
>;

/**
 * Schema para resumen de suscripción (dashboard tutor)
 */
export const suscripcionFamiliarResumenSchema = z.object({
  id: z.string(),
  estado: estadoSuscripcionFamiliarEnum,
  tier: tierNombreEnum,
  montoMensual: z.number(),
  fechaProximoCobro: z.string().datetime().nullable(),
  cantidadEstudiantes: z.number(),
  cantidadInscripciones: z.number(),
});

export type SuscripcionFamiliarResumen = z.infer<typeof suscripcionFamiliarResumenSchema>;

/**
 * Schema para lista de suscripciones
 */
export const suscripcionesFamiliaresListSchema = z.array(suscripcionFamiliarSchema);

export type SuscripcionesFamiliaresList = z.infer<typeof suscripcionesFamiliaresListSchema>;
