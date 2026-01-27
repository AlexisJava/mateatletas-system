/**
 * Base Schemas
 *
 * Common validation schemas shared across intents.
 */

import { z } from 'zod';

// =============================================================================
// INTENT ID PATTERN
// =============================================================================

/** Valid intent ID pattern: category:name */
export const intentIdSchema = z
  .string()
  .regex(
    /^(presentation|interaction|narrative|gamification|layout|closure):[a-z-]+$/,
    'Intent ID must be in format "category:name" (e.g., "presentation:hero")',
  );

// =============================================================================
// COMMON PRIMITIVES
// =============================================================================

export const nonEmptyString = z.string().min(1, 'Required');
export const optionalString = z.string().optional();

// =============================================================================
// QUIZ/INTERACTION OPTIONS
// =============================================================================

export const quizOptionSchema = z.object({
  id: nonEmptyString,
  text: nonEmptyString,
  visual: z.unknown().optional(),
});

export const matchingPairSchema = z.object({
  id: nonEmptyString,
  left: nonEmptyString,
  right: nonEmptyString,
});

// =============================================================================
// GAMIFICATION
// =============================================================================

export const rewardItemSchema = z.object({
  type: z.enum(['xp', 'streak', 'achievement', 'level', 'custom']),
  value: z.union([z.number(), z.string()]),
  label: nonEmptyString,
  icon: z.unknown().optional(),
});

// =============================================================================
// LAYOUT
// =============================================================================

export const bentoCellSchema = z.object({
  id: nonEmptyString,
  content: z.string(),
  colSpan: z.number().int().min(1).max(4).optional(),
  rowSpan: z.number().int().min(1).max(4).optional(),
});

export const tabSchema = z.object({
  id: nonEmptyString,
  label: nonEmptyString,
  content: z.string(),
  icon: z.unknown().optional(),
});

export const carouselSlideSchema = z.object({
  id: nonEmptyString,
  content: z.string(),
  title: optionalString,
  image: optionalString,
});
