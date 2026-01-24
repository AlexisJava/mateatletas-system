'use client';

import {
  Users,
  TrendingUp,
  DollarSign,
  CreditCard,
  Activity,
  Percent,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { OverviewStats, TierDistributionData } from '../hooks';
import type { RevenueDataPoint } from '@/lib/api/admin.api';

/**
 * OverviewTab - Vista general de métricas clave
 *
 * Muestra:
 * - KPIs principales (estudiantes, ingresos, retención)
 * - Distribución por tier
 * - Histórico de ingresos
 */

interface OverviewTabProps {
  overview: OverviewStats;
  tierDistribution: TierDistributionData;
  historicoMensual: RevenueDataPoint[];
}

// Colores para tiers
const TIER_COLORS = {
  STEAM_SINCRONICO: '#10b981',
  STEAM_ASINCRONICO: '#3b82f6',
  STEAM_LIBROS: '#f59e0b',
  SIN_PLAN: '#6b7280',
};

const TIER_LABELS: Record<string, string> = {
  STEAM_SINCRONICO: 'Sincrónico',
  STEAM_ASINCRONICO: 'Asincrónico',
  STEAM_LIBROS: 'Libros',
  SIN_PLAN: 'Sin Plan',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function KPICard({
  icon: Icon,
  label,
  value,
  change,
  color,
  suffix = '',
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  change?: number;
  color: string;
  suffix?: string;
}) {
  const hasChange = change !== undefined && change !== 0;
  const isPositive = hasChange && change > 0;

  return (
    <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {hasChange && (
          <div
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            <span>
              {isPositive ? '+' : ''}
              {change}%
            </span>
          </div>
        )}
      </div>
      <p className="text-sm text-[var(--admin-text-muted)] mb-1">{label}</p>
      <p className="text-2xl font-bold text-[var(--admin-text)]">
        {value}
        {suffix && (
          <span className="text-base font-normal text-[var(--admin-text-muted)]">{suffix}</span>
        )}
      </p>
    </div>
  );
}

export function OverviewTab({ overview, tierDistribution, historicoMensual }: OverviewTabProps) {
  // Preparar datos para el pie chart de tiers
  const tierData = [
    {
      name: 'Sincrónico',
      value: tierDistribution.STEAM_SINCRONICO,
      color: TIER_COLORS.STEAM_SINCRONICO,
    },
    {
      name: 'Asincrónico',
      value: tierDistribution.STEAM_ASINCRONICO,
      color: TIER_COLORS.STEAM_ASINCRONICO,
    },
    { name: 'Libros', value: tierDistribution.STEAM_LIBROS, color: TIER_COLORS.STEAM_LIBROS },
    { name: 'Sin Plan', value: tierDistribution.SIN_PLAN, color: TIER_COLORS.SIN_PLAN },
  ].filter((t) => t.value > 0);

  // Preparar datos para el gráfico de ingresos
  const revenueData = historicoMensual.map((item) => ({
    month: item.month,
    ingresos: item.ingresos,
    pendientes: item.pendientes,
  }));

  return (
    <div className="h-full overflow-auto p-4 space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Users}
          label="Estudiantes Activos"
          value={overview.estudiantesActivos}
          change={overview.crecimientoMensual}
          color="#8b5cf6"
        />
        <KPICard
          icon={CreditCard}
          label="Inscripciones Activas"
          value={overview.inscripcionesActivas}
          color="#06b6d4"
        />
        <KPICard
          icon={DollarSign}
          label="Ingresos del Mes"
          value={formatCurrency(overview.ingresosMes)}
          color="#10b981"
        />
        <KPICard
          icon={Clock}
          label="Pendientes de Cobro"
          value={formatCurrency(overview.pagosPendientes)}
          color="#f59e0b"
        />
      </div>

      {/* Segunda fila de KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Activity}
          label="Total Estudiantes"
          value={overview.totalEstudiantes}
          color="#3b82f6"
        />
        <KPICard
          icon={TrendingUp}
          label="Tasa de Retención"
          value={overview.tasaRetencion}
          suffix="%"
          color="#10b981"
        />
        <KPICard
          icon={Percent}
          label="Tasa de Cobro"
          value={overview.tasaCobro}
          suffix="%"
          color="#8b5cf6"
        />
        <KPICard
          icon={TrendingUp}
          label="Crecimiento Mensual"
          value={
            overview.crecimientoMensual >= 0
              ? `+${overview.crecimientoMensual}`
              : overview.crecimientoMensual
          }
          suffix="%"
          color={overview.crecimientoMensual >= 0 ? '#10b981' : '#ef4444'}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Tier */}
        <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]">
          <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
            Distribución por Plan
          </h3>
          <div className="h-64">
            {tierData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    nameKey="name"
                    strokeWidth={0}
                  >
                    {tierData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 15, 25, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                    formatter={(value: number) => [`${value} estudiantes`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[var(--admin-text-muted)]">
                Sin datos de distribución
              </div>
            )}
          </div>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {tierData.map((tier) => (
              <div key={tier.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }} />
                <span className="text-sm text-[var(--admin-text-muted)]">
                  {tier.name}: <span className="text-[var(--admin-text)]">{tier.value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Histórico de Ingresos */}
        <div className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]">
          <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
            Evolución de Ingresos
          </h3>
          <div className="h-64">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="var(--admin-text-muted)" fontSize={12} />
                  <YAxis
                    stroke="var(--admin-text-muted)"
                    fontSize={12}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 15, 25, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                  />
                  <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} name="Cobrados" />
                  <Bar
                    dataKey="pendientes"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    name="Pendientes"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[var(--admin-text-muted)]">
                Sin datos de ingresos
              </div>
            )}
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-sm text-[var(--admin-text-muted)]">Cobrados</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-sm text-[var(--admin-text-muted)]">Pendientes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewTab;
