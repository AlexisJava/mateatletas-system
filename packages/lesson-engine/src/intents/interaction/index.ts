/**
 * Interaction Intents
 *
 * Intents for interactive learning activities:
 * - QuizMCIntent: Multiple choice questions
 * - QuizTFIntent: True/false questions
 * - DragDropIntent: Drag to reorder/sort items (steps, sequences)
 * - MatchingIntent: Connect pairs
 * - FillBlankIntent: Complete text with blanks
 * - SortingIntent: Sort items by criterion (numeric, alphabetic, size)
 *
 * All intents follow the NO SCROLL rule - 100dvh viewport.
 */

export { QuizMCIntent, type QuizMCIntentProps, type QuizOption } from './QuizMCIntent';
export { QuizTFIntent, type QuizTFIntentProps } from './QuizTFIntent';
export { DragDropIntent, type DragDropIntentProps, type DragItem } from './DragDropIntent';
export { MatchingIntent, type MatchingIntentProps, type MatchPair } from './MatchingIntent';
export { FillBlankIntent, type FillBlankIntentProps } from './FillBlankIntent';
export {
  SortingIntent,
  type SortingIntentProps,
  type SortItem,
  type SortDirection,
  type SortCriterion,
} from './SortingIntent';
export {
  ShortAnswerIntent,
  type ShortAnswerIntentProps,
  type ValidationTypeSA,
} from './ShortAnswerIntent';
export { ChecklistIntent, type ChecklistIntentProps, type ChecklistItem } from './ChecklistIntent';
export {
  RubricIntent,
  type RubricIntentProps,
  type RubricCriterion,
  type RubricLevel,
} from './RubricIntent';
export {
  CodeValidatorIntent,
  type CodeValidatorIntentProps,
  type CodeTestCase,
} from './CodeValidatorIntent';
