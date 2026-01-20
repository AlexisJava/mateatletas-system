'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, UserPlus, UserMinus, TrendingUp } from 'lucide-react';
import {
  getCombinedDashboardStats,
  getRetentionStats,
  getCasasEstadisticas,
} from '@/lib/api/admin.api';
import { KPICard, GlassCard, MiniStat } from '../GlassCard';
import { MultiLineChart, GlowingPieChart } from '../charts';

// Colors for each casa
const CASA_COLORS = {
  QUANTUM: '#06b6d4',
  VERTEX: '#a855f7',
  PULSAR: '#f59e0b',
};

export function EstudiantesTab() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: getCombinedDashboardStats,
  });

  const { data: retention } = useQuery({
    queryKey: ['admin', 'retention'],
    queryFn: () => getRetentionStats(6),
  });

  const { data: casas } = useQuery({
    queryKey: ['admin', 'casas'],
    queryFn: getCasasEstadisticas,
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

  // Prepare pie chart data
  const casasPieData = [
    { name: 'Quantum', value: stats.distribucionCasas.Quantum, color: CASA_COLORS.QUANTUM },
    { name: 'Vertex', value: stats.distribucionCasas.Vertex, color: CASA_COLORS.VERTEX },
    { name: 'Pulsar', value: stats.distribucionCasas.Pulsar, color: CASA_COLORS.PULSAR },
  ];

  // Prepare retention chart data
  const retentionChartData =
    retention?.map((d) => ({
      month: d.month,
      nuevos: d.nuevos,
      activos: d.activos,
      bajas: d.bajas,
    })) ?? [];

  // Calculate totals from retention
  const totalNuevos = retention?.reduce((sum, d) => sum + d.nuevos, 0) ?? 0;
  const totalBajas = retention?.reduce((sum, d) => sum + d.bajas, 0) ?? 0;
  const netGrowth = totalNuevos - totalBajas;

  // Casa líder
  const casaLider = casas?.ranking[0];

  return (
    <div className="h-full p-4 flex flex-col gap-5">
      {/* Row 1: 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
        <KPICard
          label="Total Estudiantes"
          value={stats.totalEstudiantes.toLocaleString('es-AR')}
          icon={Users}
          color="#06b6d4"
        />
        <KPICard
          label="Nuevos (6 meses)"
          value={totalNuevos.toLocaleString('es-AR')}
          icon={UserPlus}
          color="#10b981"
          trend="up"
        />
        <KPICard
          label="Bajas (6 meses)"
          value={totalBajas.toLocaleString('es-AR')}
          icon={UserMinus}
          color="#ef4444"
        />
        <KPICard
          label="Crecimiento Neto"
          value={netGrowth >= 0 ? `+${netGrowth}` : netGrowth.toString()}
          change={stats.crecimientoMensual}
          changeLabel="este mes"
          icon={TrendingUp}
          color={netGrowth >= 0 ? '#10b981' : '#ef4444'}
          trend={netGrowth >= 0 ? 'up' : 'down'}
        />
      </div>

      {/* Row 2: Main Chart (8 cols) + Pie Chart (4 cols) */}
      <div className="grid grid-cols-12 gap-4 flex-shrink-0">
        {/* Chart - 8 columns */}
        <div className="col-span-12 lg:col-span-8">
          <MultiLineChart
            data={retentionChartData}
            lines={[
              { key: 'nuevos', name: 'Nuevos', color: '#10b981' },
              { key: 'activos', name: 'Activos', color: '#06b6d4' },
              { key: 'bajas', name: 'Bajas', color: '#ef4444', dashed: true },
            ]}
            xAxisKey="month"
            title="Evolución de Estudiantes"
            subtitle="Nuevos, activos y bajas por mes"
            height={280}
          />
        </div>

        {/* Pie Chart - 4 columns (single card, full height) */}
        <div className="col-span-12 lg:col-span-4">
          <GlowingPieChart
            data={casasPieData}
            title="Distribución por Casa"
            subtitle="Estudiantes activos"
            centerValue={stats.estudiantesActivos}
            centerLabel="activos"
            height={220}
          />
        </div>
      </div>

      {/* Row 3: Bottom Stats Bar */}
      <div className="flex-shrink-0">
        <GlassCard className="p-2">
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
            <MiniStat
              label="Activos"
              value={stats.estudiantesActivos.toLocaleString('es-AR')}
              color="#06b6d4"
            />
            <MiniStat label="Quantum" value={stats.distribucionCasas.Quantum} color="#06b6d4" />
            <MiniStat label="Vertex" value={stats.distribucionCasas.Vertex} color="#a855f7" />
            <MiniStat label="Pulsar" value={stats.distribucionCasas.Pulsar} color="#f59e0b" />
            <MiniStat
              label="Casa Líder"
              value={casaLider?.nombre ?? '-'}
              color={CASA_COLORS[casaLider?.tipo as keyof typeof CASA_COLORS] ?? '#8b5cf6'}
            />
            <MiniStat
              label="Puntos Líder"
              value={casaLider?.puntosTotales.toLocaleString('es-AR') ?? '0'}
              color={CASA_COLORS[casaLider?.tipo as keyof typeof CASA_COLORS] ?? '#8b5cf6'}
            />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
