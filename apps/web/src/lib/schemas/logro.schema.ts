import { z } from 'zod';

/**
 * Schema de Logro
 * Coincide con la interfaz Logro en store/cursos.store.ts
 */
export const logroSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string(),
});

/**
 * Schema para respuesta de completar lección
 */
export const completarLeccionResponseSchema = z.object({
  puntos_ganados: z.number(),
  logro_desbloqueado: logroSchema.nullable(),
});

/**
 * Derivar tipos desde los schemas
 */
export type LogroSchemaType = z.infer<typeof logroSchema>;
export type CompletarLeccionResponseSchemaType = z.infer<typeof completarLeccionResponseSchema>;
