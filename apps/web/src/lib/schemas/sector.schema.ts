import { z } from 'zod';

/**
 * Schema principal de Sector
 * Coincide con el tipo Sector en types/sectores.types.ts
 * Representa un sector educativo (ej: Matemáticas, Ciencias, etc)
 */
export const sectorSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string().optional(),
  color: z.string(),
  icono: z.string(),
  activo: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),

  // Relaciones opcionales
  rutas: z.array(z.lazy(() => z.unknown())).optional(), // RutaEspecialidad[] - lazy to avoid circular dependency
  _count: z
    .object({
      rutas: z.number(),
      docentes: z.number(),
    })
    .optional(),
});

/**
 * Schema para lista de sectores
 */
export const sectoresListSchema = z.array(sectorSchema);

/**
 * Schema para respuesta paginada
 */
export const sectoresResponseSchema = z.object({
  data: z.array(sectorSchema),
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
 * Schema para crear sector
 * Coincide con CreateSectorDto en types/sectores.types.ts
 */
export const createSectorSchema = z.object({
  nombre: z.string(),
  descripcion: z.string().optional(),
  color: z.string().optional(),
  icono: z.string().optional(),
  activo: z.boolean().optional(),
});

/**
 * Schema para actualizar sector
 * Coincide con UpdateSectorDto en types/sectores.types.ts
 */
export const updateSectorSchema = z.object({
  nombre: z.string().optional(),
  descripcion: z.string().optional(),
  color: z.string().optional(),
  icono: z.string().optional(),
  activo: z.boolean().optional(),
});

// ============================================
// TIPOS DERIVADOS
// ============================================

export type SectorFromSchema = z.infer<typeof sectorSchema>;
export type CreateSectorInput = z.infer<typeof createSectorSchema>;
export type UpdateSectorInput = z.infer<typeof updateSectorSchema>;
export type SectoresResponse = z.infer<typeof sectoresResponseSchema>;
