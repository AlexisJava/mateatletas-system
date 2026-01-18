import { z } from 'zod';
import { tierNombreEnum } from './enums.schema';

// ============================================================================
// INSCRIPCION ACTIVIDAD SCHEMAS (Sistema 2026)
// ============================================================================

/**
 * Estado de inscripción a actividad
 */
export const estadoInscripcionActividadEnum = z.enum([
  'ACTIVA', // Inscripción activa
  'PAUSADA', // Pausada temporalmente
  'CANCELADA', // Cancelada (baja)
]);

export type EstadoInscripcionActividad = z.infer<typeof estadoInscripcionActividadEnum>;

/**
 * Schema base de InscripcionActividad
 */
export const inscripcionActividadSchema = z.object({
  id: z.string(),

  // Relaciones principales
  suscripcion_familiar_id: z.string(),
  estudiante_id: z.string(),
  producto_id: z.string(),

  // Asignación específica (XOR: uno u otro)
  clase_grupo_id: z.string().nullable().optional(),
  comision_id: z.string().nullable().optional(),

  // Tier y estado
  tier: tierNombreEnum.nullable().optional(),
  estado: estadoInscripcionActividadEnum,

  // Fechas
  fecha_inicio: z.string().datetime(),
  fecha_fin: z.string().datetime().nullable().optional(),

  // Timestamps
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type InscripcionActividad = z.infer<typeof inscripcionActividadSchema>;

/**
 * Schema para crear inscripción a actividad
 */
export const createInscripcionActividadSchema = z
  .object({
    estudiante_id: z.string(),
    producto_id: z.string(),
    clase_grupo_id: z.string().nullable().optional(),
    comision_id: z.string().nullable().optional(),
    tier: tierNombreEnum.nullable().optional(),
  })
  .refine(
    (data) => {
      // XOR validation: debe tener clase_grupo_id OR comision_id, pero no ambos ni ninguno
      const hasClaseGrupo = data.clase_grupo_id !== null && data.clase_grupo_id !== undefined;
      const hasComision = data.comision_id !== null && data.comision_id !== undefined;
      return hasClaseGrupo !== hasComision; // XOR
    },
    {
      message: 'Debe especificar clase_grupo_id O comision_id, pero no ambos',
    },
  );

export type CreateInscripcionActividadDto = z.infer<typeof createInscripcionActividadSchema>;

/**
 * Schema para actualizar inscripción a actividad
 */
export const updateInscripcionActividadSchema = z.object({
  clase_grupo_id: z.string().nullable().optional(),
  comision_id: z.string().nullable().optional(),
  tier: tierNombreEnum.nullable().optional(),
  estado: estadoInscripcionActividadEnum.optional(),
  fecha_fin: z.string().datetime().nullable().optional(),
});

export type UpdateInscripcionActividadDto = z.infer<typeof updateInscripcionActividadSchema>;

/**
 * Schema con relaciones incluidas (para responses)
 */
export const inscripcionActividadWithRelationsSchema = inscripcionActividadSchema.extend({
  estudiante: z
    .object({
      id: z.string(),
      nombre: z.string(),
      apellido: z.string(),
      edad: z.number(),
    })
    .optional(),
  producto: z
    .object({
      id: z.string(),
      nombre: z.string(),
      tipo: z.string(),
    })
    .optional(),
  claseGrupo: z
    .object({
      id: z.string(),
      nombre: z.string(),
      horario: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  comision: z
    .object({
      id: z.string(),
      nombre: z.string(),
      fecha_inicio: z.string().datetime(),
      fecha_fin: z.string().datetime(),
    })
    .nullable()
    .optional(),
});

export type InscripcionActividadWithRelations = z.infer<
  typeof inscripcionActividadWithRelationsSchema
>;

/**
 * Schema para lista de inscripciones
 */
export const inscripcionesActividadListSchema = z.array(inscripcionActividadSchema);

export type InscripcionesActividadList = z.infer<typeof inscripcionesActividadListSchema>;

/**
 * Schema para resumen de inscripciones por estudiante
 */
export const inscripcionesEstudianteResumenSchema = z.object({
  estudiante_id: z.string(),
  estudiante_nombre: z.string(),
  total_inscripciones: z.number(),
  inscripciones_activas: z.number(),
  inscripciones: z.array(
    z.object({
      id: z.string(),
      producto_nombre: z.string(),
      tipo_asignacion: z.enum(['CLASE_GRUPO', 'COMISION']),
      estado: estadoInscripcionActividadEnum,
      tier: tierNombreEnum.nullable(),
    }),
  ),
});

export type InscripcionesEstudianteResumen = z.infer<typeof inscripcionesEstudianteResumenSchema>;
