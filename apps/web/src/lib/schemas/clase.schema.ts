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
 * Schema de Sector simplificado (para relación en Clase)
 */
const sectorEnClaseSchema = z
  .object({
    id: z.string(),
    nombre: z.string(),
    icono: z.string(),
    color: z.string(),
  })
  .nullish();

/**
 * Schema de Docente simplificado (para relación en Clase)
 */
const docenteEnClaseSchema = z
  .object({
    id: z.string().optional(),
    nombre: z.string().nullish(),
    apellido: z.string().nullish(),
    user: z
      .object({
        nombre: z.string(),
        apellido: z.string(),
      })
      .nullish(),
    sector: sectorEnClaseSchema,
  })
  .nullish();

/**
 * Schema de Estudiante simplificado (para inscripciones)
 */
const estudianteEnInscripcionSchema = z.object({
  id: z.string(),
  nombre: z.string().nullish(),
  apellido: z.string().nullish(),
});

/**
 * Schema de Inscripción a Clase
 */
export const inscripcionClaseSchema = z.object({
  id: z.string(),
  claseId: z.string().nullish(),
  estudianteId: z.string().nullish(),
  tutorId: z.string().nullish(),
  createdAt: z.string().nullish(),

  // Relaciones opcionales
  estudiante: estudianteEnInscripcionSchema.optional(),
});

/**
 * Schema principal de Clase
 * Coincide con el tipo Clase en types/clases.types.ts
 */
export const claseSchema = z.object({
  id: z.string(),
  docenteId: z.string().nullish(),
  rutaCurricularId: z.string().nullish(),

  // Fecha y hora
  fechaHoraInicio: z.string(), // ISO 8601 DateTime
  duracionMinutos: z.number().int().positive(),

  // Capacidad
  cupoMaximo: z.number().int().positive().nullish(),
  cupoDisponible: z.number().int().nonnegative().nullish(),
  cuposOcupados: z.number().int().nonnegative().nullish(),

  // Estado
  estado: estadoClaseSchema.nullish(),

  // Información adicional
  nombre: z.string().nullish(),
  titulo: z.string().nullish(),
  descripcion: z.string().nullish(),

  // Metadata
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),

  // Relaciones opcionales (cuando se incluyen en el response)
  docente: docenteEnClaseSchema,
  rutaCurricular: rutaCurricularEnClaseSchema.nullish(),
  sector: sectorEnClaseSchema,
  inscripciones: z.array(inscripcionClaseSchema).nullish(),
  producto: z
    .object({
      nombre: z.string(),
      tipo: z.string(),
    })
    .nullish(),
  _count: z
    .object({
      inscripciones: z.number(),
    })
    .nullish(),
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
    data: payload.data,
    meta: payload.meta ?? payload.metadata,
  }));

export const calendarioResponseSchema = z.object({
  mes: z.number().int(),
  anio: z.number().int(),
  clases: z.array(claseSchema),
  total: z.number().int(),
});

/**
 * Schema para crear una clase (sin id, sin timestamps)
 */
export const createClaseSchema = claseSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    docente: true,
    rutaCurricular: true,
    inscripciones: true,
  })
  .extend({
    cupoDisponible: z.number().int().nonnegative().optional(),
  });

/**
 * Schema para actualizar una clase (todos los campos opcionales excepto id)
 */
export const updateClaseSchema = claseSchema.partial().required({ id: true });

/**
 * Schema para filtros de clases
 */
export const filtroClasesSchema = z.object({
  rutaCurricularId: z.string().optional(),
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
  soloDisponibles: z.boolean().optional(),
});

/**
 * Schema para crear una reserva
 */
export const crearReservaSchema = z.object({
  estudianteId: z.string(),
  observaciones: z.string().optional(),
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
