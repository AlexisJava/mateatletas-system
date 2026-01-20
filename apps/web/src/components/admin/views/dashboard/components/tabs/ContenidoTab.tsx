'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, TrendingUp, Users, Star } from 'lucide-react';
import { getLibrosLeidos, getCombinedDashboardStats } from '@/lib/api/admin.api';
import { KPICard, GlassCard, MiniStat } from '../GlassCard';
import { GradientAreaChart } from '../charts';

export function ContenidoTab() {
  const { data: libros, isLoading } = useQuery({
    queryKey: ['admin', 'libros'],
    queryFn: getLibrosLeidos,
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

  if (!libros) {
    return (
      <div className="h-full flex items-center justify-center text-[var(--admin-text-muted)]">
        Error al cargar datos
      </div>
    );
  }

  // Calculate engagement rate
  const engagementRate =
    stats?.totalEstudiantes && stats.totalEstudiantes > 0
      ? ((libros.total / stats.totalEstudiantes) * 100).toFixed(1)
      : '0';

  // Chart data for trend
  const trendChartData =
    libros.tendencia?.map((d) => ({
      month: d.month,
      completados: d.completados,
    })) ?? [];

  // Estimate average completion time (mock data for now)
  const avgCompletionMinutes = 45;

  // Calculate month-over-month growth
  const lastMonthCompletados = trendChartData[trendChartData.length - 1]?.completados ?? 0;
  const prevMonthCompletados = trendChartData[trendChartData.length - 2]?.completados ?? 0;
  const momGrowth =
    prevMonthCompletados > 0
      ? (((lastMonthCompletados - prevMonthCompletados) / prevMonthCompletados) * 100).toFixed(0)
      : '0';

  return (
    <div className="h-full p-4 flex flex-col gap-5">
      {/* Row 1: 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
        <KPICard
          label="Total Completados"
          value={libros.total.toLocaleString('es-AR')}
          icon={BookOpen}
          color="#ec4899"
          trend="up"
        />
        <KPICard
          label="Este Mes"
          value={libros.completadosEsteMes.toLocaleString('es-AR')}
          change={parseInt(momGrowth)}
          changeLabel="vs mes anterior"
          icon={TrendingUp}
          color="#8b5cf6"
          trend={parseInt(momGrowth) >= 0 ? 'up' : 'down'}
        />
        <KPICard
          label="Por Estudiante"
          value={libros.porEstudiante.toFixed(1)}
          icon={Users}
          color="#06b6d4"
        />
        <KPICard
          label="Engagement"
          value={`${engagementRate}%`}
          icon={Star}
          color={
            parseFloat(engagementRate) >= 50
              ? '#10b981'
              : parseFloat(engagementRate) >= 25
                ? '#f59e0b'
                : '#ef4444'
          }
          trend={
            parseFloat(engagementRate) >= 50
              ? 'up'
              : parseFloat(engagementRate) >= 25
                ? 'neutral'
                : 'down'
          }
        />
      </div>

      {/* Row 2: Main Chart (8 cols) + Side Cards (4 cols) */}
      <div className="grid grid-cols-12 gap-4 flex-shrink-0">
        {/* Chart - 8 columns */}
        <div className="col-span-12 lg:col-span-8">
          <GradientAreaChart
            data={trendChartData}
            dataKey="completados"
            xAxisKey="month"
            title="Tendencia de Contenidos Completados"
            subtitle="Últimos 6 meses"
            color="#ec4899"
            height={280}
          />
        </div>

        {/* Side Cards - 4 columns, stacked */}
        <div className="col-span-12 lg:col-span-4 grid grid-rows-2 gap-4">
          {/* Promedio por Estudiante Card */}
          <GlassCard glowColor="#ec489930" className="p-4">
            <div className="h-full flex flex-col justify-center">
              <p className="text-sm text-[var(--admin-text-muted)] mb-2">Promedio por Estudiante</p>
              <p className="text-3xl font-bold" style={{ color: '#ec4899' }}>
                {libros.porEstudiante.toFixed(1)}
              </p>
              <div className="mt-2 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(libros.porEstudiante * 10, 100)}%`,
                    background: 'linear-gradient(90deg, #ec4899 0%, #8b5cf6 100%)',
                  }}
                />
              </div>
            </div>
          </GlassCard>

          {/* Tiempo Promedio Card */}
          <GlassCard glowColor="#f59e0b30" className="p-4">
            <div className="h-full flex flex-col justify-center">
              <p className="text-sm text-[var(--admin-text-muted)] mb-2">Tiempo Promedio</p>
              <p className="text-3xl font-bold" style={{ color: '#f59e0b' }}>
                {avgCompletionMinutes} min
              </p>
              <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                Por contenido completado
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Row 3: Bottom Stats Bar */}
      <div className="flex-shrink-0">
        <GlassCard className="p-2">
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
            <MiniStat label="Total" value={libros.total.toLocaleString('es-AR')} color="#ec4899" />
            <MiniStat
              label="Este Mes"
              value={libros.completadosEsteMes.toLocaleString('es-AR')}
              color="#8b5cf6"
            />
            <MiniStat
              label="Por Estudiante"
              value={libros.porEstudiante.toFixed(1)}
              color="#06b6d4"
            />
            <MiniStat label="Engagement" value={`${engagementRate}%`} color="#10b981" />
            <MiniStat label="Tiempo Prom." value={`${avgCompletionMinutes}m`} color="#f59e0b" />
            <MiniStat
              label="Crecimiento"
              value={`${parseInt(momGrowth) >= 0 ? '+' : ''}${momGrowth}%`}
              color={parseInt(momGrowth) >= 0 ? '#10b981' : '#ef4444'}
            />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
