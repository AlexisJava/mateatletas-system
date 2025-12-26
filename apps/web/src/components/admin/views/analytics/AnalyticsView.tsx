'use client';

import { useState } from 'react';
import { Users, Target, BookOpen, TrendingUp, Download } from 'lucide-react';
import type { AnalyticsTabId } from './types/analytics.types';
import {
  AnalyticsStatCard,
  AnalyticsTabNav,
  CasasTab,
  BibliotecaTab,
  RetencionTab,
} from './components';
import { useAnalytics } from './hooks';

/**
 * AnalyticsView - Vista de analytics del admin
 *
 * Orquesta los tabs de Casas, Biblioteca y Retención.
 * Conecta con endpoints reales del backend.
 */

export function AnalyticsView() {
  const [activeTab, setActiveTab] = useState<AnalyticsTabId>('casas');
  const { isLoading, error, data } = useAnalytics();

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

  const { stats, casaDistribution, retentionData } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Error banner (datos mock en uso) */}
      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2 text-sm text-yellow-400">
          Usando datos de ejemplo (backend no disponible)
        </div>
      )}

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
          value={`${stats.tasaRetencion}%`}
          change={2.1}
          icon={Target}
          color="#22c55e"
        />
        <AnalyticsStatCard
          label="Libros Leidos"
          value={stats.librosLeidos > 0 ? stats.librosLeidos.toLocaleString() : '—'}
          change={stats.librosLeidos > 0 ? 15.3 : undefined}
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
      {activeTab === 'casas' && <CasasTab casaDistribution={casaDistribution} />}
      {activeTab === 'biblioteca' && <BibliotecaTab />}
      {activeTab === 'retencion' && <RetencionTab retentionData={retentionData} />}

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
