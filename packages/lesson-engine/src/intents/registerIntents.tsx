/**
 * Intent Registration
 *
 * Registers all implemented intents in the IntentRegistry.
 * Each intent is wrapped to adapt from IntentProps to its specific props.
 *
 * Call this function once at app initialization to make all intents available.
 */

import { IntentRegistry, type IntentProps } from '../renderer/IntentRegistry';
import { HeroIntent } from './presentation/HeroIntent';
import { DefineIntent } from './presentation/DefineIntent';
import { ExplainIntent } from './presentation/ExplainIntent';
import { QuizMCIntent } from './interaction/QuizMCIntent';
import { DragDropIntent } from './interaction/DragDropIntent';
import { StoryIntent } from './narrative/StoryIntent';
import { RewardIntent } from './gamification/RewardIntent';

/**
 * Creates an adapter that wraps an intent component to match IntentProps interface
 */
function createAdapter<P extends object>(
  Component: React.ComponentType<P & { onContinue?: () => void }>,
) {
  return function IntentAdapter({ props, onComplete }: IntentProps) {
    return <Component {...(props as P)} onContinue={onComplete} />;
  };
}

/**
 * Register all implemented intents
 *
 * Intent naming convention: `category:name`
 * - presentation:hero, presentation:define, presentation:explain
 * - interaction:quiz-mc, interaction:drag-drop
 * - narrative:story
 * - gamification:reward
 */
export function registerAllIntents(): void {
  // Presentation intents
  IntentRegistry.register('presentation:hero', createAdapter(HeroIntent));
  IntentRegistry.register('presentation:define', createAdapter(DefineIntent));
  IntentRegistry.register('presentation:explain', createAdapter(ExplainIntent));

  // Interaction intents
  IntentRegistry.register('interaction:quiz-mc', createAdapter(QuizMCIntent));
  IntentRegistry.register('interaction:drag-drop', createAdapter(DragDropIntent));

  // Narrative intents
  IntentRegistry.register('narrative:story', createAdapter(StoryIntent));

  // Gamification intents
  IntentRegistry.register('gamification:reward', createAdapter(RewardIntent));
}

/**
 * Check if intents are registered
 */
export function areIntentsRegistered(): boolean {
  return IntentRegistry.list().length > 0;
}

/**
 * Get list of all registered intent types
 */
export function getRegisteredIntents(): string[] {
  return IntentRegistry.list();
}
