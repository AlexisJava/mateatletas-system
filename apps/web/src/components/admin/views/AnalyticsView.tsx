'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Home,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  Activity,
  Target,
  UserPlus,
  UserMinus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import {
  MOCK_CASA_DISTRIBUTION,
  MOCK_TIER_DISTRIBUTION,
  MOCK_RETENTION_DATA,
  MOCK_DASHBOARD_STATS,
} from '@/lib/constants/admin-mock-data';

/**
 * AnalyticsView - Vista de analytics del admin
 *
 * Adaptado del mockup AI Studio con CSS variables.
 * Incluye: Casas, Biblioteca, Retencion
 */

// =============================================================================
// LIBRARY MOCK DATA
// =============================================================================

const LIBRARY_DATA = [
  { month: 'Jul', lecturas: 1250, completados: 890, promedio: 4.2 },
  { month: 'Ago', lecturas: 1480, completados: 1050, promedio: 4.5 },
  { month: 'Sep', lecturas: 1320, completados: 920, promedio: 4.1 },
  { month: 'Oct', lecturas: 1680, completados: 1280, promedio: 4.8 },
  { month: 'Nov', lecturas: 1820, completados: 1420, promedio: 4.6 },
  { month: 'Dic', lecturas: 2100, completados: 1680, promedio: 4.9 },
];

const TOP_BOOKS = [
  { title: 'Matematica Divertida Vol. 1', reads: 342, rating: 4.8 },
  { title: 'Programacion para Ninos', reads: 298, rating: 4.7 },
  { title: 'Ciencia en Casa', reads: 256, rating: 4.5 },
  { title: 'Logica y Puzzles', reads: 234, rating: 4.6 },
  { title: 'Aventuras STEAM', reads: 189, rating: 4.4 },
];

// =============================================================================
// STAT CARD COMPONENT
// =============================================================================

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon: typeof Users;
  color: string;
}

function StatCard({ label, value, change, icon: Icon, color }: StatCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)] hover:border-[var(--admin-border-accent)] transition-all">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center`}
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              change >= 0
                ? 'text-[var(--status-success)] bg-[var(--status-success-muted)]'
                : 'text-[var(--status-danger)] bg-[var(--status-danger-muted)]'
            }`}
          >
            {change >= 0 ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {change >= 0 ? '+' : ''}
            {change}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-[var(--admin-text)]">{value}</p>
      <p className="text-sm text-[var(--admin-text-muted)] mt-1">{label}</p>
    </div>
  );
}

// =============================================================================
// SECTION HEADER COMPONENT
// =============================================================================

interface SectionHeaderProps {
  icon: typeof Users;
  title: string;
  iconColor: string;
}

function SectionHeader({ icon: Icon, title, iconColor }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${iconColor}20` }}
      >
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>
      <h2 className="text-xl font-bold text-[var(--admin-text)]">{title}</h2>
    </div>
  );
}

// =============================================================================
// MAIN ANALYTICS VIEW
// =============================================================================

