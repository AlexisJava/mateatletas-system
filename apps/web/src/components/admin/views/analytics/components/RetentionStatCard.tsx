'use client';

import type { LucideIcon } from 'lucide-react';

/**
 * RetentionStatCard - Card de estadística de retención
 */

interface RetentionStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  colorClass: string;
  bgClass: string;
}

export function RetentionStatCard({
  icon: Icon,
  label,
  value,
  colorClass,
  bgClass,
}: RetentionStatCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg ${bgClass} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
        <span className="text-sm text-[var(--admin-text-muted)]">{label}</span>
      </div>
      <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
    </div>
  );
}

export default RetentionStatCard;
