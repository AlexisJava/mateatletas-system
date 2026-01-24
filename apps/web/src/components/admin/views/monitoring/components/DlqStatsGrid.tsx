'use client';

import { motion } from 'framer-motion';
import type { DlqStats, DlqStatus } from '@/lib/api/admin.api';
import type { StatusFilter } from '../hooks/useMonitoring';

interface DlqStatsGridProps {
  stats: DlqStats | null;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
}

interface StatCardConfig {
  status: StatusFilter;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}

const statCards: StatCardConfig[] = [
  {
    status: 'all',
    label: 'Total DLQ',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
    icon: '📊',
  },
  {
    status: 'PENDING',
    label: 'Pendientes',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    icon: '⏳',
  },
  {
    status: 'PROCESSING',
    label: 'Procesando',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    icon: '⚙️',
  },
  {
    status: 'RESOLVED',
    label: 'Resueltos',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    icon: '✅',
  },
  {
    status: 'ABANDONED',
    label: 'Abandonados',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    icon: '❌',
  },
];

function getStatValue(stats: DlqStats | null, status: StatusFilter): number {
  if (!stats) return 0;
  if (status === 'all') {
    return Object.values(stats.byStatus).reduce((sum, count) => sum + count, 0);
  }
  return stats.byStatus[status as DlqStatus] ?? 0;
}

/**
 * DlqStatsGrid - Grid de estadísticas de DLQ con filtro clickeable
 */
export function DlqStatsGrid({ stats, statusFilter, onStatusFilterChange }: DlqStatsGridProps) {
  return (
    <div className="grid grid-cols-5 gap-4">
      {statCards.map((card, index) => {
        const value = getStatValue(stats, card.status);
        const isActive = statusFilter === card.status;

        return (
          <motion.button
            key={card.status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onStatusFilterChange(card.status)}
            className={`
              relative p-4 rounded-xl border transition-all duration-200
              ${
                isActive
                  ? `${card.bgColor} ${card.borderColor} ring-2 ring-offset-0 ring-white/10`
                  : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]'
              }
            `}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{card.icon}</span>
              <span
                className={`text-xs font-medium ${isActive ? card.color : 'text-[var(--admin-text-muted)]'}`}
              >
                {card.label}
              </span>
            </div>
            <div
              className={`text-2xl font-bold ${isActive ? card.color : 'text-[var(--admin-text)]'}`}
            >
              {value.toLocaleString()}
            </div>
            {isActive && (
              <motion.div
                layoutId="stat-indicator"
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full ${card.color.replace('text-', 'bg-')}`}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
