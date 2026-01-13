'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Check, X, ChevronRight, HelpCircle } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { BitMascot } from '@mateatletas/ui/organisms';
import { backgrounds, borders, blur, lessonSprings } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface QuizTFIntentProps {
  /** The statement to evaluate */
  statement: string;
  /** Whether the statement is true or false */
  correctAnswer: boolean;
  /** Feedback for correct answer */
  correctFeedback?: string;
  /** Feedback for incorrect answer */
  incorrectFeedback?: string;
  /** Explanation shown after answer */
  explanation?: string;
  /** XP to award for correct answer */
  xpReward?: number;
  /** Called when quiz is completed */
  onComplete?: (correct: boolean) => void;
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
      staggerChildren: 0.12,
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

const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.02, transition: lessonSprings.button },
  tap: { scale: 0.98 },
  selected: { scale: 1, transition: lessonSprings.button },
};

const feedbackVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: lessonSprings.card,
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * QuizTFIntent - True/False question
 *
 * Presents a statement that the user must evaluate as true or false.
 * Simple binary choice with immediate feedback.
 *
 * @example
 * ```tsx
 * <QuizTFIntent
 *   statement="El número π es exactamente igual a 3.14"
 *   correctAnswer={false}
 *   correctFeedback="¡Muy bien! π es un número irracional"
 *   incorrectFeedback="No exactamente..."
 *   explanation="π ≈ 3.14159... y continúa infinitamente sin repetirse"
 *   xpReward={15}
 *   onComplete={(correct) => handleResult(correct)}
 * />
 * ```
 */
export function QuizTFIntent({
  statement,
  correctAnswer,
  correctFeedback = '¡Correcto!',
  incorrectFeedback = 'No es correcto',
  explanation,
  xpReward = 10,
  onComplete,
  className,
}: QuizTFIntentProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const isCorrect = selectedAnswer === correctAnswer;
  const hasAnswered = selectedAnswer !== null;

  const handleSelect = (answer: boolean) => {
    if (hasAnswered) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);
  };

  const handleContinue = () => {
    onComplete?.(isCorrect);
  };

  const getMascotMood = () => {
    if (!hasAnswered) return 'thinking';
    return isCorrect ? 'celebrating' : 'sad';
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
            <HelpCircle className="w-3.5 h-3.5" />
            Verdadero o Falso
          </Badge>
          {hasAnswered && isCorrect && (
            <Badge
              variant="xp"
              className="inline-flex items-center gap-1"
              style={{ background: 'var(--house-primary)', color: 'white' }}
            >
              +{xpReward} XP
            </Badge>
          )}
        </motion.div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-2xl"
        >
          {/* Statement card */}
          <motion.div
            variants={fadeUp}
            className="p-8 rounded-3xl mb-8 text-center"
            style={{
              background: backgrounds.card,
              backdropFilter: `blur(${blur.md})`,
              border: `1px solid ${borders.subtle}`,
            }}
          >
            <p className="text-xl md:text-2xl text-white leading-relaxed font-medium">
              {statement}
            </p>
          </motion.div>

          {/* True/False buttons */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 mb-8">
            {/* True button */}
            <motion.button
              variants={buttonVariants}
              initial="idle"
              whileHover={!hasAnswered ? 'hover' : undefined}
              whileTap={!hasAnswered ? 'tap' : undefined}
              animate={selectedAnswer === true ? 'selected' : 'idle'}
              onClick={() => handleSelect(true)}
              disabled={hasAnswered}
              className={clsx(
                'p-6 rounded-2xl flex flex-col items-center gap-3 transition-colors',
                !hasAnswered && 'cursor-pointer',
                hasAnswered && 'cursor-default',
              )}
              style={{
                background:
                  selectedAnswer === true
                    ? correctAnswer === true
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'rgba(239, 68, 68, 0.2)'
                    : hasAnswered && correctAnswer === true
                      ? 'rgba(34, 197, 94, 0.1)'
                      : backgrounds.card,
                backdropFilter: `blur(${blur.md})`,
                border:
                  selectedAnswer === true
                    ? correctAnswer === true
                      ? '2px solid #22c55e'
                      : '2px solid #ef4444'
                    : hasAnswered && correctAnswer === true
                      ? '2px solid #22c55e'
                      : `1px solid ${borders.subtle}`,
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background:
                    selectedAnswer === true
                      ? correctAnswer === true
                        ? '#22c55e'
                        : '#ef4444'
                      : 'rgba(34, 197, 94, 0.2)',
                }}
              >
                <Check
                  className="w-8 h-8"
                  style={{
                    color: selectedAnswer === true ? 'white' : '#22c55e',
                  }}
                />
              </div>
              <span className="text-xl font-bold text-white">Verdadero</span>
            </motion.button>

            {/* False button */}
            <motion.button
              variants={buttonVariants}
              initial="idle"
              whileHover={!hasAnswered ? 'hover' : undefined}
              whileTap={!hasAnswered ? 'tap' : undefined}
              animate={selectedAnswer === false ? 'selected' : 'idle'}
              onClick={() => handleSelect(false)}
              disabled={hasAnswered}
              className={clsx(
                'p-6 rounded-2xl flex flex-col items-center gap-3 transition-colors',
                !hasAnswered && 'cursor-pointer',
                hasAnswered && 'cursor-default',
              )}
              style={{
                background:
                  selectedAnswer === false
                    ? correctAnswer === false
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'rgba(239, 68, 68, 0.2)'
                    : hasAnswered && correctAnswer === false
                      ? 'rgba(34, 197, 94, 0.1)'
                      : backgrounds.card,
                backdropFilter: `blur(${blur.md})`,
                border:
                  selectedAnswer === false
                    ? correctAnswer === false
                      ? '2px solid #22c55e'
                      : '2px solid #ef4444'
                    : hasAnswered && correctAnswer === false
                      ? '2px solid #22c55e'
                      : `1px solid ${borders.subtle}`,
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background:
                    selectedAnswer === false
                      ? correctAnswer === false
                        ? '#22c55e'
                        : '#ef4444'
                      : 'rgba(239, 68, 68, 0.2)',
                }}
              >
                <X
                  className="w-8 h-8"
                  style={{
                    color: selectedAnswer === false ? 'white' : '#ef4444',
                  }}
                />
              </div>
              <span className="text-xl font-bold text-white">Falso</span>
            </motion.button>
          </motion.div>

          {/* Feedback section */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                variants={feedbackVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="flex items-start gap-4"
              >
                <BitMascot mood={getMascotMood()} size="sm" />
                <div
                  className="flex-1 p-4 rounded-2xl"
                  style={{
                    background: isCorrect ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${isCorrect ? '#22c55e' : '#ef4444'}`,
                  }}
                >
                  <p
                    className="font-semibold text-lg"
                    style={{ color: isCorrect ? '#22c55e' : '#ef4444' }}
                  >
                    {isCorrect ? correctFeedback : incorrectFeedback}
                  </p>
                  {explanation && <p className="text-white/70 mt-2">{explanation}</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Continue button */}
      {hasAnswered && (
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

QuizTFIntent.displayName = 'QuizTFIntent';
