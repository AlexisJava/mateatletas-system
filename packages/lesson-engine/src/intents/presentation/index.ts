/**
 * Presentation Intents
 *
 * Intents for presenting educational content:
 * - HeroIntent: Welcome/introduction slides
 * - DefineIntent: Vocabulary/concept definitions
 * - ExplainIntent: Step-by-step explanations
 *
 * All intents follow the NO SCROLL rule - 100dvh viewport.
 * Navigation is horizontal when needed.
 */

export { HeroIntent, type HeroIntentProps } from './HeroIntent';
export { DefineIntent, type DefineIntentProps } from './DefineIntent';
export { ExplainIntent, type ExplainIntentProps, type ExplainStep } from './ExplainIntent';
