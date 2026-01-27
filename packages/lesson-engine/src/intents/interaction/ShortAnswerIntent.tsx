'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronRight, MessageSquare, Check, RotateCcw, Lightbulb } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { BitMascot } from '@mateatletas/ui/organisms';
import { backgrounds, borders, blur, lessonSprings } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export type ValidationTypeSA = 'keywords' | 'regex' | 'exact';

export interface ShortAnswerIntentProps {
  /** The question to answer */
  question: string;
  /** Type of validation to use */
  validationType: ValidationTypeSA;
  /** Keywords that must be present (for validationType='keywords') */
  keywords?: string[];
  /** Regex pattern to match (for validationType='regex') */
  regexPattern?: string;
  /** Exact answer expected (for validationType='exact') */
  exactAnswer?: string;
  /** Whether comparison is case-sensitive */
  caseSensitive?: boolean;
  /** Minimum answer length */
  minLength?: number;
  /** Maximum answer length */
  maxLength?: number;
  /** Hint to show */
  hint?: string;
  /** Feedback for correct answer */
  correctFeedback?: string;
  /** Feedback for incorrect answer */
  incorrectFeedback?: string;
  /** Whether to show mascot */
  showMascot?: boolean;
  /** XP to award */
  xpReward?: number;
  /** Levenshtein tolerance (0-1, default 0.8 = 80% similarity) */
  fuzzyTolerance?: number;
  /** Called when completed */
  onComplete?: (isCorrect: boolean) => void;
  /** Additional class names */
  className?: string;
}

// =============================================================================
// LEVENSHTEIN DISTANCE (for fuzzy matching)
// =============================================================================

/**
 * Calculate Levenshtein distance between two strings
 * Based on: https://en.wikipedia.org/wiki/Levenshtein_distance
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Initialize first column
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }

  // Initialize first row
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  // Fill the matrix
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      );
    }
  }

  return matrix[a.length][b.length];
}

/**
 * Calculate normalized Levenshtein similarity (0 to 1)
 * 1 = identical, 0 = completely different
 */
function levenshteinSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const distance = levenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);
  return 1 - distance / maxLength;
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
// VALIDATION HELPERS
// =============================================================================

interface ValidationResult {
  isCorrect: boolean;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  similarity?: number;
}

