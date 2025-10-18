import { z } from 'zod';

// ============================================================================
// EQUIPO SCHEMAS
// ============================================================================

/**
 * Schema para estudiante en equipo (simplificado)
 */
export const estudianteEnEquipoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  puntos_totales: z.number(),
  nivel_actual: z.number().optional(),
});

export type EstudianteEnEquipo = z.infer<typeof estudianteEnEquipoSchema>;

/**
 * Schema base de Equipo
 */
export const equipoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  color_primario: z.string(),
  color_secundario: z.string(),
  icono_url: z.string().nullable().optional(),
  puntos_totales: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  estudiantes: z.array(estudianteEnEquipoSchema).optional(),
});

export type Equipo = z.infer<typeof equipoSchema>;

/**
 * Schema para crear equipo
 */
export const createEquipoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  color_primario: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color primario debe ser un hex válido'),
  color_secundario: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color secundario debe ser un hex válido'),
  icono_url: z.string().optional(),
});

export type CreateEquipoDto = z.infer<typeof createEquipoSchema>;

/**
 * Schema para actualizar equipo
 */
export const updateEquipoSchema = createEquipoSchema.partial();

export type UpdateEquipoDto = z.infer<typeof updateEquipoSchema>;

/**
 * Schema para lista de equipos
 */
export const equiposListSchema = z.array(equipoSchema);

export type EquiposList = z.infer<typeof equiposListSchema>;

/**
 * Schema para response paginada de equipos
 */
export const equiposResponseSchema = z.object({
  data: z.array(equipoSchema),
  metadata: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type EquiposResponse = z.infer<typeof equiposResponseSchema>;

/**
 * Schema para ranking de equipo
 */
export const equipoRankingSchema = z.object({
  posicion: z.number(),
  id: z.string(),
  nombre: z.string(),
  puntos_totales: z.number(),
  cantidad_estudiantes: z.number(),
});

export type EquipoRanking = z.infer<typeof equipoRankingSchema>;

/**
 * Schema para estadísticas de equipos
 */
export const equiposEstadisticasSchema = z.object({
  totalEquipos: z.number(),
  totalEstudiantes: z.number(),
  promedioEstudiantesPorEquipo: z.number(),
  ranking: z.array(equipoRankingSchema),
});

export type EquiposEstadisticas = z.infer<typeof equiposEstadisticasSchema>;

/**
 * Schema para respuesta de eliminación de equipo
 */
export const deleteEquipoResponseSchema = z.object({
  message: z.string(),
  estudiantesDesvinculados: z.number(),
});

export type DeleteEquipoResponse = z.infer<typeof deleteEquipoResponseSchema>;
