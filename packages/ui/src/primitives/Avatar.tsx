import { forwardRef, useState, type ImgHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { User } from 'lucide-react';
import { backgrounds, borders } from '../tokens/lesson';

/**
 * Avatar variants using class-variance-authority
 */
const avatarVariants = cva(
  // Base styles
  [
    'relative inline-flex items-center justify-center',
    'overflow-hidden',
    'bg-white/10',
    'flex-shrink-0',
  ],
  {
    variants: {
      size: {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-xl',
        '2xl': 'w-24 h-24 text-2xl',
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-xl',
      },
      ring: {
        none: '',
        default: 'ring-2 ring-white/20',
        house: 'ring-2',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle',
      ring: 'none',
    },
  },
);

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export interface AvatarProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'size' | 'style'>,
    VariantProps<typeof avatarVariants> {
  /** Image source URL */
  src?: string;
  /** Alt text / name for fallback initials */
  alt?: string;
  /** Name for generating initials (overrides alt for initials) */
  name?: string;
  /** Custom fallback content */
  fallback?: React.ReactNode;
  /** Status indicator */
  status?: 'online' | 'offline' | 'away' | 'busy';
  /** Additional class names */
  className?: string;
}

/**
 * Avatar - User avatar/profile picture component
 *
 * Shows image, initials fallback, or icon fallback.
 * Supports status indicators and house-colored rings.
 *
 * @example
 * ```tsx
 * <Avatar src="/user.jpg" alt="John Doe" />
 * <Avatar name="María García" size="lg" />
 * <Avatar ring="house" status="online" />
 * ```
 */
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      size = 'md',
      shape = 'circle',
      ring = 'none',
      src,
      alt,
      name,
      fallback,
      status,
      className,
      ...props
    },
    ref,
  ) => {
    const [imageError, setImageError] = useState(false);
    const displayName = name || alt || '';
    const initials = displayName ? getInitials(displayName) : null;
    const showImage = src && !imageError;

    // Ring style for house variant (using CSS custom property for Tailwind ring)
    const ringStyle: React.CSSProperties =
      ring === 'house' ? { ['--tw-ring-color' as string]: 'var(--house-primary)' } : {};

    // Status indicator colors
    const statusColors = {
      online: '#22c55e',
      offline: '#64748b',
      away: '#fbbf24',
      busy: '#ef4444',
    };

    return (
      <div
        ref={ref}
        className={clsx(avatarVariants({ size, shape, ring }), className)}
        style={{
          background: backgrounds.surface,
          border: `1px solid ${borders.subtle}`,
          ...ringStyle,
        }}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt || displayName || 'Avatar'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            {...props}
          />
        ) : fallback ? (
          <span className="text-slate-300">{fallback}</span>
        ) : initials ? (
          <span className="font-semibold" style={{ color: 'var(--house-primary, #94a3b8)' }}>
            {initials}
          </span>
        ) : (
          <User className="w-1/2 h-1/2 text-slate-400" />
        )}

        {/* Status indicator */}
        {status && (
          <span
            className={clsx(
              'absolute bottom-0 right-0 rounded-full border-2 border-[#0f0f22]',
              size === 'xs' && 'w-1.5 h-1.5',
              size === 'sm' && 'w-2 h-2',
              size === 'md' && 'w-2.5 h-2.5',
              size === 'lg' && 'w-3 h-3',
              size === 'xl' && 'w-4 h-4',
              size === '2xl' && 'w-5 h-5',
            )}
            style={{ backgroundColor: statusColors[status] }}
          />
        )}
      </div>
    );
  },
);

Avatar.displayName = 'Avatar';
