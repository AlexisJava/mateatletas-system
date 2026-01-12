import { z } from 'zod';
import { slideBaseSchema } from '../base.schema';

// QUIZ - Multiple choice con feedback
export const quizIntentSchema = slideBaseSchema.extend({
  intent: z.literal('quiz'),
  props: z.object({
    question: z.string().min(1),
    options: z.array(z.string()).min(2).max(6),
    correctIndex: z.number().int().min(0),
    feedback: z
      .object({
        correct: z.string(),
        incorrect: z.string(),
      })
      .optional(),
    shuffle: z.boolean().default(false),
    timeLimit: z.number().positive().optional(),
  }),
});

export type QuizIntent = z.infer<typeof quizIntentSchema>;

// MATCH - Conectar pares relacionados
export const matchIntentSchema = slideBaseSchema.extend({
  intent: z.literal('match'),
  props: z.object({
    instruction: z.string().optional(),
    pairs: z
      .array(
        z.object({
          left: z.string(),
          right: z.string(),
        }),
      )
      .min(2)
      .max(6),
    shuffle: z.boolean().default(true),
  }),
});

export type MatchIntent = z.infer<typeof matchIntentSchema>;

// SORT - Ordenar elementos
export const sortIntentSchema = slideBaseSchema.extend({
  intent: z.literal('sort'),
  props: z.object({
    instruction: z.string().optional(),
    items: z.array(z.string()).min(2).max(8),
    correctOrder: z.array(z.number().int()),
  }),
});

export type SortIntent = z.infer<typeof sortIntentSchema>;

// Union de todos los intents de interacción
export const interactionIntentSchema = z.discriminatedUnion('intent', [
  quizIntentSchema,
  matchIntentSchema,
  sortIntentSchema,
]);

export type InteractionIntent = z.infer<typeof interactionIntentSchema>;
