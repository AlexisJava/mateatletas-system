'use client';

import { motion } from 'framer-motion';
import type { AuditLogsStats } from '@/lib/api/admin.api';
import type { SeverityFilter, CategoryFilter } from '../hooks/useAuditLogs';

interface AuditStatsGridProps {
  stats: AuditLogsStats | null;
  severityFilter: SeverityFilter;
  onSeverityFilterChange: (severity: SeverityFilter) => void;
  categoryFilter: CategoryFilter;
  onCategoryFilterChange: (category: CategoryFilter) => void;
}

interface StatCardConfig {
  key: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}

const severityCards: StatCardConfig[] = [
  {
    key: 'all',
    label: 'Total',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
    icon: '📊',
  },
  {
    key: 'info',
    label: 'Info',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    icon: 'ℹ️',
  },
  {
    key: 'warning',
    label: 'Warning',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    icon: '⚠️',
  },
  {
    key: 'error',
    label: 'Error',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    icon: '❌',
  },
  {
    key: 'critical',
    label: 'Critical',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    icon: '🚨',
  },
];

const categoryLabels: Record<string, { label: string; icon: string }> = {
  auth: { label: 'Auth', icon: '🔐' },
  payment: { label: 'Pagos', icon: '💳' },
  user_management: { label: 'Usuarios', icon: '👥' },
  data_modification: { label: 'Datos', icon: '📝' },
  security: { label: 'Seguridad', icon: '🛡️' },
  system: { label: 'Sistema', icon: '⚙️' },
};

function getSeverityValue(stats: AuditLogsStats | null, key: string): number {
  if (!stats) return 0;
  if (key === 'all') return stats.total;
  return stats.bySeverity[key] ?? 0;
}

/**
 * AuditStatsGrid - Grid de estadísticas con filtros clickeables
 */
export function AuditStatsGrid({
  stats,
  severityFilter,
  onSeverityFilterChange,
  categoryFilter,
  onCategoryFilterChange,
}: AuditStatsGridProps) {
  return (
    <div className="space-y-4">
      {/* Severity filters */}
      <div>
        <h3 className="text-sm font-medium text-[var(--admin-text-muted)] mb-2">Por Severidad</h3>
        <div className="grid grid-cols-5 gap-3">
          {severityCards.map((card, index) => {
            const value = getSeverityValue(stats, card.key);
            const isActive = severityFilter === card.key;

            return (
              <motion.button
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onSeverityFilterChange(card.key as SeverityFilter)}
                className={`
                  relative p-3 rounded-xl border transition-all duration-200
                  ${
                    isActive
                      ? `${card.bgColor} ${card.borderColor} ring-2 ring-offset-0 ring-white/10`
                      : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{card.icon}</span>
                  <span
                    className={`text-xs font-medium ${isActive ? card.color : 'text-[var(--admin-text-muted)]'}`}
                  >
                    {card.label}
                  </span>
                </div>
                <div
                  className={`text-xl font-bold ${isActive ? card.color : 'text-[var(--admin-text)]'}`}
                >
                  {value.toLocaleString()}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Category filters */}
      <div>
        <h3 className="text-sm font-medium text-[var(--admin-text-muted)] mb-2">Por Categoría</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryFilterChange('all')}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${
                categoryFilter === 'all'
                  ? 'bg-[var(--admin-accent)]/20 text-[var(--admin-accent)] border border-[var(--admin-accent)]/30'
                  : 'bg-white/[0.03] text-[var(--admin-text-muted)] border border-white/[0.08] hover:bg-white/[0.05]'
              }
            `}
          >
            Todas
          </button>
          {Object.entries(stats?.byCategory ?? {}).map(([key, count]) => {
            const cat = categoryLabels[key] ?? { label: key, icon: '📁' };
            const isActive = categoryFilter === key;

            return (
              <button
                key={key}
                onClick={() => onCategoryFilterChange(key as CategoryFilter)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5
                  ${
                    isActive
                      ? 'bg-[var(--admin-accent)]/20 text-[var(--admin-accent)] border border-[var(--admin-accent)]/30'
                      : 'bg-white/[0.03] text-[var(--admin-text-muted)] border border-white/[0.08] hover:bg-white/[0.05]'
                  }
                `}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="text-xs opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
