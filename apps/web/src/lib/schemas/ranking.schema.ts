import { z } from 'zod';

const equipoResumenSchema = z
  .object({
    id: z.string(),
    nombre: z.string(),
    color: z.string().optional(),
    color_primario: z.string().optional(),
    color_secundario: z.string().optional(),
  })
  .passthrough();

const rankingIntegranteSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  avatar: z.string().nullable().optional(),
  puntos: z.number(),
});

const rankingGlobalItemSchema = rankingIntegranteSchema.extend({
  equipo: equipoResumenSchema.nullable().optional(),
  posicion: z.number().optional(),
});

export const rankingResponseSchema = z.object({
  equipoActual: equipoResumenSchema.nullable(),
  posicionEquipo: z.number(),
  posicionGlobal: z.number(),
  rankingEquipo: z.array(rankingIntegranteSchema),
  rankingGlobal: z.array(rankingGlobalItemSchema),
});

export type RankingResponse = z.infer<typeof rankingResponseSchema>;
