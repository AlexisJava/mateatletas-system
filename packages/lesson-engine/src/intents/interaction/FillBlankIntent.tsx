'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronRight, Edit3, Check, RotateCcw } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { BitMascot } from '@mateatletas/ui/organisms';
import { backgrounds, borders, blur, lessonSprings } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface FillBlankIntentProps {
  /** Text with blanks marked as {{blank}} or {{blank:hint}} */
  text: string;
  /** Correct answers for each blank (in order) */
  answers: string[];
  /** Whether to be case-sensitive */
  caseSensitive?: boolean;
  /** Feedback for correct answer */
  correctFeedback?: string;
  /** Feedback for incorrect answer */
  incorrectFeedback?: string;
  /** XP to award */
  xpReward?: number;
  /** Called when completed */
  onComplete?: (allCorrect: boolean) => void;
  /** Additional class names */
  className?: string;
}

interface BlankInfo {
  index: number;
  hint?: string;
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
// HELPERS
// =============================================================================

function parseTextWithBlanks(text: string): { parts: (string | BlankInfo)[]; blankCount: number } {
  const regex = /\{\{blank(?::([^}]+))?\}\}/g;
  const parts: (string | BlankInfo)[] = [];
  let lastIndex = 0;
  let blankIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the blank
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Add blank info
    parts.push({
      index: blankIndex,
      hint: match[1],
    });

    blankIndex++;
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return { parts, blankCount: blankIndex };
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * FillBlankIntent - Complete the text activity
 *
 * Presents text with blanks that the user must fill in.
 * Supports hints for each blank.
 *
 * @example
 * ```tsx
 * <FillBlankIntent
 *   text="La fracción {{blank:numerador}}/{{blank:denominador}} se lee como 'tres cuartos'"
 *   answers={['3', '4']}
 *   onComplete={(correct) => handleResult(correct)}
 * />
 * ```
 */
export function FillBlankIntent({
  text,
  answers,
  caseSensitive = false,
  correctFeedback = '¡Perfecto! Todas las respuestas son correctas',
  incorrectFeedback = 'Algunas respuestas no son correctas',
  xpReward = 15,
  onComplete,
  className,
}: FillBlankIntentProps) {
  const { parts, blankCount } = parseTextWithBlanks(text);
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(blankCount).fill(''));
  const [showResults, setShowResults] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check answers
  const checkAnswer = (userAnswer: string, correctAnswer: string) => {
    const normalize = (s: string) => (caseSensitive ? s.trim() : s.trim().toLowerCase());
    return normalize(userAnswer) === normalize(correctAnswer);
  };

  const results = userAnswers.map((ans, idx) => checkAnswer(ans, answers[idx]));
  const allCorrect = results.every(Boolean);
  const allFilled = userAnswers.every((ans) => ans.trim() !== '');

  const handleInputChange = (index: number, value: string) => {
    if (showResults) return;
    setUserAnswers((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && allFilled && !showResults) {
      handleCheck();
    } else if (e.key === 'Tab' && !e.shiftKey && index < blankCount - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCheck = () => {
    setShowResults(true);
  };

  const handleRetry = () => {
    setUserAnswers(Array(blankCount).fill(''));
    setShowResults(false);
    // Focus first input
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const handleContinue = () => {
    onComplete?.(allCorrect);
  };

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div
      className={clsx('h-[100dvh] w-full overflow-hidden relative flex flex-col', className)}
      style={{ background: backgrounds.base }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
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
            <Edit3 className="w-3.5 h-3.5" />
            Completar
          </Badge>
          {showResults && allCorrect && (
            <Badge
              variant="xp"
              className="inline-flex items-center gap-1"
              style={{ background: 'var(--house-primary)', color: 'white' }}
            >
              +{xpReward} XP
            </Badge>
          )}
        </motion.div>
        <motion.h1 variants={fadeUp} className="text-2xl md:text-3xl font-bold text-white mt-3">
          Completa el texto
        </motion.h1>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 relative z-10 flex items-center justify-center px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-3xl"
        >
          {/* Text with blanks */}
          <motion.div
            variants={fadeUp}
            className="p-8 rounded-3xl"
            style={{
              background: backgrounds.card,
              backdropFilter: `blur(${blur.md})`,
              border: `1px solid ${borders.subtle}`,
            }}
          >
            <p className="text-xl md:text-2xl text-white leading-loose">
              {parts.map((part, idx) => {
                if (typeof part === 'string') {
                  return <span key={idx}>{part}</span>;
                }

                const blankInfo = part as BlankInfo;
                const isCorrect = showResults && results[blankInfo.index];
                const isIncorrect = showResults && !results[blankInfo.index];

                return (
                  <span key={idx} className="inline-block mx-1 align-middle">
                    <input
                      ref={(el) => {
                        inputRefs.current[blankInfo.index] = el;
                      }}
                      type="text"
                      value={userAnswers[blankInfo.index]}
                      onChange={(e) => handleInputChange(blankInfo.index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(blankInfo.index, e)}
                      disabled={showResults}
                      placeholder={blankInfo.hint || '...'}
                      className={clsx(
                        'w-28 md:w-36 px-3 py-1 rounded-lg text-center font-medium transition-colors',
                        'focus:outline-none focus:ring-2',
                        !showResults &&
                          'text-white bg-white/10 border border-white/20 focus:ring-[var(--house-primary)]',
                        isCorrect && 'bg-green-500/20 text-green-400 border-2 border-green-500',
                        isIncorrect && 'bg-red-500/20 text-red-400 border-2 border-red-500',
                      )}
                      style={{
                        fontSize: 'inherit',
                      }}
                    />
                    {showResults && isIncorrect && (
                      <span className="text-green-400 text-sm ml-1">
                        ({answers[blankInfo.index]})
                      </span>
                    )}
                  </span>
                );
              })}
            </p>
          </motion.div>

          {/* Feedback */}
          <AnimatePresence>
            {showResults && (
              <motion.div
                variants={feedbackVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="mt-6 flex items-start gap-4"
              >
                <BitMascot mood={allCorrect ? 'celebrating' : 'thinking'} size="sm" />
                <div
                  className="flex-1 p-4 rounded-2xl"
                  style={{
                    background: allCorrect ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${allCorrect ? '#22c55e' : '#ef4444'}`,
                  }}
                >
                  <p
                    className="font-semibold text-lg"
                    style={{ color: allCorrect ? '#22c55e' : '#ef4444' }}
                  >
                    {allCorrect ? correctFeedback : incorrectFeedback}
                  </p>
                  {!allCorrect && (
                    <p className="text-white/70 mt-1">
                      {results.filter(Boolean).length} de {blankCount} correctas
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer actions */}
      <div className="relative z-10 px-6 pb-6 flex justify-center gap-4">
        {!showResults && allFilled && (
          <Button variant="primary" size="lg" onClick={handleCheck}>
            <Check className="w-5 h-5 mr-2" />
            Verificar
          </Button>
        )}

        {showResults && !allCorrect && (
          <Button variant="ghost" onClick={handleRetry}>
            <RotateCcw className="w-5 h-5 mr-2" />
            Reintentar
          </Button>
        )}

        {showResults && (
          <Button variant="primary" size="lg" onClick={handleContinue}>
            Continuar
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

FillBlankIntent.displayName = 'FillBlankIntent';
