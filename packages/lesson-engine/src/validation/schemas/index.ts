/**
 * Intent Schemas
 *
 * All Zod schemas for intent validation.
 * These schemas match the ACTUAL component props in lesson-engine intents.
 */

// Base schemas
export * from './base.schema';

// Category schemas
export * from './presentation.schema';
export * from './interaction.schema';
export * from './narrative.schema';
export * from './gamification.schema';
export * from './layout.schema';
export * from './closure.schema';

// Re-export combined schema
import { z } from 'zod';
import { presentationIntentSchema } from './presentation.schema';
import { interactionIntentSchema } from './interaction.schema';
import { narrativeIntentSchema } from './narrative.schema';
import { gamificationIntentSchema } from './gamification.schema';
import { layoutIntentSchema } from './layout.schema';
import { closureIntentSchema } from './closure.schema';

/**
 * Master schema that validates any intent JSON.
 *
 * Uses discriminated union on the 'intent' field to select the correct schema.
 */
export const intentSchema = z.union([
  presentationIntentSchema,
  interactionIntentSchema,
  narrativeIntentSchema,
  gamificationIntentSchema,
  layoutIntentSchema,
  closureIntentSchema,
]);

export type IntentData = z.infer<typeof intentSchema>;

/**
 * Map of intent IDs to their specific schemas.
 * Useful for getting a schema for a specific intent.
 */
export const intentSchemaMap = {
  // Presentation
  'presentation:hero': z.object({ intent: z.literal('presentation:hero') }).passthrough(),
  'presentation:define': z.object({ intent: z.literal('presentation:define') }).passthrough(),
  'presentation:explain': z.object({ intent: z.literal('presentation:explain') }).passthrough(),
  'presentation:showcase': z.object({ intent: z.literal('presentation:showcase') }).passthrough(),
  'presentation:highlight': z.object({ intent: z.literal('presentation:highlight') }).passthrough(),

  // Interaction
  'interaction:quiz-mc': z.object({ intent: z.literal('interaction:quiz-mc') }).passthrough(),
  'interaction:quiz-tf': z.object({ intent: z.literal('interaction:quiz-tf') }).passthrough(),
  'interaction:drag-drop': z.object({ intent: z.literal('interaction:drag-drop') }).passthrough(),
  'interaction:matching': z.object({ intent: z.literal('interaction:matching') }).passthrough(),
  'interaction:fill-blank': z.object({ intent: z.literal('interaction:fill-blank') }).passthrough(),
  'interaction:sorting': z.object({ intent: z.literal('interaction:sorting') }).passthrough(),

  // Narrative
  'narrative:story': z.object({ intent: z.literal('narrative:story') }).passthrough(),
  'narrative:dialogue': z.object({ intent: z.literal('narrative:dialogue') }).passthrough(),
  'narrative:mascot-speech': z
    .object({ intent: z.literal('narrative:mascot-speech') })
    .passthrough(),

  // Gamification
  'gamification:reward': z.object({ intent: z.literal('gamification:reward') }).passthrough(),
  'gamification:achievement': z
    .object({ intent: z.literal('gamification:achievement') })
    .passthrough(),
  'gamification:challenge': z.object({ intent: z.literal('gamification:challenge') }).passthrough(),
  'gamification:leaderboard': z
    .object({ intent: z.literal('gamification:leaderboard') })
    .passthrough(),

  // Layout
  'layout:split': z.object({ intent: z.literal('layout:split') }).passthrough(),
  'layout:bento': z.object({ intent: z.literal('layout:bento') }).passthrough(),
  'layout:tabs': z.object({ intent: z.literal('layout:tabs') }).passthrough(),
  'layout:carousel': z.object({ intent: z.literal('layout:carousel') }).passthrough(),

  // Closure
  'closure:summary': z.object({ intent: z.literal('closure:summary') }).passthrough(),
  'closure:next-steps': z.object({ intent: z.literal('closure:next-steps') }).passthrough(),
  'closure:certificate': z.object({ intent: z.literal('closure:certificate') }).passthrough(),
} as const;

export type IntentId = keyof typeof intentSchemaMap;
