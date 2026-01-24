'use client';

import { UserPlus, Users, UserMinus, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import type { RetentionDataPoint } from '../hooks';

/**
 * RetencionTab - Tab de métricas de retención
 *
 * Muestra:
 * - KPIs de retención (nuevos, activos, bajas)
 * - Gráfico de evolución de estudiantes
 * - Análisis de tendencias
 */

interface RetencionTabProps {
  retentionData: RetentionDataPoint[];
}

function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  color: string;
}) {
  return (
    <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
          <div>
            <p className="text-sm text-[var(--admin-text-muted)]">{label}</p>
            <p className="text-2xl font-bold" style={{ color }}>
              {value}
            </p>
          </div>
        </div>
        {trend && trend !== 'neutral' && (
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              trend === 'up' ? 'bg-emerald-500/20' : 'bg-red-500/20'
            }`}
          >
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function RetencionTab({ retentionData }: RetencionTabProps) {
  const data = retentionData;

  // Calcular stats del último mes
  const lastMonth = data[data.length - 1];
  const prevMonth = data[data.length - 2];

  const nuevos = lastMonth?.nuevos ?? 0;
  const activos = lastMonth?.activos ?? 0;
  const bajas = lastMonth?.bajas ?? 0;

  // Calcular tendencias
  const nuevosTrend = prevMonth
    ? nuevos > prevMonth.nuevos
      ? 'up'
      : nuevos < prevMonth.nuevos
        ? 'down'
        : 'neutral'
    : 'neutral';
  const activosTrend = prevMonth
    ? activos > prevMonth.activos
      ? 'up'
      : activos < prevMonth.activos
        ? 'down'
        : 'neutral'
    : 'neutral';
  const bajasTrend = prevMonth
    ? bajas < prevMonth.bajas
      ? 'up'
      : bajas > prevMonth.bajas
        ? 'down'
        : 'neutral'
    : 'neutral';

  // Calcular tasa de retención
  const tasaRetencion =
    activos > 0 && bajas > 0 ? (((activos - bajas) / activos) * 100).toFixed(1) : '100.0';

  // Calcular net growth
  const netGrowth = nuevos - bajas;

  return (
    <div className="h-full overflow-auto p-4 space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={UserPlus}
          label="Nuevos este mes"
          value={`+${nuevos}`}
          trend={nuevosTrend}
          color="#10b981"
        />
        <MetricCard
          icon={Users}
          label="Activos totales"
          value={activos}
          trend={activosTrend}
          color="#3b82f6"
        />
        <MetricCard
          icon={UserMinus}
          label="Bajas este mes"
          value={bajas}
          trend={bajasTrend}
          color="#ef4444"
        />
        <MetricCard
          icon={Activity}
          label="Crecimiento Neto"
          value={netGrowth >= 0 ? `+${netGrowth}` : netGrowth}
          trend={netGrowth > 0 ? 'up' : netGrowth < 0 ? 'down' : 'neutral'}
          color={netGrowth >= 0 ? '#10b981' : '#ef4444'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Evolución */}
        <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]">
          <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
            Evolución de Estudiantes
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="var(--admin-text-muted)" fontSize={12} />
                <YAxis stroke="var(--admin-text-muted)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 15, 25, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="activos"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }}
                  name="Activos"
                />
                <Line
                  type="monotone"
                  dataKey="nuevos"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                  name="Nuevos"
                />
                <Line
                  type="monotone"
                  dataKey="bajas"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 0, r: 4 }}
                  name="Bajas"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-[var(--admin-text-muted)]">Activos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-sm text-[var(--admin-text-muted)]">Nuevos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-[var(--admin-text-muted)]">Bajas</span>
            </div>
          </div>
        </div>

        {/* Area Chart - Crecimiento Neto */}
        <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]">
          <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
            Balance Nuevos vs Bajas
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="var(--admin-text-muted)" fontSize={12} />
                <YAxis stroke="var(--admin-text-muted)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 15, 25, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="nuevos"
                  stackId="1"
                  stroke="#10b981"
                  fill="rgba(16, 185, 129, 0.3)"
                  name="Nuevos"
                />
                <Area
                  type="monotone"
                  dataKey="bajas"
                  stackId="2"
                  stroke="#ef4444"
                  fill="rgba(239, 68, 68, 0.3)"
                  name="Bajas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Retention Rate Card */}
      <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--admin-text)]">Tasa de Retención</h3>
            <p className="text-sm text-[var(--admin-text-muted)] mt-1">
              Porcentaje de estudiantes que permanecen activos
            </p>
          </div>
          <div className="text-right">
            <p
              className={`text-4xl font-bold ${
                parseFloat(tasaRetencion) >= 90
                  ? 'text-emerald-400'
                  : parseFloat(tasaRetencion) >= 70
                    ? 'text-amber-400'
                    : 'text-red-400'
              }`}
            >
              {tasaRetencion}%
            </p>
            <p className="text-sm text-[var(--admin-text-muted)]">
              {parseFloat(tasaRetencion) >= 90
                ? 'Excelente'
                : parseFloat(tasaRetencion) >= 70
                  ? 'Buena'
                  : 'Necesita atención'}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-3 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              parseFloat(tasaRetencion) >= 90
                ? 'bg-emerald-500'
                : parseFloat(tasaRetencion) >= 70
                  ? 'bg-amber-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(parseFloat(tasaRetencion), 100)}%` }}
          />
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-400">Adquisición</p>
              <p className="text-sm text-[var(--admin-text-muted)] mt-1">
                {nuevos > 0
                  ? `${nuevos} nuevos estudiantes este mes`
                  : 'Sin nuevas inscripciones este mes'}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-400">Actividad</p>
              <p className="text-sm text-[var(--admin-text-muted)] mt-1">
                {activos} estudiantes activos actualmente
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-start gap-3">
            <TrendingDown className="w-5 h-5 text-amber-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-400">Churn</p>
              <p className="text-sm text-[var(--admin-text-muted)] mt-1">
                {bajas > 0 ? `${bajas} bajas este mes` : 'Sin bajas este mes'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RetencionTab;
