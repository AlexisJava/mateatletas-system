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
  suscripcionFamiliarId: z.string(),
  estudianteId: z.string(),
  productoId: z.string(),

  // Asignación específica (XOR: uno u otro)
  claseGrupoId: z.string().nullable().optional(),
  comisionId: z.string().nullable().optional(),

  // Tier y estado
  tier: tierNombreEnum.nullable().optional(),
  estado: estadoInscripcionActividadEnum,

  // Fechas
  fechaInicio: z.string().datetime(),
  fechaFin: z.string().datetime().nullable().optional(),

  // Timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type InscripcionActividad = z.infer<typeof inscripcionActividadSchema>;

/**
 * Schema para crear inscripción a actividad
 */
export const createInscripcionActividadSchema = z
  .object({
    estudianteId: z.string(),
    productoId: z.string(),
    claseGrupoId: z.string().nullable().optional(),
    comisionId: z.string().nullable().optional(),
    tier: tierNombreEnum.nullable().optional(),
  })
  .refine(
    (data) => {
      // XOR validation: debe tener claseGrupoId OR comisionId, pero no ambos ni ninguno
      const hasClaseGrupo = data.claseGrupoId !== null && data.claseGrupoId !== undefined;
      const hasComision = data.comisionId !== null && data.comisionId !== undefined;
      return hasClaseGrupo !== hasComision; // XOR
    },
    {
      message: 'Debe especificar claseGrupoId O comisionId, pero no ambos',
    },
  );

export type CreateInscripcionActividadDto = z.infer<typeof createInscripcionActividadSchema>;

/**
 * Schema para actualizar inscripción a actividad
 */
export const updateInscripcionActividadSchema = z.object({
  claseGrupoId: z.string().nullable().optional(),
  comisionId: z.string().nullable().optional(),
  tier: tierNombreEnum.nullable().optional(),
  estado: estadoInscripcionActividadEnum.optional(),
  fechaFin: z.string().datetime().nullable().optional(),
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
      fechaInicio: z.string().datetime(),
      fechaFin: z.string().datetime(),
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
  estudianteId: z.string(),
  estudianteNombre: z.string(),
  totalInscripciones: z.number(),
  inscripcionesActivas: z.number(),
  inscripciones: z.array(
    z.object({
      id: z.string(),
      productoNombre: z.string(),
      tipoAsignacion: z.enum(['CLASE_GRUPO', 'COMISION']),
      estado: estadoInscripcionActividadEnum,
      tier: tierNombreEnum.nullable(),
    }),
  ),
});

export type InscripcionesEstudianteResumen = z.infer<typeof inscripcionesEstudianteResumenSchema>;
