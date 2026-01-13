import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { backgrounds } from '../tokens/lesson';

/**
 * Skeleton variants using class-variance-authority
 */
const skeletonVariants = cva(
  // Base styles with shimmer animation
  ['animate-pulse'],
  {
    variants: {
      variant: {
        /** Default rectangle */
        default: 'rounded-lg',
        /** Circular (for avatars) */
        circle: 'rounded-full',
        /** Text line */
        text: 'rounded h-4',
        /** Card placeholder */
        card: 'rounded-3xl',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /** Width (CSS value or Tailwind class) */
  width?: string | number;
  /** Height (CSS value or Tailwind class) */
  height?: string | number;
  /** Number of lines (for text variant) */
  lines?: number;
  /** Additional class names */
  className?: string;
}

/**
 * Skeleton - Loading placeholder component
 *
 * Uses tokens from lesson.ts for consistent styling.
 * Includes shimmer animation for loading states.
 *
 * @example
 * ```tsx
 * <Skeleton width={200} height={20} />
 * <Skeleton variant="circle" width={48} height={48} />
 * <Skeleton variant="text" lines={3} />
 * <Skeleton variant="card" height={200} />
 * ```
 */
export function Skeleton({
  variant = 'default',
  width,
  height,
  lines = 1,
  className,
  style,
  ...props
}: SkeletonProps) {
  const baseStyle: React.CSSProperties = {
    background: backgrounds.surface,
    ...style,
  };

  // Handle width
  if (width !== undefined) {
    baseStyle.width = typeof width === 'number' ? `${width}px` : width;
  }

  // Handle height
  if (height !== undefined) {
    baseStyle.height = typeof height === 'number' ? `${height}px` : height;
  }

  // Text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <div className={clsx('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={clsx(skeletonVariants({ variant }), i === lines - 1 && 'w-3/4')}
            style={baseStyle}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={clsx(skeletonVariants({ variant }), className)} style={baseStyle} {...props} />
  );
}

Skeleton.displayName = 'Skeleton';

/**
 * Pre-configured skeleton patterns
 */
export const SkeletonPatterns = {
  /** Avatar + text pattern */
  User: ({ className }: { className?: string }) => (
    <div className={clsx('flex items-center gap-3', className)}>
      <Skeleton variant="circle" width={40} height={40} />
      <div className="space-y-2">
        <Skeleton width={120} height={14} />
        <Skeleton width={80} height={12} />
      </div>
    </div>
  ),

  /** Card with content pattern */
  Card: ({ className }: { className?: string }) => (
    <div className={clsx('p-6 rounded-3xl', className)} style={{ background: backgrounds.card }}>
      <Skeleton width="60%" height={24} className="mb-4" />
      <Skeleton variant="text" lines={3} />
      <Skeleton width={100} height={36} className="mt-4" />
    </div>
  ),

  /** Stats row pattern */
  Stats: ({ count = 4, className }: { count?: number; className?: string }) => (
    <div
      className={clsx('grid gap-4', className)}
      style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 rounded-2xl" style={{ background: backgrounds.card }}>
          <Skeleton width={32} height={32} className="mb-2" />
          <Skeleton width="80%" height={20} className="mb-1" />
          <Skeleton width="50%" height={14} />
        </div>
      ))}
    </div>
  ),
};
