/**
 * Layout Intent Schemas
 *
 * Schemas that match the actual component props in:
 * - SplitIntent
 * - BentoIntent
 * - TabsIntent
 * - CarouselIntent
 */

import { z } from 'zod';
import { optionalString, bentoCellSchema, tabSchema, carouselSlideSchema } from './base.schema';

// =============================================================================
// SPLIT INTENT
// =============================================================================

const splitPaneSchema = z.object({
  title: optionalString,
  content: z.string(),
  image: optionalString,
  icon: z.unknown().optional(),
});

export const splitIntentSchema = z.object({
  intent: z.literal('layout:split'),
  left: splitPaneSchema,
  right: splitPaneSchema,
  ratio: z.enum(['50-50', '40-60', '60-40', '30-70', '70-30']).default('50-50'),
  stackOnMobile: z.boolean().default(true),
  showContinue: z.boolean().default(true),
});

export type SplitIntentData = z.infer<typeof splitIntentSchema>;

// =============================================================================
// BENTO INTENT
// =============================================================================

export const bentoIntentSchema = z.object({
  intent: z.literal('layout:bento'),
  title: optionalString,
  subtitle: optionalString,
  columns: z.number().int().min(2).max(4).default(3),
  cells: z.array(bentoCellSchema).min(1).max(12),
  showContinue: z.boolean().default(true),
});

export type BentoIntentData = z.infer<typeof bentoIntentSchema>;

// =============================================================================
// TABS INTENT
// =============================================================================

export const tabsIntentSchema = z.object({
  intent: z.literal('layout:tabs'),
  title: optionalString,
  variant: z.enum(['pills', 'underline', 'cards']).default('pills'),
  tabs: z.array(tabSchema).min(2).max(8),
  defaultTab: optionalString,
  showContinue: z.boolean().default(true),
});

export type TabsIntentData = z.infer<typeof tabsIntentSchema>;

// =============================================================================
// CAROUSEL INTENT
// =============================================================================

export const carouselIntentSchema = z.object({
  intent: z.literal('layout:carousel'),
  title: optionalString,
  slides: z.array(carouselSlideSchema).min(2).max(20),
  showCounter: z.boolean().default(true),
  showDots: z.boolean().default(true),
  autoPlay: z.boolean().default(false),
  autoPlayInterval: z.number().int().min(1000).default(5000),
  showContinue: z.boolean().default(true),
});

export type CarouselIntentData = z.infer<typeof carouselIntentSchema>;

// =============================================================================
// UNION
// =============================================================================

export const layoutIntentSchema = z.discriminatedUnion('intent', [
  splitIntentSchema,
  bentoIntentSchema,
  tabsIntentSchema,
  carouselIntentSchema,
]);

export type LayoutIntentData = z.infer<typeof layoutIntentSchema>;
