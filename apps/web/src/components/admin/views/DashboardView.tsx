'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calendar,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Activity,
  ListTodo,
  Plus,
  X,
  Loader2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  MOCK_TASKS,
  MOCK_DASHBOARD_STATS,
  MOCK_REVENUE_DATA,
  MOCK_CASA_DISTRIBUTION,
  formatCompactCurrency,
  getTaskPriorityColor,
  getTaskStatusColor,
  type MockTask,
} from '@/lib/constants/admin-mock-data';
import type { TaskStatus } from '@/types/admin-dashboard.types';

/**
 * DashboardView - Vista principal del admin
 *
 * Adaptado del mockup AI Studio con CSS variables.
 * Usa Recharts para gráficos unificados.
 */

// =============================================================================
// STAT CARD COMPONENT
// =============================================================================

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number | null;
  changeLabel?: string;
  icon: typeof Users;
  status?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

function StatCard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  status = 'neutral',
}: StatCardProps) {
  const statusColors = {
    success: 'text-[var(--status-success)]',
    warning: 'text-[var(--status-warning)]',
    danger: 'text-[var(--status-danger)]',
    info: 'text-[var(--status-info)]',
    neutral: 'text-[var(--admin-accent)]',
  };

  const bgColors = {
    success: 'bg-[var(--status-success-muted)]',
    warning: 'bg-[var(--status-warning-muted)]',
    danger: 'bg-[var(--status-danger-muted)]',
    info: 'bg-[var(--status-info-muted)]',
    neutral: 'bg-[var(--admin-accent-muted)]',
  };

  return (
    <div className="group p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)] hover:border-[var(--admin-border-accent)] transition-all duration-300 hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-xl ${bgColors[status]} flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${statusColors[status]}`} />
        </div>
        {change !== undefined && change !== null && (
          <div
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              change >= 0
                ? 'text-[var(--status-success)] bg-[var(--status-success-muted)]'
                : 'text-[var(--status-danger)] bg-[var(--status-danger-muted)]'
            }`}
          >
            {change >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>
              {change >= 0 ? '+' : ''}
              {change}%
            </span>
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-[var(--admin-text)] mb-1">{value}</p>
        <p className="text-sm text-[var(--admin-text-muted)]">{label}</p>
        {changeLabel && (
          <p className="text-xs text-[var(--admin-text-disabled)] mt-1">{changeLabel}</p>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// QUICK ACTION COMPONENT
// =============================================================================

interface QuickActionProps {
  href: string;
  label: string;
  description: string;
  icon: typeof Users;
}

function QuickAction({ href, label, description, icon: Icon }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 p-4 rounded-xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)] hover:border-[var(--admin-border-accent)] hover:bg-[var(--admin-surface-2)] transition-all duration-200"
    >
      <div className="w-10 h-10 rounded-lg bg-[var(--admin-accent-muted)] flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-[var(--admin-accent)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--admin-text)] group-hover:text-[var(--admin-accent)] transition-colors">
          {label}
        </p>
        <p className="text-xs text-[var(--admin-text-muted)]">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-[var(--admin-text-disabled)] group-hover:text-[var(--admin-accent)] group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

// =============================================================================
// ALERT ITEM COMPONENT
// =============================================================================

interface AlertItemProps {
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  action?: string;
  href?: string;
}

function AlertItem({ type, title, description, action, href }: AlertItemProps) {
  const icons = {
    warning: AlertCircle,
    info: Activity,
    success: CheckCircle,
  };
  const colors = {
    warning: 'text-[var(--status-warning)] bg-[var(--status-warning-muted)]',
    info: 'text-[var(--status-info)] bg-[var(--status-info-muted)]',
    success: 'text-[var(--status-success)] bg-[var(--status-success-muted)]',
  };
  const borderColors = {
    warning: 'border-l-[var(--status-warning)]',
    info: 'border-l-[var(--status-info)]',
    success: 'border-l-[var(--status-success)]',
  };
  const Icon = icons[type];

  const content = (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg bg-[var(--admin-surface-1)] border border-[var(--admin-border)] border-l-4 ${borderColors[type]} hover:border-[var(--admin-border-accent)] transition-colors`}
    >
      <div
        className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${colors[type]}`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--admin-text)]">{title}</p>
        <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">{description}</p>
        {action && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--admin-accent)] mt-2">
            {action}
            <ArrowRight className="w-3 h-3" />
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

// =============================================================================
// TASK ITEM COMPONENT
// =============================================================================

interface TaskItemProps {
  task: MockTask;
  onToggle: (id: string) => void;
}

function TaskItem({ task, onToggle }: TaskItemProps) {
  const isCompleted = task.status === 'completed';

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg bg-[var(--admin-surface-1)] border border-[var(--admin-border)] hover:border-[var(--admin-border-accent)] transition-colors ${
        isCompleted ? 'opacity-60' : ''
      }`}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          isCompleted
            ? 'bg-[var(--status-success)] border-[var(--status-success)]'
            : 'border-[var(--admin-border)] hover:border-[var(--admin-accent)]'
        }`}
      >
        {isCompleted && <CheckCircle className="w-3 h-3 text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${isCompleted ? 'line-through text-[var(--admin-text-muted)]' : 'text-[var(--admin-text)]'}`}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-[var(--admin-text-muted)] truncate">{task.description}</p>
        )}
      </div>
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTaskPriorityColor(task.priority)}`}
      >
        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
      </span>
    </div>
  );
}

// =============================================================================
// NOTES MODAL
// =============================================================================

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: string;
  onSave: (notes: string) => void;
}

function NotesModal({ isOpen, onClose, notes, onSave }: NotesModalProps) {
  const [localNotes, setLocalNotes] = useState(notes);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onSave(localNotes);
    setSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-2xl max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-[var(--admin-border)]">
          <h3 className="text-lg font-semibold text-[var(--admin-text)]">Notas del día</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--admin-text-muted)]" />
          </button>
        </div>
        <div className="p-4">
          <textarea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            placeholder="Escribe tus notas aquí..."
            className="w-full h-48 p-4 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] placeholder:text-[var(--admin-text-disabled)] resize-none focus:outline-none focus:border-[var(--admin-accent)] transition-colors"
          />
        </div>
        <div className="flex gap-3 p-4 border-t border-[var(--admin-border)]">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-[var(--admin-surface-2)] text-[var(--admin-text)] rounded-xl font-medium hover:bg-[var(--admin-surface-1)] border border-[var(--admin-border)] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2.5 bg-[var(--admin-accent)] text-black rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN DASHBOARD VIEW
// =============================================================================

export function DashboardView() {
  const [tasks, setTasks] = useState<MockTask[]>(MOCK_TASKS);
  const [notes, setNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simular carga de datos
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (isMounted) {
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
        return { ...task, status: newStatus };
      }),
    );
  }, []);

  const stats = MOCK_DASHBOARD_STATS;

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
          {/* Revenue Chart */}
          <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--admin-text)]">
                Evolución de Ingresos
              </h2>
              <Link
                href="/admin/finanzas"
                className="text-xs text-[var(--admin-accent)] hover:underline"
              >
                Ver detalle
              </Link>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_REVENUE_DATA}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--status-success)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--status-success)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                  <XAxis dataKey="month" stroke="var(--admin-text-muted)" fontSize={12} />
                  <YAxis
                    stroke="var(--admin-text-muted)"
                    fontSize={12}
                    tickFormatter={(value) => formatCompactCurrency(value)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--admin-surface-2)',
                      border: '1px solid var(--admin-border)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'var(--admin-text)' }}
                    formatter={(value: number) => [formatCompactCurrency(value), 'Ingresos']}
                  />
                  <Area
                    type="monotone"
                    dataKey="ingresos"
                    stroke="var(--status-success)"
                    strokeWidth={2}
                    fill="url(#colorIngresos)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
              Acciones rápidas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <QuickAction
                href="/admin/personas"
                label="Gestionar Personas"
                description="Estudiantes, docentes, tutores"
                icon={Users}
              />
              <QuickAction
                href="/admin/finanzas"
                label="Registrar Pago"
                description="Pagos manuales"
                icon={CreditCard}
              />
              <QuickAction
                href="/admin/productos"
                label="Ver Productos"
                description="Colonia, cursos, talleres"
                icon={GraduationCap}
              />
              <QuickAction
                href="/admin/analytics"
                label="Generar Reporte"
                description="Exportar datos"
                icon={TrendingUp}
              />
            </div>
          </div>

          {/* Casa Distribution */}
          <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--admin-text)]">
                Distribución por Casa
              </h2>
              <Link
                href="/admin/analytics"
                className="text-xs text-[var(--admin-accent)] hover:underline"
              >
                Ver análisis
              </Link>
            </div>
            <div className="flex items-center gap-8">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={MOCK_CASA_DISTRIBUTION}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {MOCK_CASA_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {MOCK_CASA_DISTRIBUTION.map((casa) => (
                  <div key={casa.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: casa.color }}
                      />
                      <span className="text-sm text-[var(--admin-text)]">{casa.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-[var(--admin-text)]">
                      {casa.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonia 2026 Highlight */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[var(--admin-accent-muted)] to-[var(--status-info-muted)] border border-[var(--admin-border-accent)]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--admin-accent)] flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[var(--admin-text)]">
                  Colonia de Verano 2026
                </h3>
                <p className="text-sm text-[var(--admin-text-secondary)] mt-1">
                  Inscripciones abiertas para Enero y Febrero. Gestiona las inscripciones, tiers y
                  pagos desde el panel de productos.
                </p>
                <Link
                  href="/admin/productos"
                  className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-[var(--admin-accent)] hover:underline"
                >
                  Ver productos
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Tasks & Alerts */}
        <div className="space-y-6">
          {/* Tasks */}
          <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--admin-text)] flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-[var(--admin-accent)]" />
                Tareas
              </h2>
              <button className="p-2 rounded-lg bg-[var(--admin-accent-muted)] text-[var(--admin-accent)] hover:bg-[var(--admin-accent)] hover:text-black transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {tasks.map((task) => (
                <TaskItem key={task.id} task={task} onToggle={handleToggleTask} />
              ))}
            </div>
          </div>

          {/* System Alerts */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
              Alertas del sistema
            </h2>
            <div className="space-y-3">
              {stats.ingresosPendientes > 0 && (
                <AlertItem
                  type="warning"
                  title={`${formatCompactCurrency(stats.ingresosPendientes)} en pagos pendientes`}
                  description="Revisar inscripciones sin confirmar pago"
                  action="Ver finanzas"
                  href="/admin/finanzas"
                />
              )}
              <AlertItem
                type="info"
                title="Colonia 2026 activa"
                description="Las inscripciones están abiertas"
                action="Ver productos"
                href="/admin/productos"
              />
              <AlertItem
                type="success"
                title="Sistema funcionando correctamente"
                description="Todos los servicios operativos"
              />
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="p-4 rounded-xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
            <h3 className="text-sm font-semibold text-[var(--admin-text)] mb-3">Resumen rápido</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--admin-text-muted)]">Tasa de cobro</span>
                <span className="text-sm font-medium text-[var(--status-success)]">
                  {stats.tasaCobro}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--admin-text-muted)]">Estudiantes activos</span>
                <span className="text-sm font-medium text-[var(--admin-text)]">
                  {stats.estudiantesActivos}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--admin-text-muted)]">Crecimiento mensual</span>
                <span className="text-sm font-medium text-[var(--status-success)]">
                  +{stats.crecimientoMensual}%
                </span>
              </div>
            </div>
          </div>

          {/* Notes Button */}
          <button
            onClick={() => setShowNotesModal(true)}
            className="w-full p-4 rounded-xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)] hover:border-[var(--admin-border-accent)] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--status-info-muted)] flex items-center justify-center">
                <Activity className="w-5 h-5 text-[var(--status-info)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--admin-text)]">Notas del día</p>
                <p className="text-xs text-[var(--admin-text-muted)]">
                  {notes ? 'Editar notas' : 'Agregar notas'}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Notes Modal */}
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
