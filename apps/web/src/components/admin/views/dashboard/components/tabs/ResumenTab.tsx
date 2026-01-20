'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, DollarSign, TrendingUp, Percent, Clock, BookOpen } from 'lucide-react';
import { formatCompactCurrency } from '@/lib/utils/format';
import { getCombinedDashboardStats, getRetentionStats, getLibrosLeidos } from '@/lib/api/admin.api';
import { GlassCard, KPICard, MiniStat } from '../GlassCard';
import { GradientAreaChart } from '../charts';

export function ResumenTab() {
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: getCombinedDashboardStats,
  });

  const { data: retention } = useQuery({
    queryKey: ['admin', 'retention'],
    queryFn: () => getRetentionStats(6),
  });

  const { data: libros } = useQuery({
    queryKey: ['admin', 'libros'],
    queryFn: getLibrosLeidos,
  });

  if (loadingStats) {
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

  const mrr = stats.ingresosMes;
  const arr = mrr * 12;

  const retentionChartData =
    retention?.map((d) => ({
      month: d.month,
      activos: d.activos,
    })) ?? [];

  return (
    <div className="h-full p-4 flex flex-col gap-5">
      {/* Row 1: 4 KPI Cards - Compact height */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
        <KPICard
          label="Estudiantes Activos"
          value={stats.inscripcionesActivas.toLocaleString('es-AR')}
          icon={Users}
          color="#06b6d4"
          change={stats.crecimientoMensual}
          changeLabel="vs mes anterior"
          trend={
            stats.crecimientoMensual > 0 ? 'up' : stats.crecimientoMensual < 0 ? 'down' : 'neutral'
          }
        />
        <KPICard
          label="MRR"
          value={formatCompactCurrency(mrr)}
          icon={DollarSign}
          color="#10b981"
          change={8}
          changeLabel="vs mes anterior"
          trend="up"
        />
        <KPICard
          label="Tasa de Cobro"
          value={`${stats.tasaCobro}%`}
          icon={Percent}
          color={stats.tasaCobro >= 80 ? '#10b981' : stats.tasaCobro >= 60 ? '#f59e0b' : '#ef4444'}
        />
        <KPICard
          label="Por Cobrar"
          value={formatCompactCurrency(stats.ingresosPendientes)}
          icon={Clock}
          color="#f59e0b"
        />
      </div>

      {/* Row 2: Main Chart (8 cols) + 2 Stacked Cards (4 cols) */}
      <div className="grid grid-cols-12 gap-4 flex-shrink-0">
        {/* Chart - 8 columns */}
        <div className="col-span-12 lg:col-span-8">
          <GradientAreaChart
            data={retentionChartData}
            dataKey="activos"
            xAxisKey="month"
            title="Evolución de Estudiantes Activos"
            subtitle="Últimos 6 meses"
            color="#06b6d4"
            height={280}
          />
        </div>

        {/* Side Cards - 4 columns, stacked */}
        <div className="col-span-12 lg:col-span-4 grid grid-rows-2 gap-4">
          {/* ARR Card */}
          <GlassCard glowColor="#8b5cf630" className="p-4">
            <div className="h-full flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: '#8b5cf615' }}
                >
                  <TrendingUp className="w-5 h-5" style={{ color: '#8b5cf6' }} />
                </div>
                <p className="text-sm text-[var(--admin-text-muted)]">ARR Proyectado</p>
              </div>
              <p className="text-3xl font-bold" style={{ color: '#8b5cf6' }}>
                {formatCompactCurrency(arr)}
              </p>
              <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                Basado en MRR actual × 12
              </p>
            </div>
          </GlassCard>

          {/* Contenidos Card */}
          <GlassCard glowColor="#ec489930" className="p-4">
            <div className="h-full flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: '#ec489915' }}
                >
                  <BookOpen className="w-5 h-5" style={{ color: '#ec4899' }} />
                </div>
                <p className="text-sm text-[var(--admin-text-muted)]">Contenidos Completados</p>
              </div>
              <p className="text-3xl font-bold" style={{ color: '#ec4899' }}>
                {(libros?.total ?? 0).toLocaleString('es-AR')}
              </p>
              <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                {libros?.completadosEsteMes ?? 0} este mes
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
              label="Total Estudiantes"
              value={stats.totalEstudiantes.toLocaleString('es-AR')}
              color="#06b6d4"
            />
            <MiniStat label="Quantum" value={stats.distribucionCasas.Quantum} color="#06b6d4" />
            <MiniStat label="Vertex" value={stats.distribucionCasas.Vertex} color="#a855f7" />
            <MiniStat label="Pulsar" value={stats.distribucionCasas.Pulsar} color="#f59e0b" />
            <MiniStat label="Este Mes" value={libros?.completadosEsteMes ?? 0} color="#ec4899" />
            <MiniStat
              label="Por Estudiante"
              value={(libros?.porEstudiante ?? 0).toFixed(1)}
              color="#8b5cf6"
            />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
