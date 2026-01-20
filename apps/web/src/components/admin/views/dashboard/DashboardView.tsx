'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, DollarSign, TrendingUp, BookOpen } from 'lucide-react';
import { DashboardTabs } from './components/DashboardTabs';
import { ResumenTab } from './components/tabs/ResumenTab';
import { EstudiantesTab } from './components/tabs/EstudiantesTab';
import { FinanzasTab } from './components/tabs/FinanzasTab';
import { RetencionTab } from './components/tabs/RetencionTab';
import { ContenidoTab } from './components/tabs/ContenidoTab';

/**
 * DashboardView - Vista principal del admin con tabs
 *
 * Diseño: Dark Glassmorphism Gaming Premium
 * - 100vh sin scroll
 * - Tabs con animaciones suaves
 * - Gráficos con gradientes vibrantes
 */

export type DashboardTabId = 'resumen' | 'estudiantes' | 'finanzas' | 'retencion' | 'contenido';

interface TabConfig {
  id: DashboardTabId;
  label: string;
  icon: typeof LayoutDashboard;
  color: string;
}

const TABS: TabConfig[] = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard, color: '#8b5cf6' },
  { id: 'estudiantes', label: 'Estudiantes', icon: Users, color: '#06b6d4' },
  { id: 'finanzas', label: 'Finanzas', icon: DollarSign, color: '#10b981' },
  { id: 'retencion', label: 'Retención', icon: TrendingUp, color: '#f59e0b' },
  { id: 'contenido', label: 'Contenido', icon: BookOpen, color: '#ec4899' },
];

const TAB_COMPONENTS: Record<DashboardTabId, React.ComponentType> = {
  resumen: ResumenTab,
  estudiantes: EstudiantesTab,
  finanzas: FinanzasTab,
  retencion: RetencionTab,
  contenido: ContenidoTab,
};

export function DashboardView() {
  const [activeTab, setActiveTab] = useState<DashboardTabId>('resumen');

  const ActiveComponent = TAB_COMPONENTS[activeTab];
  const activeConfig = TABS.find((t) => t.id === activeTab);

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

      {/* Tabs Navigation */}
      <DashboardTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

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
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default DashboardView;
