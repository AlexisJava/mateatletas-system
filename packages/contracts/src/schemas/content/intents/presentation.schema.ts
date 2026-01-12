import { z } from 'zod';
import { slideBaseSchema } from '../base.schema';

// HERO - Abrir lección con impacto
export const heroIntentSchema = slideBaseSchema.extend({
  intent: z.literal('hero'),
  props: z.object({
    title: z.string().min(1),
    subtitle: z.string().optional(),
    icon: z.string().optional(),
    background: z.string().optional(),
  }),
});

export type HeroIntent = z.infer<typeof heroIntentSchema>;

// DEFINE - Término nuevo + significado
export const defineIntentSchema = slideBaseSchema.extend({
  intent: z.literal('define'),
  props: z.object({
    term: z.string().min(1),
    definition: z.string().min(1),
    visual: z.string().optional(),
    example: z.string().optional(),
  }),
});

export type DefineIntent = z.infer<typeof defineIntentSchema>;

// EXPLAIN - Concepto + visual de soporte
export const explainIntentSchema = slideBaseSchema.extend({
  intent: z.literal('explain'),
  props: z.object({
    concept: z.string().min(1),
    visual: z.string().optional(),
    points: z.array(z.string()).optional(),
  }),
});

export type ExplainIntent = z.infer<typeof explainIntentSchema>;

// SHOWCASE - Stats/números para impresionar
export const showcaseIntentSchema = slideBaseSchema.extend({
  intent: z.literal('showcase'),
  props: z.object({
    items: z
      .array(
        z.object({
          stat: z.string(),
          label: z.string(),
          icon: z.string().optional(),
        }),
      )
      .min(1)
      .max(6),
  }),
});

export type ShowcaseIntent = z.infer<typeof showcaseIntentSchema>;

// Union de todos los intents de presentación
export const presentationIntentSchema = z.discriminatedUnion('intent', [
  heroIntentSchema,
  defineIntentSchema,
  explainIntentSchema,
  showcaseIntentSchema,
]);

export type PresentationIntent = z.infer<typeof presentationIntentSchema>;
