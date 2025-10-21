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

/**
 * Derivar tipos desde los schemas (single source of truth)
 * Estos tipos se usan en lugar de los tipos manuales para garantizar sincronización
 */
export type EstudianteFromSchema = z.infer<typeof estudianteSchema>;
export type EstudiantesResponseFromSchema = z.infer<typeof estudiantesResponseSchema>;
export type EstadisticasEstudiantesFromSchema = z.infer<typeof estadisticasEstudiantesSchema>;
