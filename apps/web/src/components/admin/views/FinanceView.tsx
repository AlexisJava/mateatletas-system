'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Clock,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Download,
  Bell,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  Loader2,
  Info,
  Gamepad2,
  Sparkles,
  Crown,
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
} from 'recharts';
import {
  MOCK_TRANSACTIONS,
  MOCK_REVENUE_DATA,
  formatCurrency,
  formatCompactCurrency,
  getTransactionStatusColor,
  formatRelativeTime,
} from '@/lib/constants/admin-mock-data';

/**
 * FinanceView - Vista de finanzas del admin
 *
 * Adaptado del mockup AI Studio con CSS variables.
 * Usa Recharts para gráficos unificados.
 */

// =============================================================================
// MOCK CONFIG DATA
// =============================================================================

const MOCK_CONFIG = {
  precioSteamLibros: 40000,
  precioSteamAsincronico: 65000,
  precioSteamSincronico: 95000,
  descuentoSegundoHermano: 10,
  diaVencimiento: 15,
  diasAntesRecordatorio: 5,
  notificacionesActivas: true,
};

// =============================================================================
// STAT CARD COMPONENT
// =============================================================================

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: typeof DollarSign;
  gradient: string;
  bgGradient: string;
}

function StatCard({
  label,
  value,
  change,
  trend,
  icon: Icon,
  gradient,
  bgGradient,
}: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)] hover:border-[var(--admin-border-accent)] transition-all duration-300 hover:shadow-lg">
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-30`} />
      <div className="relative p-5">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold ${
              trend === 'up'
                ? 'bg-[var(--status-success-muted)] text-[var(--status-success)]'
                : 'bg-[var(--status-danger-muted)] text-[var(--status-danger)]'
            }`}
          >
            {trend === 'up' ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {change}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[var(--admin-text-muted)] text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-[var(--admin-text)]">{value}</p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// CONFIG MODAL
// =============================================================================

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: typeof MOCK_CONFIG;
  onSave: (config: typeof MOCK_CONFIG) => void;
}

