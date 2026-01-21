import { z } from 'zod';

// ============================================================================
// ESTUDIANTE SCHEMAS
// ============================================================================

/**
 * Nivel escolar enum
 */
export const nivelEscolarEnum = z.enum(['Primaria', 'Secundaria', 'Universidad']);

/**
 * Schema base de Estudiante
 */
export const estudianteSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  email: z.string().email().nullable().optional(),
  edad: z.number().int().positive('La edad debe ser un número positivo'),
  nivelEscolar: nivelEscolarEnum,
  fotoUrl: z.string().nullable().optional(),
  avatarGradient: z.number().int().min(0).max(9).default(0),
  tutorId: z.string(),
  sectorId: z.string().nullable().optional(),
  equipoId: z.string().nullable().optional(),
  puntosTotales: z.number().int().nonnegative().default(0),
  nivelActual: z.number().int().positive().default(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Relaciones opcionales
  equipo: z
    .object({
      id: z.string(),
      nombre: z.string(),
      colorPrimario: z.string(),
      colorSecundario: z.string(),
      iconoUrl: z.string().nullable().optional(),
      puntosTotales: z.number(),
    })
    .optional(),
});

export type Estudiante = z.infer<typeof estudianteSchema>;

/**
 * Schema para crear estudiante
 */
export const createEstudianteSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').nullable().optional(),
  edad: z.number().int().positive('La edad debe ser un número positivo'),
  nivelEscolar: nivelEscolarEnum,
  fotoUrl: z.string().optional(),
  equipoId: z.string().optional(),
});

export type CreateEstudianteDto = z.infer<typeof createEstudianteSchema>;

/**
 * Schema para actualizar estudiante
 */
export const updateEstudianteSchema = createEstudianteSchema.partial();

export type UpdateEstudianteDto = z.infer<typeof updateEstudianteSchema>;

/**
 * Schema para lista de estudiantes
 */
export const estudiantesListSchema = z.array(estudianteSchema);

export type EstudiantesList = z.infer<typeof estudiantesListSchema>;

/**
 * Schema para response paginada de estudiantes
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

export type EstudiantesResponse = z.infer<typeof estudiantesResponseSchema>;

/**
 * Schema para estadísticas de estudiantes
 */
export const estadisticasEstudiantesSchema = z.object({
  total: z.number(),
  porNivel: z.record(z.number()),
  porEquipo: z.record(z.number()),
  puntosTotales: z.number(),
});

export type EstadisticasEstudiantes = z.infer<typeof estadisticasEstudiantesSchema>;
