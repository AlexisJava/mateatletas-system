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
  nivel_escolar: nivelEscolarEnum,
  foto_url: z.string().nullable().optional(),
  avatar_url: z.string().default('avataaars'),
  tutor_id: z.string(),
  sector_id: z.string().nullable().optional(),
  equipo_id: z.string().nullable().optional(),
  puntos_totales: z.number().int().nonnegative().default(0),
  nivel_actual: z.number().int().positive().default(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Relaciones opcionales
  equipo: z.object({
    id: z.string(),
    nombre: z.string(),
    color_primario: z.string(),
    color_secundario: z.string(),
    icono_url: z.string().nullable().optional(),
    puntos_totales: z.number(),
  }).optional(),
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
  nivel_escolar: nivelEscolarEnum,
  foto_url: z.string().optional(),
  equipo_id: z.string().optional(),
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
  por_nivel: z.record(z.number()),
  por_equipo: z.record(z.number()),
  puntos_totales: z.number(),
});

export type EstadisticasEstudiantes = z.infer<typeof estadisticasEstudiantesSchema>;
