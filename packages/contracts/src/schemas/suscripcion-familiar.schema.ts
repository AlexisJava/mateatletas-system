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
  tutor_id: z.string(),

  // MercadoPago
  preapproval_id: z.string().nullable().optional(),
  preapproval_plan_id: z.string().nullable().optional(),

  // Estado
  estado: estadoSuscripcionFamiliarEnum,

  // Facturación
  tier: tierNombreEnum,
  monto_mensual: z.number().int().nonnegative(),
  fecha_proximo_cobro: z.string().datetime().nullable().optional(),
  fecha_gracia: z.string().datetime().nullable().optional(),

  // Timestamps
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
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
        estudiante_id: z.string(),
        producto_id: z.string(),
        estado: z.string(),
      }),
    )
    .optional(),
  _count: z
    .object({
      inscripciones: z.number(),
      historial_cambios: z.number(),
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
  monto_mensual: z.number(),
  fecha_proximo_cobro: z.string().datetime().nullable(),
  cantidad_estudiantes: z.number(),
  cantidad_inscripciones: z.number(),
});

export type SuscripcionFamiliarResumen = z.infer<typeof suscripcionFamiliarResumenSchema>;

/**
 * Schema para lista de suscripciones
 */
export const suscripcionesFamiliaresListSchema = z.array(suscripcionFamiliarSchema);

export type SuscripcionesFamiliaresList = z.infer<typeof suscripcionesFamiliaresListSchema>;
