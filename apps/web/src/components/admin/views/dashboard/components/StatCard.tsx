'use client';

import { StatCard as UIStatCard } from '@mateatletas/ui';
import type { StatCardProps } from '../types/dashboard.types';

/**
 * StatCard - Wrapper del componente del Design System para Admin Dashboard
 *
 * Adapta la interfaz local (icon: LucideIcon) al design system (icon: ReactNode)
 * y activa el tema admin automáticamente.
 */
export function StatCard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  status = 'neutral',
}: StatCardProps) {
  return (
    <UIStatCard
      label={label}
      value={value}
      change={change ?? undefined}
      changeLabel={changeLabel}
      icon={<Icon className="w-5 h-5" />}
      status={status}
      adminTheme
    />
  );
}

export default StatCard;
