import { z } from 'zod';

// Enums compartidos
export const areaEnum = z.enum(['math', 'code', 'science']);
export const houseEnum = z.enum(['quantum', 'vertex', 'pulsar']);
export const animateEnum = z.enum(['fade', 'slide', 'scale', 'pop', 'none']);

// Tipos inferidos
export type Area = z.infer<typeof areaEnum>;
export type House = z.infer<typeof houseEnum>;
export type AnimateType = z.infer<typeof animateEnum>;

// Schema base para todos los slides
export const slideBaseSchema = z.object({
  animate: animateEnum.default('fade'),
  delay: z.number().default(0),
  on: z
    .object({
      complete: z
        .object({
          xp: z.number().optional(),
          achievement: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

export type SlideBase = z.infer<typeof slideBaseSchema>;
