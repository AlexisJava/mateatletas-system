/**
 * Gamification Intents
 *
 * Intents for rewards and achievements:
 * - RewardIntent: Celebration screen with XP, achievements, etc.
 * - AchievementIntent: Unlock achievement celebration
 * - ChallengeIntent: Timed quiz challenge
 * - LeaderboardIntent: Display rankings
 *
 * All intents follow the NO SCROLL rule - 100dvh viewport.
 */

export { RewardIntent, type RewardIntentProps, type RewardItem } from './RewardIntent';
export { AchievementIntent, type AchievementIntentProps } from './AchievementIntent';
export {
  ChallengeIntent,
  type ChallengeIntentProps,
  type ChallengeQuestion,
} from './ChallengeIntent';
export {
  LeaderboardIntent,
  type LeaderboardIntentProps,
  type LeaderboardEntry,
} from './LeaderboardIntent';
