'use client';

import { Users, CheckCircle, Clock, PauseCircle, XCircle, DollarSign } from 'lucide-react';
import type { SuscripcionesStats, EstadoFilter } from '../hooks';
import { formatCurrency } from '@/lib/utils/format';

interface SuscripcionesStatsGridProps {
  stats: SuscripcionesStats;
  estadoFilter: EstadoFilter;
  onEstadoFilterChange: (filter: EstadoFilter) => void;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  isActive: boolean;
  onClick: () => void;
}

function StatCard({ label, value, icon, color, isActive, onClick }: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
        ${
          isActive
            ? `bg-gradient-to-br ${color} border-transparent shadow-lg`
            : 'bg-[var(--admin-surface-1)] border-[var(--admin-border)] hover:bg-[var(--admin-surface-2)]'
        }
      `}
    >
      <div
        className={`
          w-12 h-12 rounded-xl flex items-center justify-center
          ${isActive ? 'bg-white/20' : 'bg-[var(--admin-surface-2)]'}
        `}
      >
        {icon}
      </div>
      <div className="text-left">
        <p className={`text-2xl font-bold ${isActive ? 'text-white' : 'text-[var(--admin-text)]'}`}>
          {value}
        </p>
        <p className={`text-sm ${isActive ? 'text-white/80' : 'text-[var(--admin-text-muted)]'}`}>
          {label}
        </p>
      </div>
      {isActive && (
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white animate-pulse" />
      )}
    </button>
  );
}

/**
 * Grid de estadísticas de suscripciones
 * Cada tarjeta actúa como filtro
 */
export function SuscripcionesStatsGrid({
  stats,
  estadoFilter,
  onEstadoFilterChange,
}: SuscripcionesStatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard
        label="Total"
        value={stats.total}
        icon={<Users className="w-6 h-6 text-[var(--admin-accent)]" />}
        color="from-[var(--admin-accent)] to-[var(--admin-accent-secondary)]"
        isActive={estadoFilter === 'all'}
        onClick={() => onEstadoFilterChange('all')}
      />
      <StatCard
        label="Activas"
        value={stats.authorized}
        icon={<CheckCircle className="w-6 h-6 text-[var(--status-success)]" />}
        color="from-[var(--status-success)] to-emerald-600"
        isActive={estadoFilter === 'AUTHORIZED'}
        onClick={() => onEstadoFilterChange('AUTHORIZED')}
      />
      <StatCard
        label="Pendientes"
        value={stats.pending}
        icon={<Clock className="w-6 h-6 text-[var(--status-warning)]" />}
        color="from-[var(--status-warning)] to-amber-600"
        isActive={estadoFilter === 'PENDING'}
        onClick={() => onEstadoFilterChange('PENDING')}
      />
      <StatCard
        label="Pausadas"
        value={stats.paused}
        icon={<PauseCircle className="w-6 h-6 text-[var(--status-info)]" />}
        color="from-[var(--status-info)] to-blue-600"
        isActive={estadoFilter === 'PAUSED'}
        onClick={() => onEstadoFilterChange('PAUSED')}
      />
      <StatCard
        label="Canceladas"
        value={stats.cancelled}
        icon={<XCircle className="w-6 h-6 text-[var(--status-danger)]" />}
        color="from-[var(--status-danger)] to-red-600"
        isActive={estadoFilter === 'CANCELLED'}
        onClick={() => onEstadoFilterChange('CANCELLED')}
      />
      <StatCard
        label="Ingreso Est."
        value={formatCurrency(stats.ingresoMensualEstimado)}
        icon={<DollarSign className="w-6 h-6 text-emerald-500" />}
        color="from-emerald-500 to-emerald-600"
        isActive={false}
        onClick={() => {}} // No es filtro
      />
    </div>
  );
}

export default SuscripcionesStatsGrid;