function validateAnswer(userAnswer: string, props: ShortAnswerIntentProps): ValidationResult {
  const { validationType, caseSensitive = false, fuzzyTolerance = 0.8 } = props;

  // Normalize the answer
  const normalizedAnswer = caseSensitive ? userAnswer.trim() : userAnswer.trim().toLowerCase();

  switch (validationType) {
    case 'exact': {
      const expected = caseSensitive
        ? (props.exactAnswer ?? '').trim()
        : (props.exactAnswer ?? '').trim().toLowerCase();

      // First try exact match
      if (normalizedAnswer === expected) {
        return { isCorrect: true, similarity: 1 };
      }

      // Then try fuzzy match with Levenshtein
      const similarity = levenshteinSimilarity(normalizedAnswer, expected);
      return {
        isCorrect: similarity >= fuzzyTolerance,
        similarity,
      };
    }

    case 'keywords': {
      const keywords = props.keywords ?? [];
      const normalizedKeywords = keywords.map((kw) =>
        caseSensitive ? kw.trim() : kw.trim().toLowerCase(),
      );

      const matchedKeywords: string[] = [];
      const missingKeywords: string[] = [];

      for (let i = 0; i < normalizedKeywords.length; i++) {
        const keyword = normalizedKeywords[i];
        const originalKeyword = keywords[i];

        // Check direct inclusion
        if (normalizedAnswer.includes(keyword)) {
          matchedKeywords.push(originalKeyword);
          continue;
        }

        // Check fuzzy match for each word in the answer
        const words = normalizedAnswer.split(/\s+/);
        const fuzzyMatch = words.some(
          (word) => levenshteinSimilarity(word, keyword) >= fuzzyTolerance,
        );

        if (fuzzyMatch) {
          matchedKeywords.push(originalKeyword);
        } else {
          missingKeywords.push(originalKeyword);
        }
      }

      return {
        isCorrect: missingKeywords.length === 0,
        matchedKeywords,
        missingKeywords,
      };
    }

    case 'regex': {
      try {
        const flags = caseSensitive ? '' : 'i';
        const regex = new RegExp(props.regexPattern ?? '', flags);
        return { isCorrect: regex.test(userAnswer.trim()) };
      } catch {
        // Invalid regex pattern - fail gracefully
        console.error('Invalid regex pattern:', props.regexPattern);
        return { isCorrect: false };
      }
    }

    default:
      return { isCorrect: false };
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * ShortAnswerIntent - Short text answer with auto-validation
 *
 * Supports three validation types:
 * - `exact`: Must match the exact answer (with optional fuzzy tolerance)
 * - `keywords`: Must contain all specified keywords
 * - `regex`: Must match the regex pattern
 *
 * @example
 * ```tsx
 * // Keywords validation
 * <ShortAnswerIntent
 *   question="¿Qué es una variable?"
 *   validationType="keywords"
 *   keywords={['almacenar', 'dato', 'valor']}
 *   hint="Piensa en un contenedor para datos"
 * />
 *
 * // Exact match with fuzzy tolerance
 * <ShortAnswerIntent
 *   question="¿Cuál es la capital de Francia?"
 *   validationType="exact"
 *   exactAnswer="París"
 *   fuzzyTolerance={0.85}
 * />
 * ```
 */
export function ShortAnswerIntent({
  question,
  validationType,
  keywords = [],
  regexPattern,
  exactAnswer,
  caseSensitive = false,
  minLength = 1,
  maxLength = 500,
  hint,
  correctFeedback = '¡Excelente respuesta!',
  incorrectFeedback = 'Tu respuesta no es correcta',
  showMascot = true,
  xpReward = 15,
  fuzzyTolerance = 0.8,
  onComplete,
  className,
}: ShortAnswerIntentProps): React.ReactElement {
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Computed states
  const canSubmit = useMemo(() => {
    const trimmed = userAnswer.trim();
    return trimmed.length >= minLength && trimmed.length <= maxLength;
  }, [userAnswer, minLength, maxLength]);

  const charCount = userAnswer.length;
  const isOverLimit = charCount > maxLength;
  const isUnderLimit = charCount < minLength && charCount > 0;

  // Handlers
  const handleCheck = (): void => {
    const result = validateAnswer(userAnswer, {
      question,
      validationType,
      keywords,
      regexPattern,
      exactAnswer,
      caseSensitive,
      fuzzyTolerance,
    });
    setValidationResult(result);
    setShowResult(true);
  };

  const handleRetry = (): void => {
    setUserAnswer('');
    setShowResult(false);
    setValidationResult(null);
    setShowHint(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleContinue = (): void => {
    onComplete?.(validationResult?.isCorrect ?? false);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    // Cmd/Ctrl + Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canSubmit && !showResult) {
      e.preventDefault();
      handleCheck();
    }
  };

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const isCorrect = validationResult?.isCorrect ?? false;

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
            <MessageSquare className="w-3.5 h-3.5" />
            Respuesta Corta
          </Badge>
          {showResult && isCorrect && (
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
      <div className="flex-1 relative z-10 flex items-center justify-center px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-2xl"
        >
          {/* Question */}
          <motion.div
            variants={fadeUp}
            className="p-6 rounded-3xl mb-4"
            style={{
              background: backgrounds.card,
              backdropFilter: `blur(${blur.md})`,
              border: `1px solid ${borders.subtle}`,
            }}
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">{question}</h2>

            {/* Textarea */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={userAnswer}
                onChange={(e) => !showResult && setUserAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={showResult}
                placeholder="Escribe tu respuesta aquí..."
                rows={4}
                className={clsx(
                  'w-full px-4 py-3 rounded-xl resize-none transition-all',
                  'focus:outline-none focus:ring-2',
                  'text-white placeholder:text-white/40',
                  !showResult &&
                    'bg-white/10 border border-white/20 focus:ring-[var(--house-primary)]',
                  showResult && isCorrect && 'bg-green-500/20 border-2 border-green-500',
                  showResult && !isCorrect && 'bg-red-500/20 border-2 border-red-500',
                )}
                style={{ minHeight: '100px' }}
              />

              {/* Character count */}
              <div
                className={clsx(
                  'absolute bottom-2 right-3 text-sm',
                  isOverLimit && 'text-red-400',
                  isUnderLimit && 'text-amber-400',
                  !isOverLimit && !isUnderLimit && 'text-white/40',
                )}
              >
                {charCount}/{maxLength}
              </div>
            </div>

            {/* Hint toggle */}
            {hint && !showResult && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 mt-3 text-sm text-white/60 hover:text-white/80 transition-colors"
              >
                <Lightbulb className="w-4 h-4" />
                {showHint ? 'Ocultar pista' : 'Ver pista'}
              </button>
            )}

            {/* Hint content */}
            <AnimatePresence>
              {showHint && hint && !showResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30"
                >
                  <p className="text-amber-200 text-sm">{hint}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Feedback */}
          <AnimatePresence>
            {showResult && validationResult && (
              <motion.div
                variants={feedbackVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="flex items-start gap-4"
              >
                {showMascot && (
                  <BitMascot mood={isCorrect ? 'celebrating' : 'thinking'} size="sm" />
                )}
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

                  {/* Keywords feedback */}
                  {validationType === 'keywords' &&
                    validationResult.missingKeywords &&
                    validationResult.missingKeywords.length > 0 && (
                      <p className="text-white/70 mt-2 text-sm">
                        Palabras clave faltantes:{' '}
                        <span className="text-amber-400">
                          {validationResult.missingKeywords.join(', ')}
                        </span>
                      </p>
                    )}

                  {/* Similarity score for exact match */}
                  {validationType === 'exact' &&
                    !isCorrect &&
                    validationResult.similarity !== undefined && (
                      <p className="text-white/70 mt-2 text-sm">
                        Similitud: {Math.round(validationResult.similarity * 100)}% (necesitas{' '}
                        {Math.round(fuzzyTolerance * 100)}%)
                      </p>
                    )}

                  {/* Show correct answer if wrong */}
                  {!isCorrect && validationType === 'exact' && exactAnswer && (
                    <p className="text-white/70 mt-2 text-sm">
                      Respuesta correcta: <span className="text-green-400">{exactAnswer}</span>
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
        {!showResult && canSubmit && (
          <Button variant="primary" size="lg" onClick={handleCheck}>
            <Check className="w-5 h-5 mr-2" />
            Verificar
          </Button>
        )}

        {!showResult && !canSubmit && userAnswer.length > 0 && (
          <p className="text-white/50 text-sm">
            {isUnderLimit ? `Mínimo ${minLength} caracteres` : `Máximo ${maxLength} caracteres`}
          </p>
        )}

        {showResult && !isCorrect && (
          <Button variant="ghost" onClick={handleRetry}>
            <RotateCcw className="w-5 h-5 mr-2" />
            Reintentar
          </Button>
        )}

        {showResult && (
          <Button variant="primary" size="lg" onClick={handleContinue}>
            Continuar
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

ShortAnswerIntent.displayName = 'ShortAnswerIntent';
