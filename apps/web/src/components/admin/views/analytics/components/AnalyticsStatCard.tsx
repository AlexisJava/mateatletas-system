'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { AnalyticsStatCardProps } from '../types/analytics.types';

/**
 * AnalyticsStatCard - Tarjeta de estadística para analytics
 */

export function AnalyticsStatCard({
  label,
  value,
  change,
  icon: Icon,
  color,
}: AnalyticsStatCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)] hover:border-[var(--admin-border-accent)] transition-all">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              change >= 0
                ? 'text-[var(--status-success)] bg-[var(--status-success-muted)]'
                : 'text-[var(--status-danger)] bg-[var(--status-danger-muted)]'
            }`}
          >
            {change >= 0 ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {change >= 0 ? '+' : ''}
            {change}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-[var(--admin-text)]">{value}</p>
      <p className="text-sm text-[var(--admin-text-muted)] mt-1">{label}</p>
    </div>
  );
}

export default AnalyticsStatCard;
