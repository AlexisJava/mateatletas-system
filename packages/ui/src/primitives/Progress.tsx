import { forwardRef, type HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { backgrounds, borders, radius } from '../tokens/lesson';

/**
 * Progress variants using class-variance-authority
 */
const progressVariants = cva(
  // Base styles for container
  ['relative overflow-hidden'],
  {
    variants: {
      variant: {
        /** Default progress bar with house colors */
        default: '',
        /** XP progress - gold gradient */
        xp: '',
        /** Lesson progress */
        lesson: '',
        /** Timer progress */
        timer: '',
      },
      size: {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
        xl: 'h-6',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'full',
    },
  },
);

/**
 * Get fill gradient based on variant
 */
function getFillStyles(variant: ProgressProps['variant']): React.CSSProperties {
  switch (variant) {
    case 'xp':
      return {
        background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
        boxShadow: '0 0 10px rgba(251, 191, 36, 0.5)',
      };
    case 'timer':
      return {
        background: 'linear-gradient(90deg, #ef4444, #dc2626)',
        boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
      };
    case 'lesson':
    case 'default':
    default:
      return {
        background: 'linear-gradient(90deg, var(--house-primary), var(--house-secondary))',
        boxShadow: '0 0 10px var(--house-primary-alpha)',
      };
  }
}

export interface ProgressProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'style'>,
    VariantProps<typeof progressVariants> {
  /** Current value (0-100 or custom max) */
  value: number;
  /** Maximum value (default 100) */
  max?: number;
  /** Show percentage label */
  showLabel?: boolean;
  /** Custom label format */
  labelFormat?: (value: number, max: number) => string;
  /** Animate on mount */
  animate?: boolean;
  /** Animation duration in seconds */
  animationDuration?: number;
  /** Additional class names */
  className?: string;
}

/**
 * Progress - Progress bar component with animations
 *
 * Uses tokens from lesson.ts and supports house-based theming.
 * Includes variants for XP, lessons, and timers.
 *
 * @example
 * ```tsx
 * <Progress value={75} />
 * <Progress variant="xp" value={1250} max={2000} showLabel />
 * <Progress variant="timer" value={30} max={60} animate />
 * ```
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      variant = 'default',
      size = 'md',
      rounded = 'full',
      value,
      max = 100,
      showLabel = false,
      labelFormat,
      animate = true,
      animationDuration = 0.5,
      className,
      ...props
    },
    ref,
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const defaultLabelFormat = (v: number, m: number) => {
      if (variant === 'xp') return `${v}/${m} XP`;
      return `${Math.round((v / m) * 100)}%`;
    };

    const label = labelFormat ? labelFormat(value, max) : defaultLabelFormat(value, max);

    return (
      <div className="w-full">
        {showLabel && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-400">Progreso</span>
            <span className="text-sm font-bold text-white">{label}</span>
          </div>
        )}

        <div
          ref={ref}
          className={clsx(progressVariants({ variant, size, rounded }), className)}
          style={{
            background: backgrounds.overlay,
            border: `1px solid ${borders.white5}`,
          }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          {...props}
        >
          <motion.div
            className={clsx('h-full', rounded === 'full' ? 'rounded-full' : `rounded-${rounded}`)}
            style={getFillStyles(variant)}
            initial={animate ? { width: 0 } : { width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={{
              duration: animationDuration,
              ease: 'easeOut',
            }}
          />
        </div>
      </div>
    );
  },
);

Progress.displayName = 'Progress';
