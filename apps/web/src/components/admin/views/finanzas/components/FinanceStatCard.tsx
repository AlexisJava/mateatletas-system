'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { FinanceStatCardProps } from '../types/finance.types';

/**
 * FinanceStatCard - Tarjeta de estadística financiera
 *
 * Muestra un KPI con gradientes y tendencia.
 */

export function FinanceStatCard({
  label,
  value,
  change,
  trend,
  icon: Icon,
  gradient,
  bgGradient,
}: FinanceStatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)] hover:border-[var(--admin-border-accent)] transition-all duration-300 hover:shadow-lg">
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-30`} />
      <div className="relative p-5">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold ${
              trend === 'up'
                ? 'bg-[var(--status-success-muted)] text-[var(--status-success)]'
                : 'bg-[var(--status-danger-muted)] text-[var(--status-danger)]'
            }`}
          >
            {trend === 'up' ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {change}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[var(--admin-text-muted)] text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-[var(--admin-text)]">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default FinanceStatCard;
