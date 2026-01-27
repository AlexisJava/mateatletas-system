'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronRight, CheckSquare, Check, RotateCcw, Square } from 'lucide-react';
import { Button, Badge } from '@mateatletas/ui/primitives';
import { BitMascot } from '@mateatletas/ui/organisms';
import { backgrounds, borders, blur, lessonSprings } from '@mateatletas/ui/tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface ChecklistItem {
  /** Unique identifier */
  id: string;
  /** Text to display */
  text: string;
  /** Whether this item is required to pass (default: true) */
  required?: boolean;
}

export interface ChecklistIntentProps {
  /** Title of the checklist */
  title: string;
  /** Optional instruction text */
  instruction?: string;
  /** Items to check */
  items: ChecklistItem[];
  /** Minimum number of items required (alternative to using required on each item) */
  minRequired?: number;
  /** Feedback for passing */
  correctFeedback?: string;
  /** Feedback for not passing */
  incorrectFeedback?: string;
  /** Whether to show mascot */
  showMascot?: boolean;
  /** XP to award */
  xpReward?: number;
  /** Called when completed */
  onComplete?: (passed: boolean) => void;
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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: lessonSprings.card,
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: lessonSprings.card,
  },
};

const checkmarkVariants = {
  unchecked: { scale: 0, opacity: 0 },
  checked: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 500, damping: 30 },
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
// COMPONENT
// =============================================================================

/**
 * ChecklistIntent - Self-assessment checklist
 *
 * Students mark checkboxes to indicate what they've completed or understood.
 * Validation is based on required items or minimum count.
 *
 * @example
 * ```tsx
 * // With required items
 * <ChecklistIntent
 *   title="¿Completaste los pasos?"
 *   items={[
 *     { id: '1', text: 'Leí el enunciado', required: true },
 *     { id: '2', text: 'Identifiqué los datos', required: true },
 *     { id: '3', text: 'Hice un dibujo', required: false },
 *   ]}
 * />
 *
 * // With minimum required
 * <ChecklistIntent
 *   title="Marca los que aplicaste"
 *   items={[
 *     { id: '1', text: 'Suma' },
 *     { id: '2', text: 'Resta' },
 *     { id: '3', text: 'Multiplicación' },
 *   ]}
 *   minRequired={2}
 * />
 * ```
 */
