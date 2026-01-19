'use client';

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Check, X, Zap, ChevronRight, RotateCcw } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { BitMascot } from '@mateatletas/ui/organisms';
import { backgrounds, borders, blur, lessonSprings, feedback } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface QuizOption {
  id: string;
  text: string;
  /** Optional visual for the option */
  visual?: ReactNode;
}

export interface QuizMCIntentProps {
  /** The question to display */
  question: string;
  /** Available options (2-4) */
  options: QuizOption[];
  /** ID of the correct option */
  correctId: string;
  /** Optional explanation shown after answering */
  explanation?: string;
  /** Feedback messages */
  feedback?: {
    correct?: string;
    incorrect?: string;
  };
  /** Show combo indicator */
  combo?: number;
  /** Show Bit mascot */
  showMascot?: boolean;
  /** XP to award on correct answer */
  xpReward?: number;
  /** Called with result when answered */
  onAnswer?: (result: { isCorrect: boolean; selectedId: string; xp?: number }) => void;
  /** Called when user continues after answering */
  onContinue?: () => void;
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
      staggerChildren: 0.08,
    },
  },
};

const questionVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: lessonSprings.card,
  },
};

const optionVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: lessonSprings.card,
  },
};

const feedbackVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: lessonSprings.button,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

const mascotVariants = {
  idle: { y: [0, -5, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
  correct: { scale: [1, 1.1, 1], rotate: [0, -5, 5, 0], transition: { duration: 0.5 } },
  incorrect: { x: [0, -5, 5, -5, 0], transition: { duration: 0.4 } },
};

// =============================================================================
// COMPONENT
// =============================================================================

type QuizStatus = 'idle' | 'correct' | 'incorrect';

/**
 * QuizMCIntent - Multiple choice quiz interaction
 *
 * Full-viewport quiz with options, mascot, and feedback.
 * NO SCROLL - options are displayed in a 2x2 grid if needed.
 *
 * @example
 * ```tsx
 * <QuizMCIntent
 *   question="¿Cuánto es 1/2 + 1/4?"
 *   options={[
 *     { id: 'a', text: '3/4' },
 *     { id: 'b', text: '2/6' },
 *     { id: 'c', text: '1/3' },
 *     { id: 'd', text: '3/6' },
 *   ]}
 *   correctId="a"
 *   xpReward={20}
 *   onAnswer={({ isCorrect, xp }) => console.log(isCorrect, xp)}
 *   onContinue={() => nextSlide()}
 * />
 * ```
 */
export function QuizMCIntent({
  question,
  options,
  correctId,
  explanation,
  feedback: feedbackMessages,
  combo,
  showMascot = true,
  xpReward = 10,
  onAnswer,
  onContinue,
  className,
}: QuizMCIntentProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<QuizStatus>('idle');

  const handleSelect = (id: string) => {
    if (status !== 'idle') return;
    setSelected(id);
  };

  const handleCheck = () => {
    if (!selected || status !== 'idle') return;

    const isCorrect = selected === correctId;
    setStatus(isCorrect ? 'correct' : 'incorrect');
    onAnswer?.({
      isCorrect,
      selectedId: selected,
      xp: isCorrect ? xpReward : 0,
    });
  };

  const handleRetry = () => {
    setSelected(null);
    setStatus('idle');
  };

  const handleContinue = () => {
    onContinue?.();
  };

  // Mascot mood
  const mascotMood = status === 'idle' ? 'thinking' : status === 'correct' ? 'celebrating' : 'sad';

  // Grid columns based on option count
  const gridCols = options.length <= 2 ? 'grid-cols-1' : 'grid-cols-2';

  return (
    <div
      className={clsx(
        'h-[100dvh] w-full overflow-hidden relative flex flex-col items-center justify-center p-6',
        className,
      )}
      style={{ background: backgrounds.base }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            status === 'correct'
              ? feedback.correct.solid
              : status === 'incorrect'
                ? feedback.incorrect.solid
                : 'var(--house-primary)',
          filter: `blur(${blur['2xl']})`,
          opacity: 0.12,
          transition: 'background 0.5s ease',
        }}
      />

      {/* Combo indicator */}
      {combo && combo > 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-6 right-6 z-20"
        >
          <Badge variant="xp" pulse>
            <Zap className="w-4 h-4 fill-current" />
            Combo x{combo}
          </Badge>
        </motion.div>
      )}

      {/* Content container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-2xl flex flex-col items-center"
      >
        {/* Mascot */}
        {showMascot && (
          <motion.div
            variants={mascotVariants}
            animate={status === 'idle' ? 'idle' : status}
            className="mb-4"
          >
            <BitMascot mood={mascotMood} size="sm" />
          </motion.div>
        )}

        {/* Question card */}
        <motion.div variants={questionVariants} className="w-full mb-8">
          <div
            className="p-6 rounded-2xl text-center relative overflow-hidden"
            style={{
              background: backgrounds.card,
              backdropFilter: `blur(${blur.md})`,
              border: `1px solid ${borders.subtle}`,
            }}
          >
            {/* Status bar */}
            <div
              className="absolute top-0 left-0 w-full h-1.5 transition-all duration-500"
              style={{
                background:
                  status === 'correct'
                    ? feedback.correct.solid
                    : status === 'incorrect'
                      ? feedback.incorrect.solid
                      : 'var(--house-primary)',
              }}
            />
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight pt-2">
              {question}
            </h2>
          </div>
        </motion.div>

        {/* Options grid */}
        <motion.div
          variants={containerVariants}
          className={clsx('w-full grid gap-4 mb-8', gridCols)}
        >
          {options.map((option, index) => {
            const isSelected = selected === option.id;
            const isCorrectOption = option.id === correctId;
            const showResult = status !== 'idle';

            let optionStyle: React.CSSProperties = {
              background: backgrounds.card,
              backdropFilter: `blur(${blur.md})`,
              border: `2px solid ${isSelected ? 'var(--house-primary)' : borders.subtle}`,
            };

            if (showResult) {
              if (isCorrectOption) {
                optionStyle = {
                  ...optionStyle,
                  background: feedback.correct.bg,
                  border: `2px solid ${feedback.correct.border}`,
                };
              } else if (isSelected && !isCorrectOption) {
                optionStyle = {
                  ...optionStyle,
                  background: feedback.incorrect.bg,
                  border: `2px solid ${feedback.incorrect.border}`,
                };
              }
            }

            return (
              <motion.button
                key={option.id}
                variants={optionVariants}
                whileHover={status === 'idle' ? { scale: 1.02 } : undefined}
                whileTap={status === 'idle' ? { scale: 0.98 } : undefined}
                onClick={() => handleSelect(option.id)}
                disabled={status !== 'idle'}
                className={clsx(
                  'p-5 rounded-xl text-left transition-all duration-300 relative',
                  status === 'idle' && 'cursor-pointer hover:shadow-lg',
                  status !== 'idle' && 'cursor-default',
                )}
                style={optionStyle}
              >
                <div className="flex items-center gap-4">
                  {/* Letter badge */}
                  <div
                    className={clsx(
                      'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0',
                      showResult && isCorrectOption && 'bg-green-500 text-white',
                      showResult && isSelected && !isCorrectOption && 'bg-red-500 text-white',
                      !showResult && isSelected && 'text-white',
                      !showResult && !isSelected && 'bg-white/10 text-white/60',
                    )}
                    style={{
                      background: !showResult && isSelected ? 'var(--house-primary)' : undefined,
                    }}
                  >
                    {showResult ? (
                      isCorrectOption ? (
                        <Check className="w-5 h-5" />
                      ) : isSelected ? (
                        <X className="w-5 h-5" />
                      ) : (
                        String.fromCharCode(65 + index)
                      )
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </div>

                  {/* Option text */}
                  <span
                    className={clsx(
                      'text-lg font-medium',
                      showResult && isCorrectOption && 'text-green-300',
                      showResult && isSelected && !isCorrectOption && 'text-red-300',
                      !showResult && 'text-white',
                    )}
                  >
                    {option.text}
                  </span>
                </div>

                {/* Visual if provided */}
                {option.visual && <div className="mt-4 flex justify-center">{option.visual}</div>}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Feedback message */}
        <AnimatePresence>
          {status !== 'idle' && (
            <motion.div
              variants={feedbackVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={clsx(
                'w-full p-4 rounded-xl mb-6 text-center',
                status === 'correct' ? 'bg-green-500/20' : 'bg-red-500/20',
              )}
            >
              <p
                className={clsx(
                  'font-semibold text-lg',
                  status === 'correct' ? 'text-green-300' : 'text-red-300',
                )}
              >
                {status === 'correct'
                  ? feedbackMessages?.correct || '¡Excelente! Respuesta correcta.'
                  : feedbackMessages?.incorrect || 'No es correcto. Intenta de nuevo.'}
              </p>
              {explanation && status === 'correct' && (
                <p className="text-white/70 mt-2 text-sm">{explanation}</p>
              )}
              {status === 'correct' && xpReward > 0 && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge variant="xp">+{xpReward} XP</Badge>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex items-center gap-4 w-full max-w-md">
          {status === 'incorrect' && (
            <Button variant="ghost" onClick={handleRetry} className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          )}

          <Button
            variant="primary"
            size="lg"
            onClick={status === 'idle' ? handleCheck : handleContinue}
            disabled={!selected && status === 'idle'}
            className="flex-1"
          >
            {status === 'idle' ? (
              'Comprobar'
            ) : (
              <>
                Continuar
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

QuizMCIntent.displayName = 'QuizMCIntent';
