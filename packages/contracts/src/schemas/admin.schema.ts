import { z } from 'zod';

// ============================================================================
// ADMIN SCHEMAS
// ============================================================================

/**
 * Schema para estadísticas del dashboard
 */
export const dashboardStatsSchema = z.object({
  totalEstudiantes: z.number().int().nonnegative(),
  totalDocentes: z.number().int().nonnegative(),
  totalClases: z.number().int().nonnegative(),
  clasesHoy: z.number().int().nonnegative(),
  estudiantesActivos: z.number().int().nonnegative(),
  ingresosMesActual: z.number().nonnegative(),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

/**
 * Schema para alerta administrativa
 */
export const alertaSchema = z.object({
  id: z.string(),
  estudiante_id: z.string(),
  clase_id: z.string(),
  descripcion: z.string(),
  fecha: z.string().datetime(),
  resuelta: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Alerta = z.infer<typeof alertaSchema>;

/**
 * Schema para lista de alertas
 */
export const alertasListSchema = z.array(alertaSchema);

export type AlertasList = z.infer<typeof alertasListSchema>;

/**
 * Schema para respuesta genérica con mensaje
 */
export const messageResponseSchema = z.object({
  message: z.string(),
});

export type MessageResponse = z.infer<typeof messageResponseSchema>;
