'use client';

import { useEffect, useState } from 'react';
import { useStats, useStatsLoading, useFetchStats } from '@/features/admin/stats';
import { useAuthStore } from '@/store/auth.store';
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
} from 'lucide-react';
import Link from 'next/link';
import { useCasaDistribution } from '@/hooks/useCasaDistribution';
import { CASAS_CONFIG, CASA_NAMES, getCasaPercentage } from '@/lib/constants/casas-2026';

/**
 * Admin Dashboard v2.0 - Modelo 2026
 * Con métricas de Casas: Quantum, Vertex, Pulsar
 */

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
    <div className="admin-stat-card group">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-lg ${bgColors[status]} flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${statusColors[status]}`} />
        </div>
        {change !== undefined && change !== null && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${change >= 0 ? 'text-[var(--status-success)]' : 'text-[var(--status-danger)]'}`}
          >
            {change >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
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
      className="group flex items-center gap-4 p-4 rounded-lg bg-[var(--admin-surface-1)] border border-[var(--admin-border)] hover:border-[var(--admin-border-accent)] hover:bg-[var(--admin-surface-2)] transition-all duration-200"
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
  const Icon = icons[type];

  const content = (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--admin-surface-1)] border border-[var(--admin-border)] hover:border-[var(--admin-border-accent)] transition-colors">
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

export default function AdminDashboard() {
  const stats = useStats();
  const isLoading = useStatsLoading();
  const fetchStats = useFetchStats();
  const { user } = useAuthStore();
  const [greeting, setGreeting] = useState('Bienvenido');
  const [currentDate, setCurrentDate] = useState('');
  const { distribution: casaDistribution } = useCasaDistribution();

  useEffect(() => {
    fetchStats();

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 20) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');

    setCurrentDate(
      new Date().toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    );
  }, [fetchStats]);

  const formatCurrency = (num: number): string => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toLocaleString('es-AR')}`;
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

  const totalEstudiantes = stats?.totalEstudiantes || 0;
  const ingresosTotal = stats?.ingresosTotal || 0;
  const pagosPendientes = stats?.pagosPendientes || 0;
  const inscripcionesActivas = stats?.inscripcionesActivas || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--admin-text)]">
            {greeting}, {user?.nombre || 'Admin'}
          </h1>
          <p className="text-sm text-[var(--admin-text-muted)] mt-1 capitalize">{currentDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--status-success-muted)] text-[var(--status-success)]">
            <div className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse" />
            <span className="text-xs font-medium">Sistema operativo</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard
          label="Total Estudiantes"
          value={totalEstudiantes.toLocaleString('es-AR')}
          change={null}
          changeLabel="vs mes anterior"
          icon={Users}
          status="info"
        />
        <StatCard
          label="Inscripciones Activas"
          value={inscripcionesActivas.toLocaleString('es-AR')}
          change={null}
          changeLabel="este mes"
          icon={GraduationCap}
          status="success"
        />
        <StatCard
          label="Pagos Pendientes"
          value={formatCurrency(pagosPendientes)}
          change={null}
          icon={Clock}
          status="warning"
        />
        <StatCard
          label="Ingresos del Mes"
          value={formatCurrency(ingresosTotal)}
          change={null}
          changeLabel="vs mes anterior"
          icon={DollarSign}
          status="success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
              Acciones rápidas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <QuickAction
                href="/admin/inscripciones-2026"
                label="Gestionar Inscripciones"
                description="Colonia 2026"
                icon={GraduationCap}
              />
              <QuickAction
                href="/admin/pagos"
                label="Registrar Pago"
                description="Pagos manuales"
                icon={CreditCard}
              />
              <QuickAction
                href="/admin/estudiantes"
                label="Ver Estudiantes"
                description="Lista completa"
                icon={Users}
              />
              <QuickAction
                href="/admin/reportes"
                label="Generar Reporte"
                description="Exportar datos"
                icon={TrendingUp}
              />
            </div>
          </div>

          {/* Distribución por Casas 2026 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--admin-text)]">
                Distribución por Casa
              </h2>
              <Link
                href="/admin/estudiantes"
                className="text-xs text-[var(--admin-accent)] hover:underline"
              >
                Ver todos
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CASA_NAMES.map((casa) => {
                const config = CASAS_CONFIG[casa];
                const count = casaDistribution[casa];
                const percentage = getCasaPercentage(casaDistribution, casa);
                const Icon = config.icon;

                return (
                  <div
                    key={casa}
                    className="p-4 rounded-xl border transition-all hover:scale-[1.02]"
                    style={{
                      backgroundColor: `${config.color}08`,
                      borderColor: `${config.color}25`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${config.color}20` }}
                      >
                        <Icon className="w-4.5 h-4.5" style={{ color: config.color }} />
                      </div>
                      <span className="text-xl font-bold" style={{ color: config.color }}>
                        {count}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">{config.emoji}</span>
                        <h3 className="font-semibold text-[var(--admin-text)] text-sm">
                          Casa {casa}
                        </h3>
                      </div>
                      <p className="text-xs text-[var(--admin-text-muted)]">{config.descripcion}</p>
                      <div className="mt-2 h-1.5 rounded-full bg-[var(--admin-surface-2)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: config.color,
                          }}
                        />
                      </div>
                      <p className="text-xs text-[var(--admin-text-disabled)] mt-1">
                        {percentage}% del total
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Colonia 2026 Highlight */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-[var(--admin-accent-muted)] to-[var(--status-info-muted)] border border-[var(--admin-border-accent)]">
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
                  pagos desde el panel dedicado.
                </p>
                <Link
                  href="/admin/inscripciones-2026"
                  className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-[var(--admin-accent)] hover:underline"
                >
                  Ir a Inscripciones 2026
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Alerts & Activity */}
        <div className="space-y-6">
          {/* System Alerts */}
          <div>
            <h2 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
              Alertas del sistema
            </h2>
            <div className="space-y-3">
              {pagosPendientes > 0 && (
                <AlertItem
                  type="warning"
                  title={`${formatCurrency(pagosPendientes)} en pagos pendientes`}
                  description="Revisar inscripciones sin confirmar pago"
                  action="Ver pagos"
                  href="/admin/pagos"
                />
              )}
              <AlertItem
                type="info"
                title="Colonia 2026 activa"
                description="Las inscripciones están abiertas"
                action="Gestionar"
                href="/admin/inscripciones-2026"
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
                <span className="text-sm text-[var(--admin-text-muted)]">Estudiantes totales</span>
                <span className="text-sm font-medium text-[var(--admin-text)]">
                  {totalEstudiantes}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--admin-text-muted)]">
                  Inscripciones activas
                </span>
                <span className="text-sm font-medium text-[var(--admin-text)]">
                  {inscripcionesActivas}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--admin-text-muted)]">Tasa de conversión</span>
                <span className="text-sm font-medium text-[var(--status-success)]">
                  {totalEstudiantes > 0
                    ? Math.round((inscripcionesActivas / totalEstudiantes) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
