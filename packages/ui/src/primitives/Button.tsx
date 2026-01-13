import { forwardRef, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';
import { lessonSprings, buttonStyles, shadows, borders } from '../tokens/lesson';

/**
 * Button variants using class-variance-authority
 * Base styles + variant-specific classes
 */
const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center gap-2',
    'font-semibold tracking-normal',
    'rounded-2xl',
    'transition-colors',
    'outline-none focus:outline-none',
    'select-none cursor-pointer',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variant: {
        primary: 'text-white',
        secondary: 'text-white',
        ghost: 'text-slate-300 hover:text-white',
        danger: 'text-white',
      },
      size: {
        sm: 'text-sm py-2 px-4',
        md: 'text-base py-3 px-6',
        lg: 'text-lg py-4 px-8',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

/**
 * Get inline styles based on variant (for gradients and effects that can't be in Tailwind)
 */
function getVariantStyles(variant: ButtonProps['variant']): React.CSSProperties {
  switch (variant) {
    case 'primary':
      return {
        background: buttonStyles.primary.background,
        boxShadow: shadows.buttonPrimary,
        border: `1px solid ${borders.interactive}`,
      };
    case 'secondary':
      return {
        background: buttonStyles.secondary.background,
        backdropFilter: buttonStyles.secondary.backdropFilter,
        border: buttonStyles.secondary.border,
        boxShadow: buttonStyles.secondary.boxShadow,
      };
    case 'ghost':
      return {
        background: buttonStyles.ghost.background,
        border: buttonStyles.ghost.border,
      };
    case 'danger':
      return {
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        boxShadow: '0 10px 20px -5px rgba(239, 68, 68, 0.4)',
        border: `1px solid ${borders.interactive}`,
      };
    default:
      return {};
  }
}

/**
 * Framer Motion hover/tap animations by variant
 */
function getMotionProps(variant: ButtonProps['variant'], disabled?: boolean) {
  if (disabled) return {};

  const baseHover = { scale: 1.02, y: -2 };
  const baseTap = { scale: 0.96, y: 2 };

  switch (variant) {
    case 'primary':
      return {
        whileHover: {
          ...baseHover,
          filter: 'brightness(1.1)',
          boxShadow: shadows.buttonHover,
        },
        whileTap: {
          ...baseTap,
          filter: 'brightness(0.95)',
          boxShadow: shadows.buttonPressed,
        },
      };
    case 'secondary':
      return {
        whileHover: {
          ...baseHover,
          backgroundColor: 'rgba(30, 27, 75, 0.7)',
          borderColor: 'var(--house-primary)',
          boxShadow: '0 8px 20px var(--house-primary-alpha)',
        },
        whileTap: {
          ...baseTap,
          backgroundColor: 'rgba(30, 27, 75, 0.4)',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        },
      };
    case 'ghost':
      return {
        whileHover: {
          scale: 1.04,
          y: -1,
          backgroundColor: 'rgba(255,255,255,0.08)',
        },
        whileTap: {
          scale: 0.95,
          y: 1,
          backgroundColor: 'rgba(255,255,255,0.05)',
        },
      };
    case 'danger':
      return {
        whileHover: {
          ...baseHover,
          filter: 'brightness(1.1)',
          boxShadow: '0 15px 30px -5px rgba(239, 68, 68, 0.5)',
        },
        whileTap: {
          ...baseTap,
          filter: 'brightness(0.95)',
        },
      };
    default:
      return {};
  }
}

// Props that conflict between React and Framer Motion
type ConflictingProps = 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart';

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style' | ConflictingProps>,
    VariantProps<typeof buttonVariants> {
  /** Icon to show before text */
  icon?: ReactNode;
  /** Icon to show after text */
  iconRight?: ReactNode;
  /** Show loading spinner */
  loading?: boolean;
  /** Additional class names */
  className?: string;
  /** Children content */
  children: ReactNode;
}

/**
 * Button - Primitive component with Framer Motion animations
 *
 * Uses tokens from lesson.ts for consistent styling across the design system.
 * Supports house-based theming via CSS variables.
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Continue
 * </Button>
 *
 * <Button variant="secondary" icon={<Star />} loading>
 *   Loading...
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconRight,
      loading = false,
      disabled = false,
      className,
      children,
      onClick,
      type = 'button',
      'aria-label': ariaLabel,
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const motionProps = getMotionProps(variant, isDisabled);

    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={onClick}
        aria-label={ariaLabel}
        className={clsx(buttonVariants({ variant, size }), className)}
        style={getVariantStyles(variant)}
        disabled={isDisabled}
        transition={lessonSprings.button}
        {...motionProps}
      >
        {/* Loading spinner */}
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}

        {/* Left icon */}
        {!loading && icon && <span className="pointer-events-none">{icon}</span>}

        {/* Text content */}
        <span className="pointer-events-none">{children}</span>

        {/* Right icon */}
        {iconRight && <span className="pointer-events-none">{iconRight}</span>}

        {/* Shine effect for primary variant */}
        {variant === 'primary' && !isDisabled && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
        )}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';

export type { VariantProps };
