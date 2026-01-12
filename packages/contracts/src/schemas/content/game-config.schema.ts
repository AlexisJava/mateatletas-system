import { z } from 'zod';
import { areaEnum, houseEnum } from './base.schema';

// Schema base para todos los game configs
export const baseGameConfigSchema = z.object({
  title: z.string().min(1),
  instruction: z.string().min(1),
  duration: z.number().positive().optional(),
  lives: z.number().int().positive().default(3),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  area: areaEnum,
  house: houseEnum,
});

export type BaseGameConfig = z.infer<typeof baseGameConfigSchema>;

// Los schemas específicos de cada template (catcher, match3, etc.)
// se implementan en FASE 4 cuando se construya game-engine
