import { z } from 'zod';
import {
  ISODateSchema,
  SystemHealthStatusSchema,
  UUIDSchema,
  EmailSchema,
  RoleSchema,
  NonNegativeNumberSchema,
} from '../../shared/schemas/common.schema';
import { SystemStatsSchema } from '../../stats/types/stats.schema';

/**
 * Schema para UserSummary
 */
export const UserSummarySchema = z.object({
  id: UUIDSchema,
  email: EmailSchema,
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  role: RoleSchema,
  createdAt: ISODateSchema,
});

export type UserSummary = z.infer<typeof UserSummarySchema>;

/**
 * Schema para ClassSummary
 */
export const ClassSummarySchema = z.object({
  id: UUIDSchema,
  titulo: z.string().min(1),
  docenteNombre: z.string().min(1),
  fechaHora: ISODateSchema,
  estado: z.string(),
  inscritos: NonNegativeNumberSchema,
});

export type ClassSummary = z.infer<typeof ClassSummarySchema>;

/**
 * Schema para SystemHealth
 */
export const SystemHealthSchema = z.object({
  database: SystemHealthStatusSchema,
  api: SystemHealthStatusSchema,
  lastCheck: ISODateSchema,
});

export type SystemHealth = z.infer<typeof SystemHealthSchema>;

/**
 * Schema para DashboardData
 */
export const DashboardDataSchema = z.object({
  stats: SystemStatsSchema,
  recentUsers: z.array(UserSummarySchema),
  recentClasses: z.array(ClassSummarySchema),
  systemHealth: SystemHealthSchema,
});

export type DashboardData = z.infer<typeof DashboardDataSchema>;

/**
 * Parser seguro con manejo de errores
 */
export function parseDashboardData(data: unknown): DashboardData {
  return DashboardDataSchema.parse(data);
}

/**
 * Parser seguro que retorna null en caso de error
 */
export function safeParseDashboardData(data: unknown): DashboardData | null {
  const result = DashboardDataSchema.safeParse(data);
  return result.success ? result.data : null;
}
