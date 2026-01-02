'use client';

import { useState, useEffect } from 'react';
import { Users, GraduationCap, DollarSign, Clock } from 'lucide-react';
import { formatCompactCurrency } from '@/lib/constants/admin-mock-data';
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
import { useDashboardStats, useTareas } from './hooks';

/**
 * DashboardView - Vista principal del admin
 *
 * Orquesta los componentes del dashboard con datos reales del backend.
 */

export function DashboardView() {
  const { stats, isLoading, error, refetch } = useDashboardStats();
  const { tasks, isLoading: tasksLoading, error: tasksError, toggleTask } = useTareas();
  const [notes, setNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);

  // Persistir notas en localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('admin-dashboard-notes');
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  const handleSaveNotes = (newNotes: string) => {
    setNotes(newNotes);
    localStorage.setItem('admin-dashboard-notes', newNotes);
  };

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

  // Error state - no hay datos
  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
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
    <div className="space-y-6 animate-fade-in">
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
          <CasaDistributionChart distribucion={stats.distribucionCasas} />
          <ColoniaHighlight />
        </div>

        {/* Right Column - Tasks & Alerts */}
        <div className="space-y-6">
          <TasksPanel
            tasks={tasks}
            isLoading={tasksLoading}
            error={tasksError}
            onToggleTask={toggleTask}
          />
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
        onSave={handleSaveNotes}
      />
    </div>
  );
}

export default DashboardView;
