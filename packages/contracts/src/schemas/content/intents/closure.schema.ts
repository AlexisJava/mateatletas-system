import { z } from 'zod';
import { slideBaseSchema } from '../base.schema';

// SUMMARY - Recap de puntos clave
export const summaryIntentSchema = slideBaseSchema.extend({
  intent: z.literal('summary'),
  props: z.object({
    points: z.array(z.string()).min(1).max(5),
    takeaway: z.string().optional(),
  }),
});

export type SummaryIntent = z.infer<typeof summaryIntentSchema>;

// NEXT STEPS - Motivar siguiente lección
export const nextStepsIntentSchema = slideBaseSchema.extend({
  intent: z.literal('nextSteps'),
  props: z.object({
    nextLessonId: z.string().optional(),
    nextLessonTitle: z.string().optional(),
    teaser: z.string(),
    encouragement: z.string().optional(),
  }),
});

export type NextStepsIntent = z.infer<typeof nextStepsIntentSchema>;

// Union de todos los intents de cierre
export const closureIntentSchema = z.discriminatedUnion('intent', [
  summaryIntentSchema,
  nextStepsIntentSchema,
]);

export type ClosureIntent = z.infer<typeof closureIntentSchema>;
