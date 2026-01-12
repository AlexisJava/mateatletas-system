import { z } from 'zod';
import { slideBaseSchema } from '../base.schema';

// CHALLENGE - Pregunta con XP extra
export const challengeIntentSchema = slideBaseSchema.extend({
  intent: z.literal('challenge'),
  props: z.object({
    question: z.string().min(1),
    options: z.array(z.string()).min(2).max(6),
    correctIndex: z.number().int().min(0),
    xpBonus: z.number().positive(),
    timeLimit: z.number().positive().optional(),
    hint: z.string().optional(),
  }),
});

export type ChallengeIntent = z.infer<typeof challengeIntentSchema>;

// ACHIEVEMENT - Desbloqueo de logro
export const achievementIntentSchema = slideBaseSchema.extend({
  intent: z.literal('achievement'),
  props: z.object({
    achievementId: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    icon: z.string().optional(),
    celebration: z.enum(['confetti', 'fireworks', 'stars', 'none']).default('confetti'),
  }),
});

export type AchievementIntent = z.infer<typeof achievementIntentSchema>;

// Union de todos los intents de gamificación
export const gamificationIntentSchema = z.discriminatedUnion('intent', [
  challengeIntentSchema,
  achievementIntentSchema,
]);

export type GamificationIntent = z.infer<typeof gamificationIntentSchema>;
