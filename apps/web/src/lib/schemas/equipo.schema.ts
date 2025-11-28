import { z } from 'zod';

/**
 * Schema de estudiante simplificado para equipos
 */
const estudianteEnEquipoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  puntos_totales: z.number(),
  nivel_actual: z.number().optional(),
});

/**
 * Schema principal de Equipo
 * Coincide EXACTAMENTE con el tipo Equipo en types/equipo.types.ts
 */
export const equipoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  color_primario: z.string(),
  color_secundario: z.string(),
  icono_url: z.string().nullable(),
  puntos_totales: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  estudiantes: z.array(estudianteEnEquipoSchema).optional(),
});

/**
 * Schema para respuesta paginada de equipos
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

/**
 * Schema para estadísticas de equipos
 */
export const equiposEstadisticasSchema = z.object({
  totalEquipos: z.number(),
  totalEstudiantes: z.number(),
  promedioEstudiantesPorEquipo: z.number(),
  ranking: z.array(
    z.object({
      posicion: z.number(),
      id: z.string(),
      nombre: z.string(),
      puntos_totales: z.number(),
      cantidad_estudiantes: z.number(),
    }),
  ),
});

/**
 * Schema para respuesta de eliminación
 */
export const deleteEquipoResponseSchema = z.object({
  message: z.string(),
  estudiantesDesvinculados: z.number(),
});

/**
 * Lista de equipos (sin paginación)
 */
export const equiposListSchema = z.array(equipoSchema);

/**
 * Derivar tipos desde los schemas
 */
export type EquipoSchemaType = z.infer<typeof equipoSchema>;
export type EquiposResponseSchemaType = z.infer<typeof equiposResponseSchema>;
export type EquiposEstadisticasSchemaType = z.infer<typeof equiposEstadisticasSchema>;
export type DeleteEquipoResponseSchemaType = z.infer<typeof deleteEquipoResponseSchema>;
