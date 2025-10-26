import { z } from 'zod';

// ============================================================================
// CLASE SCHEMAS
// ============================================================================

/**
 * Enum para estado de clase
 */
export const estadoClaseEnum = z.enum(['Programada', 'Cancelada']);

export type EstadoClase = z.infer<typeof estadoClaseEnum>;

/**
 * Objeto constante runtime para acceder a valores de EstadoClase
 * SINGLE SOURCE OF TRUTH para estados de clase
 */
export const ESTADO_CLASE = {
  Programada: 'Programada',
  Cancelada: 'Cancelada',
} as const satisfies Record<EstadoClase, EstadoClase>;

/**
 * Enum para estado de asistencia
 */
export const estadoAsistenciaEnum = z.enum(['Presente', 'Ausente', 'Justificado']);

export type EstadoAsistencia = z.infer<typeof estadoAsistenciaEnum>;

/**
 * Objeto constante runtime para acceder a valores de EstadoAsistencia
 */
export const ESTADO_ASISTENCIA = {
  Presente: 'Presente',
  Ausente: 'Ausente',
  Justificado: 'Justificado',
} as const satisfies Record<EstadoAsistencia, EstadoAsistencia>;

/**
 * Schema base de Clase
 */
export const claseSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  ruta_curricular_id: z.string().nullable().optional(),
  docente_id: z.string(),
  sector_id: z.string().nullable().optional(),
  fecha_hora_inicio: z.string().datetime(),
  duracion_minutos: z.number().int().positive('La duración debe ser positiva'),
  descripcion: z.string().nullable().optional(),
  estado: estadoClaseEnum,
  cupos_maximo: z.number().int().positive(),
  cupos_ocupados: z.number().int().nonnegative(),
  producto_id: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Clase = z.infer<typeof claseSchema>;

/**
 * Schema para crear clase
 */
export const createClaseSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  ruta_curricular_id: z.string().optional(),
  docente_id: z.string(),
  sector_id: z.string().optional(),
  fecha_hora_inicio: z.string().datetime(),
  duracion_minutos: z.number().int().positive('La duración debe ser positiva'),
  descripcion: z.string().optional(),
  cupos_maximo: z.number().int().positive('El cupo máximo debe ser positivo'),
  producto_id: z.string().optional(),
});

export type CreateClaseDto = z.infer<typeof createClaseSchema>;

/**
 * Schema para actualizar clase
 */
export const updateClaseSchema = createClaseSchema.partial();

export type UpdateClaseDto = z.infer<typeof updateClaseSchema>;

/**
 * Schema de Asistencia
 */
export const asistenciaSchema = z.object({
  id: z.string(),
  clase_id: z.string(),
  estudiante_id: z.string(),
  estado: estadoAsistenciaEnum,
  observaciones: z.string().nullable().optional(),
  puntos_otorgados: z.number().int().nonnegative(),
  fecha_registro: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Asistencia = z.infer<typeof asistenciaSchema>;

/**
 * Schema para lista de clases
 */
export const clasesListSchema = z.array(claseSchema);

export type ClasesList = z.infer<typeof clasesListSchema>;

/**
 * Schema para inscripción/reserva de clase
 */
export const inscripcionClaseSchema = z.object({
  id: z.string(),
  clase_id: z.string(),
  estudiante_id: z.string(),
  tutor_id: z.string(),
  observaciones: z.string().nullable().optional(),
  fecha_inscripcion: z.union([z.string().datetime(), z.date()]),
  createdAt: z.union([z.string().datetime(), z.date()]),
  updatedAt: z.union([z.string().datetime(), z.date()]),
  clase: claseSchema.optional(),
  estudiante: z
    .object({
      id: z.string(),
      nombre: z.string(),
      apellido: z.string(),
    })
    .optional(),
});

export type InscripcionClase = z.infer<typeof inscripcionClaseSchema>;

/**
 * DTO para reservar una clase
 */
export const reservarClaseSchema = z.object({
  estudianteId: z.string(),
  observaciones: z.string().optional(),
});

export type ReservarClaseInput = z.infer<typeof reservarClaseSchema>;
