'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Calendar,
  FileText,
  Settings,
  Award,
  Clock,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Loader2,
  X,
  Save,
  Info,
  Gamepad2,
  Sparkles,
  Crown,
  UserMinus,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import type { ChartOptions, TooltipItem } from 'chart.js';
import {
  getMetricasDashboard,
  getConfiguracionPrecios,
  getHistorialCambios,
  getInscripcionesPendientes,
  getEstudiantesConDescuentos,
  updateConfiguracionPrecios,
} from '@/lib/api/pagos.api';
import type {
  MetricasDashboardResponse,
  ConfiguracionPrecios,
  HistorialCambioPrecios,
  InscripcionMensualConRelaciones,
  EstudianteConDescuento,
} from '@/types/pago.types';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

/**
 * 💰 MATEATLETAS OS - Dashboard de Pagos
 *
 * Sistema de Gestión Financiera del Club
 * Sistema de Tiers 2026:
 * - Arcade: $30.000/mes - 1 mundo async
 * - Arcade+: $60.000/mes - 3 mundos async
 * - Pro: $75.000/mes - 1 mundo async + 1 mundo sync con docente
 *
 * Descuentos familiares:
 * - 2do hermano: 12%
 * - 3er hermano en adelante: 20%
 */
export default function PagosDashboard() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [metricsData, setMetricsData] = useState<MetricasDashboardResponse | null>(null);
  const [configuracion, setConfiguracion] = useState<ConfiguracionPrecios | null>(null);
  const [historialCambios, setHistorialCambios] = useState<HistorialCambioPrecios[]>([]);
  const [inscripcionesPendientes, setInscripcionesPendientes] = useState<
    InscripcionMensualConRelaciones[]
  >([]);
  const [estudiantesDescuentos, setEstudiantesDescuentos] = useState<EstudianteConDescuento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    precioArcade: '',
    precioArcadePlus: '',
    precioPro: '',
    descuentoHermano2: '',
    descuentoHermano3Mas: '',
    diaVencimiento: '',
    diasAntesRecordatorio: '',
    notificacionesActivas: true,
    motivoCambio: '',
  });

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch todos los datos del dashboard
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const now = new Date();
        const mesActual = now.getMonth() + 1;
        const anioActual = now.getFullYear();

        const [metricas, config, historial, pendientes, descuentos] = await Promise.all([
          getMetricasDashboard({ anio: anioActual, mes: mesActual }),
          getConfiguracionPrecios(),
          getHistorialCambios(),
          getInscripcionesPendientes(),
          getEstudiantesConDescuentos(),
        ]);

        setMetricsData(metricas);
        setConfiguracion(config);
        setHistorialCambios(historial);
        setInscripcionesPendientes(pendientes);
        setEstudiantesDescuentos(descuentos);
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        setError('No se pudieron cargar los datos. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchAllData();
    }
  }, [mounted]);

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (showConfigModal && configuracion) {
      setFormData({
        precioArcade: String(configuracion.precioArcade || ''),
        precioArcadePlus: String(configuracion.precioArcadePlus || ''),
        precioPro: String(configuracion.precioPro || ''),
        descuentoHermano2: String(configuracion.descuentoHermano2 || ''),
        descuentoHermano3Mas: String(configuracion.descuentoHermano3Mas || ''),
        diaVencimiento: String(configuracion.diaVencimiento || '15'),
        diasAntesRecordatorio: String(configuracion.diasAntesRecordatorio || '5'),
        notificacionesActivas: configuracion.notificacionesActivas,
        motivoCambio: '',
      });
    }
  }, [showConfigModal, configuracion]);

  // Handler para guardar configuración
  const handleSaveConfig = async () => {
    if (!configuracion) return;

    try {
      setSaving(true);

      const parsePrice = (value: string): number => {
        const parsed = parseFloat(value || '0');
        return isNaN(parsed) ? 0 : Math.round(parsed);
      };

      const parsePercentage = (value: string): number => {
        const parsed = parseFloat(value || '0');
        return isNaN(parsed) ? 0 : parsed;
      };

      const updateData = {
        adminId: user?.id || '',
        precioArcade: parsePrice(formData.precioArcade),
        precioArcadePlus: parsePrice(formData.precioArcadePlus),
        precioPro: parsePrice(formData.precioPro),
        descuentoHermano2: parsePercentage(formData.descuentoHermano2),
        descuentoHermano3Mas: parsePercentage(formData.descuentoHermano3Mas),
        diaVencimiento: parseInt(formData.diaVencimiento || '15'),
        diasAntesRecordatorio: parseInt(formData.diasAntesRecordatorio || '5'),
        notificacionesActivas: formData.notificacionesActivas,
        motivoCambio: formData.motivoCambio || undefined,
      };

      const updatedConfig = await updateConfiguracionPrecios(updateData);
      setConfiguracion(updatedConfig);

      const nuevoHistorial = await getHistorialCambios();
      setHistorialCambios(nuevoHistorial);

      setShowConfigModal(false);
    } catch (err) {
      console.error('Error al actualizar configuración:', err);
      alert('Error al actualizar la configuración. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) {
    return null;
  }

  // Formatear moneda argentina
  const formatCurrency = (amount: string | number): string => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  };

  // Formatear porcentaje con signo
  const formatPercentage = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(1)}%`;
  };

  // ============================================================================
  // ESTADOS DE CARGA Y ERROR
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--admin-text-muted)]">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  if (error || !metricsData || !metricsData.metricas) {
    return (
      <div className="p-6 rounded-lg bg-[var(--status-danger-muted)] border border-[var(--status-danger)]/30 text-center">
        <AlertCircle className="w-10 h-10 text-[var(--status-danger)] mx-auto mb-3" />
        <p className="text-[var(--admin-text)] mb-4">
          {error || 'No se pudieron cargar los datos'}
        </p>
        <button onClick={() => window.location.reload()} className="admin-btn admin-btn-primary">
          Reintentar
        </button>
      </div>
    );
  }

  // ============================================================================
  // PREPARAR DATOS DE LAS MÉTRICAS
  // ============================================================================

  const { metricas, evolucionMensual, distribucionEstados } = metricsData;

  // Datos para las cards principales
  const mainStats = [
    {
      label: 'Ingresos del Mes',
      value: formatCurrency(metricas.ingresosMesActual),
      change: formatPercentage(metricas.comparacionMesAnterior.ingresosCambio),
      trend: parseFloat(metricas.comparacionMesAnterior.ingresosCambio) >= 0 ? 'up' : 'down',
      icon: DollarSign,
      gradient: 'from-emerald-500 to-green-500',
      bgGradient: 'from-emerald-500/10 to-green-500/10',
    },
    {
      label: 'Pagos Pendientes',
      value: formatCurrency(metricas.pagosPendientes),
      change: formatPercentage(metricas.comparacionMesAnterior.pendientesCambio),
      trend: parseFloat(metricas.comparacionMesAnterior.pendientesCambio) >= 0 ? 'up' : 'down',
      icon: Clock,
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-500/10 to-orange-500/10',
    },
    {
      label: 'Inscripciones Activas',
      value: metricas.inscripcionesActivas.toString(),
      change:
        metricas.comparacionMesAnterior.inscripcionesCambio >= 0
          ? `+${metricas.comparacionMesAnterior.inscripcionesCambio}`
          : metricas.comparacionMesAnterior.inscripcionesCambio.toString(),
      trend: metricas.comparacionMesAnterior.inscripcionesCambio >= 0 ? 'up' : 'down',
      icon: Users,
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-500/10 to-purple-500/10',
    },
    {
      label: 'Tasa de Cobro',
      value: `${parseFloat(metricas.tasaCobroActual).toFixed(1)}%`,
      change: formatPercentage(metricas.comparacionMesAnterior.tasaCobroCambio),
      trend: parseFloat(metricas.comparacionMesAnterior.tasaCobroCambio) >= 0 ? 'up' : 'down',
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
    },
  ];

  // Datos para gráfico de evolución mensual (Bar chart)
  const evolucionChartData = {
    labels: evolucionMensual.map((item) => {
      const [year, month] = item.periodo.split('-');
      return `${month}/${year?.slice(2) || ''}`;
    }),
    datasets: [
      {
        label: 'Ingresos',
        data: evolucionMensual.map((item) => parseFloat(item.ingresos)),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      },
      {
        label: 'Pendientes',
        data: evolucionMensual.map((item) => parseFloat(item.pendientes)),
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
        borderColor: 'rgba(251, 191, 36, 1)',
        borderWidth: 2,
      },
    ],
  };

  // Datos para gráfico de distribución (Doughnut chart)
  const distribucionChartData = {
    labels: distribucionEstados.map((item) => item.estado),
    datasets: [
      {
        data: distribucionEstados.map((item) => parseFloat(item.porcentaje)),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: ['rgba(16, 185, 129, 1)', 'rgba(251, 191, 36, 1)', 'rgba(239, 68, 68, 1)'],
        borderWidth: 2,
      },
    ],
  };

  // Opciones para el gráfico de barras
  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: { size: 12 },
        },
      },
      title: { display: false },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          callback: function (value: string | number) {
            return formatCurrency(typeof value === 'string' ? parseFloat(value) : value);
          },
        },
      },
    },
  };

  // Opciones para el gráfico doughnut
  const doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: { size: 12 },
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'doughnut'>) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value.toFixed(1)}%`;
          },
        },
      },
    },
  };

  // ============================================================================
  // RENDER DEL DASHBOARD
  // ============================================================================

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--admin-text)]">Sistema de Pagos</h1>
          <p className="text-sm text-[var(--admin-text-muted)] mt-1">
            Panel de Gestión Financiera - Tiers 2026
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-mono text-[var(--admin-text)]">
            {currentTime.toLocaleTimeString('es-AR')}
          </div>
          <div className="text-xs text-[var(--admin-text-muted)] capitalize">
            {currentTime.toLocaleDateString('es-AR', {
              weekday: 'long',
              day: 'numeric',
              month: 'short',
            })}
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mainStats.map((stat, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`} />
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                    stat.trend === 'up'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Evolución Mensual
          </h3>
          <div className="h-80">
            <Bar data={evolucionChartData} options={barChartOptions} />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-violet-400" />
            Estados de Pago
          </h3>
          <div className="h-80">
            <Doughnut data={distribucionChartData} options={doughnutChartOptions} />
          </div>
        </div>
      </div>

      {/* Configuración de Precios - TIERS 2026 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              Tiers 2026
            </h3>
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-semibold"
            >
              Editar
            </button>
          </div>
          {configuracion && (
            <div className="space-y-4">
              {/* Tier Arcade */}
              <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-white font-bold text-lg">Arcade</span>
                    <p className="text-gray-400 text-xs">1 mundo async</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-cyan-400">
                    {formatCurrency(configuracion.precioArcade)}
                  </span>
                  <span className="text-gray-400 text-sm">/mes</span>
                </div>
              </div>

              {/* Tier Arcade+ */}
              <div className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-white font-bold text-lg">Arcade+</span>
                    <p className="text-gray-400 text-xs">3 mundos async</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-violet-400">
                    {formatCurrency(configuracion.precioArcadePlus)}
                  </span>
                  <span className="text-gray-400 text-sm">/mes</span>
                </div>
              </div>

              {/* Tier Pro */}
              <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-white font-bold text-lg">Pro</span>
                    <p className="text-gray-400 text-xs">1 async + 1 sync con docente</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-amber-400">
                    {formatCurrency(configuracion.precioPro)}
                  </span>
                  <span className="text-gray-400 text-sm">/mes</span>
                </div>
              </div>

              {/* Descuentos Familiares */}
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                  <UserMinus className="w-4 h-4" />
                  Descuentos Familiares
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400 text-sm">2do hermano</span>
                    <p className="text-emerald-400 font-bold text-lg">
                      {parseFloat(String(configuracion.descuentoHermano2)).toFixed(0)}% OFF
                    </p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400 text-sm">3er+ hermano</span>
                    <p className="text-emerald-400 font-bold text-lg">
                      {parseFloat(String(configuracion.descuentoHermano3Mas)).toFixed(0)}% OFF
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Inscripciones Pendientes */}
        <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Inscripciones Pendientes
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {inscripcionesPendientes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay inscripciones pendientes</p>
              </div>
            ) : (
              inscripcionesPendientes.slice(0, 10).map((inscripcion) => (
                <div
                  key={inscripcion.id}
                  className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-semibold">
                        {inscripcion.estudiante.nombre} {inscripcion.estudiante.apellido}
                      </p>
                      <p className="text-gray-400 text-sm">{inscripcion.producto.nombre}</p>
                    </div>
                    <span className="text-emerald-400 font-semibold">
                      {formatCurrency(inscripcion.precioFinal)}
                    </span>
                  </div>
                </div>
              ))
            )}
            {inscripcionesPendientes.length > 10 && (
              <p className="text-center text-gray-400 text-sm pt-2">
                Y {inscripcionesPendientes.length - 10} más...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Estudiantes con Descuentos */}
      <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 mb-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-violet-400" />
          Estudiantes con Descuentos Aplicados
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {estudiantesDescuentos.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-400">
              <p>No hay estudiantes con descuentos este mes</p>
            </div>
          ) : (
            estudiantesDescuentos.map((estudiante) => (
              <div
                key={estudiante.estudianteId}
                className="p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <p className="text-white font-semibold mb-2">{estudiante.estudianteNombre}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tipo:</span>
                    <span className="text-violet-400 font-semibold">
                      {estudiante.tipoDescuento}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Original:</span>
                    <span className="text-gray-300 line-through">
                      {formatCurrency(estudiante.precioOriginal)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-gray-400 font-semibold">Final:</span>
                    <span className="text-white font-bold">
                      {formatCurrency(estudiante.precioFinal)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Historial de Cambios */}
      <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 mb-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          Historial de Cambios de Precios
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {historialCambios.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No hay cambios registrados</p>
            </div>
          ) : (
            historialCambios.slice(0, 5).map((cambio) => (
              <div key={cambio.id} className="p-4 bg-white/5 rounded-lg border-l-4 border-cyan-400">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">
                      {new Date(cambio.fechaCambio).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
                {cambio.motivoCambio && (
                  <p className="text-white text-sm mb-2 italic">
                    &ldquo;{cambio.motivoCambio}&rdquo;
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Grid Final - Reportes y Notificaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" />
            Reportes y Exportación
          </h3>
          <div className="space-y-3">
            <button className="w-full p-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-lg text-white font-semibold transition-all duration-300 flex items-center justify-between group">
              <span>Exportar Inscripciones (CSV)</span>
              <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
            </button>
            <button className="w-full p-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg text-white font-semibold transition-all duration-300 flex items-center justify-between group">
              <span>Exportar Métricas (Excel)</span>
              <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            Notificaciones
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-amber-500/10 border-l-4 border-amber-500 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-white font-semibold text-sm">Pagos por vencer</p>
                  <p className="text-gray-300 text-sm">
                    {inscripcionesPendientes.length} inscripciones pendientes
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-emerald-500/10 border-l-4 border-emerald-500 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-white font-semibold text-sm">Sistema activo</p>
                  <p className="text-gray-300 text-sm">Servicios funcionando correctamente</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Configuración de Precios - TIERS 2026 */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 p-6 flex items-center justify-between border-b border-white/20">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Configuración Tiers 2026</h2>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Info Box */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-300 mb-1">
                      Sistema de Tiers 2026
                    </p>
                    <p className="text-xs text-gray-300">
                      Cada Tier tiene un precio independiente. Los descuentos familiares se aplican
                      sobre cualquier Tier seleccionado.
                    </p>
                  </div>
                </div>
              </div>

              {/* Precios por Tier */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-300">Precios por Tier</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
                      <Gamepad2 className="w-3 h-3" /> Arcade
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        $
                      </span>
                      <input
                        type="number"
                        value={formData.precioArcade}
                        onChange={(e) => setFormData({ ...formData, precioArcade: e.target.value })}
                        className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        placeholder="30000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Arcade+
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        $
                      </span>
                      <input
                        type="number"
                        value={formData.precioArcadePlus}
                        onChange={(e) =>
                          setFormData({ ...formData, precioArcadePlus: e.target.value })
                        }
                        className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-violet-500"
                        placeholder="60000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Pro
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        $
                      </span>
                      <input
                        type="number"
                        value={formData.precioPro}
                        onChange={(e) => setFormData({ ...formData, precioPro: e.target.value })}
                        className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-amber-500"
                        placeholder="75000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Descuentos Familiares */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-300">Descuentos Familiares</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">2do hermano (%)</label>
                    <input
                      type="number"
                      value={formData.descuentoHermano2}
                      onChange={(e) =>
                        setFormData({ ...formData, descuentoHermano2: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      placeholder="12"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">3er+ hermano (%)</label>
                    <input
                      type="number"
                      value={formData.descuentoHermano3Mas}
                      onChange={(e) =>
                        setFormData({ ...formData, descuentoHermano3Mas: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      placeholder="20"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              {/* Motivo del Cambio */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Motivo del Cambio (Opcional)
                </label>
                <textarea
                  value={formData.motivoCambio}
                  onChange={(e) => setFormData({ ...formData, motivoCambio: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Ej: Ajuste de precios para ciclo 2026"
                  rows={2}
                />
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors font-semibold border border-white/10"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
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
      )}
    </div>
  );
}
