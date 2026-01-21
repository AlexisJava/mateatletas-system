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
  estudianteId: z.string(),
  claseGrupoId: z.string(),
  tutorId: z.string(),

  // Fechas
  fechaInscripcion: z.string().datetime(),
  fechaBaja: z.string().datetime().nullable().optional(),

  // Tipo de acceso
  tipoAcceso: tipoAccesoEnum,
  observaciones: z.string().nullable().optional(),

  // Timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  // Campos que indican la fuente
  fuente: fuenteInscripcionEnum,
  suscripcionFamiliarId: z.string().nullable().optional(), // Solo para SUSCRIPCION_2026
  productoId: z.string().nullable().optional(), // Solo para SUSCRIPCION_2026
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
      nivelEscolar: z.string(),
    })
    .optional(),
  claseGrupo: z
    .object({
      id: z.string(),
      nombre: z.string(),
      horario: z.string().nullable().optional(),
      docenteId: z.string().nullable().optional(),
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
  estudianteId: z.string().optional(),
  claseGrupoId: z.string().optional(),
  tutorId: z.string().optional(),
  fuente: fuenteInscripcionEnum.optional(),
  estado: estadoInscripcionUnificadaEnum.optional(),
  tipoAcceso: tipoAccesoEnum.optional(),
  tier: tierNombreEnum.optional(),
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional(),
});

export type InscripcionUnificadaFilter = z.infer<typeof inscripcionUnificadaFilterSchema>;

/**
 * Schema para estadísticas de inscripciones
 */
export const inscripcionesEstadisticasSchema = z.object({
  total: z.number(),
  porFuente: z.object({
    MANUAL: z.number(),
    SUSCRIPCION_2026: z.number(),
  }),
  porEstado: z.object({
    ACTIVA: z.number(),
    CANCELADA: z.number(),
    PAUSADA: z.number(),
  }),
  porTipoAcceso: z.object({
    SINCRONICO: z.number(),
    ASINCRONICO: z.number(),
  }),
  porTier: z.object({
    STEAM_LIBROS: z.number(),
    STEAM_ASINCRONICO: z.number(),
    STEAM_SINCRONICO: z.number(),
    SIN_TIER: z.number(),
  }),
});

export type InscripcionesEstadisticas = z.infer<typeof inscripcionesEstadisticasSchema>;
