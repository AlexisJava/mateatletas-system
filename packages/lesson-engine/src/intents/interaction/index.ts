/**
 * Interaction Intents
 *
 * Intents for interactive learning activities:
 * - QuizMCIntent: Multiple choice questions
 * - DragDropIntent: Drag to reorder/sort items
 *
 * All intents follow the NO SCROLL rule - 100dvh viewport.
 */

export { QuizMCIntent, type QuizMCIntentProps, type QuizOption } from './QuizMCIntent';
export { DragDropIntent, type DragDropIntentProps, type DragItem } from './DragDropIntent';
