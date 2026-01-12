import { z } from 'zod';
import { slideBaseSchema } from '../base.schema';

// Contenido genérico para layouts (puede ser texto, imagen, etc.)
const layoutContentSchema = z.object({
  type: z.enum(['text', 'image', 'video', 'component']),
  value: z.string(),
});

// SPLIT - Forzar 50/50 columnas
export const splitIntentSchema = slideBaseSchema.extend({
  intent: z.literal('split'),
  props: z.object({
    left: layoutContentSchema,
    right: layoutContentSchema,
    ratio: z.enum(['50/50', '40/60', '60/40', '30/70', '70/30']).default('50/50'),
  }),
});

export type SplitIntent = z.infer<typeof splitIntentSchema>;

// BENTO - Grid flexible
export const bentoIntentSchema = slideBaseSchema.extend({
  intent: z.literal('bento'),
  props: z.object({
    items: z
      .array(
        z.object({
          content: layoutContentSchema,
          span: z.enum(['1', '2', '3']).default('1'),
        }),
      )
      .min(2)
      .max(6),
    columns: z.enum(['2', '3', '4']).default('3'),
  }),
});

export type BentoIntent = z.infer<typeof bentoIntentSchema>;

// Union de todos los intents de layout
export const layoutIntentSchema = z.discriminatedUnion('intent', [
  splitIntentSchema,
  bentoIntentSchema,
]);

export type LayoutIntent = z.infer<typeof layoutIntentSchema>;
