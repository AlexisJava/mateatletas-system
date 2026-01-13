'use client';

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { clsx } from 'clsx';
import { GripVertical, Check, X, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { BitMascot } from '@mateatletas/ui/organisms';
import { backgrounds, borders, blur, lessonSprings, feedback } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface DragItem {
  id: string;
  content: string;
  /** Optional visual */
  visual?: ReactNode;
}

export interface DragDropIntentProps {
  /** Instructions for the user */
  instruction: string;
  /** Items to be ordered */
  items: DragItem[];
  /** Correct order of item IDs */
  correctOrder: string[];
  /** Category label */
  category?: string;
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
  onAnswer?: (result: { isCorrect: boolean; userOrder: string[]; xp?: number }) => void;
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
      staggerChildren: 0.1,
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
// COMPONENT
// =============================================================================

type Status = 'idle' | 'correct' | 'incorrect';

/**
 * DragDropIntent - Reorder/sorting interaction
 *
 * Users drag items to put them in the correct order.
 * Uses Framer Motion's Reorder for smooth drag animations.
 *
 * @example
 * ```tsx
 * <DragDropIntent
 *   instruction="Ordena los pasos para sumar fracciones"
 *   items={[
 *     { id: '1', content: 'Buscar MCM' },
 *     { id: '2', content: 'Igualar denominadores' },
 *     { id: '3', content: 'Sumar numeradores' },
 *   ]}
 *   correctOrder={['1', '2', '3']}
 *   onContinue={() => nextSlide()}
 * />
 * ```
 */
export function DragDropIntent({
  instruction,
  items: initialItems,
  correctOrder,
  category = 'Ordenar',
  showMascot = true,
  xpReward = 15,
  feedback: feedbackMessages,
  onAnswer,
  onContinue,
  className,
}: DragDropIntentProps) {
  // Shuffle items initially
  const [items, setItems] = useState(() => {
    const shuffled = [...initialItems];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  const [status, setStatus] = useState<Status>('idle');

  const handleCheck = () => {
    const userOrder = items.map((item) => item.id);
    const isCorrect = userOrder.every((id, idx) => id === correctOrder[idx]);

    setStatus(isCorrect ? 'correct' : 'incorrect');
    onAnswer?.({
      isCorrect,
      userOrder,
      xp: isCorrect ? xpReward : 0,
    });
  };

  const handleRetry = () => {
    // Reshuffle
    const shuffled = [...initialItems];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setItems(shuffled);
    setStatus('idle');
  };

  const mascotMood = status === 'idle' ? 'thinking' : status === 'correct' ? 'celebrating' : 'sad';

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
                : 'var(--house-secondary)',
          filter: `blur(${blur['2xl']})`,
          opacity: 0.1,
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
        <motion.div variants={itemVariants} className="mb-4">
          <Badge variant="level" className="inline-flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            {category}
          </Badge>
        </motion.div>

        {/* Instruction */}
        <motion.h2
          variants={itemVariants}
          className="text-2xl md:text-3xl font-bold text-white text-center mb-8"
        >
          {instruction}
        </motion.h2>

        {/* Draggable items */}
        <motion.div variants={itemVariants} className="w-full mb-8">
          <Reorder.Group
            axis="y"
            values={items}
            onReorder={status === 'idle' ? setItems : () => {}}
            className="space-y-3"
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
                    'p-4 rounded-xl flex items-center gap-4 transition-all duration-300',
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
                    scale: 1.02,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    cursor: 'grabbing',
                  }}
                >
                  {/* Drag handle */}
                  <div className={clsx('flex-shrink-0', status !== 'idle' && 'opacity-30')}>
                    <GripVertical className="w-5 h-5 text-white/40" />
                  </div>

                  {/* Position number */}
                  <div
                    className={clsx(
                      'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0',
                      isCorrectPosition && 'bg-green-500 text-white',
                      isIncorrectPosition && 'bg-red-500 text-white',
                      status === 'idle' && 'bg-white/10 text-white/60',
                    )}
                  >
                    {status !== 'idle' && isCorrectPosition ? (
                      <Check className="w-4 h-4" />
                    ) : status !== 'idle' && isIncorrectPosition ? (
                      <X className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Content */}
                  <span
                    className={clsx(
                      'text-lg font-medium flex-1',
                      isCorrectPosition && 'text-green-300',
                      isIncorrectPosition && 'text-red-300',
                      status === 'idle' && 'text-white',
                    )}
                  >
                    {item.content}
                  </span>

                  {/* Visual */}
                  {item.visual && <div className="flex-shrink-0">{item.visual}</div>}
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
                  ? feedbackMessages?.correct || '¡Perfecto! Orden correcto.'
                  : feedbackMessages?.incorrect || 'El orden no es correcto. Intenta de nuevo.'}
              </p>
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

DragDropIntent.displayName = 'DragDropIntent';
