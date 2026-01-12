import { z } from 'zod';
import { slideBaseSchema } from '../base.schema';

export const mascotMoodEnum = z.enum(['happy', 'thinking', 'excited', 'confused', 'celebrating']);
export type MascotMood = z.infer<typeof mascotMoodEnum>;

// MASCOT - BIT guía/comenta
export const mascotIntentSchema = slideBaseSchema.extend({
  intent: z.literal('mascot'),
  props: z.object({
    mood: mascotMoodEnum.default('happy'),
    message: z.string().min(1),
    position: z.enum(['left', 'right', 'center']).default('left'),
  }),
});

export type MascotIntent = z.infer<typeof mascotIntentSchema>;

// CONVERSATION - Diálogo entre personajes
export const conversationIntentSchema = slideBaseSchema.extend({
  intent: z.literal('conversation'),
  props: z.object({
    speakers: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          avatar: z.string().optional(),
        }),
      )
      .min(1),
    messages: z
      .array(
        z.object({
          speakerId: z.string(),
          text: z.string(),
        }),
      )
      .min(1),
  }),
});

export type ConversationIntent = z.infer<typeof conversationIntentSchema>;

// Union de todos los intents narrativos
export const narrativeIntentSchema = z.discriminatedUnion('intent', [
  mascotIntentSchema,
  conversationIntentSchema,
]);

export type NarrativeIntent = z.infer<typeof narrativeIntentSchema>;
