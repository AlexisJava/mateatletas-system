'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AdminInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-10 px-3 rounded-xl',
              'bg-[var(--admin-surface-0)] border border-[var(--admin-border)]',
              'text-[var(--admin-text)] placeholder:text-[var(--admin-text-disabled)]',
              'transition-all duration-200',
              'hover:border-[var(--admin-text-muted)]',
              'focus:outline-none focus:border-[var(--admin-accent)] focus:ring-2 focus:ring-[var(--admin-accent-muted)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error &&
                'border-[var(--status-danger)] focus:border-[var(--status-danger)] focus:ring-[var(--status-danger-muted)]',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-[var(--status-danger)]">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-[var(--admin-text-muted)]">{hint}</p>}
      </div>
    );
  },
);

AdminInput.displayName = 'AdminInput';
