import { z } from 'zod';
import { NonNegativeNumberSchema } from '../../shared/schemas/common.schema';

/**
 * Schema Zod para SystemStats
 * Valida las estadísticas del sistema del admin
 */
export const SystemStatsSchema = z.object({
  totalUsuarios: NonNegativeNumberSchema,
  totalTutores: NonNegativeNumberSchema,
  totalDocentes: NonNegativeNumberSchema,
  totalEstudiantes: NonNegativeNumberSchema,
  totalClases: NonNegativeNumberSchema,
  clasesActivas: NonNegativeNumberSchema,
  totalProductos: NonNegativeNumberSchema,
  ingresosTotal: NonNegativeNumberSchema,
  pagosPendientes: NonNegativeNumberSchema,
  inscripcionesActivas: NonNegativeNumberSchema,
});

export type SystemStats = z.infer<typeof SystemStatsSchema>;

/**
 * Parser seguro con manejo de errores
 */
export function parseSystemStats(data: unknown): SystemStats {
  return SystemStatsSchema.parse(data);
}

/**
 * Parser seguro que retorna null en caso de error
 */
export function safeParseSystemStats(data: unknown): SystemStats | null {
  const result = SystemStatsSchema.safeParse(data);
  return result.success ? result.data : null;
}
