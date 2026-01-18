'use client';

import { Users, Clock, DollarSign } from 'lucide-react';
import { formatCompactCurrency } from '@/lib/utils/format';
import {
  StatCard,
  TierDistributionCard,
  RevenueChart,
  QuickActionsGrid,
  CasaDistributionChart,
  AlertsPanel,
} from './components';
import { useDashboardStats } from './hooks';

/**
 * DashboardView - Vista principal del admin
 *
 * Layout Bento Grid optimizado para viewport sin scroll.
 * Estructura:
 * - Row 1: 4 KPIs (Estudiantes Activos, Distribución Tier, Por Cobrar, Cobrado)
 * - Row 2: Revenue Chart (2/3) + Casas + Alertas (1/3 stacked)
 * - Row 3: Quick Actions
 */

export function DashboardView() {
  const { stats, isLoading, error, refetch } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--admin-text-muted)]">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-[var(--status-danger)] mb-4">Error al cargar datos del dashboard</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-[var(--admin-surface-2)] rounded-lg hover:bg-[var(--admin-surface-1)] border border-[var(--admin-border)] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Row 1: KPI Stats - 4 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Estudiantes Activos (inscripciones del mes) */}
        <StatCard
          label="Estudiantes Activos"
          value={stats.inscripcionesActivas.toLocaleString('es-AR')}
          icon={Users}
          status="info"
        />

        {/* Card 2: Distribución por Tier */}
        <TierDistributionCard />

        {/* Card 3: Por Cobrar */}
        <StatCard
          label="Por Cobrar"
          value={formatCompactCurrency(stats.ingresosPendientes)}
          icon={Clock}
          status="warning"
        />

        {/* Card 4: Cobrado este mes */}
        <StatCard
          label="Cobrado"
          value={formatCompactCurrency(stats.ingresosMes)}
          icon={DollarSign}
          status="success"
        />
      </div>

      {/* Row 2: Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Revenue Chart - 2/3 del ancho */}
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>

        {/* Right Column - 1/3 del ancho, 2 cards stacked */}
        <div className="flex flex-col gap-3">
          <CasaDistributionChart distribucion={stats.distribucionCasas} />
          <AlertsPanel ingresosPendientes={stats.ingresosPendientes} />
        </div>
      </div>

      {/* Row 3: Quick Actions */}
      <QuickActionsGrid />
    </div>
  );
}

export default DashboardView;
