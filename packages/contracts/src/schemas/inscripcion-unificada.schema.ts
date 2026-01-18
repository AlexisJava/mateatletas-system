import { z } from 'zod';
import { tierNombreEnum } from './enums.schema';

// ============================================================================
// INSCRIPCION UNIFICADA SCHEMAS (Vista PostgreSQL - Read Only)
// ============================================================================

/**
 * Fuente de la inscripción (cómo se creó)
 */
export const fuenteInscripcionEnum = z.enum([
  'MANUAL', // Admin creó manualmente (becas, especial)
  'SUSCRIPCION_2026', // Tutor creó via suscripción familiar
]);

export type FuenteInscripcion = z.infer<typeof fuenteInscripcionEnum>;

/**
 * Estado de la inscripción unificada
 */
export const estadoInscripcionUnificadaEnum = z.enum(['ACTIVA', 'CANCELADA', 'PAUSADA']);

export type EstadoInscripcionUnificada = z.infer<typeof estadoInscripcionUnificadaEnum>;

/**
 * Tipo de acceso (sincrónico o asincrónico)
 */
export const tipoAccesoEnum = z.enum(['SINCRONICO', 'ASINCRONICO']);

export type TipoAcceso = z.infer<typeof tipoAccesoEnum>;

/**
 * Schema base de InscripcionUnificada (Vista - READ ONLY)
 *
 * IMPORTANTE: Esta es una vista PostgreSQL que unifica:
 * - inscripciones_clase_grupo (fuente: MANUAL)
 * - inscripciones_actividad (fuente: SUSCRIPCION_2026)
 *
 * SOLO USAR PARA LECTURAS. Para escrituras usar los modelos base.
 */
export const inscripcionUnificadaSchema = z.object({
  id: z.string(),
  estudiante_id: z.string(),
  clase_grupo_id: z.string(),
  tutor_id: z.string(),

  // Fechas
  fecha_inscripcion: z.string().datetime(),
  fecha_baja: z.string().datetime().nullable().optional(),

  // Tipo de acceso
  tipo_acceso: tipoAccesoEnum,
  observaciones: z.string().nullable().optional(),

  // Timestamps
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),

  // Campos que indican la fuente
  fuente: fuenteInscripcionEnum,
  suscripcion_familiar_id: z.string().nullable().optional(), // Solo para SUSCRIPCION_2026
  producto_id: z.string().nullable().optional(), // Solo para SUSCRIPCION_2026
  tier: tierNombreEnum.nullable().optional(), // Solo para SUSCRIPCION_2026
  estado: estadoInscripcionUnificadaEnum,
});

export type InscripcionUnificada = z.infer<typeof inscripcionUnificadaSchema>;

/**
 * Schema con relaciones incluidas (para responses)
 */
export const inscripcionUnificadaWithRelationsSchema = inscripcionUnificadaSchema.extend({
  estudiante: z
    .object({
      id: z.string(),
      nombre: z.string(),
      apellido: z.string(),
      edad: z.number(),
      nivel_escolar: z.string(),
    })
    .optional(),
  claseGrupo: z
    .object({
      id: z.string(),
      nombre: z.string(),
      horario: z.string().nullable().optional(),
      docente_id: z.string().nullable().optional(),
    })
    .optional(),
  tutor: z
    .object({
      id: z.string(),
      nombre: z.string(),
      apellido: z.string(),
      email: z.string().email(),
    })
    .optional(),
});

export type InscripcionUnificadaWithRelations = z.infer<
  typeof inscripcionUnificadaWithRelationsSchema
>;

/**
 * Schema para lista de inscripciones unificadas
 */
export const inscripcionesUnificadasListSchema = z.array(inscripcionUnificadaSchema);

export type InscripcionesUnificadasList = z.infer<typeof inscripcionesUnificadasListSchema>;

/**
 * Schema para filtros de consulta
 */
export const inscripcionUnificadaFilterSchema = z.object({
  estudiante_id: z.string().optional(),
  clase_grupo_id: z.string().optional(),
  tutor_id: z.string().optional(),
  fuente: fuenteInscripcionEnum.optional(),
  estado: estadoInscripcionUnificadaEnum.optional(),
  tipo_acceso: tipoAccesoEnum.optional(),
  tier: tierNombreEnum.optional(),
  fecha_desde: z.string().datetime().optional(),
  fecha_hasta: z.string().datetime().optional(),
});

export type InscripcionUnificadaFilter = z.infer<typeof inscripcionUnificadaFilterSchema>;

/**
 * Schema para estadísticas de inscripciones
 */
export const inscripcionesEstadisticasSchema = z.object({
  total: z.number(),
  por_fuente: z.object({
    MANUAL: z.number(),
    SUSCRIPCION_2026: z.number(),
  }),
  por_estado: z.object({
    ACTIVA: z.number(),
    CANCELADA: z.number(),
    PAUSADA: z.number(),
  }),
  por_tipo_acceso: z.object({
    SINCRONICO: z.number(),
    ASINCRONICO: z.number(),
  }),
  por_tier: z.object({
    STEAM_LIBROS: z.number(),
    STEAM_ASINCRONICO: z.number(),
    STEAM_SINCRONICO: z.number(),
    SIN_TIER: z.number(),
  }),
});

export type InscripcionesEstadisticas = z.infer<typeof inscripcionesEstadisticasSchema>;
