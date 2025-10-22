import { z } from 'zod';
import { sectorSchema } from './sector.schema';

/**
 * Schema de DocenteRuta (relación docente-ruta)
 * Coincide con DocenteRuta en types/sectores.types.ts
 */
export const docenteRutaSchema = z.object({
  id: z.string(),
  docenteId: z.string(),
  rutaId: z.string(),
  sectorId: z.string(),
  asignadoEn: z.string(),

  // Relaciones opcionales
  ruta: z.lazy(() => z.any()).optional(), // RutaEspecialidad - lazy to avoid circular dependency
  sector: sectorSchema.optional(),
  docente: z.object({
    id: z.string(),
    nombre: z.string(),
    apellido: z.string(),
    email: z.string(),
  }).optional(),
});

/**
 * Schema de RutaEspecialidad (Ruta Curricular)
 * Coincide con RutaEspecialidad en types/sectores.types.ts
 * Representa una especialidad o área de estudio dentro de un sector
 */
export const rutaEspecialidadSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string().optional(),
  sectorId: z.string().optional(), // Opcional: puede no venir en algunos endpoints
  activo: z.boolean().optional(), // Opcional: puede no venir en algunos endpoints
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  color: z.string().optional(), // Color de la ruta (puede venir del backend)

  // Relaciones opcionales
  sector: sectorSchema.optional(),
  docentes: z.array(docenteRutaSchema).optional(),
  _count: z.object({
    docentes: z.number(),
  }).optional(),
});

/**
 * Alias para compatibilidad (RutaCurricular = RutaEspecialidad)
 */
export const rutaCurricularSchema = rutaEspecialidadSchema;

/**
 * Schema para lista de rutas
 */
export const rutasListSchema = z.array(rutaEspecialidadSchema);

/**
 * Schema para respuesta paginada
 */
export const rutasResponseSchema = z.object({
  data: z.array(rutaEspecialidadSchema),
  metadata: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }).optional(),
});

/**
 * Schema para crear ruta
 * Coincide con CreateRutaEspecialidadDto en types/sectores.types.ts
 */
export const createRutaSchema = z.object({
  nombre: z.string(),
  descripcion: z.string().optional(),
  sectorId: z.string(),
  activo: z.boolean().optional(),
});

/**
 * Schema para actualizar ruta
 * Coincide con UpdateRutaEspecialidadDto en types/sectores.types.ts
 */
export const updateRutaSchema = z.object({
  nombre: z.string().optional(),
  descripcion: z.string().optional(),
  sectorId: z.string().optional(),
  activo: z.boolean().optional(),
});

/**
 * Schema para asignar rutas a docente
 * Coincide con AsignarRutasDocenteDto en types/sectores.types.ts
 */
export const asignarRutasDocenteSchema = z.object({
  rutaIds: z.array(z.string()),
});

/**
 * Schema para filtrar rutas por sector
 */
export const filtroRutasSchema = z.object({
  sectorId: z.string().optional(),
  activo: z.boolean().optional(),
});

// ============================================
// TIPOS DERIVADOS
// ============================================

export type RutaEspecialidadFromSchema = z.infer<typeof rutaEspecialidadSchema>;
export type RutaCurricularFromSchema = RutaEspecialidadFromSchema; // Alias
export type DocenteRutaFromSchema = z.infer<typeof docenteRutaSchema>;
export type CreateRutaInput = z.infer<typeof createRutaSchema>;
export type UpdateRutaInput = z.infer<typeof updateRutaSchema>;
export type AsignarRutasDocenteInput = z.infer<typeof asignarRutasDocenteSchema>;
export type FiltroRutasInput = z.infer<typeof filtroRutasSchema>;
export type RutasResponse = z.infer<typeof rutasResponseSchema>;
