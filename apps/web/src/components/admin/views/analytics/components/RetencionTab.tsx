'use client';

import { Activity, UserPlus, Users, UserMinus } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { MOCK_RETENTION_DATA } from '@/lib/constants/admin-mock-data';
import { SectionHeader } from './SectionHeader';
import { RetentionStatCard } from './RetentionStatCard';
import { RetentionRateCard } from './RetentionRateCard';
import { RecommendedActionsCard } from './RecommendedActionsCard';

/**
 * RetencionTab - Tab de métricas de retención
 */

export function RetencionTab() {
  return (
    <div className="space-y-6">
      <SectionHeader icon={Activity} title="Metricas de Retencion" iconColor="#22c55e" />

      {/* Retention Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <RetentionStatCard
          icon={UserPlus}
          label="Nuevos este mes"
          value="+55"
          colorClass="text-[var(--status-success)]"
          bgClass="bg-[var(--status-success-muted)]"
        />
        <RetentionStatCard
          icon={Users}
          label="Activos totales"
          value="381"
          colorClass="text-[var(--status-info)]"
          bgClass="bg-[var(--status-info-muted)]"
        />
        <RetentionStatCard
          icon={UserMinus}
          label="Bajas este mes"
          value="-9"
          colorClass="text-[var(--status-danger)]"
          bgClass="bg-[var(--status-danger-muted)]"
        />
      </div>

      {/* Retention Chart */}
      <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
        <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
          Evolucion de Estudiantes
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_RETENTION_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
              <XAxis dataKey="month" stroke="var(--admin-text-muted)" fontSize={12} />
              <YAxis stroke="var(--admin-text-muted)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--admin-surface-2)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="activos"
                stroke="var(--status-info)"
                strokeWidth={2}
                dot={{ fill: 'var(--status-info)', strokeWidth: 0 }}
                name="Activos"
              />
              <Line
                type="monotone"
                dataKey="nuevos"
                stroke="var(--status-success)"
                strokeWidth={2}
                dot={{ fill: 'var(--status-success)', strokeWidth: 0 }}
                name="Nuevos"
              />
              <Line
                type="monotone"
                dataKey="bajas"
                stroke="var(--status-danger)"
                strokeWidth={2}
                dot={{ fill: 'var(--status-danger)', strokeWidth: 0 }}
                name="Bajas"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Retention Rate & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RetentionRateCard />
        <RecommendedActionsCard />
      </div>
    </div>
  );
}

export default RetencionTab;
