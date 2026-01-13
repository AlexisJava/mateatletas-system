import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { AlertCircle, Check } from 'lucide-react';
import { backgrounds, borders, radius, feedback } from '../tokens/lesson';

/**
 * Input variants using class-variance-authority
 */
const inputVariants = cva(
  // Base styles
  [
    'w-full',
    'font-medium',
    'outline-none',
    'transition-all duration-200',
    'placeholder:text-slate-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variant: {
        /** Default input style */
        default: 'text-white',
        /** Filled style with background */
        filled: 'text-white',
        /** Ghost/minimal style */
        ghost: 'bg-transparent text-white border-b-2 border-white/20 rounded-none px-0',
      },
      size: {
        sm: 'text-sm py-2 px-3 rounded-lg',
        md: 'text-base py-3 px-4 rounded-xl',
        lg: 'text-lg py-4 px-5 rounded-2xl',
      },
      state: {
        default: '',
        error: '',
        success: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
    },
  },
);

/**
 * Get inline styles based on variant and state
 */
function getInputStyles(
  variant: InputProps['variant'],
  state: InputProps['state'],
): React.CSSProperties {
  const baseStyles: React.CSSProperties = {
    background: backgrounds.input,
    border: `1px solid ${borders.accent}`,
  };

  // State-specific border colors
  if (state === 'error') {
    baseStyles.borderColor = feedback.incorrect.border;
  } else if (state === 'success') {
    baseStyles.borderColor = feedback.correct.border;
  }

  switch (variant) {
    case 'filled':
      return {
        ...baseStyles,
        background: backgrounds.surface,
      };
    case 'ghost':
      return {
        background: 'transparent',
        border: 'none',
        borderBottom:
          state === 'error'
            ? `2px solid ${feedback.incorrect.border}`
            : state === 'success'
              ? `2px solid ${feedback.correct.border}`
              : `2px solid ${borders.accent}`,
      };
    default:
      return baseStyles;
  }
}

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'style'>,
    VariantProps<typeof inputVariants> {
  /** Error message to display */
  error?: string;
  /** Success state */
  success?: boolean;
  /** Left icon/adornment */
  leftIcon?: ReactNode;
  /** Right icon/adornment */
  rightIcon?: ReactNode;
  /** Additional class names for wrapper */
  wrapperClassName?: string;
  /** Additional class names for input */
  className?: string;
}

/**
 * Input - Form input component
 *
 * Uses tokens from lesson.ts for consistent styling.
 * Supports error/success states with visual feedback.
 *
 * @example
 * ```tsx
 * <Input placeholder="Enter your name" />
 * <Input variant="filled" leftIcon={<Mail />} />
 * <Input error="This field is required" />
 * <Input success rightIcon={<Check />} />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      state: stateProp,
      error,
      success,
      leftIcon,
      rightIcon,
      wrapperClassName,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    // Determine state from props
    const state = error ? 'error' : success ? 'success' : stateProp || 'default';

    // Auto-add icons for states if not provided
    const effectiveRightIcon =
      rightIcon ||
      (state === 'error' ? (
        <AlertCircle className="w-5 h-5 text-red-400" />
      ) : state === 'success' ? (
        <Check className="w-5 h-5 text-green-400" />
      ) : null);

    return (
      <div className={clsx('w-full', wrapperClassName)}>
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            className={clsx(
              inputVariants({ variant, size, state }),
              leftIcon && 'pl-10',
              effectiveRightIcon && 'pr-10',
              className,
            )}
            style={getInputStyles(variant, state)}
            disabled={disabled}
            aria-invalid={state === 'error'}
            aria-describedby={error ? 'input-error' : undefined}
            {...props}
          />

          {/* Right icon */}
          {effectiveRightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {effectiveRightIcon}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p id="input-error" className="mt-2 text-sm text-red-400 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
