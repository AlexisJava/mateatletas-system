/**
 * Intents - Index
 *
 * Barrel file para todos los intents del lesson engine.
 *
 * Implemented intents:
 * - presentation: HeroIntent, DefineIntent, ExplainIntent
 * - interaction: QuizMCIntent, DragDropIntent
 * - narrative: StoryIntent
 * - gamification: RewardIntent
 */

// Presentation intents
export * from './presentation';

// Interaction intents
export * from './interaction';

// Gamification intents
export * from './gamification';

// Narrative intents
export * from './narrative';

// Layout intents (TODO)
export * from './layout';

// Closure intents (TODO)
export * from './closure';

// Registration utilities
export {
  registerAllIntents,
  areIntentsRegistered,
  getRegisteredIntents,
} from './registerIntents.js';
