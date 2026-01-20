'use client';

import { useQuery } from '@tanstack/react-query';
import { TrendingUp, UserPlus, UserMinus, Target } from 'lucide-react';
import { getRetentionStats, getCombinedDashboardStats } from '@/lib/api/admin.api';
import { KPICard, GlassCard, MiniStat } from '../GlassCard';
import { MultiLineChart, GradientBarChart } from '../charts';

export function RetencionTab() {
  const { data: retention, isLoading } = useQuery({
    queryKey: ['admin', 'retention'],
    queryFn: () => getRetentionStats(6),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: getCombinedDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!retention) {
    return (
      <div className="h-full flex items-center justify-center text-[var(--admin-text-muted)]">
        Error al cargar datos
      </div>
    );
  }

  // Calculate metrics
  const totalNuevos = retention.reduce((sum, d) => sum + d.nuevos, 0);
  const totalBajas = retention.reduce((sum, d) => sum + d.bajas, 0);
  const avgActivos = Math.round(
    retention.reduce((sum, d) => sum + d.activos, 0) / retention.length,
  );

  // Churn rate (bajas / activos promedio * 100)
  const churnRate = avgActivos > 0 ? ((totalBajas / 6 / avgActivos) * 100).toFixed(1) : '0';

  // Retention rate
  const retentionRate = 100 - parseFloat(churnRate);

  // Growth rate
  const firstMonth = retention[0]?.activos ?? 0;
  const lastMonth = retention[retention.length - 1]?.activos ?? 0;
  const growthRate =
    firstMonth > 0 ? (((lastMonth - firstMonth) / firstMonth) * 100).toFixed(1) : '0';

  // Net promoter (nuevos - bajas)
  const netPromoter = totalNuevos - totalBajas;

  // Chart data
  const lineChartData = retention.map((d) => ({
    month: d.month,
    nuevos: d.nuevos,
    activos: d.activos,
    bajas: d.bajas,
  }));

  const churnChartData = retention.map((d) => ({
    month: d.month,
    bajas: d.bajas,
  }));

  return (
    <div className="h-full p-4 flex flex-col gap-5">
      {/* Row 1: 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
        <KPICard
          label="Retención"
          value={`${retentionRate.toFixed(1)}%`}
          icon={Target}
          color={retentionRate >= 90 ? '#10b981' : retentionRate >= 75 ? '#f59e0b' : '#ef4444'}
          trend={retentionRate >= 90 ? 'up' : retentionRate >= 75 ? 'neutral' : 'down'}
        />
        <KPICard
          label="Crecimiento"
          value={`${parseFloat(growthRate) >= 0 ? '+' : ''}${growthRate}%`}
          icon={TrendingUp}
          color={parseFloat(growthRate) >= 0 ? '#10b981' : '#ef4444'}
          trend={parseFloat(growthRate) >= 0 ? 'up' : 'down'}
        />
        <KPICard
          label="Nuevos (6m)"
          value={totalNuevos.toLocaleString('es-AR')}
          icon={UserPlus}
          color="#06b6d4"
          trend="up"
        />
        <KPICard
          label="Bajas (6m)"
          value={totalBajas.toLocaleString('es-AR')}
          icon={UserMinus}
          color="#ef4444"
        />
      </div>

      {/* Row 2: Main Chart (8 cols) + Side Cards (4 cols) */}
      <div className="grid grid-cols-12 gap-4 flex-shrink-0">
        {/* Chart - 8 columns */}
        <div className="col-span-12 lg:col-span-8">
          <MultiLineChart
            data={lineChartData}
            lines={[
              { key: 'activos', name: 'Activos', color: '#06b6d4' },
              { key: 'nuevos', name: 'Nuevos', color: '#10b981' },
              { key: 'bajas', name: 'Bajas', color: '#ef4444', dashed: true },
            ]}
            xAxisKey="month"
            title="Tendencia de Retención"
            subtitle="Comparativa mensual de estudiantes"
            height={280}
          />
        </div>

        {/* Side Cards - 4 columns, stacked */}
        <div className="col-span-12 lg:col-span-4 grid grid-rows-2 gap-4">
          {/* Churn Rate Card */}
          <GlassCard
            glowColor={
              parseFloat(churnRate) <= 5
                ? '#10b98130'
                : parseFloat(churnRate) <= 10
                  ? '#f59e0b30'
                  : '#ef444430'
            }
            className="p-4"
          >
            <div className="h-full flex flex-col justify-center">
              <p className="text-sm text-[var(--admin-text-muted)] mb-2">Churn Rate Mensual</p>
              <p
                className="text-3xl font-bold"
                style={{
                  color:
                    parseFloat(churnRate) <= 5
                      ? '#10b981'
                      : parseFloat(churnRate) <= 10
                        ? '#f59e0b'
                        : '#ef4444',
                }}
              >
                {churnRate}%
              </p>
              <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                {parseFloat(churnRate) <= 5
                  ? 'Excelente - muy bajo'
                  : parseFloat(churnRate) <= 10
                    ? 'Moderado - monitorear'
                    : 'Alto - requiere acción'}
              </p>
            </div>
          </GlassCard>

          {/* Net Growth Card */}
          <GlassCard glowColor={netPromoter >= 0 ? '#10b98130' : '#ef444430'} className="p-4">
            <div className="h-full flex flex-col justify-center">
              <p className="text-sm text-[var(--admin-text-muted)] mb-2">Balance Neto (6m)</p>
              <p
                className="text-3xl font-bold"
                style={{ color: netPromoter >= 0 ? '#10b981' : '#ef4444' }}
              >
                {netPromoter >= 0 ? '+' : ''}
                {netPromoter}
              </p>
              <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                {netPromoter >= 0 ? 'Crecimiento positivo' : 'Más bajas que altas - revisar'}
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Row 3: Bottom Stats Bar */}
      <div className="flex-shrink-0">
        <GlassCard className="p-2">
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
            <MiniStat
              label="Retención"
              value={`${retentionRate.toFixed(1)}%`}
              color={retentionRate >= 90 ? '#10b981' : retentionRate >= 75 ? '#f59e0b' : '#ef4444'}
            />
            <MiniStat
              label="Churn"
              value={`${churnRate}%`}
              color={
                parseFloat(churnRate) <= 5
                  ? '#10b981'
                  : parseFloat(churnRate) <= 10
                    ? '#f59e0b'
                    : '#ef4444'
              }
            />
            <MiniStat
              label="Crecimiento"
              value={`${parseFloat(growthRate) >= 0 ? '+' : ''}${growthRate}%`}
              color={parseFloat(growthRate) >= 0 ? '#10b981' : '#ef4444'}
            />
            <MiniStat
              label="Promedio Activos"
              value={avgActivos.toLocaleString('es-AR')}
              color="#06b6d4"
            />
            <MiniStat label="Nuevos/Mes" value={(totalNuevos / 6).toFixed(0)} color="#10b981" />
            <MiniStat label="Bajas/Mes" value={(totalBajas / 6).toFixed(0)} color="#ef4444" />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
