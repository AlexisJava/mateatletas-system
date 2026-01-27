/**
 * Interaction Intent Schemas
 *
 * Schemas that match the actual component props in:
 * - QuizMCIntent
 * - QuizTFIntent
 * - DragDropIntent
 * - MatchingIntent
 * - FillBlankIntent
 * - SortingIntent
 */

import { z } from 'zod';
import {
  nonEmptyString,
  optionalString,
  quizOptionSchema,
  matchingPairSchema,
} from './base.schema';

// =============================================================================
// QUIZ MC INTENT
// =============================================================================

export const quizMCIntentSchema = z.object({
  intent: z.literal('interaction:quiz-mc'),
  question: nonEmptyString,
  options: z.array(quizOptionSchema).min(2).max(6),
  correctId: nonEmptyString,
  explanation: optionalString,
  feedback: z
    .object({
      correct: optionalString,
      incorrect: optionalString,
    })
    .optional(),
  combo: z.number().int().min(0).optional(),
  showMascot: z.boolean().default(true),
  xpReward: z.number().int().min(0).default(10),
});

export type QuizMCIntentData = z.infer<typeof quizMCIntentSchema>;

// =============================================================================
// QUIZ TF INTENT
// =============================================================================

export const quizTFIntentSchema = z.object({
  intent: z.literal('interaction:quiz-tf'),
  statement: nonEmptyString,
  correctAnswer: z.boolean(),
  correctFeedback: optionalString,
  incorrectFeedback: optionalString,
  explanation: optionalString,
  showMascot: z.boolean().default(true),
  xpReward: z.number().int().min(0).default(10),
});

export type QuizTFIntentData = z.infer<typeof quizTFIntentSchema>;

// =============================================================================
// DRAG DROP INTENT
// =============================================================================

const dragDropItemSchema = z.object({
  id: nonEmptyString,
  content: nonEmptyString,
  image: optionalString,
});

export const dragDropIntentSchema = z.object({
  intent: z.literal('interaction:drag-drop'),
  instruction: nonEmptyString,
  items: z.array(dragDropItemSchema).min(2).max(10),
  correctOrder: z.array(z.string()).min(2).max(10),
  showMascot: z.boolean().default(true),
  xpReward: z.number().int().min(0).default(15),
});

export type DragDropIntentData = z.infer<typeof dragDropIntentSchema>;

// =============================================================================
// MATCHING INTENT
// =============================================================================

export const matchingIntentSchema = z.object({
  intent: z.literal('interaction:matching'),
  title: optionalString,
  instruction: optionalString,
  pairs: z.array(matchingPairSchema).min(2).max(8),
  shuffle: z.boolean().default(true),
  showMascot: z.boolean().default(true),
  xpReward: z.number().int().min(0).default(20),
});

export type MatchingIntentData = z.infer<typeof matchingIntentSchema>;

// =============================================================================
// FILL BLANK INTENT
// =============================================================================

export const fillBlankIntentSchema = z.object({
  intent: z.literal('interaction:fill-blank'),
  text: nonEmptyString, // Contains {{blank:label}} markers
  answers: z.array(z.string()).min(1).max(10),
  caseSensitive: z.boolean().default(false),
  showMascot: z.boolean().default(true),
  xpReward: z.number().int().min(0).default(10),
});

export type FillBlankIntentData = z.infer<typeof fillBlankIntentSchema>;

// =============================================================================
// SORTING INTENT
// =============================================================================

const sortingItemSchema = z.object({
  id: nonEmptyString,
  label: nonEmptyString,
  value: z.union([z.number(), z.string()]),
});

export const sortingIntentSchema = z.object({
  intent: z.literal('interaction:sorting'),
  instruction: nonEmptyString,
  items: z.array(sortingItemSchema).min(2).max(10),
  direction: z.enum(['asc', 'desc']).default('asc'),
  criterion: z.enum(['numeric', 'alphabetic', 'custom']).default('numeric'),
  showMascot: z.boolean().default(true),
  xpReward: z.number().int().min(0).default(15),
});

export type SortingIntentData = z.infer<typeof sortingIntentSchema>;

// =============================================================================
// UNION
// =============================================================================

export const interactionIntentSchema = z.discriminatedUnion('intent', [
  quizMCIntentSchema,
  quizTFIntentSchema,
  dragDropIntentSchema,
  matchingIntentSchema,
  fillBlankIntentSchema,
  sortingIntentSchema,
]);

export type InteractionIntentData = z.infer<typeof interactionIntentSchema>;
