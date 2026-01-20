'use client';

import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, Percent, CreditCard } from 'lucide-react';
import { formatCompactCurrency } from '@/lib/utils/format';
import { getCombinedDashboardStats, getHistoricoMensual } from '@/lib/api/admin.api';
import { KPICard, GlassCard, MiniStat } from '../GlassCard';
import { GradientAreaChart, GradientBarChart } from '../charts';

export function FinanzasTab() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: getCombinedDashboardStats,
  });

  const { data: historico } = useQuery({
    queryKey: ['admin', 'historico-mensual'],
    queryFn: () => getHistoricoMensual(6),
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="h-full flex items-center justify-center text-[var(--admin-text-muted)]">
        Error al cargar datos
      </div>
    );
  }

  // Calculate MRR and ARR
  const mrr = stats.ingresosMes;
  const arr = mrr * 12;

  // Calculate ARPU (Average Revenue Per User)
  const arpu = stats.inscripcionesActivas > 0 ? stats.ingresosMes / stats.inscripcionesActivas : 0;

  // Transform data for charts
  const revenueChartData =
    historico?.map((d) => ({
      month: d.month,
      ingresos: d.ingresos,
    })) ?? [];

  const pendientesChartData =
    historico?.map((d) => ({
      month: d.month,
      pendientes: d.pendientes,
    })) ?? [];

  // Total from last 6 months
  const totalIngresado = historico?.reduce((sum, d) => sum + d.ingresos, 0) ?? 0;
  const totalPendiente = historico?.reduce((sum, d) => sum + d.pendientes, 0) ?? 0;

  return (
    <div className="h-full p-4 flex flex-col gap-5">
      {/* Row 1: 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
        <KPICard
          label="MRR"
          value={formatCompactCurrency(mrr)}
          icon={DollarSign}
          color="#10b981"
          trend="up"
        />
        <KPICard
          label="ARR Proyectado"
          value={formatCompactCurrency(arr)}
          icon={TrendingUp}
          color="#8b5cf6"
          trend="up"
        />
        <KPICard
          label="Tasa de Cobro"
          value={`${stats.tasaCobro}%`}
          icon={Percent}
          color={stats.tasaCobro >= 80 ? '#10b981' : stats.tasaCobro >= 60 ? '#f59e0b' : '#ef4444'}
          trend={stats.tasaCobro >= 80 ? 'up' : stats.tasaCobro >= 60 ? 'neutral' : 'down'}
        />
        <KPICard
          label="ARPU"
          value={formatCompactCurrency(arpu)}
          icon={CreditCard}
          color="#06b6d4"
        />
      </div>

      {/* Row 2: Main Chart (8 cols) + Side Cards (4 cols) */}
      <div className="grid grid-cols-12 gap-4 flex-shrink-0">
        {/* Chart - 8 columns */}
        <div className="col-span-12 lg:col-span-8">
          <GradientAreaChart
            data={revenueChartData}
            dataKey="ingresos"
            xAxisKey="month"
            title="Ingresos Mensuales"
            subtitle="Últimos 6 meses"
            color="#10b981"
            height={280}
            formatValue={(v) => formatCompactCurrency(v)}
            formatTooltip={(v) => formatCompactCurrency(v)}
          />
        </div>

        {/* Side Cards - 4 columns, stacked */}
        <div className="col-span-12 lg:col-span-4 grid grid-rows-2 gap-4">
          {/* Total Ingresado Card */}
          <GlassCard glowColor="#10b98130" className="p-4">
            <div className="h-full flex flex-col justify-center">
              <p className="text-sm text-[var(--admin-text-muted)] mb-2">Total Ingresado (6m)</p>
              <p className="text-3xl font-bold" style={{ color: '#10b981' }}>
                {formatCompactCurrency(totalIngresado)}
              </p>
              <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                Prom. {formatCompactCurrency(totalIngresado / 6)}/mes
              </p>
            </div>
          </GlassCard>

          {/* Por Cobrar Card */}
          <GlassCard glowColor="#f59e0b30" className="p-4">
            <div className="h-full flex flex-col justify-center">
              <p className="text-sm text-[var(--admin-text-muted)] mb-2">Por Cobrar Hoy</p>
              <p className="text-3xl font-bold" style={{ color: '#f59e0b' }}>
                {formatCompactCurrency(stats.ingresosPendientes)}
              </p>
              <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                Acumulado: {formatCompactCurrency(totalPendiente)}
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Row 3: Bottom Stats Bar */}
      <div className="flex-shrink-0">
        <GlassCard className="p-2">
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
            <MiniStat label="MRR" value={formatCompactCurrency(mrr)} color="#10b981" />
            <MiniStat label="ARR" value={formatCompactCurrency(arr)} color="#8b5cf6" />
            <MiniStat label="ARPU" value={formatCompactCurrency(arpu)} color="#06b6d4" />
            <MiniStat label="Tasa Cobro" value={`${stats.tasaCobro}%`} color="#f59e0b" />
            <MiniStat
              label="Suscripciones"
              value={stats.inscripcionesActivas.toLocaleString('es-AR')}
              color="#ec4899"
            />
            <MiniStat
              label="Pendiente"
              value={formatCompactCurrency(stats.ingresosPendientes)}
              color="#ef4444"
            />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
