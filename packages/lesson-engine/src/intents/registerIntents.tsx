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
import { ShowcaseIntent } from './presentation/ShowcaseIntent';
import { HighlightIntent } from './presentation/HighlightIntent';
import { QuizMCIntent } from './interaction/QuizMCIntent';
import { QuizTFIntent } from './interaction/QuizTFIntent';
import { DragDropIntent } from './interaction/DragDropIntent';
import { MatchingIntent } from './interaction/MatchingIntent';
import { FillBlankIntent } from './interaction/FillBlankIntent';
import { SortingIntent } from './interaction/SortingIntent';
import { StoryIntent } from './narrative/StoryIntent';
import { DialogueIntent } from './narrative/DialogueIntent';
import { MascotSpeechIntent } from './narrative/MascotSpeechIntent';
import { RewardIntent } from './gamification/RewardIntent';
import { AchievementIntent } from './gamification/AchievementIntent';
import { ChallengeIntent } from './gamification/ChallengeIntent';
import { LeaderboardIntent } from './gamification/LeaderboardIntent';

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
 * - presentation:hero, presentation:define, presentation:explain, presentation:showcase, presentation:highlight
 * - interaction:quiz-mc, interaction:quiz-tf, interaction:drag-drop, interaction:matching, interaction:fill-blank
 * - narrative:story, narrative:dialogue, narrative:mascot-speech
 * - gamification:reward, gamification:achievement, gamification:challenge, gamification:leaderboard
 */
export function registerAllIntents(): void {
  // Presentation intents
  IntentRegistry.register('presentation:hero', createAdapter(HeroIntent));
  IntentRegistry.register('presentation:define', createAdapter(DefineIntent));
  IntentRegistry.register('presentation:explain', createAdapter(ExplainIntent));
  IntentRegistry.register('presentation:showcase', createAdapter(ShowcaseIntent));
  IntentRegistry.register('presentation:highlight', createAdapter(HighlightIntent));

  // Interaction intents
  IntentRegistry.register('interaction:quiz-mc', createAdapter(QuizMCIntent));
  IntentRegistry.register('interaction:quiz-tf', createAdapter(QuizTFIntent));
  IntentRegistry.register('interaction:drag-drop', createAdapter(DragDropIntent));
  IntentRegistry.register('interaction:matching', createAdapter(MatchingIntent));
  IntentRegistry.register('interaction:fill-blank', createAdapter(FillBlankIntent));
  IntentRegistry.register('interaction:sorting', createAdapter(SortingIntent));

  // Narrative intents
  IntentRegistry.register('narrative:story', createAdapter(StoryIntent));
  IntentRegistry.register('narrative:dialogue', createAdapter(DialogueIntent));
  IntentRegistry.register('narrative:mascot-speech', createAdapter(MascotSpeechIntent));

  // Gamification intents
  IntentRegistry.register('gamification:reward', createAdapter(RewardIntent));
  IntentRegistry.register('gamification:achievement', createAdapter(AchievementIntent));
  IntentRegistry.register('gamification:challenge', createAdapter(ChallengeIntent));
  IntentRegistry.register('gamification:leaderboard', createAdapter(LeaderboardIntent));
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
