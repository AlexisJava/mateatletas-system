import { z } from 'zod';

/**
 * Schema de Estado de Clase
 * Coincide con EstadoClase enum en types/clases.types.ts
 */
export const estadoClaseSchema = z.enum(['Programada', 'EnCurso', 'Finalizada', 'Cancelada']);

/**
 * Schema de Ruta Curricular simplificado (para relación en Clase)
 */
const rutaCurricularEnClaseSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  color: z.string(),
  descripcion: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Schema de Docente simplificado (para relación en Clase)
 */
const docenteEnClaseSchema = z.object({
  id: z.string(),
  user: z.object({
    nombre: z.string(),
    apellido: z.string(),
  }).optional(),
});

/**
 * Schema de Estudiante simplificado (para inscripciones)
 */
const estudianteEnInscripcionSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  apellido: z.string(),
});

/**
 * Schema de Inscripción a Clase
 */
export const inscripcionClaseSchema = z.object({
  id: z.string(),
  clase_id: z.string(),
  estudiante_id: z.string(),
  tutor_id: z.string(),
  createdAt: z.string(),

  // Relaciones opcionales
  estudiante: estudianteEnInscripcionSchema.optional(),
});

/**
 * Schema principal de Clase
 * Coincide con el tipo Clase en types/clases.types.ts
 */
export const claseSchema = z.object({
  id: z.string(),
  docente_id: z.string(),
  ruta_curricular_id: z.string(),

  // Fecha y hora
  fecha_hora_inicio: z.string(), // ISO 8601 DateTime
  duracion_minutos: z.number().int().positive(),

  // Capacidad
  cupo_maximo: z.number().int().positive(),
  cupo_disponible: z.number().int().nonnegative(),

  // Estado
  estado: estadoClaseSchema,

  // Información adicional
  titulo: z.string().optional(),
  descripcion: z.string().optional(),

  // Metadata
  createdAt: z.string(),
  updatedAt: z.string(),

  // Relaciones opcionales (cuando se incluyen en el response)
  docente: docenteEnClaseSchema.optional(),
  ruta_curricular: rutaCurricularEnClaseSchema.optional(),
  rutaCurricular: rutaCurricularEnClaseSchema.optional().nullable(),
  inscripciones: z.array(inscripcionClaseSchema).optional(),
});

/**
 * Schema para lista de clases
 */
export const clasesListSchema = z.array(claseSchema);

/**
 * Schema para respuesta paginada de clases
 */
const paginationSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const clasesResponseSchema = z
  .object({
    data: z.array(claseSchema),
    meta: paginationSchema.optional(),
    metadata: paginationSchema.optional(),
  })
  .transform((payload) => ({
    data: payload.data.map((clase) => ({
      ...clase,
      ruta_curricular: clase.ruta_curricular ?? clase.rutaCurricular ?? undefined,
    })),
    meta: payload.meta ?? payload.metadata,
  }));

export const calendarioResponseSchema = z
  .object({
    mes: z.number().int(),
    anio: z.number().int(),
    clases: z.array(claseSchema),
    total: z.number().int(),
  })
  .transform((payload) => ({
    mes: payload.mes,
    anio: payload.anio,
    total: payload.total,
    clases: payload.clases.map((clase) => ({
      ...clase,
      ruta_curricular: clase.ruta_curricular ?? clase.rutaCurricular ?? undefined,
    })),
  }));

/**
 * Schema para crear una clase (sin id, sin timestamps)
 */
export const createClaseSchema = claseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  docente: true,
  ruta_curricular: true,
  inscripciones: true,
}).extend({
  cupo_disponible: z.number().int().nonnegative().optional(),
});

/**
 * Schema para actualizar una clase (todos los campos opcionales excepto id)
 */
export const updateClaseSchema = claseSchema.partial().required({ id: true });

/**
 * Schema para filtros de clases
 */
export const filtroClasesSchema = z.object({
  ruta_curricular_id: z.string().optional(),
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
  soloDisponibles: z.boolean().optional(),
});

/**
 * Schema para crear una reserva
 */
export const crearReservaSchema = z.object({
  estudiante_id: z.string(),
});

// ============================================
// TIPOS DERIVADOS
// ============================================

export type ClaseFromSchema = z.infer<typeof claseSchema>;
export type InscripcionClaseFromSchema = z.infer<typeof inscripcionClaseSchema>;
export type CreateClaseInput = z.infer<typeof createClaseSchema>;
export type UpdateClaseInput = z.infer<typeof updateClaseSchema>;
export type FiltroClasesInput = z.infer<typeof filtroClasesSchema>;
export type CrearReservaInput = z.infer<typeof crearReservaSchema>;
export type ClasesResponse = z.infer<typeof clasesResponseSchema>;
export type EstadoClase = z.infer<typeof estadoClaseSchema>;
export type CalendarioResponse = z.infer<typeof calendarioResponseSchema>;
