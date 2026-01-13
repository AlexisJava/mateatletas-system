/**
 * Interaction Intents
 *
 * Intents for interactive learning activities:
 * - QuizMCIntent: Multiple choice questions
 * - QuizTFIntent: True/false questions
 * - DragDropIntent: Drag to reorder/sort items
 * - MatchingIntent: Connect pairs
 * - FillBlankIntent: Complete text with blanks
 *
 * All intents follow the NO SCROLL rule - 100dvh viewport.
 */

export { QuizMCIntent, type QuizMCIntentProps, type QuizOption } from './QuizMCIntent';
export { QuizTFIntent, type QuizTFIntentProps } from './QuizTFIntent';
export { DragDropIntent, type DragDropIntentProps, type DragItem } from './DragDropIntent';
export { MatchingIntent, type MatchingIntentProps, type MatchPair } from './MatchingIntent';
export { FillBlankIntent, type FillBlankIntentProps } from './FillBlankIntent';