export function ChecklistIntent({
  title,
  instruction,
  items,
  minRequired,
  correctFeedback = '¡Muy bien! Has completado todos los criterios',
  incorrectFeedback = 'Aún faltan algunos criterios por completar',
  showMascot = true,
  xpReward = 10,
  onComplete,
  className,
}: ChecklistIntentProps): React.ReactElement {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showResult, setShowResult] = useState(false);

  // Calculate pass/fail status
  const evaluationResult = useMemo(() => {
    const checkedCount = checkedItems.size;

    if (minRequired !== undefined) {
      // Use minRequired logic
      return {
        passed: checkedCount >= minRequired,
        checkedCount,
        requiredCount: minRequired,
        message: `${checkedCount} de ${minRequired} mínimos`,
      };
    }

    // Use required items logic
    const requiredItems = items.filter((item) => item.required !== false);
    const checkedRequiredCount = requiredItems.filter((item) => checkedItems.has(item.id)).length;

    return {
      passed: checkedRequiredCount === requiredItems.length,
      checkedCount: checkedRequiredCount,
      requiredCount: requiredItems.length,
      message: `${checkedRequiredCount} de ${requiredItems.length} obligatorios`,
    };
  }, [checkedItems, items, minRequired]);

  // Handlers
  const handleToggle = (itemId: string): void => {
    if (showResult) return;

    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleCheck = (): void => {
    setShowResult(true);
  };

  const handleRetry = (): void => {
    setCheckedItems(new Set());
    setShowResult(false);
  };

  const handleContinue = (): void => {
    onComplete?.(evaluationResult.passed);
  };

  // Check if item is required
  const isRequired = (item: ChecklistItem): boolean => {
    if (minRequired !== undefined) return false; // All items count equally
    return item.required !== false;
  };

  return (
    <div
      className={clsx('h-[100dvh] w-full overflow-hidden relative flex flex-col', className)}
      style={{ background: backgrounds.base }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
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
            <CheckSquare className="w-3.5 h-3.5" />
            Checklist
          </Badge>
          {showResult && evaluationResult.passed && (
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
          {title}
        </motion.h1>
        {instruction && (
          <motion.p variants={fadeUp} className="text-white/70 mt-2">
            {instruction}
          </motion.p>
        )}
      </motion.div>

      {/* Main content */}
      <div className="flex-1 relative z-10 flex items-center justify-center px-6 overflow-y-auto py-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-2xl"
        >
          {/* Checklist items */}
          <motion.div
            variants={fadeUp}
            className="p-6 rounded-3xl space-y-3"
            style={{
              background: backgrounds.card,
              backdropFilter: `blur(${blur.md})`,
              border: `1px solid ${borders.subtle}`,
            }}
          >
            {items.map((item) => {
              const isChecked = checkedItems.has(item.id);
              const itemRequired = isRequired(item);

              return (
                <motion.button
                  key={item.id}
                  variants={itemVariants}
                  onClick={() => handleToggle(item.id)}
                  disabled={showResult}
                  className={clsx(
                    'w-full flex items-center gap-4 p-4 rounded-xl transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--house-primary)]',
                    !showResult && 'hover:bg-white/5 cursor-pointer',
                    showResult && 'cursor-default',
                    isChecked && !showResult && 'bg-white/10',
                    showResult && isChecked && 'bg-green-500/10',
                    showResult && !isChecked && itemRequired && 'bg-red-500/10',
                  )}
                  role="checkbox"
                  aria-checked={isChecked}
                  aria-label={item.text}
                >
                  {/* Checkbox */}
                  <div
                    className={clsx(
                      'relative w-6 h-6 rounded-md flex items-center justify-center transition-all',
                      'border-2',
                      !isChecked && 'border-white/30',
                      isChecked &&
                        !showResult &&
                        'border-[var(--house-primary)] bg-[var(--house-primary)]',
                      showResult && isChecked && 'border-green-500 bg-green-500',
                      showResult && !isChecked && itemRequired && 'border-red-500/50',
                    )}
                  >
                    <AnimatePresence>
                      {isChecked && (
                        <motion.div
                          variants={checkmarkVariants}
                          initial="unchecked"
                          animate="checked"
                          exit="unchecked"
                        >
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {!isChecked && !showResult && <Square className="w-4 h-4 text-transparent" />}
                  </div>

                  {/* Text */}
                  <span
                    className={clsx(
                      'flex-1 text-left text-lg transition-colors',
                      isChecked ? 'text-white' : 'text-white/70',
                      showResult && !isChecked && itemRequired && 'text-red-300',
                    )}
                  >
                    {item.text}
                  </span>

                  {/* Required indicator */}
                  {itemRequired && !showResult && (
                    <span className="text-xs text-white/40 uppercase tracking-wider">
                      Obligatorio
                    </span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Progress indicator (before checking) */}
          {!showResult && (
            <motion.div variants={fadeUp} className="mt-4 text-center text-white/50 text-sm">
              {minRequired !== undefined
                ? `Mínimo ${minRequired} de ${items.length}`
                : `${evaluationResult.checkedCount} de ${evaluationResult.requiredCount} obligatorios`}
            </motion.div>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                variants={feedbackVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="mt-6 flex items-start gap-4"
              >
                {showMascot && (
                  <BitMascot
                    mood={evaluationResult.passed ? 'celebrating' : 'thinking'}
                    size="sm"
                  />
                )}
                <div
                  className="flex-1 p-4 rounded-2xl"
                  style={{
                    background: evaluationResult.passed
                      ? 'rgba(34, 197, 94, 0.15)'
                      : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${evaluationResult.passed ? '#22c55e' : '#ef4444'}`,
                  }}
                >
                  <p
                    className="font-semibold text-lg"
                    style={{ color: evaluationResult.passed ? '#22c55e' : '#ef4444' }}
                  >
                    {evaluationResult.passed ? correctFeedback : incorrectFeedback}
                  </p>
                  <p className="text-white/70 mt-1">{evaluationResult.message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer actions */}
      <div className="relative z-10 px-6 pb-6 flex justify-center gap-4">
        {!showResult && (
          <Button variant="primary" size="lg" onClick={handleCheck}>
            <Check className="w-5 h-5 mr-2" />
            Verificar
          </Button>
        )}

        {showResult && !evaluationResult.passed && (
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

ChecklistIntent.displayName = 'ChecklistIntent';