export function AnalyticsView() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'casas' | 'biblioteca' | 'retencion'>('casas');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (isMounted) {
        setIsLoading(false);
      }
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
        <StatCard
          label="Estudiantes Activos"
          value={stats.estudiantesActivos}
          change={stats.crecimientoMensual}
          icon={Users}
          color="#6366f1"
        />
        <StatCard
          label="Tasa de Retencion"
          value="94.2%"
          change={2.1}
          icon={Target}
          color="#22c55e"
        />
        <StatCard
          label="Libros Leidos"
          value="2,100"
          change={15.3}
          icon={BookOpen}
          color="#f59e0b"
        />
        <StatCard
          label="Crecimiento Mensual"
          value={`${stats.crecimientoMensual}%`}
          change={3.2}
          icon={TrendingUp}
          color="#06b6d4"
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-[var(--admin-surface-1)] rounded-xl border border-[var(--admin-border)] w-fit">
        {[
          { id: 'casas', label: 'Casas', icon: Home },
          { id: 'biblioteca', label: 'Biblioteca', icon: BookOpen },
          { id: 'retencion', label: 'Retencion', icon: Activity },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--admin-accent)] text-black'
                : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-2)]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* CASAS TAB */}
      {activeTab === 'casas' && (
        <div className="space-y-6">
          <SectionHeader icon={Home} title="Distribucion por Casa" iconColor="#6366f1" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
              <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
                Distribucion General
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={MOCK_CASA_DISTRIBUTION}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {MOCK_CASA_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend
                      formatter={(value) => (
                        <span className="text-[var(--admin-text-muted)] text-sm">{value}</span>
                      )}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--admin-surface-2)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Casa Cards */}
            <div className="space-y-4">
              {MOCK_CASA_DISTRIBUTION.map((casa, index) => {
                const total = MOCK_CASA_DISTRIBUTION.reduce((acc, c) => acc + c.value, 0);
                const percentage = ((casa.value / total) * 100).toFixed(1);

                return (
                  <div
                    key={casa.name}
                    className="p-4 rounded-xl border transition-all hover:scale-[1.02]"
                    style={{
                      backgroundColor: `${casa.color}08`,
                      borderColor: `${casa.color}30`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${casa.color}20` }}
                        >
                          <Home className="w-5 h-5" style={{ color: casa.color }} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-[var(--admin-text)]">{casa.name}</h4>
                          <p className="text-xs text-[var(--admin-text-muted)]">
                            {percentage}% del total
                          </p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold" style={{ color: casa.color }}>
                        {casa.value}
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--admin-surface-2)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: casa.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* BIBLIOTECA TAB */}
      {activeTab === 'biblioteca' && (
        <div className="space-y-6">
          <SectionHeader icon={BookOpen} title="Analytics de Biblioteca" iconColor="#f59e0b" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reading Trends */}
            <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
              <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
                Tendencias de Lectura
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={LIBRARY_DATA}>
                    <defs>
                      <linearGradient id="colorLecturas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                    <XAxis dataKey="month" stroke="var(--admin-text-muted)" fontSize={12} />
                    <YAxis stroke="var(--admin-text-muted)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--admin-surface-2)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="lecturas"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fill="url(#colorLecturas)"
                    />
                    <Area
                      type="monotone"
                      dataKey="completados"
                      stroke="#22c55e"
                      strokeWidth={2}
                      fill="transparent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Books */}
            <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
              <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
                Libros Mas Leidos
              </h3>
              <div className="space-y-3">
                {TOP_BOOKS.map((book, index) => (
                  <div
                    key={book.title}
                    className="flex items-center gap-3 p-3 bg-[var(--admin-surface-2)] rounded-lg"
                  >
                    <span className="w-6 h-6 rounded-full bg-[var(--status-warning-muted)] text-[var(--status-warning)] flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--admin-text)] truncate">{book.title}</p>
                      <p className="text-xs text-[var(--admin-text-muted)]">
                        {book.reads} lecturas
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[var(--status-warning)]">
                      <span className="text-sm font-semibold">{book.rating}</span>
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tier Distribution */}
          <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
            <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
              Distribucion por Tier
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_TIER_DISTRIBUTION} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                  <XAxis type="number" stroke="var(--admin-text-muted)" fontSize={12} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="var(--admin-text-muted)"
                    fontSize={12}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--admin-surface-2)',
                      border: '1px solid var(--admin-border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {MOCK_TIER_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* RETENCION TAB */}
      {activeTab === 'retencion' && (
        <div className="space-y-6">
          <SectionHeader icon={Activity} title="Metricas de Retencion" iconColor="#22c55e" />

          {/* Retention Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--status-success-muted)] flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-[var(--status-success)]" />
                </div>
                <span className="text-sm text-[var(--admin-text-muted)]">Nuevos este mes</span>
              </div>
              <p className="text-3xl font-bold text-[var(--status-success)]">+55</p>
            </div>
            <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--status-info-muted)] flex items-center justify-center">
                  <Users className="w-5 h-5 text-[var(--status-info)]" />
                </div>
                <span className="text-sm text-[var(--admin-text-muted)]">Activos totales</span>
              </div>
              <p className="text-3xl font-bold text-[var(--status-info)]">381</p>
            </div>
            <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--status-danger-muted)] flex items-center justify-center">
                  <UserMinus className="w-5 h-5 text-[var(--status-danger)]" />
                </div>
                <span className="text-sm text-[var(--admin-text-muted)]">Bajas este mes</span>
              </div>
              <p className="text-3xl font-bold text-[var(--status-danger)]">-9</p>
            </div>
          </div>

          {/* Retention Chart */}
          <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
            <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
              Evolucion de Estudiantes
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_RETENTION_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                  <XAxis dataKey="month" stroke="var(--admin-text-muted)" fontSize={12} />
                  <YAxis stroke="var(--admin-text-muted)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--admin-surface-2)',
                      border: '1px solid var(--admin-border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="activos"
                    stroke="var(--status-info)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--status-info)', strokeWidth: 0 }}
                    name="Activos"
                  />
                  <Line
                    type="monotone"
                    dataKey="nuevos"
                    stroke="var(--status-success)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--status-success)', strokeWidth: 0 }}
                    name="Nuevos"
                  />
                  <Line
                    type="monotone"
                    dataKey="bajas"
                    stroke="var(--status-danger)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--status-danger)', strokeWidth: 0 }}
                    name="Bajas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Retention Rate */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
              <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
                Tasa de Retencion Mensual
              </h3>
              <div className="flex items-center justify-center py-8">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="var(--admin-surface-2)"
                      strokeWidth="12"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="var(--status-success)"
                      strokeWidth="12"
                      strokeDasharray={`${94.2 * 4.4} ${100 * 4.4}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-[var(--status-success)]">94.2%</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-[var(--admin-text-muted)]">
                Objetivo: 95% | Actual: 94.2%
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
              <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4">
                Acciones Recomendadas
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-[var(--status-warning-muted)] rounded-lg border-l-4 border-[var(--status-warning)]">
                  <p className="text-sm font-medium text-[var(--admin-text)]">
                    Contactar estudiantes inactivos
                  </p>
                  <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                    12 estudiantes sin actividad hace 2+ semanas
                  </p>
                </div>
                <div className="p-3 bg-[var(--status-info-muted)] rounded-lg border-l-4 border-[var(--status-info)]">
                  <p className="text-sm font-medium text-[var(--admin-text)]">
                    Enviar encuesta de satisfaccion
                  </p>
                  <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                    Programada para fin de mes
                  </p>
                </div>
                <div className="p-3 bg-[var(--status-success-muted)] rounded-lg border-l-4 border-[var(--status-success)]">
                  <p className="text-sm font-medium text-[var(--admin-text)]">
                    Celebrar aniversarios
                  </p>
                  <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                    8 estudiantes cumplen 1 ano este mes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
