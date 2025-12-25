'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import type { StatCardProps } from '../types/dashboard.types';

/**
 * StatCard - Tarjeta de estadística para el dashboard
 *
 * Muestra un KPI con icono, valor, y cambio porcentual.
 */

const STATUS_TEXT_COLORS = {
  success: 'text-[var(--status-success)]',
  warning: 'text-[var(--status-warning)]',
  danger: 'text-[var(--status-danger)]',
  info: 'text-[var(--status-info)]',
  neutral: 'text-[var(--admin-accent)]',
} as const;

const STATUS_BG_COLORS = {
  success: 'bg-[var(--status-success-muted)]',
  warning: 'bg-[var(--status-warning-muted)]',
  danger: 'bg-[var(--status-danger-muted)]',
  info: 'bg-[var(--status-info-muted)]',
  neutral: 'bg-[var(--admin-accent-muted)]',
} as const;

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  status = 'neutral',
}: StatCardProps) {
  return (
    <div className="group p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)] hover:border-[var(--admin-border-accent)] transition-all duration-300 hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-xl ${STATUS_BG_COLORS[status]} flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${STATUS_TEXT_COLORS[status]}`} />
        </div>
        {change !== undefined && change !== null && (
          <div
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              change >= 0
                ? 'text-[var(--status-success)] bg-[var(--status-success-muted)]'
                : 'text-[var(--status-danger)] bg-[var(--status-danger-muted)]'
            }`}
          >
            {change >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>
              {change >= 0 ? '+' : ''}
              {change}%
            </span>
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-[var(--admin-text)] mb-1">{value}</p>
        <p className="text-sm text-[var(--admin-text-muted)]">{label}</p>
        {changeLabel && (
          <p className="text-xs text-[var(--admin-text-disabled)] mt-1">{changeLabel}</p>
        )}
      </div>
    </div>
  );
}

export default StatCard;
