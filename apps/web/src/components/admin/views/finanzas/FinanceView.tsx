'use client';

import { useState } from 'react';
import { DollarSign, Clock, Users, TrendingUp } from 'lucide-react';
import { formatCompactCurrency } from '@/lib/constants/admin-mock-data';
import type { FinanceStatCardProps } from './types/finance.types';
import {
  FinanceStatCard,
  ConfigModal,
  TierConfigPanel,
  TransactionsList,
  RevenueEvolutionChart,
  PaymentStatusChart,
  ReportsPanel,
  NotificationsPanel,
} from './components';
import { useFinanceStats } from './hooks';

/**
 * FinanceView - Vista de finanzas del admin
 *
 * Orquesta los componentes de finanzas con datos reales del backend.
 * Fallback a mock data si el backend no está disponible.
 */

export function FinanceView() {
  const { stats, config, isLoading, error, saveConfig } = useFinanceStats();
  const [showConfigModal, setShowConfigModal] = useState(false);

  const handleSaveConfig = async (newConfig: typeof config) => {
    try {
      await saveConfig(newConfig);
      setShowConfigModal(false);
    } catch {
      // Error ya logueado en el hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--admin-text-muted)]">Cargando metricas...</p>
        </div>
      </div>
    );
  }

  // Formatear cambios como string con signo
  const formatChange = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const mainStats: FinanceStatCardProps[] = [
    {
      label: 'Ingresos del Mes',
      value: formatCompactCurrency(stats.ingresosMes),
      change: formatChange(stats.cambios.ingresos),
      trend: stats.cambios.ingresos >= 0 ? 'up' : 'down',
      icon: DollarSign,
      gradient: 'from-emerald-500 to-green-500',
      bgGradient: 'from-emerald-500/10 to-green-500/10',
    },
    {
      label: 'Pagos Pendientes',
      value: formatCompactCurrency(stats.pagosPendientes),
      change: formatChange(stats.cambios.pendientes),
      trend: stats.cambios.pendientes <= 0 ? 'down' : 'up',
      icon: Clock,
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-500/10 to-orange-500/10',
    },
    {
      label: 'Inscripciones Activas',
      value: stats.inscripcionesActivas.toLocaleString('es-AR'),
      change: `${stats.cambios.inscripciones >= 0 ? '+' : ''}${stats.cambios.inscripciones}`,
      trend: stats.cambios.inscripciones >= 0 ? 'up' : 'down',
      icon: Users,
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-500/10 to-purple-500/10',
    },
    {
      label: 'Tasa de Cobro',
      value: `${stats.tasaCobro.toFixed(1)}%`,
      change: formatChange(stats.cambios.tasaCobro),
      trend: stats.cambios.tasaCobro >= 0 ? 'up' : 'down',
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Error banner (datos mock en uso) */}
      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2 text-sm text-yellow-400">
          Usando datos de ejemplo (backend no disponible)
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((stat, index) => (
          <FinanceStatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueEvolutionChart />
        <PaymentStatusChart />
      </div>

      {/* Config & Transactions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TierConfigPanel config={config} onEdit={() => setShowConfigModal(true)} />
        <TransactionsList />
      </div>

      {/* Reports & Notifications Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportsPanel />
        <NotificationsPanel />
      </div>

      <ConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        config={config}
        onSave={handleSaveConfig}
      />
    </div>
  );
}

export default FinanceView;
