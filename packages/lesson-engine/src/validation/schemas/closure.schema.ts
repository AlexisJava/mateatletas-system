/**
 * Closure Intent Schemas
 *
 * Schemas that match the actual component props in:
 * - SummaryIntent
 * - NextStepsIntent
 * - CertificateIntent
 */

import { z } from 'zod';
import { nonEmptyString, optionalString } from './base.schema';

// =============================================================================
// SUMMARY INTENT
// =============================================================================

const summaryPointSchema = z.object({
  id: nonEmptyString,
  text: nonEmptyString,
  icon: z.unknown().optional(),
});

export const summaryIntentSchema = z.object({
  intent: z.literal('closure:summary'),
  title: nonEmptyString,
  subtitle: optionalString,
  points: z.array(summaryPointSchema).min(1).max(10),
  closingMessage: optionalString,
  showMascot: z.boolean().default(true),
  showCheckmarks: z.boolean().default(true),
});

export type SummaryIntentData = z.infer<typeof summaryIntentSchema>;

// =============================================================================
// NEXT STEPS INTENT
// =============================================================================

const nextStepOptionSchema = z.object({
  id: nonEmptyString,
  title: nonEmptyString,
  description: optionalString,
  icon: z.unknown().optional(),
  recommended: z.boolean().optional(),
  disabled: z.boolean().optional(),
});

export const nextStepsIntentSchema = z.object({
  intent: z.literal('closure:next-steps'),
  title: nonEmptyString,
  subtitle: optionalString,
  steps: z.array(nextStepOptionSchema).min(1).max(6),
  showMascot: z.boolean().default(true),
});

export type NextStepsIntentData = z.infer<typeof nextStepsIntentSchema>;

// =============================================================================
// CERTIFICATE INTENT
// =============================================================================

export const certificateIntentSchema = z.object({
  intent: z.literal('closure:certificate'),
  studentName: nonEmptyString,
  courseTitle: nonEmptyString,
  completionDate: optionalString,
  xpEarned: z.number().int().min(0).default(100),
  showDownload: z.boolean().default(true),
  showShare: z.boolean().default(true),
  ctaText: z.string().default('Continuar'),
});

export type CertificateIntentData = z.infer<typeof certificateIntentSchema>;

// =============================================================================
// UNION
// =============================================================================

export const closureIntentSchema = z.discriminatedUnion('intent', [
  summaryIntentSchema,
  nextStepsIntentSchema,
  certificateIntentSchema,
]);

export type ClosureIntentData = z.infer<typeof closureIntentSchema>;
