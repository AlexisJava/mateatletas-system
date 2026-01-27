/**
 * Narrative Intent Schemas
 *
 * Schemas that match the actual component props in:
 * - StoryIntent
 * - DialogueIntent
 * - MascotSpeechIntent
 */

import { z } from 'zod';
import { nonEmptyString, optionalString } from './base.schema';

// =============================================================================
// STORY INTENT
// =============================================================================

const storySegmentSchema = z.object({
  text: nonEmptyString,
  mood: z.enum(['happy', 'thinking', 'celebrating', 'sad', 'excited']).optional(),
  image: optionalString,
});

export const storyIntentSchema = z.object({
  intent: z.literal('narrative:story'),
  title: optionalString,
  segments: z.array(storySegmentSchema).min(1).max(20),
  showDots: z.boolean().default(true),
  showMascot: z.boolean().default(true),
});

export type StoryIntentData = z.infer<typeof storyIntentSchema>;

// =============================================================================
// DIALOGUE INTENT
// =============================================================================

const dialogueChoiceSchema = z.object({
  text: nonEmptyString,
  nextTurn: z.number().int().min(0).optional(),
});

const dialogueTurnSchema = z.object({
  speaker: z.enum(['bit', 'user', 'character']),
  message: z.string(), // Can be empty for user turns
  mood: z.enum(['happy', 'thinking', 'celebrating', 'sad', 'excited']).optional(),
  characterName: optionalString,
  choices: z.array(dialogueChoiceSchema).optional(),
});

export const dialogueIntentSchema = z.object({
  intent: z.literal('narrative:dialogue'),
  title: optionalString,
  turns: z.array(dialogueTurnSchema).min(1).max(50),
  showMascot: z.boolean().default(true),
});

export type DialogueIntentData = z.infer<typeof dialogueIntentSchema>;

// =============================================================================
// MASCOT SPEECH INTENT
// =============================================================================

export const mascotSpeechIntentSchema = z.object({
  intent: z.literal('narrative:mascot-speech'),
  message: nonEmptyString,
  type: z
    .enum(['motivation', 'encouragement', 'celebration', 'tip', 'introduction'])
    .default('introduction'),
  mood: z.enum(['happy', 'thinking', 'celebrating', 'sad', 'excited']).default('happy'),
  title: optionalString,
  subtitle: optionalString,
  ctaText: z.string().default('Continuar'),
});

export type MascotSpeechIntentData = z.infer<typeof mascotSpeechIntentSchema>;

// =============================================================================
// UNION
// =============================================================================

export const narrativeIntentSchema = z.discriminatedUnion('intent', [
  storyIntentSchema,
  dialogueIntentSchema,
  mascotSpeechIntentSchema,
]);

export type NarrativeIntentData = z.infer<typeof narrativeIntentSchema>;
