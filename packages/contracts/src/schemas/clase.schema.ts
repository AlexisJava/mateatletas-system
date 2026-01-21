import { z } from 'zod';

// ============================================================================
// CLASE SCHEMAS
// ============================================================================

/**
 * Enum para estado de clase
 * Sincronizado con Prisma enum EstadoClase
 */
export const estadoClaseEnum = z.enum(['Programada', 'EnVivo', 'Finalizada', 'Cancelada']);

export type EstadoClase = z.infer<typeof estadoClaseEnum>;

/**
 * Objeto constante runtime para acceder a valores de EstadoClase
 * SINGLE SOURCE OF TRUTH para estados de clase
 */
export const ESTADO_CLASE = {
  Programada: 'Programada',
  EnVivo: 'EnVivo',
  Finalizada: 'Finalizada',
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
  rutaCurricularId: z.string().nullable().optional(),
  docenteId: z.string(),
  sectorId: z.string().nullable().optional(),
  fechaHoraInicio: z.string().datetime(),
  duracionMinutos: z.number().int().positive('La duración debe ser positiva'),
  descripcion: z.string().nullable().optional(),
  estado: estadoClaseEnum,
  cuposMaximo: z.number().int().positive(),
  cuposOcupados: z.number().int().nonnegative(),
  productoId: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Clase = z.infer<typeof claseSchema>;

/**
 * Schema para crear clase
 */
export const createClaseSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  rutaCurricularId: z.string().optional(),
  docenteId: z.string(),
  sectorId: z.string().optional(),
  fechaHoraInicio: z.string().datetime(),
  duracionMinutos: z.number().int().positive('La duración debe ser positiva'),
  descripcion: z.string().optional(),
  cuposMaximo: z.number().int().positive('El cupo máximo debe ser positivo'),
  productoId: z.string().optional(),
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
  claseId: z.string(),
  estudianteId: z.string(),
  estado: estadoAsistenciaEnum,
  observaciones: z.string().nullable().optional(),
  puntosOtorgados: z.number().int().nonnegative(),
  fechaRegistro: z.string().datetime(),
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
  claseId: z.string(),
  estudianteId: z.string(),
  tutorId: z.string(),
  observaciones: z.string().nullable().optional(),
  fechaInscripcion: z.union([z.string().datetime(), z.date()]),
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
