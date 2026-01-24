'use client';

import { motion } from 'framer-motion';
import type { QueueStats, QueueHealth } from '@/lib/api/admin.api';

interface QueueHealthCardProps {
  stats: QueueStats | null;
  isLoading: boolean;
}

const healthConfig: Record<QueueHealth, { color: string; bg: string; label: string }> = {
  healthy: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
    label: 'Saludable',
  },
  degraded: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/20',
    label: 'Degradada',
  },
  critical: {
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    label: 'Crítica',
  },
};

/**
 * QueueHealthCard - Card de salud de la cola BullMQ
 */
export function QueueHealthCard({ stats, isLoading }: QueueHealthCardProps) {
  if (isLoading || !stats) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-32 mb-4" />
        <div className="h-8 bg-white/10 rounded w-20 mb-2" />
        <div className="grid grid-cols-5 gap-4 mt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const health = healthConfig[stats.health];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-[var(--admin-text)]">Cola de Webhooks</h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${health.bg}`}>
          <div className={`w-2 h-2 rounded-full ${health.color} animate-pulse`} />
          <span className={`text-sm font-medium ${health.color}`}>{health.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <MetricBox label="En espera" value={stats.waiting} color="text-blue-400" />
        <MetricBox label="Activos" value={stats.active} color="text-cyan-400" />
        <MetricBox label="Completados" value={stats.completed} color="text-emerald-400" />
        <MetricBox label="Fallidos" value={stats.failed} color="text-red-400" />
        <MetricBox label="Retrasados" value={stats.delayed} color="text-amber-400" />
      </div>

      <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-between text-sm">
        <span className="text-[var(--admin-text-muted)]">
          Tasa de fallos: <span className="text-[var(--admin-text)]">{stats.failedRate}</span>
        </span>
        <span className="text-[var(--admin-text-muted)]">
          Actualizado: {new Date(stats.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </motion.div>
  );
}

interface MetricBoxProps {
  label: string;
  value: number;
  color: string;
}

function MetricBox({ label, value, color }: MetricBoxProps) {
  return (
    <div className="bg-white/[0.02] rounded-lg p-3 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value.toLocaleString()}</div>
      <div className="text-xs text-[var(--admin-text-muted)] mt-1">{label}</div>
    </div>
  );
}
