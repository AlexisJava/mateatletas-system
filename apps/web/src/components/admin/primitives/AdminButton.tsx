'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type AdminButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type AdminButtonSize = 'sm' | 'md' | 'lg';

export interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const VARIANT_STYLES: Record<AdminButtonVariant, string> = {
  primary: `
    bg-[var(--admin-accent)] hover:bg-[var(--admin-accent-hover)]
    text-white font-medium
    shadow-lg shadow-[var(--admin-accent)]/20
    hover:shadow-[var(--admin-accent)]/30
  `,
  secondary: `
    bg-white/[0.05] hover:bg-white/[0.08]
    border border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]
    text-[var(--admin-text)]
  `,
  ghost: `
    hover:bg-white/[0.05]
    text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]
  `,
  danger: `
    bg-[var(--status-danger-muted)] hover:bg-[var(--status-danger)]/20
    text-[var(--status-danger)]
    border border-[var(--status-danger)]/30
  `,
};

const SIZE_STYLES: Record<AdminButtonSize, string> = {
  sm: 'h-8 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
};

export const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/50 focus:ring-offset-2 focus:ring-offset-[var(--admin-bg)]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          VARIANT_STYLES[variant],
          SIZE_STYLES[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {icon && iconPosition === 'left' && icon}
            {children}
            {icon && iconPosition === 'right' && icon}
          </>
        )}
      </button>
    );
  },
);

AdminButton.displayName = 'AdminButton';
