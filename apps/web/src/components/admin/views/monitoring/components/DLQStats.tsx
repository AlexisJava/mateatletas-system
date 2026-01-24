'use client';

import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { KPICard } from '@/components/admin/patterns';
import type { DlqStats } from '@/lib/api/admin.api';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface DLQStatsProps {
  stats: DlqStats | undefined;
  isLoading: boolean;
}

export function DLQStats({ stats, isLoading }: DLQStatsProps) {
  const pending = stats?.byStatus?.PENDING ?? 0;
  const processing = stats?.byStatus?.PROCESSING ?? 0;
  const resolved = stats?.byStatus?.RESOLVED ?? 0;
  const abandoned = stats?.byStatus?.ABANDONED ?? 0;

  const oldestPendingAge = stats?.oldestPending?.createdAt
    ? formatDistanceToNow(new Date(stats.oldestPending.createdAt), { addSuffix: true, locale: es })
    : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        label="Pendientes"
        value={isLoading ? '-' : pending}
        change={pending > 0 ? pending : undefined}
        changeLabel={oldestPendingAge ? `Más antiguo ${oldestPendingAge}` : undefined}
        icon={AlertTriangle}
        color="var(--status-warning)"
        trend={pending > 0 ? 'down' : 'neutral'}
      />

      <KPICard
        label="Procesando"
        value={isLoading ? '-' : processing}
        icon={Clock}
        color="var(--status-info)"
      />

      <KPICard
        label="Resueltos"
        value={isLoading ? '-' : resolved}
        icon={CheckCircle}
        color="var(--status-success)"
      />

      <KPICard
        label="Abandonados"
        value={isLoading ? '-' : abandoned}
        icon={XCircle}
        color="var(--status-danger)"
      />
    </div>
  );
}
