'use client';

import { useEffect, useState } from 'react';
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
import { Bar, Doughnut, Line } from 'react-chartjs-2';
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
  ArcElement
);

/**
 * 💰 MATEATLETAS OS - Dashboard de Pagos
 *
 * Sistema de Gestión Financiera del Club
 * - Métricas en tiempo real desde API
 * - Configuración de precios dinámica
 * - Gestión de inscripciones y pagos
 * - Reportes y auditoría
 * - Estilo glassmorphism y gradientes vibrantes
 */
export default function PagosDashboard() {
  const [mounted, setMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('2025-01');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [metricsData, setMetricsData] = useState<MetricasDashboardResponse | null>(null);
  const [configuracion, setConfiguracion] = useState<ConfiguracionPrecios | null>(null);
  const [historialCambios, setHistorialCambios] = useState<HistorialCambioPrecios[]>([]);
  const [inscripcionesPendientes, setInscripcionesPendientes] = useState<InscripcionMensualConRelaciones[]>([]);
  const [estudiantesDescuentos, setEstudiantesDescuentos] = useState<EstudianteConDescuento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    precioClubMatematicas: '',
    precioCursosEspecializados: '',
    descuentoAacreaPorcentaje: '',
    descuentoAacreaActivo: false,
    motivoCambio: '',
  });

  useEffect(() => {
    setMounted(true);
    // Actualizar reloj cada segundo
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch todos los datos del dashboard
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ejecutar todas las llamadas en paralelo
        const [metricas, config, historial, pendientes, descuentos] = await Promise.all([
          getMetricasDashboard(),
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
        precioClubMatematicas: String(configuracion.precioClubMatematicas || ''),
        precioCursosEspecializados: String(configuracion.precioCursosEspecializados || ''),
        descuentoAacreaPorcentaje: String(configuracion.descuentoAacreaPorcentaje || ''),
        descuentoAacreaActivo: configuracion.descuentoAacreaActivo,
        motivoCambio: '',
      });
    }
  }, [showConfigModal, configuracion]);

  // Handler para guardar configuración
  const handleSaveConfig = async () => {
    if (!configuracion) return;

    try {
      setSaving(true);

      // IMPORTANTE: Precios en ARS deben ser enteros (sin centavos) para contabilidad
      // Solo los porcentajes pueden tener decimales
      // Validar que los valores sean números válidos
      const parsePrice = (value: string): number => {
        const parsed = parseFloat(value || '0');
        return isNaN(parsed) ? 0 : Math.round(parsed);
      };

      const parsePercentage = (value: string): number => {
        const parsed = parseFloat(value || '0');
        return isNaN(parsed) ? 0 : parsed;
      };

      const updateData = {
        adminId: 'admin-temp-id', // TODO: Obtener del contexto de autenticación
        precioClubMatematicas: parsePrice(formData.precioClubMatematicas),
        precioCursosEspecializados: parsePrice(formData.precioCursosEspecializados),
        precioMultipleActividades: parsePrice(formData.precioMultipleActividades),
        precioHermanosBasico: parsePrice(formData.precioHermanosBasico),
        precioHermanosMultiple: parsePrice(formData.precioHermanosMultiple),
        descuentoAacreaPorcentaje: parsePercentage(formData.descuentoAacreaPorcentaje),
        descuentoAacreaActivo: formData.descuentoAacreaActivo,
        motivoCambio: formData.motivoCambio || undefined,
      };

      const updatedConfig = await updateConfiguracionPrecios(updateData);
      setConfiguracion(updatedConfig);

      // Recargar historial de cambios
      const nuevoHistorial = await getHistorialCambios();
      setHistorialCambios(nuevoHistorial);

      setShowConfigModal(false);
      setFormData({
        precioClubMatematicas: '',
        precioCursosEspecializados: '',
        precioMultipleActividades: '',
        precioHermanosBasico: '',
        precioHermanosMultiple: '',
        descuentoAacreaPorcentaje: '',
        descuentoAacreaActivo: false,
        motivoCambio: '',
      });
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

  // Formatear números grandes
  const formatLargeNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

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
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Cargando métricas del dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !metricsData) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg mb-4">{error || 'No se pudieron cargar los datos'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
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
      change: metricas.comparacionMesAnterior.inscripcionesCambio >= 0
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
      return `${month}/${year.slice(2)}`;
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
          'rgba(16, 185, 129, 0.8)', // Verde para Pagado
          'rgba(251, 191, 36, 0.8)', // Amarillo para Pendiente
          'rgba(239, 68, 68, 0.8)', // Rojo para Vencido
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Opciones para el gráfico de barras
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          callback: function (value: any) {
            return formatCurrency(value);
          },
        },
      },
    },
  };

  // Opciones para el gráfico doughnut
  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: {
            size: 12,
          },
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
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
    <div className="min-h-screen p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              💰 Sistema de Pagos
            </h1>
            <p className="text-gray-300 text-lg">
              Panel de Gestión Financiera · Mateatletas OS
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono text-white mb-1">
              {currentTime.toLocaleTimeString('es-AR')}
            </div>
            <div className="text-sm text-gray-400">
              {currentTime.toLocaleDateString('es-AR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
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
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`}
              />
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
          {/* Gráfico de evolución mensual */}
          <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Evolución Mensual
            </h3>
            <div className="h-80">
              <Bar data={evolucionChartData} options={barChartOptions} />
            </div>
          </div>

          {/* Gráfico de distribución por estado */}
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

        {/* Grid de Secciones Adicionales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Configuración de Precios */}
          <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                Configuración de Precios
              </h3>
              <button
                onClick={() => setShowConfigModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-semibold"
              >
                Editar
              </button>
            </div>
            {configuracion && (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Club Matemáticas</span>
                  <span className="text-white font-semibold">{formatCurrency(configuracion.precioClubMatematicas)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Cursos Especializados</span>
                  <span className="text-white font-semibold">{formatCurrency(configuracion.precioCursosEspecializados)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Múltiples Actividades</span>
                  <span className="text-white font-semibold">{formatCurrency(configuracion.precioMultipleActividades)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Hermanos Básico</span>
                  <span className="text-white font-semibold">{formatCurrency(configuracion.precioHermanosBasico)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Hermanos Múltiple</span>
                  <span className="text-white font-semibold">{formatCurrency(configuracion.precioHermanosMultiple)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Descuento AACREA</span>
                  <span className={`font-semibold ${configuracion.descuentoAacreaActivo ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {parseFloat(configuracion.descuentoAacreaPorcentaje).toFixed(1)}% {configuracion.descuentoAacreaActivo ? '(Activo)' : '(Inactivo)'}
                  </span>
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
                  <div key={inscripcion.id} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-semibold">
                          {inscripcion.estudiante.nombre} {inscripcion.estudiante.apellido}
                        </p>
                        <p className="text-gray-400 text-sm">{inscripcion.producto.nombre}</p>
                      </div>
                      <span className="text-emerald-400 font-semibold">{formatCurrency(inscripcion.precioFinal)}</span>
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
                <div key={estudiante.estudianteId} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-white font-semibold mb-2">{estudiante.estudianteNombre}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tipo:</span>
                      <span className="text-violet-400 font-semibold">{estudiante.tipoDescuento}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Inscripciones:</span>
                      <span className="text-white">{estudiante.cantidadInscripciones}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Original:</span>
                      <span className="text-gray-300 line-through">{formatCurrency(estudiante.precioOriginal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Descuento:</span>
                      <span className="text-emerald-400 font-semibold">-{formatCurrency(estudiante.totalDescuento)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/10">
                      <span className="text-gray-400 font-semibold">Final:</span>
                      <span className="text-white font-bold">{formatCurrency(estudiante.precioFinal)}</span>
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
                    <span className="text-xs text-gray-500">Admin: {cambio.adminId}</span>
                  </div>
                  {cambio.motivoCambio && (
                    <p className="text-white text-sm mb-2 italic">&ldquo;{cambio.motivoCambio}&rdquo;</p>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(cambio.valoresNuevos).map(([key, value]) => (
                      <div key={key} className="flex justify-between p-2 bg-white/5 rounded">
                        <span className="text-gray-400">{key}:</span>
                        <span className="text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Grid Final - Reportes y Notificaciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reportes y Exportación */}
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
              <button className="w-full p-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-lg text-white font-semibold transition-all duration-300 flex items-center justify-between group">
                <span>Generar Reporte Mensual (PDF)</span>
                <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Sistema de Notificaciones */}
          <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              Notificaciones y Recordatorios
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-amber-500/10 border-l-4 border-amber-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-sm">Pagos por vencer</p>
                    <p className="text-gray-300 text-sm">
                      {inscripcionesPendientes.length} inscripciones pendientes este mes
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-emerald-500/10 border-l-4 border-emerald-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-sm">Sistema activo</p>
                    <p className="text-gray-300 text-sm">
                      Todos los servicios funcionando correctamente
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-blue-500/10 border-l-4 border-blue-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-sm">Próximo cierre</p>
                    <p className="text-gray-300 text-sm">
                      Fin de mes: {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Configuración de Precios */}
        {showConfigModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header del Modal */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 p-6 flex items-center justify-between border-b border-white/20">
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">Editar Configuración de Precios</h2>
                </div>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Body del Modal */}
              <div className="p-6 space-y-6">
                {/* Grid de Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Club Matemáticas */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Precio Club Matemáticas
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        value={formData.precioClubMatematicas}
                        onChange={(e) => setFormData({ ...formData, precioClubMatematicas: e.target.value })}
                        className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="52000"
                      />
                    </div>
                  </div>

                  {/* Cursos Especializados */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Precio Cursos Especializados
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        value={formData.precioCursosEspecializados}
                        onChange={(e) => setFormData({ ...formData, precioCursosEspecializados: e.target.value })}
                        className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="57000"
                      />
                    </div>
                  </div>

                  {/* NOTA: Los precios con descuento se calculan AUTOMÁTICAMENTE */}
                  <div className="col-span-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-300 mb-1">
                          ℹ️ Precios calculados automáticamente
                        </p>
                        <p className="text-xs text-gray-300">
                          Los precios con descuento (Múltiples Actividades, Hermanos Básico, Hermanos Múltiple)
                          se calculan automáticamente cuando modificás el precio base de Club Matemáticas:
                        </p>
                        <ul className="text-xs text-gray-400 mt-2 space-y-1 ml-4">
                          <li>• Múltiples Actividades = Club Mat - 12%</li>
                          <li>• Hermanos Básico = Club Mat - 12%</li>
                          <li>• Hermanos Múltiple = Club Mat - 24%</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Descuento AACREA Porcentaje */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Descuento AACREA (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.descuentoAacreaPorcentaje}
                        onChange={(e) => setFormData({ ...formData, descuentoAacreaPorcentaje: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="25"
                        min="0"
                        max="100"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                    </div>
                  </div>
                </div>

                {/* Toggle AACREA */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <p className="text-white font-semibold">Descuento AACREA Activo</p>
                    <p className="text-gray-400 text-sm">Activar o desactivar el descuento AACREA</p>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, descuentoAacreaActivo: !formData.descuentoAacreaActivo })}
                    className={`relative w-16 h-8 rounded-full transition-colors ${
                      formData.descuentoAacreaActivo ? 'bg-emerald-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        formData.descuentoAacreaActivo ? 'translate-x-8' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Motivo del Cambio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Motivo del Cambio (Opcional)
                  </label>
                  <textarea
                    value={formData.motivoCambio}
                    onChange={(e) => setFormData({ ...formData, motivoCambio: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    placeholder="Ej: Ajuste inflacionario trimestral"
                    rows={3}
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
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
