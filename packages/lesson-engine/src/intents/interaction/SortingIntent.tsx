'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { clsx } from 'clsx';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Check,
  X,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { BitMascot } from '@mateatletas/ui/organisms';
import { backgrounds, borders, blur, lessonSprings, feedback } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface SortItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Value used for sorting comparison */
  value: number | string;
  /** Optional visual representation */
  visual?: React.ReactNode;
}

export type SortDirection = 'asc' | 'desc';
export type SortCriterion = 'numeric' | 'alphabetic' | 'size' | 'custom';

export interface SortingIntentProps {
  /** Instruction text */
  instruction: string;
  /** Items to sort */
  items: SortItem[];
  /** Sort direction required */
  direction: SortDirection;
  /** Sort criterion for display */
  criterion?: SortCriterion;
  /** Category badge text */
  category?: string;
  /** Show direction hint */
  showDirectionHint?: boolean;
  /** Show Bit mascot */
  showMascot?: boolean;
  /** XP reward */
  xpReward?: number;
  /** Feedback messages */
  feedback?: {
    correct?: string;
    incorrect?: string;
  };
  /** Called with result */
  onAnswer?: (result: { isCorrect: boolean; attempts: number; xp?: number }) => void;
  /** Called when continuing */
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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: lessonSprings.card,
  },
};

const feedbackVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: lessonSprings.button,
  },
};

