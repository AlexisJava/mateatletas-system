'use client';

import type { ReactNode } from 'react';

/**
 * ChartContainer - Wrapper consistente para graficos
 *
 * Proporciona titulo, subtitulo, loading state y estilos uniformes.
 */

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

function ChartSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-[var(--admin-surface-2)] rounded-lg" />
    </div>
  );
}

export function ChartContainer({
  title,
  subtitle,
  loading = false,
  action,
  children,
  className = '',
}: ChartContainerProps) {
  return (
    <div
      className={`p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)] ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--admin-text)]">{title}</h3>
          {subtitle && <p className="text-sm text-[var(--admin-text-muted)] mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {loading ? <ChartSkeleton /> : children}
    </div>
  );
}

export default ChartContainer;
