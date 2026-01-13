/**
 * Organisms - Complex UI components composed of molecules/primitives
 *
 * These are the main content components for lessons, quizzes, and gamification.
 * They're designed to work with the house theming system via CSS variables.
 */

// Mascot
export { BitMascot } from './BitMascot';
export type { BitMascotProps, MascotMood, MascotSize } from './BitMascot';

// Lesson components
export { LessonCard } from './LessonCard';
export type { LessonCardProps, LessonStatus } from './LessonCard';

// Gamification
export { AchievementCard } from './AchievementCard';
export type { AchievementCardProps } from './AchievementCard';

// Intent cards (for lesson slides)
export { QuizCard } from './QuizCard';
export type { QuizCardProps, QuizOption } from './QuizCard';

export { DefineCard } from './DefineCard';
export type { DefineCardProps } from './DefineCard';

export { ExplainCard } from './ExplainCard';
export type { ExplainCardProps } from './ExplainCard';

// Class/Schedule components
export { ProximaClaseCard } from './ProximaClaseCard';
export type { ProximaClaseCardProps, ClaseStatus } from './ProximaClaseCard';
