import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Check, X } from 'lucide-react';
import { lessonSprings, backgrounds, borders, feedback } from '../tokens/lesson';

export type OptionState = 'idle' | 'selected' | 'correct' | 'incorrect' | 'disabled';

export interface OptionButtonProps {
  /** Option content/label */
  children: ReactNode;
  /** Current state of the option */
  state?: OptionState;
  /** Whether this option is selected */
  selected?: boolean;
  /** Whether this is the correct answer (for showing after submission) */
  isCorrect?: boolean;
  /** Whether answer has been submitted */
  submitted?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Show letter prefix (A, B, C, D) */
  letter?: string;
  /** Additional class names */
  className?: string;
}

/**
 * Get computed state from props
 */
function computeState({
  state,
  selected,
  isCorrect,
  submitted,
  disabled,
}: Pick<
  OptionButtonProps,
  'state' | 'selected' | 'isCorrect' | 'submitted' | 'disabled'
>): OptionState {
  // If explicit state is provided, use it
  if (state) return state;

  // If disabled
  if (disabled) return 'disabled';

  // If submitted, show correct/incorrect
  if (submitted) {
    if (selected && isCorrect) return 'correct';
    if (selected && !isCorrect) return 'incorrect';
    if (isCorrect) return 'correct'; // Show correct answer even if not selected
    return 'idle';
  }

  // If selected but not submitted
  if (selected) return 'selected';

  return 'idle';
}

/**
 * Get styles based on state
 */
function getStyles(computedState: OptionState): {
  style: React.CSSProperties;
  className: string;
} {
  switch (computedState) {
    case 'selected':
      return {
        style: {
          backgroundColor: backgrounds.input,
          borderColor: 'var(--house-primary)',
          boxShadow: '0 0 15px var(--house-primary-alpha)',
        },
        className: 'text-white',
      };
    case 'correct':
      return {
        style: {
          backgroundColor: feedback.correct.bg,
          borderColor: feedback.correct.border,
        },
        className: 'text-green-100',
      };
    case 'incorrect':
      return {
        style: {
          backgroundColor: feedback.incorrect.bg,
          borderColor: feedback.incorrect.border,
        },
        className: 'text-red-100',
      };
    case 'disabled':
      return {
        style: {
          backgroundColor: backgrounds.input,
          borderColor: borders.subtle,
          opacity: 0.5,
        },
        className: 'text-slate-400 cursor-not-allowed',
      };
    case 'idle':
    default:
      return {
        style: {
          backgroundColor: backgrounds.input,
          borderColor: borders.subtle,
        },
        className: 'text-slate-200 hover:border-white/20',
      };
  }
}

/**
 * OptionButton - Molecule for quiz/selection options
 *
 * Used in quiz intents for multiple choice questions.
 * Handles selection, correct, and incorrect states with animations.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <OptionButton onClick={() => setSelected('a')} selected={selected === 'a'}>
 *   var puntos = 10
 * </OptionButton>
 *
 * // After submission
 * <OptionButton selected submitted isCorrect>
 *   ¡Respuesta correcta!
 * </OptionButton>
 * ```
 */
export function OptionButton({
  children,
  state,
  selected = false,
  isCorrect = false,
  submitted = false,
  onClick,
  disabled = false,
  letter,
  className,
}: OptionButtonProps) {
  const computedState = computeState({ state, selected, isCorrect, submitted, disabled });
  const { style, className: stateClassName } = getStyles(computedState);
  const isDisabled = disabled || submitted;

  const showCorrectIcon = computedState === 'correct';
  const showIncorrectIcon = computedState === 'incorrect' && selected;

  return (
    <motion.button
      type="button"
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={clsx(
        'relative w-full p-5 rounded-2xl text-left',
        'font-bold font-sans',
        'border-2 transition-colors',
        stateClassName,
        className,
      )}
      style={style}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      transition={lessonSprings.button}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Letter prefix */}
        {letter && (
          <span
            className={clsx(
              'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
              'text-sm font-bold',
              computedState === 'selected' && 'bg-[var(--house-primary)] text-white',
              computedState === 'correct' && 'bg-green-500 text-white',
              computedState === 'incorrect' && 'bg-red-500 text-white',
              computedState === 'idle' && 'bg-white/10 text-slate-400',
            )}
          >
            {letter}
          </span>
        )}

        {/* Content */}
        <span className="flex-1 font-mono text-base">{children}</span>

        {/* State icons */}
        {showCorrectIcon && <Check className="w-5 h-5 text-green-400 flex-shrink-0" />}
        {showIncorrectIcon && <X className="w-5 h-5 text-red-400 flex-shrink-0" />}
      </div>
    </motion.button>
  );
}

OptionButton.displayName = 'OptionButton';
