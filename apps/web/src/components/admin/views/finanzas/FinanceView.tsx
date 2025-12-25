'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Clock, Users, TrendingUp } from 'lucide-react';
import { formatCompactCurrency } from '@/lib/constants/admin-mock-data';
import type { TierConfig, FinanceStatCardProps } from './types/finance.types';
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

/**
 * FinanceView - Vista de finanzas del admin
 *
 * Orquesta los componentes de finanzas con datos y estado.
 */

const DEFAULT_CONFIG: TierConfig = {
  precioSteamLibros: 40000,
  precioSteamAsincronico: 65000,
  precioSteamSincronico: 95000,
  descuentoSegundoHermano: 10,
  diaVencimiento: 15,
  diasAntesRecordatorio: 5,
  notificacionesActivas: true,
};

export function FinanceView() {
  const [isLoading, setIsLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [config, setConfig] = useState<TierConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
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
          <p className="text-sm text-[var(--admin-text-muted)]">Cargando metricas...</p>
        </div>
      </div>
    );
  }

  const mainStats: FinanceStatCardProps[] = [
    {
      label: 'Ingresos del Mes',
      value: formatCompactCurrency(4200000),
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign,
      gradient: 'from-emerald-500 to-green-500',
      bgGradient: 'from-emerald-500/10 to-green-500/10',
    },
    {
      label: 'Pagos Pendientes',
      value: formatCompactCurrency(320000),
      change: '-5.2%',
      trend: 'down',
      icon: Clock,
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-500/10 to-orange-500/10',
    },
    {
      label: 'Inscripciones Activas',
      value: '298',
      change: '+12',
      trend: 'up',
      icon: Users,
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-500/10 to-purple-500/10',
    },
    {
      label: 'Tasa de Cobro',
      value: '92.9%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
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
        onSave={setConfig}
      />
    </div>
  );
}

export default FinanceView;
