import { z } from 'zod';

/**
 * Estado de una planificación mensual.
 * Mantiene sincronía con el enum `EstadoPlanificacion` del backend (Prisma/Nest).
 */
export const estadoPlanificacionEnum = z.enum([
  'BORRADOR',
  'PUBLICADA',
  'ARCHIVADA',
]);

export type EstadoPlanificacion = z.infer<typeof estadoPlanificacionEnum>;

const isoDate = z.union([z.string().datetime(), z.date()]);

/**
 * Información del grupo pedagógico asociado a la planificación.
 */
export const planificacionGrupoSchema = z.object({
  id: z.string(),
  codigo: z.string(),
  nombre: z.string(),
});

/**
 * Schema base para un item de planificación en listados.
 */
export const planificacionListItemSchema = z.object({
  id: z.string(),
  grupo_id: z.string(),
  codigo_grupo: z.string().optional(),
  grupo: planificacionGrupoSchema.optional(),
  mes: z.number().int().min(1).max(12),
  anio: z.number().int().min(2020),
  titulo: z.string(),
  descripcion: z.string(),
  tematica_principal: z.string(),
  objetivos_aprendizaje: z.array(z.string()),
  estado: estadoPlanificacionEnum,
  created_by_admin_id: z.string(),
  notas_docentes: z.string().nullable(),
  fecha_publicacion: isoDate.nullable(),
  created_at: isoDate,
  updated_at: isoDate,
  total_actividades: z.number().int().nonnegative(),
  total_asignaciones: z.number().int().nonnegative(),
});

export type PlanificacionListItem = z.infer<typeof planificacionListItemSchema>;

/**
 * Respuesta paginada para listados de planificaciones.
 */
export const planificacionListResponseSchema = z.object({
  data: z.array(planificacionListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total_pages: z.number().int().nonnegative(),
});

export type PlanificacionListResponse = z.infer<typeof planificacionListResponseSchema>;

/**
 * Componentes soportados por las actividades semanales.
 */
export const componenteActividadEnum = z.enum([
  'juego',
  'video',
  'pdf',
  'ejercicio',
]);

export type ComponenteActividad = z.infer<typeof componenteActividadEnum>;

/**
 * Schema de una actividad asociada a la planificación.
 */
export const planificacionActividadSchema = z.object({
  id: z.string(),
  planificacion_id: z.string(),
  semana: z.number().int().min(1),
  componente: componenteActividadEnum,
  descripcion: z.string(),
  props: z.record(z.unknown()),
  orden: z.number().int().nonnegative(),
  createdAt: isoDate,
  updatedAt: isoDate,
});

export type PlanificacionActividad = z.infer<typeof planificacionActividadSchema>;

/**
 * Detalle completo de una planificación mensual, incluye actividades.
 */
export const planificacionDetalleSchema = planificacionListItemSchema.extend({
  actividades: z.array(planificacionActividadSchema),
});

export type PlanificacionDetalle = z.infer<typeof planificacionDetalleSchema>;

/**
 * Entrada para crear una planificación mensual.
 */
export const createPlanificacionSchema = z.object({
  grupo_id: z.string(),
  mes: z.number().int().min(1).max(12),
  anio: z.number().int().min(2020),
  titulo: z.string().min(3),
  descripcion: z.string().optional(),
  tematica_principal: z.string().min(3),
  objetivos_aprendizaje: z.array(z.string()).optional(),
  notas_docentes: z.string().optional(),
});

export type CreatePlanificacionInput = z.infer<typeof createPlanificacionSchema>;

/**
 * Entrada para actualizar una planificación existente.
 */
export const updatePlanificacionSchema = z
  .object({
    titulo: z.string().min(3).optional(),
    descripcion: z.string().optional(),
    estado: estadoPlanificacionEnum.optional(),
    tematica_principal: z.string().min(3).optional(),
    objetivos_aprendizaje: z.array(z.string()).optional(),
    notas_docentes: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar la planificación',
  });

export type UpdatePlanificacionInput = z.infer<typeof updatePlanificacionSchema>;

/**
 * Entrada para crear o actualizar actividades.
 */
export const createActividadSchema = z.object({
  semana: z.number().int().min(1).max(6),
  componente: componenteActividadEnum,
  descripcion: z.string(),
  props: z.record(z.unknown()),
  orden: z.number().int().nonnegative(),
  planificacion_id: z.string().optional(),
});

export type CreateActividadInput = z.infer<typeof createActividadSchema>;
