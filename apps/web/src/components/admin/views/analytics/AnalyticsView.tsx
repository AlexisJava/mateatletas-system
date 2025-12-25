'use client';

import { useState, useEffect } from 'react';
import { Users, Target, BookOpen, TrendingUp, Download } from 'lucide-react';
import { MOCK_DASHBOARD_STATS } from '@/lib/constants/admin-mock-data';
import type { AnalyticsTabId } from './types/analytics.types';
import {
  AnalyticsStatCard,
  AnalyticsTabNav,
  CasasTab,
  BibliotecaTab,
  RetencionTab,
} from './components';

/**
 * AnalyticsView - Vista de analytics del admin
 *
 * Orquesta los tabs de Casas, Biblioteca y Retención.
 */

export function AnalyticsView() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AnalyticsTabId>('casas');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (isMounted) setIsLoading(false);
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--admin-text-muted)]">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  const stats = MOCK_DASHBOARD_STATS;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsStatCard
          label="Estudiantes Activos"
          value={stats.estudiantesActivos}
          change={stats.crecimientoMensual}
          icon={Users}
          color="#6366f1"
        />
        <AnalyticsStatCard
          label="Tasa de Retencion"
          value="94.2%"
          change={2.1}
          icon={Target}
          color="#22c55e"
        />
        <AnalyticsStatCard
          label="Libros Leidos"
          value="2,100"
          change={15.3}
          icon={BookOpen}
          color="#f59e0b"
        />
        <AnalyticsStatCard
          label="Crecimiento Mensual"
          value={`${stats.crecimientoMensual}%`}
          change={3.2}
          icon={TrendingUp}
          color="#06b6d4"
        />
      </div>

      {/* Tab Navigation */}
      <AnalyticsTabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'casas' && <CasasTab />}
      {activeTab === 'biblioteca' && <BibliotecaTab />}
      {activeTab === 'retencion' && <RetencionTab />}

      {/* Export Button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-accent)] text-black rounded-lg font-medium hover:opacity-90 transition-opacity">
          <Download className="w-4 h-4" />
          Exportar Reporte
        </button>
      </div>
    </div>
  );
}

export default AnalyticsView;
