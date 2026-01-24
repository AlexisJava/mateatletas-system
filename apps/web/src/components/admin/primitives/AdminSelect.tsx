'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface AdminSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  hint?: string;
  options: AdminSelectOption[];
  placeholder?: string;
}

export const AdminSelect = forwardRef<HTMLSelectElement, AdminSelectProps>(
  ({ label, error, hint, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full h-10 px-3 pr-10 rounded-xl appearance-none',
              'bg-[var(--admin-surface-0)] border border-[var(--admin-border)]',
              'text-[var(--admin-text)]',
              'transition-all duration-200',
              'hover:border-[var(--admin-text-muted)]',
              'focus:outline-none focus:border-[var(--admin-accent)] focus:ring-2 focus:ring-[var(--admin-accent-muted)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error &&
                'border-[var(--status-danger)] focus:border-[var(--status-danger)] focus:ring-[var(--status-danger-muted)]',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)] pointer-events-none" />
        </div>
        {error && <p className="mt-1.5 text-sm text-[var(--status-danger)]">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-[var(--admin-text-muted)]">{hint}</p>}
      </div>
    );
  },
);

AdminSelect.displayName = 'AdminSelect';
