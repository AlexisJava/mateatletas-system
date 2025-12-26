'use client';

import { useState, useCallback } from 'react';
import { Users, GraduationCap, DollarSign, Clock } from 'lucide-react';
import { MOCK_TASKS, formatCompactCurrency, type MockTask } from '@/lib/constants/admin-mock-data';
import type { TaskStatus } from '@/types/admin-dashboard.types';
import {
  StatCard,
  RevenueChart,
  QuickActionsGrid,
  CasaDistributionChart,
  ColoniaHighlight,
  TasksPanel,
  AlertsPanel,
  QuickStatsSummary,
  NotesButton,
  NotesModal,
} from './components';
import { useDashboardStats } from './hooks';

/**
 * DashboardView - Vista principal del admin
 *
 * Orquesta los componentes del dashboard con datos reales del backend.
 * Fallback a mock data si el backend no está disponible.
 */

export function DashboardView() {
  const { stats, isLoading, error } = useDashboardStats();
  const [tasks, setTasks] = useState<MockTask[]>(MOCK_TASKS);
  const [notes, setNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);

  const handleToggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
        return { ...task, status: newStatus };
      }),
    );
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--admin-text-muted)]">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Error banner (datos mock en uso) */}
      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2 text-sm text-yellow-400">
          Usando datos de ejemplo (backend no disponible)
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Estudiantes"
          value={stats.totalEstudiantes.toLocaleString('es-AR')}
          change={stats.crecimientoMensual}
          changeLabel="vs mes anterior"
          icon={Users}
          status="info"
        />
        <StatCard
          label="Inscripciones Activas"
          value={stats.inscripcionesActivas.toLocaleString('es-AR')}
          change={8.3}
          changeLabel="este mes"
          icon={GraduationCap}
          status="success"
        />
        <StatCard
          label="Pagos Pendientes"
          value={formatCompactCurrency(stats.ingresosPendientes)}
          change={-5.2}
          icon={Clock}
          status="warning"
        />
        <StatCard
          label="Ingresos del Mes"
          value={formatCompactCurrency(stats.ingresosMes)}
          change={15.7}
          changeLabel="vs mes anterior"
          icon={DollarSign}
          status="success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <RevenueChart />
          <QuickActionsGrid />
          <CasaDistributionChart />
          <ColoniaHighlight />
        </div>

        {/* Right Column - Tasks & Alerts */}
        <div className="space-y-6">
          <TasksPanel tasks={tasks} onToggleTask={handleToggleTask} />
          <AlertsPanel ingresosPendientes={stats.ingresosPendientes} />
          <QuickStatsSummary
            tasaCobro={stats.tasaCobro}
            estudiantesActivos={stats.estudiantesActivos}
            crecimientoMensual={stats.crecimientoMensual}
          />
          <NotesButton hasNotes={!!notes} onClick={() => setShowNotesModal(true)} />
        </div>
      </div>

      <NotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        notes={notes}
        onSave={setNotes}
      />
    </div>
  );
}

export default DashboardView;
