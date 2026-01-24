'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Home, Activity, CreditCard, type LucideIcon } from 'lucide-react';
import type { AnalyticsTabId } from './types/analytics.types';
import { OverviewTab } from './components/OverviewTab';
import { CasasTab } from './components/CasasTab';
import { RetencionTab } from './components/RetencionTab';
import { SuscripcionesMPTab } from './components/SuscripcionesMPTab';
import { useAnalytics } from './hooks';

/**
 * AnalyticsView - Vista completa de analytics del admin
 *
 * Diseño: Dark Glassmorphism Gaming Premium (igual que Dashboard)
 * - 100vh sin scroll (contenido de tabs scrollea)
 * - 4 Tabs con animaciones suaves
 * - Datos de múltiples fuentes consolidados
 *
 * Tabs:
 * - Overview: KPIs principales, distribución tiers, ingresos
 * - Casas: Distribución de estudiantes por casa
 * - Retención: Métricas de retención y churn
 * - Suscripciones MP: Métricas de Mercado Pago
 */

interface TabConfig {
  id: AnalyticsTabId;
  label: string;
  icon: LucideIcon;
  color: string;
}

const TABS: TabConfig[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3, color: '#8b5cf6' },
  { id: 'casas', label: 'Casas', icon: Home, color: '#06b6d4' },
  { id: 'retencion', label: 'Retención', icon: Activity, color: '#10b981' },
  { id: 'suscripciones', label: 'Mercado Pago', icon: CreditCard, color: '#f59e0b' },
];

export function AnalyticsView() {
  const [activeTab, setActiveTab] = useState<AnalyticsTabId>('overview');
  const { isLoading, error, data, refetch } = useAnalytics();

  const activeConfig = TABS.find((t) => t.id === activeTab);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--admin-text-muted)]">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--status-danger)] mb-4">Error al cargar analytics</p>
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
    <div className="h-full flex flex-col overflow-hidden">
      {/* Background ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${activeConfig?.color}40 0%, transparent 70%)`,
          }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${activeConfig?.color}30 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Tabs Navigation - Glassmorphism style */}
      <div className="flex-shrink-0 px-4 py-3">
        <div className="relative flex items-center gap-1 p-1.5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] w-fit">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200"
                style={{
                  color: isActive ? '#fff' : 'var(--admin-text-muted)',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="analyticsActiveTabBg"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${tab.color}90 0%, ${tab.color}50 100%)`,
                      boxShadow: `0 4px 20px ${tab.color}40, inset 0 1px 0 rgba(255,255,255,0.1)`,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                {!isActive && (
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-200"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  />
                )}

                <span className="relative z-10 flex items-center gap-2">
                  <Icon
                    className="w-4 h-4 transition-transform duration-200"
                    style={{
                      transform: isActive ? 'scale(1.1)' : 'scale(1)',
                      filter: isActive ? `drop-shadow(0 0 8px ${tab.color})` : 'none',
                    }}
                  />
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>

                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: `radial-gradient(ellipse at center, ${tab.color}20 0%, transparent 70%)`,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full"
          >
            {activeTab === 'overview' && (
              <OverviewTab
                overview={data.overview}
                tierDistribution={data.tierDistribution}
                historicoMensual={data.historicoMensual}
              />
            )}
            {activeTab === 'casas' && <CasasTab casaDistribution={data.casaDistribution} />}
            {activeTab === 'retencion' && <RetencionTab retentionData={data.retentionData} />}
            {activeTab === 'suscripciones' && (
              <SuscripcionesMPTab suscripcionesMP={data.suscripcionesMP} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AnalyticsView;
