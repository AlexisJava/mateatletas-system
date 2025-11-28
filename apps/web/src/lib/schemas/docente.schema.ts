import { z } from 'zod';

/**
 * Schema principal de Docente
 * Coincide con el tipo Docente en lib/api/docentes.api.ts
 */
export const docenteSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  email: z.string().email(),
  telefono: z.string().nullish(),
  titulo: z.string().nullish(),
  titulo_profesional: z.string().nullish(),
  bio: z.string().nullish(),
  biografia: z.string().nullish(),
  especialidades: z.array(z.string()).nullish(),
  experiencia_anos: z.number().int().nonnegative().nullish(),
  disponibilidad_horaria: z.record(z.string(), z.array(z.string())).nullish(),
  nivel_educativo: z.array(z.string()).nullish(),
  estado: z.string().nullish(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

/**
 * Schema para lista de docentes
 */
export const docentesListSchema = z.array(docenteSchema);

/**
 * Schema para respuesta paginada
 */
export const docentesResponseSchema = z.object({
  data: z.array(docenteSchema),
  metadata: z
    .object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    })
    .optional(),
});

/**
 * Schema para crear docente
 * Coincide con CreateDocenteData en lib/api/docentes.api.ts
 */
export const createDocenteSchema = z.object({
  email: z.string().email(),
  password: z.string().optional(), // Se autogenera si se omite
  nombre: z.string(),
  apellido: z.string(),
  titulo: z.string().optional(),
  telefono: z.string().optional(),
  disponibilidad_horaria: z.record(z.string(), z.array(z.string())).optional(),
  estado: z.string().optional(),
});

/**
 * Schema para actualizar docente
 * Coincide con UpdateDocenteData en lib/api/docentes.api.ts
 */
export const updateDocenteSchema = z.object({
  nombre: z.string().optional(),
  apellido: z.string().optional(),
  telefono: z.string().optional(),
  titulo: z.string().optional(),
  titulo_profesional: z.string().optional(),
  bio: z.string().optional(),
  biografia: z.string().optional(),
  especialidades: z.array(z.string()).optional(),
  experiencia_anos: z.number().int().nonnegative().optional(),
  disponibilidad_horaria: z.record(z.string(), z.array(z.string())).optional(),
  nivel_educativo: z.array(z.string()).optional(),
  estado: z.string().optional(),
});

/**
 * Schema para respuesta al crear docente
 */
export const createDocenteResponseSchema = z.object({
  docente: docenteSchema,
  generatedPassword: z.string().optional(),
});

// ============================================
// TIPOS DERIVADOS
// ============================================

export type DocenteFromSchema = z.infer<typeof docenteSchema>;
export type CreateDocenteInput = z.infer<typeof createDocenteSchema>;
export type UpdateDocenteInput = z.infer<typeof updateDocenteSchema>;
export type CreateDocenteResponse = z.infer<typeof createDocenteResponseSchema>;
export type DocentesResponse = z.infer<typeof docentesResponseSchema>;
