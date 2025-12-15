import { z } from 'zod';

/**
 * Schema de estudiante simplificado para casas
 */
const estudianteEnCasaSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  puntos_totales: z.number(),
  nivel_actual: z.number().optional(),
});

/**
 * Schema principal de Casa
 * Coincide EXACTAMENTE con el tipo Casa en types/casa.types.ts
 */
export const casaSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  color_primario: z.string(),
  color_secundario: z.string(),
  icono_url: z.string().nullable(),
  puntos_totales: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  estudiantes: z.array(estudianteEnCasaSchema).optional(),
});

/**
 * Schema para respuesta paginada de casas
 */
export const casasResponseSchema = z.object({
  data: z.array(casaSchema),
  metadata: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

/**
 * Schema para estadísticas de casas
 */
export const casasEstadisticasSchema = z.object({
  totalCasas: z.number(),
  totalEstudiantes: z.number(),
  promedioEstudiantesPorCasa: z.number(),
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
export const deleteCasaResponseSchema = z.object({
  message: z.string(),
  estudiantesDesvinculados: z.number(),
});

/**
 * Lista de casas (sin paginación)
 */
export const casasListSchema = z.array(casaSchema);

/**
 * Derivar tipos desde los schemas
 */
export type CasaSchemaType = z.infer<typeof casaSchema>;
export type CasasResponseSchemaType = z.infer<typeof casasResponseSchema>;
export type CasasEstadisticasSchemaType = z.infer<typeof casasEstadisticasSchema>;
export type DeleteCasaResponseSchemaType = z.infer<typeof deleteCasaResponseSchema>;
