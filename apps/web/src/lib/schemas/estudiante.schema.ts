import { z } from 'zod';

/**
 * Schema de Equipo (simplificado para evitar circularidad)
 */
const equipoEnEstudianteSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  color_primario: z.string(),
  color_secundario: z.string(),
  icono_url: z.string().nullable().optional(),
  puntos_totales: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const rutaCurricularDetalleSchema = z
  .object({
    nombre: z.string(),
    color: z.string().optional(),
  })
  .passthrough();

/**
 * Schema principal de Estudiante
 * Coincide EXACTAMENTE con el tipo Estudiante en types/estudiante.ts
 */
export const estudianteSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  edad: z.number(),
  nivel_escolar: z.enum(['Primaria', 'Secundaria', 'Universidad']),
  avatar_url: z.string(),
  tutor_id: z.string(),
  equipo_id: z.string().nullable().optional(),
  puntos_totales: z.number(),
  nivel_actual: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  equipo: equipoEnEstudianteSchema.optional(),
});

/**
 * Schema para respuesta paginada de estudiantes
 */
export const estudiantesResponseSchema = z.object({
  data: z.array(estudianteSchema),
  metadata: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

/**
 * Schema para estadísticas de estudiantes
 */
export const estadisticasEstudiantesSchema = z.object({
  total: z.number(),
  por_nivel: z.record(z.number()),
  por_equipo: z.record(z.number()),
  puntos_totales: z.number(),
});

/**
 * Schema para respuesta de eliminación
 */
export const deleteEstudianteResponseSchema = z.object({
  message: z.string(),
});

/**
 * Schema para conteo
 */
export const countEstudiantesResponseSchema = z.object({
  count: z.number(),
});

const insigniaEstudianteSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string().optional(),
  icono_url: z.string().optional(),
});

const claseDetalleSchema = z
  .object({
    id: z.string(),
    fecha_hora_inicio: z
      .union([z.string(), z.date()])
      .transform((value) => (value instanceof Date ? value.toISOString() : value)),
    rutaCurricular: rutaCurricularDetalleSchema.optional().nullable(),
    ruta_curricular: rutaCurricularDetalleSchema.optional().nullable(),
    docente: z
      .object({
        id: z.string().optional(),
        user: z
          .object({
            nombre: z.string().optional(),
            apellido: z.string().optional(),
          })
          .optional(),
        nombre: z.string().optional(),
        apellido: z.string().optional(),
      })
      .optional(),
  })
  .passthrough();

const inscripcionClaseDetalleSchema = z.object({
  id: z.string(),
  estudiante_id: z.string(),
  clase_id: z.string(),
  estado: z.string(),
  createdAt: z
    .union([z.string(), z.date()])
    .transform((value) => (value instanceof Date ? value.toISOString() : value)),
  clase: claseDetalleSchema,
});

const asistenciaDetalleSchema = z.object({
  id: z.string(),
  presente: z.boolean().optional(),
  estado: z.string().optional(),
  fecha: z
    .union([z.string(), z.date()])
    .optional()
    .transform((value) => (value instanceof Date ? value.toISOString() : value)),
  clase: z
    .object({
      rutaCurricular: rutaCurricularDetalleSchema.optional(),
      ruta_curricular: rutaCurricularDetalleSchema.optional(),
    })
    .optional(),
});

export const estudianteDetalleSchema = estudianteSchema
  .extend({
    perfil_gamificacion: z
      .object({
        nivel: z.number(),
        puntos_totales: z.number(),
        insignias_estudiante: z.array(insigniaEstudianteSchema),
      })
      .nullable()
      .optional(),
    inscripciones_clase: z.array(inscripcionClaseDetalleSchema).optional().default([]),
    asistencias: z.array(asistenciaDetalleSchema).optional().default([]),
    estadisticas: z.object({
      total_clases: z.number(),
      clases_presente: z.number(),
      tasa_asistencia: z.number(),
      nivel: z.number().optional(),
      puntos: z.number().optional(),
      insignias: z.number().optional(),
      logros: z.number().optional(),
    }),
  })
  .transform((value) => ({
    ...value,
    inscripciones_clase: value.inscripciones_clase.map((inscripcion) => ({
      ...inscripcion,
      clase: {
        ...inscripcion.clase,
        ruta_curricular:
          inscripcion.clase.ruta_curricular ?? inscripcion.clase.rutaCurricular ?? null,
      },
    })),
    asistencias: value.asistencias.map((asistencia) => ({
      ...asistencia,
      clase: asistencia.clase
        ? {
            ...asistencia.clase,
            rutaCurricular:
              asistencia.clase.rutaCurricular ?? asistencia.clase.ruta_curricular ?? undefined,
          }
        : undefined,
    })),
  }));

/**
 * Derivar tipos desde los schemas (single source of truth)
 * Estos tipos se usan en lugar de los tipos manuales para garantizar sincronización
 */
export type EstudianteFromSchema = z.infer<typeof estudianteSchema>;
export type EstudiantesResponseFromSchema = z.infer<typeof estudiantesResponseSchema>;
export type EstadisticasEstudiantesFromSchema = z.infer<typeof estadisticasEstudiantesSchema>;
export type EstudianteDetalleFromSchema = z.infer<typeof estudianteDetalleSchema>;