function ConfigModal({ isOpen, onClose, config, onSave }: ConfigModalProps) {
  const [formData, setFormData] = useState(config);
  const [saving, setSaving] = useState(false);
  const [motivoCambio, setMotivoCambio] = useState('');

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    onSave(formData);
    setSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--admin-surface-1)] border border-[var(--admin-border)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-gradient-to-r from-[var(--status-info)] to-[var(--admin-accent-secondary)] p-5 flex items-center justify-between border-b border-[var(--admin-border)]">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Configuracion Tiers STEAM 2026</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info Box */}
          <div className="p-4 bg-[var(--status-info-muted)] border border-[var(--status-info)]/30 rounded-xl">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[var(--status-info)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[var(--status-info)] mb-1">
                  Sistema de Tiers STEAM 2026
                </p>
                <p className="text-xs text-[var(--admin-text-muted)]">
                  STEAM Libros: Plataforma completa (Mate + Progra + Ciencias). STEAM Asincronico:
                  Todo + clases grabadas. STEAM Sincronico: Todo + clases en vivo. Descuento
                  familiar: 10% para 2do hermano en adelante.
                </p>
              </div>
            </div>
          </div>

          {/* Precios por Tier */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[var(--admin-text-muted)]">
              Precios por Tier STEAM
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-[var(--admin-text-muted)] mb-1 flex items-center gap-1">
                  <Gamepad2 className="w-3 h-3" /> STEAM Libros
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]">
                    $
                  </span>
                  <input
                    type="number"
                    value={formData.precioSteamLibros}
                    onChange={(e) =>
                      setFormData({ ...formData, precioSteamLibros: parseInt(e.target.value) || 0 })
                    }
                    className="w-full pl-8 pr-4 py-3 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:border-[var(--status-info)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--admin-text-muted)] mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> STEAM Asincronico
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]">
                    $
                  </span>
                  <input
                    type="number"
                    value={formData.precioSteamAsincronico}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        precioSteamAsincronico: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-8 pr-4 py-3 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-accent-secondary)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--admin-text-muted)] mb-1 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> STEAM Sincronico
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]">
                    $
                  </span>
                  <input
                    type="number"
                    value={formData.precioSteamSincronico}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        precioSteamSincronico: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-8 pr-4 py-3 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:border-[var(--status-warning)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Descuento Familiar */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[var(--admin-text-muted)] flex items-center gap-2">
              <UserMinus className="w-4 h-4" />
              Descuento Familiar
            </h4>
            <div>
              <label className="block text-xs text-[var(--admin-text-muted)] mb-1">
                2do hermano en adelante (%)
              </label>
              <input
                type="number"
                value={formData.descuentoSegundoHermano}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    descuentoSegundoHermano: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-3 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] focus:outline-none focus:border-[var(--status-success)]"
                min="0"
                max="100"
              />
            </div>
          </div>

          {/* Motivo del Cambio */}
          <div>
            <label className="block text-sm font-semibold text-[var(--admin-text-muted)] mb-2">
              Motivo del Cambio (Opcional)
            </label>
            <textarea
              value={motivoCambio}
              onChange={(e) => setMotivoCambio(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] placeholder:text-[var(--admin-text-disabled)] focus:outline-none focus:border-[var(--admin-accent)] resize-none"
              placeholder="Ej: Ajuste de precios para ciclo 2026"
              rows={2}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-[var(--admin-border)]">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-[var(--admin-surface-2)] text-[var(--admin-text)] rounded-xl font-semibold border border-[var(--admin-border)] hover:bg-[var(--admin-surface-1)] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-[var(--status-success)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN FINANCE VIEW
// =============================================================================

export function FinanceView() {
  const [isLoading, setIsLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [config, setConfig] = useState(MOCK_CONFIG);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
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
          <p className="text-sm text-[var(--admin-text-muted)]">Cargando metricas...</p>
        </div>
      </div>
    );
  }

  const mainStats: StatCardProps[] = [
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

  const paymentStatusData = [
    { name: 'Pagados', value: 65, color: 'var(--status-success)' },
    { name: 'Pendientes', value: 25, color: 'var(--status-warning)' },
    { name: 'Vencidos', value: 10, color: 'var(--status-danger)' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Evolution */}
        <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
          <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--status-success)]" />
            Evolucion Mensual
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_REVENUE_DATA}>
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
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === 'ingresos' ? 'Ingresos' : 'Pendientes',
                  ]}
                />
                <Bar dataKey="ingresos" fill="var(--status-success)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pendientes" fill="var(--status-warning)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Status Distribution */}
        <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
          <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[var(--admin-accent-secondary)]" />
            Estados de Pago
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  strokeWidth={0}
                  label
                  labelLine={false}
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => (
                    <span className="text-[var(--admin-text-muted)] text-sm">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Config & Transactions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Configuration */}
        <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-[var(--admin-text)] flex items-center gap-2">
              <Settings className="w-5 h-5 text-[var(--status-info)]" />
              Tiers STEAM 2026
            </h3>
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-4 py-2 bg-[var(--status-info)] text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Editar
            </button>
          </div>
          <div className="space-y-3">
            {/* STEAM Libros */}
            <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-[var(--admin-text)]">STEAM Libros</span>
                    <p className="text-xs text-[var(--admin-text-muted)]">Plataforma completa</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-cyan-400">
                    {formatCurrency(config.precioSteamLibros)}
                  </span>
                  <span className="text-[var(--admin-text-muted)] text-sm">/mes</span>
                </div>
              </div>
            </div>

            {/* STEAM Asincronico */}
            <div className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-[var(--admin-text)]">
                      STEAM Asincronico
                    </span>
                    <p className="text-xs text-[var(--admin-text-muted)]">Todo + clases grabadas</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-violet-400">
                    {formatCurrency(config.precioSteamAsincronico)}
                  </span>
                  <span className="text-[var(--admin-text-muted)] text-sm">/mes</span>
                </div>
              </div>
            </div>

            {/* STEAM Sincronico */}
            <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-[var(--admin-text)]">STEAM Sincronico</span>
                    <p className="text-xs text-[var(--admin-text-muted)]">Todo + clases en vivo</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-amber-400">
                    {formatCurrency(config.precioSteamSincronico)}
                  </span>
                  <span className="text-[var(--admin-text-muted)] text-sm">/mes</span>
                </div>
              </div>
            </div>

            {/* Descuento Familiar */}
            <div className="pt-3 border-t border-[var(--admin-border)]">
              <div className="flex items-center justify-between p-3 bg-[var(--admin-surface-2)] rounded-lg">
                <div className="flex items-center gap-2">
                  <UserMinus className="w-4 h-4 text-[var(--admin-text-muted)]" />
                  <span className="text-sm text-[var(--admin-text-muted)]">
                    2do hermano en adelante
                  </span>
                </div>
                <span className="font-bold text-[var(--status-success)]">
                  {config.descuentoSegundoHermano}% OFF
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
          <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--status-warning)]" />
            Transacciones Recientes
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
            {MOCK_TRANSACTIONS.map((tx) => (
              <div
                key={tx.id}
                className="p-3 bg-[var(--admin-surface-2)] rounded-lg hover:bg-[var(--admin-surface-1)] border border-transparent hover:border-[var(--admin-border)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[var(--admin-text)]">{tx.studentName}</p>
                    <p className="text-xs text-[var(--admin-text-muted)]">{tx.tier}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[var(--admin-text)]">
                      {formatCurrency(tx.amount)}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getTransactionStatusColor(tx.status)}`}
                    >
                      {tx.status === 'completed'
                        ? 'Pagado'
                        : tx.status === 'pending'
                          ? 'Pendiente'
                          : 'Fallido'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[var(--admin-text-disabled)] mt-2">
                  {formatRelativeTime(tx.date)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reports & Notifications Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports */}
        <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
          <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-[var(--status-success)]" />
            Reportes y Exportacion
          </h3>
          <div className="space-y-3">
            <button className="w-full p-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-xl text-white font-semibold transition-all flex items-center justify-between group">
              <span>Exportar Inscripciones (CSV)</span>
              <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
            </button>
            <button className="w-full p-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl text-white font-semibold transition-all flex items-center justify-between group">
              <span>Exportar Metricas (Excel)</span>
              <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-5 rounded-2xl bg-[var(--admin-surface-1)] border border-[var(--admin-border)]">
          <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[var(--status-warning)]" />
            Notificaciones
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-[var(--status-warning-muted)] border-l-4 border-[var(--status-warning)] rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--status-warning)] mt-0.5" />
                <div>
                  <p className="font-semibold text-[var(--admin-text)] text-sm">Pagos por vencer</p>
                  <p className="text-sm text-[var(--admin-text-muted)]">
                    12 inscripciones pendientes
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-[var(--status-success-muted)] border-l-4 border-[var(--status-success)] rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[var(--status-success)] mt-0.5" />
                <div>
                  <p className="font-semibold text-[var(--admin-text)] text-sm">Sistema activo</p>
                  <p className="text-sm text-[var(--admin-text-muted)]">
                    Servicios funcionando correctamente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Config Modal */}
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