// =============================================================================
// HELPERS
// =============================================================================

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getCriterionLabel(criterion: SortCriterion): string {
  switch (criterion) {
    case 'numeric':
      return 'Ordenar números';
    case 'alphabetic':
      return 'Ordenar alfabéticamente';
    case 'size':
      return 'Ordenar por tamaño';
    case 'custom':
    default:
      return 'Ordenar';
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

type Status = 'idle' | 'correct' | 'incorrect';

/**
 * SortingIntent - Sort items by criterion
 *
 * Users arrange items in ascending or descending order based on value.
 * Different from DragDropIntent which focuses on ordering steps/sequences.
 *
 * @example
 * ```tsx
 * <SortingIntent
 *   instruction="Ordena las fracciones de menor a mayor"
 *   items={[
 *     { id: '1', label: '3/4', value: 0.75 },
 *     { id: '2', label: '1/2', value: 0.5 },
 *     { id: '3', label: '1/4', value: 0.25 },
 *   ]}
 *   direction="asc"
 *   criterion="numeric"
 *   onContinue={() => nextSlide()}
 * />
 * ```
 */
export function SortingIntent({
  instruction,
  items: initialItems,
  direction,
  criterion = 'numeric',
  category,
  showDirectionHint = true,
  showMascot = true,
  xpReward = 15,
  feedback: feedbackMessages,
  onAnswer,
  onContinue,
  className,
}: SortingIntentProps) {
  const [items, setItems] = useState(() => shuffleArray(initialItems));
  const [status, setStatus] = useState<Status>('idle');
  const [attempts, setAttempts] = useState(0);

  // Calculate correct order
  const correctOrder = useMemo(() => {
    const sorted = [...initialItems].sort((a, b) => {
      if (typeof a.value === 'number' && typeof b.value === 'number') {
        return direction === 'asc' ? a.value - b.value : b.value - a.value;
      }
      // String comparison
      const strA = String(a.value);
      const strB = String(b.value);
      return direction === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
    return sorted.map((item) => item.id);
  }, [initialItems, direction]);

  const handleCheck = () => {
    const userOrder = items.map((item) => item.id);
    const isCorrect = userOrder.every((id, idx) => id === correctOrder[idx]);
    const newAttempts = attempts + 1;

    setAttempts(newAttempts);
    setStatus(isCorrect ? 'correct' : 'incorrect');
    onAnswer?.({
      isCorrect,
      attempts: newAttempts,
      xp: isCorrect ? Math.max(xpReward - (newAttempts - 1) * 3, 5) : 0,
    });
  };

  const handleRetry = () => {
    setItems(shuffleArray(initialItems));
    setStatus('idle');
  };

  const mascotMood = status === 'idle' ? 'thinking' : status === 'correct' ? 'celebrating' : 'sad';
  const earnedXP = Math.max(xpReward - (attempts - 1) * 3, 5);

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
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full pointer-events-none"
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

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-xl flex flex-col items-center"
      >
        {/* Mascot */}
        {showMascot && (
          <motion.div variants={itemVariants} className="mb-4">
            <BitMascot mood={mascotMood} size="sm" />
          </motion.div>
        )}

        {/* Category badge */}
        <motion.div variants={itemVariants} className="mb-3">
          <Badge variant="level" className="inline-flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5" />
            {category || getCriterionLabel(criterion)}
          </Badge>
        </motion.div>

        {/* Direction hint */}
        {showDirectionHint && (
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2 mb-4 px-4 py-2 rounded-full"
            style={{
              background: backgrounds.card,
              border: `1px solid ${borders.subtle}`,
            }}
          >
            {direction === 'asc' ? (
              <>
                <ArrowUp className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white/70">De menor a mayor</span>
              </>
            ) : (
              <>
                <ArrowDown className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-white/70">De mayor a menor</span>
              </>
            )}
          </motion.div>
        )}

        {/* Instruction */}
        <motion.h2
          variants={itemVariants}
          className="text-xl md:text-2xl font-bold text-white text-center mb-6"
        >
          {instruction}
        </motion.h2>

        {/* Sortable items */}
        <motion.div variants={itemVariants} className="w-full mb-6">
          <Reorder.Group
            axis="y"
            values={items}
            onReorder={status === 'idle' ? setItems : () => {}}
            className="space-y-2"
          >
            {items.map((item, index) => {
              const isCorrectPosition = status !== 'idle' && item.id === correctOrder[index];
              const isIncorrectPosition = status === 'incorrect' && item.id !== correctOrder[index];

              return (
                <Reorder.Item
                  key={item.id}
                  value={item}
                  dragListener={status === 'idle'}
                  className={clsx(
                    'px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-300',
                    status === 'idle' && 'cursor-grab active:cursor-grabbing',
                  )}
                  style={{
                    background: isCorrectPosition
                      ? feedback.correct.bg
                      : isIncorrectPosition
                        ? feedback.incorrect.bg
                        : backgrounds.card,
                    backdropFilter: `blur(${blur.md})`,
                    border: `2px solid ${
                      isCorrectPosition
                        ? feedback.correct.border
                        : isIncorrectPosition
                          ? feedback.incorrect.border
                          : borders.subtle
                    }`,
                  }}
                  whileDrag={{
                    scale: 1.03,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    cursor: 'grabbing',
                  }}
                >
                  {/* Drag handle */}
                  <div className={clsx('flex-shrink-0', status !== 'idle' && 'opacity-30')}>
                    <GripVertical className="w-5 h-5 text-white/40" />
                  </div>

                  {/* Visual (optional) */}
                  {item.visual && <div className="flex-shrink-0">{item.visual}</div>}

                  {/* Label */}
                  <span
                    className={clsx(
                      'text-lg font-semibold flex-1',
                      isCorrectPosition && 'text-green-300',
                      isIncorrectPosition && 'text-red-300',
                      status === 'idle' && 'text-white',
                    )}
                  >
                    {item.label}
                  </span>

                  {/* Status icon */}
                  {status !== 'idle' && (
                    <div
                      className={clsx(
                        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                        isCorrectPosition && 'bg-green-500',
                        isIncorrectPosition && 'bg-red-500',
                      )}
                    >
                      {isCorrectPosition ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <X className="w-4 h-4 text-white" />
                      )}
                    </div>
                  )}
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </motion.div>

        {/* Feedback */}
        <AnimatePresence>
          {status !== 'idle' && (
            <motion.div
              variants={feedbackVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
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
                  ? feedbackMessages?.correct || '¡Excelente! Orden correcto.'
                  : feedbackMessages?.incorrect || 'Revisa el orden e intenta de nuevo.'}
              </p>
              {status === 'correct' && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge variant="xp">+{earnedXP} XP</Badge>
                  {attempts > 1 && (
                    <span className="text-white/50 text-sm">en {attempts} intentos</span>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex items-center gap-3 w-full max-w-md">
          {status === 'incorrect' && (
            <Button variant="ghost" onClick={handleRetry} className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          )}

          <Button
            variant="primary"
            size="lg"
            onClick={status === 'idle' ? handleCheck : onContinue}
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

SortingIntent.displayName = 'SortingIntent';
