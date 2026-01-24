'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type AdminBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'pending' | 'neutral';
type AdminBadgeSize = 'sm' | 'md';

interface AdminBadgeProps {
  children: ReactNode;
  variant?: AdminBadgeVariant;
  size?: AdminBadgeSize;
  icon?: ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<AdminBadgeVariant, string> = {
  success: 'bg-[var(--status-success-muted)] text-[var(--status-success)]',
  warning: 'bg-[var(--status-warning-muted)] text-[var(--status-warning)]',
  danger: 'bg-[var(--status-danger-muted)] text-[var(--status-danger)]',
  info: 'bg-[var(--status-info-muted)] text-[var(--status-info)]',
  pending: 'bg-[var(--status-pending-muted)] text-[var(--status-pending)]',
  neutral: 'bg-white/[0.08] text-[var(--admin-text-secondary)]',
};

const SIZE_STYLES: Record<AdminBadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function AdminBadge({
  children,
  variant = 'neutral',
  size = 'sm',
  icon,
  className,
}: AdminBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-md',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
