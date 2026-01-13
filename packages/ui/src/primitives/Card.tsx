import { forwardRef, type ReactNode } from 'react';
import { motion, type MotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { cardStyles, lessonSprings, backgrounds, blur, borders, radius } from '../tokens/lesson';

/**
 * Card variants using class-variance-authority
 */
const cardVariants = cva(
  // Base styles
  ['relative overflow-hidden'],
  {
    variants: {
      variant: {
        /** Standard glassmorphism card */
        base: 'rounded-3xl',
        /** Glass effect with more blur */
        glass: 'rounded-3xl',
        /** Full intent card for lesson slides */
        intent: 'rounded-[3rem] min-h-[500px]',
        /** Lesson/course card */
        lesson: 'rounded-3xl',
        /** Quiz container */
        quiz: 'rounded-[3rem]',
        /** Achievement display */
        achievement: 'rounded-3xl',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
        '2xl': 'p-12',
      },
    },
    defaultVariants: {
      variant: 'base',
      padding: 'md',
    },
  },
);

/**
 * Get inline styles based on variant
 */
function getVariantStyles(variant: CardProps['variant']): React.CSSProperties {
  const baseStyles: React.CSSProperties = {
    background: backgrounds.card,
    backdropFilter: `blur(${blur.md})`,
    border: `1px solid ${borders.subtle}`,
  };

  switch (variant) {
    case 'base':
      return baseStyles;
    case 'glass':
      return {
        ...baseStyles,
        backdropFilter: `blur(${blur.lg})`,
      };
    case 'intent':
      return {
        ...baseStyles,
        borderRadius: radius.full,
        minHeight: cardStyles.intent.minHeight,
      };
    case 'lesson':
      return baseStyles;
    case 'quiz':
      return {
        ...baseStyles,
        borderRadius: radius.full,
      };
    case 'achievement':
      return baseStyles;
    default:
      return baseStyles;
  }
}

export interface CardProps extends VariantProps<typeof cardVariants> {
  /** Enable hover effect */
  hover?: boolean;
  /** Enable glow effect using house primary color */
  glow?: boolean;
  /** Custom background gradient/color */
  backgroundGlow?: boolean;
  /** Additional class names */
  className?: string;
  /** Children content */
  children: ReactNode;
  /** Custom inline styles (merged with variant styles) */
  style?: React.CSSProperties;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Card - Glassmorphism container component
 *
 * Uses tokens from lesson.ts for consistent styling.
 * Supports house-based theming via CSS variables for glow effects.
 *
 * @example
 * ```tsx
 * <Card variant="base" hover>
 *   <h2>Card Title</h2>
 *   <p>Card content</p>
 * </Card>
 *
 * <Card variant="intent" glow padding="2xl">
 *   <DefineIntent {...props} />
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'base',
      padding = 'md',
      hover = false,
      glow = false,
      backgroundGlow = false,
      className,
      children,
      style,
      onClick,
    },
    ref,
  ) => {
    const variantStyles = getVariantStyles(variant);
    const mergedStyles = { ...variantStyles, ...style };

    // Motion props for hover effect
    const motionProps: Partial<MotionProps> = hover
      ? {
          whileHover: {
            y: -5,
            borderColor: 'var(--house-primary)',
            boxShadow: '0 8px 32px var(--house-primary-alpha)',
          },
          transition: lessonSprings.card,
        }
      : {};

    return (
      <motion.div
        ref={ref}
        className={clsx(cardVariants({ variant, padding }), className)}
        style={mergedStyles}
        onClick={onClick}
        {...motionProps}
      >
        {/* Background glow effect */}
        {backgroundGlow && (
          <div
            className="absolute -top-10 -right-10 w-40 h-40 blur-[60px] opacity-20 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom right, var(--house-primary), var(--house-secondary))',
            }}
          />
        )}

        {/* Glow border effect */}
        {glow && (
          <div
            className="absolute inset-0 rounded-inherit pointer-events-none"
            style={{
              boxShadow: '0 0 20px var(--house-primary-alpha)',
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  },
);

Card.displayName = 'Card';
