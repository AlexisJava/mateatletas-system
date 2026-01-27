/**
 * Presentation Intent Schemas
 *
 * Schemas that match the actual component props in:
 * - HeroIntent
 * - DefineIntent
 * - ExplainIntent
 * - ShowcaseIntent
 * - HighlightIntent
 */

import { z } from 'zod';
import { nonEmptyString, optionalString } from './base.schema';

// =============================================================================
// HERO INTENT
// =============================================================================

export const heroIntentSchema = z.object({
  intent: z.literal('presentation:hero'),
  title: nonEmptyString,
  subtitle: optionalString,
  icon: z.unknown().optional(), // ReactNode
  variant: z.enum(['gradient', 'ambient', 'minimal']).default('gradient'),
  ctaText: z.string().default('¡Empezar!'),
});

export type HeroIntentData = z.infer<typeof heroIntentSchema>;

// =============================================================================
// DEFINE INTENT
// =============================================================================

export const defineIntentSchema = z.object({
  intent: z.literal('presentation:define'),
  term: nonEmptyString,
  definition: nonEmptyString,
  pronunciation: optionalString,
  example: optionalString,
  visual: z.unknown().optional(), // ReactNode
  category: z.string().default('Definición'),
  enableAudio: z.boolean().default(false),
});

export type DefineIntentData = z.infer<typeof defineIntentSchema>;

// =============================================================================
// EXPLAIN INTENT
// =============================================================================

const explainStepSchema = z.object({
  title: nonEmptyString,
  content: nonEmptyString,
  icon: z.unknown().optional(),
});

export const explainIntentSchema = z.object({
  intent: z.literal('presentation:explain'),
  title: nonEmptyString,
  subtitle: optionalString,
  category: optionalString,
  steps: z.array(explainStepSchema).min(1).max(8),
});

export type ExplainIntentData = z.infer<typeof explainIntentSchema>;

// =============================================================================
// SHOWCASE INTENT
// =============================================================================

const showcaseItemSchema = z.object({
  id: nonEmptyString,
  title: nonEmptyString,
  description: optionalString,
  image: optionalString,
  icon: z.unknown().optional(),
});

export const showcaseIntentSchema = z.object({
  intent: z.literal('presentation:showcase'),
  title: nonEmptyString,
  subtitle: optionalString,
  variant: z.enum(['grid', 'carousel', 'list']).default('carousel'),
  items: z.array(showcaseItemSchema).min(1).max(12),
});

export type ShowcaseIntentData = z.infer<typeof showcaseIntentSchema>;

// =============================================================================
// HIGHLIGHT INTENT
// =============================================================================

export const highlightIntentSchema = z.object({
  intent: z.literal('presentation:highlight'),
  type: z.enum(['tip', 'warning', 'formula', 'example', 'important']),
  title: nonEmptyString,
  content: nonEmptyString,
  icon: z.unknown().optional(),
});

export type HighlightIntentData = z.infer<typeof highlightIntentSchema>;

// =============================================================================
// UNION
// =============================================================================

export const presentationIntentSchema = z.discriminatedUnion('intent', [
  heroIntentSchema,
  defineIntentSchema,
  explainIntentSchema,
  showcaseIntentSchema,
  highlightIntentSchema,
]);

export type PresentationIntentData = z.infer<typeof presentationIntentSchema>;
