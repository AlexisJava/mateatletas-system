'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronRight, MessageSquare } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { BitMascot } from '@mateatletas/ui/organisms';
import { backgrounds, borders, blur, lessonSprings } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface DialogueChoice {
  /** Choice identifier */
  id: string;
  /** Choice text */
  text: string;
  /** Response from Bit after choosing */
  response: string;
  /** Bit's mood for the response */
  responseMood?: 'happy' | 'thinking' | 'celebrating' | 'sad' | 'excited';
  /** Is this the "correct" or preferred choice? */
  isPreferred?: boolean;
}

export interface DialogueTurn {
  /** Who is speaking: 'bit' or 'user' */
  speaker: 'bit' | 'user';
  /** Message content */
  message: string;
  /** Bit's mood (only for bit speaker) */
  mood?: 'happy' | 'thinking' | 'celebrating' | 'sad' | 'excited';
  /** Choices for user to respond (only for user speaker) */
  choices?: DialogueChoice[];
}

export interface DialogueIntentProps {
  /** Title/context for the dialogue */
  title?: string;
  /** Dialogue turns */
  turns: DialogueTurn[];
  /** Called when dialogue is completed */
  onComplete?: () => void;
  /** Additional class names */
  className?: string;
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: lessonSprings.card,
  },
};

const messageVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: lessonSprings.card,
  },
};

const choiceVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      ...lessonSprings.button,
      delay: i * 0.1,
    },
  }),
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * DialogueIntent - Interactive conversation with Bit
 *
 * Presents a dialogue where user can make choices that affect Bit's responses.
 * Perfect for branching narratives and interactive scenarios.
 *
 * @example
 * ```tsx
 * <DialogueIntent
 *   title="Conversación con Bit"
 *   turns={[
 *     { speaker: 'bit', message: '¿Qué fracción representa la mitad?', mood: 'thinking' },
 *     {
 *       speaker: 'user',
 *       choices: [
 *         { id: '1', text: '1/2', response: '¡Exacto!', responseMood: 'celebrating', isPreferred: true },
 *         { id: '2', text: '1/4', response: 'Casi, pero esa es un cuarto', responseMood: 'thinking' },
 *       ],
 *     },
 *   ]}
 *   onComplete={() => nextSlide()}
 * />
 * ```
 */
export function DialogueIntent({ title, turns, onComplete, className }: DialogueIntentProps) {
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<DialogueChoice | null>(null);
  const [showResponse, setShowResponse] = useState(false);

  const currentTurn = turns[currentTurnIndex];
  const isLastTurn = currentTurnIndex === turns.length - 1;
  const isUserTurn = currentTurn?.speaker === 'user';

  const handleChoiceSelect = (choice: DialogueChoice) => {
    setSelectedChoice(choice);
    setShowResponse(true);
  };

  const handleContinue = () => {
    if (showResponse) {
      // After showing response, move to next turn
      setShowResponse(false);
      setSelectedChoice(null);
      if (isLastTurn) {
        onComplete?.();
      } else {
        setCurrentTurnIndex((prev) => prev + 1);
      }
    } else if (!isUserTurn) {
      // Bit's turn - just continue
      if (isLastTurn) {
        onComplete?.();
      } else {
        setCurrentTurnIndex((prev) => prev + 1);
      }
    }
  };

  const getCurrentMood = () => {
    if (showResponse && selectedChoice?.responseMood) {
      return selectedChoice.responseMood;
    }
    if (currentTurn?.speaker === 'bit' && currentTurn.mood) {
      return currentTurn.mood;
    }
    return 'happy';
  };

  return (
    <div
      className={clsx('h-[100dvh] w-full overflow-hidden relative flex flex-col', className)}
      style={{ background: backgrounds.base }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'var(--house-primary)',
          filter: `blur(${blur['2xl']})`,
          opacity: 0.1,
        }}
      />

      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 px-6 pt-6"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          <Badge variant="level" className="inline-flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5" />
            Diálogo
          </Badge>
        </motion.div>
        {title && (
          <motion.h1 variants={fadeUp} className="text-2xl md:text-3xl font-bold text-white mt-3">
            {title}
          </motion.h1>
        )}
      </motion.div>

      {/* Main content */}
      <div className="flex-1 relative z-10 flex items-center justify-center px-6">
        <div className="w-full max-w-3xl">
          {/* Bit mascot */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={lessonSprings.card}
            className="flex justify-center mb-6"
          >
            <BitMascot mood={getCurrentMood()} size="md" />
          </motion.div>

          {/* Chat area */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {/* Bit's message or response */}
              {(currentTurn?.speaker === 'bit' || showResponse) && (
                <motion.div
                  key={showResponse ? 'response' : `turn-${currentTurnIndex}`}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="flex justify-start"
                >
                  <div
                    className="max-w-[80%] p-5 rounded-2xl rounded-tl-md"
                    style={{
                      background: backgrounds.card,
                      backdropFilter: `blur(${blur.md})`,
                      border: `1px solid ${borders.subtle}`,
                    }}
                  >
                    <p className="text-lg text-white/90 leading-relaxed">
                      {showResponse ? selectedChoice?.response : currentTurn?.message}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* User choices */}
              {isUserTurn && !showResponse && currentTurn.choices && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col items-end gap-2 mt-6"
                >
                  {currentTurn.choices.map((choice, i) => (
                    <motion.button
                      key={choice.id}
                      custom={i}
                      variants={choiceVariants}
                      onClick={() => handleChoiceSelect(choice)}
                      className="max-w-[80%] p-4 rounded-2xl rounded-tr-md text-left transition-all hover:scale-[1.02]"
                      style={{
                        background: 'var(--house-primary-alpha)',
                        border: '1px solid var(--house-primary)',
                      }}
                    >
                      <p className="text-white font-medium">{choice.text}</p>
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Selected choice display */}
              {showResponse && selectedChoice && (
                <motion.div
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex justify-end mt-4"
                >
                  <div
                    className="max-w-[80%] p-4 rounded-2xl rounded-tr-md"
                    style={{
                      background: selectedChoice.isPreferred
                        ? 'rgba(34, 197, 94, 0.2)'
                        : 'var(--house-primary-alpha)',
                      border: `1px solid ${selectedChoice.isPreferred ? '#22c55e' : 'var(--house-primary)'}`,
                    }}
                  >
                    <p className="text-white font-medium">{selectedChoice.text}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Continue button */}
      {(!isUserTurn || showResponse) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={lessonSprings.button}
          className="relative z-10 px-6 pb-6 flex justify-center"
        >
          <Button variant="primary" size="lg" onClick={handleContinue}>
            Continuar
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}

DialogueIntent.displayName = 'DialogueIntent';
