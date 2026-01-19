import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { Star, Flame, Trophy, Zap } from 'lucide-react';
import { feedback } from '../tokens/lesson';

/**
 * Badge variants using class-variance-authority
 */
const badgeVariants = cva(
  // Base styles
  ['inline-flex items-center gap-1.5', 'font-semibold', 'rounded-full', 'select-none'],
  {
    variants: {
      variant: {
        /** Default neutral badge */
        default: 'bg-white/10 text-slate-300 border border-white/10',
        /** XP points badge - gold/yellow */
        xp: 'text-yellow-400',
        /** Streak badge - orange/fire */
        streak: 'text-orange-400',
        /** Level/rank badge - purple */
        level: 'text-purple-400',
        /** Achievement badge - house color */
        achievement: '',
        /** Success state */
        success: '',
        /** Error state */
        error: '',
        /** Status indicator */
        status: 'bg-black/40 border border-white/10 text-white',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

/**
 * Get inline styles based on variant
 */
function getVariantStyles(variant: BadgeProps['variant']): React.CSSProperties {
  switch (variant) {
    case 'xp':
      return {
        background: 'rgba(251, 191, 36, 0.2)',
        border: '1px solid rgba(251, 191, 36, 0.3)',
      };
    case 'streak':
      return {
        background: 'rgba(249, 115, 22, 0.2)',
        border: '1px solid rgba(249, 115, 22, 0.3)',
      };
    case 'level':
      return {
        background: 'rgba(168, 85, 247, 0.2)',
        border: '1px solid rgba(168, 85, 247, 0.3)',
      };
    case 'achievement':
      return {
        background: 'var(--house-primary-alpha)',
        border: '1px solid var(--house-primary)',
        color: 'var(--house-primary)',
      };
    case 'success':
      return {
        background: feedback.correct.bg,
        border: `1px solid ${feedback.correct.border}`,
        color: feedback.correct.text,
      };
    case 'error':
      return {
        background: feedback.incorrect.bg,
        border: `1px solid ${feedback.incorrect.border}`,
        color: feedback.incorrect.text,
      };
    default:
      return {};
  }
}

/**
 * Get default icon for variant
 */
function getDefaultIcon(variant: BadgeProps['variant']): ReactNode {
  switch (variant) {
    case 'xp':
      return <Star className="w-3 h-3 fill-current" />;
    case 'streak':
      return <Flame className="w-3 h-3 fill-current" />;
    case 'level':
      return <Trophy className="w-3 h-3" />;
    case 'achievement':
      return <Zap className="w-3 h-3 fill-current" />;
    default:
      return null;
  }
}

export interface BadgeProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'style'>,
    VariantProps<typeof badgeVariants> {
  /** Icon to show (auto-selected based on variant if not provided) */
  icon?: ReactNode;
  /** Hide the default icon */
  hideIcon?: boolean;
  /** Enable pulse animation */
  pulse?: boolean;
  /** Additional class names */
  className?: string;
  /** Children content */
  children: ReactNode;
}

/**
 * Badge - Gamification and status indicator component
 *
 * Pre-configured variants for XP, streaks, levels, and achievements.
 * Uses tokens from lesson.ts for consistent styling.
 *
 * @example
 * ```tsx
 * <Badge variant="xp">+50 XP</Badge>
 * <Badge variant="streak">5 días</Badge>
 * <Badge variant="level" size="lg">Nivel 12</Badge>
 * <Badge variant="success">¡Correcto!</Badge>
 * ```
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      icon,
      hideIcon = false,
      pulse = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const defaultIcon = getDefaultIcon(variant);
    const showIcon = !hideIcon && (icon || defaultIcon);

    const badge = (
      <span
        ref={ref}
        className={clsx(badgeVariants({ variant, size }), className)}
        style={getVariantStyles(variant)}
        {...props}
      >
        {showIcon && <span className="flex-shrink-0">{icon || defaultIcon}</span>}
        <span>{children}</span>
      </span>
    );

    if (pulse) {
      return (
        <motion.span
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {badge}
        </motion.span>
      );
    }

    return badge;
  },
);

Badge.displayName = 'Badge';
