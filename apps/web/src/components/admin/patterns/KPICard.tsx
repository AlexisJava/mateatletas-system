'use client';

import type { LucideIcon } from 'lucide-react';
import { AdminCard } from '../primitives';

interface KPICardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}

const TREND_COLORS = {
  up: '#10b981',
  down: '#ef4444',
  neutral: 'var(--admin-text-muted)',
} as const;

export function KPICard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  color,
  trend = 'neutral',
}: KPICardProps) {
  return (
    <AdminCard glowColor={`${color}30`} padding="md">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-[var(--admin-text-muted)] mb-1">{label}</p>
          <p className="text-3xl font-bold tracking-tight" style={{ color }}>
            {value}
          </p>
          {/* Always reserve space for change line to keep cards same height */}
          <div className="flex items-center gap-1 mt-2 min-h-[20px]">
            {change !== undefined ? (
              <>
                <span className="text-sm font-medium" style={{ color: TREND_COLORS[trend] }}>
                  {trend === 'up' && '+'}
                  {change}%
                </span>
                {changeLabel && (
                  <span className="text-xs text-[var(--admin-text-muted)]">{changeLabel}</span>
                )}
              </>
            ) : (
              <span className="text-xs text-[var(--admin-text-muted)] opacity-0">-</span>
            )}
          </div>
        </div>

        {/* Icon with glow */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `${color}15`,
            boxShadow: `0 0 20px ${color}20`,
          }}
        >
          <Icon className="w-6 h-6" style={{ color, filter: `drop-shadow(0 0 8px ${color}80)` }} />
        </div>
      </div>
    </AdminCard>
  );
}
