/**
 * Narrative Intents
 *
 * Intents for storytelling and dialogue:
 * - StoryIntent: Sequential story segments with Bit mascot
 * - DialogueIntent: Interactive conversation with choices
 * - MascotSpeechIntent: Motivational messages from Bit
 *
 * All intents follow the NO SCROLL rule - 100dvh viewport.
 */

export { StoryIntent, type StoryIntentProps, type StorySegment } from './StoryIntent';
export {
  DialogueIntent,
  type DialogueIntentProps,
  type DialogueTurn,
  type DialogueChoice,
} from './DialogueIntent';
export {
  MascotSpeechIntent,
  type MascotSpeechIntentProps,
  type SpeechType,
} from './MascotSpeechIntent';
