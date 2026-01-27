/**
 * Gamification Intent Schemas
 *
 * Schemas that match the actual component props in:
 * - RewardIntent
 * - AchievementIntent
 * - ChallengeIntent
 * - LeaderboardIntent
 */

import { z } from 'zod';
import { nonEmptyString, optionalString, rewardItemSchema } from './base.schema';

// =============================================================================
// REWARD INTENT
// =============================================================================

export const rewardIntentSchema = z.object({
  intent: z.literal('gamification:reward'),
  title: nonEmptyString,
  subtitle: optionalString,
  rewards: z.array(rewardItemSchema).min(1).max(6),
  showConfetti: z.boolean().default(true),
  showMascot: z.boolean().default(true),
  icon: z.unknown().optional(),
});

export type RewardIntentData = z.infer<typeof rewardIntentSchema>;

// =============================================================================
// ACHIEVEMENT INTENT
// =============================================================================

export const achievementIntentSchema = z.object({
  intent: z.literal('gamification:achievement'),
  title: nonEmptyString,
  description: nonEmptyString,
  icon: z.string().optional(), // Emoji or icon name
  tier: z.enum(['common', 'rare', 'epic', 'legendary']).default('common'),
  xpReward: z.number().int().min(0).default(100),
  isNewUnlock: z.boolean().default(true),
  showConfetti: z.boolean().default(true),
});

export type AchievementIntentData = z.infer<typeof achievementIntentSchema>;

// =============================================================================
// CHALLENGE INTENT
// =============================================================================

const challengeQuestionSchema = z.object({
  id: nonEmptyString,
  question: nonEmptyString,
  options: z.array(z.string()).min(2).max(6),
  correctIndex: z.number().int().min(0),
});

export const challengeIntentSchema = z.object({
  intent: z.literal('gamification:challenge'),
  title: nonEmptyString,
  subtitle: optionalString,
  timeLimit: z.number().int().min(10).max(300), // seconds
  questions: z.array(challengeQuestionSchema).min(1).max(20),
  xpPerQuestion: z.number().int().min(0).default(10),
  completionBonus: z.number().int().min(0).default(50),
  showTimer: z.boolean().default(true),
});

export type ChallengeIntentData = z.infer<typeof challengeIntentSchema>;

// =============================================================================
// LEADERBOARD INTENT
// =============================================================================

const leaderboardEntrySchema = z.object({
  id: nonEmptyString,
  name: nonEmptyString,
  score: z.number().int().min(0),
  avatar: optionalString,
  change: z.number().int().optional(), // Position change
  isCurrentUser: z.boolean().optional(),
});

export const leaderboardIntentSchema = z.object({
  intent: z.literal('gamification:leaderboard'),
  title: nonEmptyString,
  subtitle: optionalString,
  entries: z.array(leaderboardEntrySchema).min(1).max(100),
  scoreLabel: z.string().default('XP'),
  showPosition: z.boolean().default(true),
  highlightTop: z.number().int().min(1).max(10).default(3),
});

export type LeaderboardIntentData = z.infer<typeof leaderboardIntentSchema>;

// =============================================================================
// UNION
// =============================================================================

export const gamificationIntentSchema = z.discriminatedUnion('intent', [
  rewardIntentSchema,
  achievementIntentSchema,
  challengeIntentSchema,
  leaderboardIntentSchema,
]);

export type GamificationIntentData = z.infer<typeof gamificationIntentSchema>;
