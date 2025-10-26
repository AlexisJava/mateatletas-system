'use client';

import { useEffect, useState } from 'react';
import { useStats, useStatsLoading, useFetchStats } from '@/features/admin/stats';
import { useAuthStore } from '@/store/auth.store';
import {
  GraduationCap,
  BookOpen,
  TrendingUp,
  Activity,
  DollarSign,
  UserPlus,
  ArrowUpRight,
  Star,
  Award,
  BarChart3,
  MapPin,
  Calendar,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

/**
 * 🚀 MATEATLETAS OS - Dashboard Administrativo
 *
 * Sistema Operativo del Club - Diseño IMPRESIONANTE
 * - Cards con colores vibrantes únicos
 * - Efectos visuales de última generación
 * - Glassmorphism moderno
 * - Animaciones suaves
 *
 * ⚠️ ENDPOINTS PENDIENTES DE IMPLEMENTAR:
 * 1. GET /admin/stats/top-courses - Top 5 cursos más elegidos
 * 2. GET /admin/stats/geographic-distribution?region=argentina|latinoamerica - Distribución geográfica
 * 3. GET /admin/stats/upcoming-courses - Próximos inicios de cursos
 * 4. GET /admin/stats/teacher-updates - Novedades de docentes
 * 5. GET /admin/stats/trends - Cálculo de % de crecimiento vs mes anterior
 *
 * 📊 DATOS ACTUALES:
 * - ✅ Stats principales (totalEstudiantes, totalUsuarios, ingresosTotal) - Conectado
 * - ❌ Top courses - Arrays vacíos (waiting backend)
 * - ❌ Distribución geográfica - Arrays vacíos (waiting backend)
 * - ❌ Próximos inicios - Arrays vacíos (waiting backend)
 * - ❌ Novedades docentes - Arrays vacíos (waiting backend)
 * - ❌ Trends (%) - null (waiting backend)
 */
export default function AdminDashboard() {
  const stats = useStats();
  const isLoading = useStatsLoading();
  const fetchStats = useFetchStats();
  const { user } = useAuthStore();
  const [greeting, setGreeting] = useState('Bienvenido');
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedStat, setSelectedStat] = useState<{label: string; value: string | number; fullValue: number} | null>(null);
  const [regionFilter, setRegionFilter] = useState<'argentina' | 'latinoamerica'>('argentina');

  useEffect(() => {
    setMounted(true);
    fetchStats();

    // Saludo dinámico
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 20) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');

    // Actualizar reloj cada segundo
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return null;
  }

  // Función para formatear números grandes
  const formatLargeNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Calcular valores reales desde el backend
  const totalEstudiantes = stats?.totalEstudiantes || 0;
  const totalUsuarios = stats?.totalUsuarios || 0;
  const ingresosActuales = stats?.ingresosTotal || 0;
  const ingresosEstimados = ingresosActuales * 1.15; // TODO: Calcular desde backend con datos históricos

  // Stats con COLORES VIBRANTES únicos para cada uno - NUEVA ORGANIZACIÓN
  const mainStats = [
    {
      label: 'Nuevos Estudiantes',
      displayValue: formatLargeNumber(totalUsuarios),
      fullValue: totalUsuarios,
      icon: UserPlus,
      trend: null, // TODO: Calcular desde backend comparando con mes anterior
      trendUp: true,
      // MORADO VIBRANTE
      bgGradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      cardBg: 'from-violet-500/20 via-purple-500/20 to-fuchsia-500/20',
      borderColor: 'border-violet-400/50',
      shadowColor: 'shadow-violet-500/50',
      glowColor: 'shadow-violet-500/30',
      iconBg: 'from-violet-400 to-purple-500',
    },
    {
      label: 'Estudiantes Activos',
      displayValue: formatLargeNumber(totalEstudiantes),
      fullValue: totalEstudiantes,
      icon: GraduationCap,
      trend: null, // TODO: Calcular desde backend comparando con mes anterior
      trendUp: true,
      // AZUL BRILLANTE
      bgGradient: 'from-blue-500 via-cyan-500 to-teal-500',
      cardBg: 'from-blue-500/20 via-cyan-500/20 to-teal-500/20',
      borderColor: 'border-blue-400/50',
      shadowColor: 'shadow-blue-500/50',
      glowColor: 'shadow-cyan-500/30',
      iconBg: 'from-blue-400 to-cyan-500',
    },
    {
      label: 'Ingresos Estimados Próximo Mes',
      displayValue: `$${formatLargeNumber(ingresosEstimados)}`,
      fullValue: ingresosEstimados,
      icon: TrendingUp,
      trend: null, // TODO: Calcular desde backend comparando con mes anterior
      trendUp: true,
      // VERDE ESMERALDA
      bgGradient: 'from-emerald-500 via-green-500 to-teal-500',
      cardBg: 'from-emerald-500/20 via-green-500/20 to-teal-500/20',
      borderColor: 'border-emerald-400/50',
      shadowColor: 'shadow-emerald-500/50',
      glowColor: 'shadow-green-500/30',
      iconBg: 'from-emerald-400 to-green-500',
    },
    {
      label: 'Ingresos del Mes Actual',
      displayValue: `$${formatLargeNumber(ingresosActuales)}`,
      fullValue: ingresosActuales,
      icon: DollarSign,
      trend: null, // TODO: Calcular desde backend comparando con mes anterior
      trendUp: true,
      // DORADO/AMARILLO
      bgGradient: 'from-amber-500 via-yellow-500 to-orange-500',
      cardBg: 'from-amber-500/20 via-yellow-500/20 to-orange-500/20',
      borderColor: 'border-amber-400/50',
      shadowColor: 'shadow-amber-500/50',
      glowColor: 'shadow-yellow-500/30',
      iconBg: 'from-amber-400 to-yellow-500',
    },
  ];

  // TODO: Obtener desde backend - GET /admin/stats/top-courses
  // Cursos más elegidos - Data para gráfico
  const topCourses: Array<{
    id: number;
    name: string;
    students: number;
    color: string;
    percentage: number;
  }> = [];

  // TODO: Obtener desde backend - GET /admin/stats/geographic-distribution?region=argentina
  const argentineProvinces: Array<{
    id: number;
    name: string;
    students: number;
    color: string;
    percentage: number;
  }> = [];

  // TODO: Obtener desde backend - GET /admin/stats/geographic-distribution?region=latinoamerica
  const latinamericaCountries: Array<{
    id: number;
    name: string;
    students: number;
    color: string;
    percentage: number;
  }> = [];

  // Seleccionar datos según el filtro
  const topLocations = regionFilter === 'argentina' ? argentineProvinces : latinamericaCountries;

  // TODO: Obtener desde backend - GET /admin/stats/upcoming-courses
  const upcomingStarts: Array<{
    id: number;
    course: string;
    date: string;
    students: number;
    icon: typeof BookOpen;
    gradient: string;
  }> = [];

  // TODO: Obtener desde backend - GET /admin/stats/teacher-updates
  const teacherUpdates: Array<{
    id: number;
    title: string;
    name: string;
    specialty: string;
    icon: typeof UserPlus | typeof Award | typeof Star;
    gradient: string;
  }> = [];

  // Configuración del gráfico de barras - Cursos Más Elegidos
  const coursesChartData = {
    labels: topCourses.map(c => c.name),
    datasets: [
      {
        label: 'Estudiantes',
        data: topCourses.map(c => c.students),
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)',  // Violet
          'rgba(59, 130, 246, 0.8)',  // Blue
          'rgba(16, 185, 129, 0.8)',  // Emerald
          'rgba(251, 191, 36, 0.8)',  // Amber
          'rgba(249, 115, 22, 0.8)',  // Orange
        ],
        borderColor: [
          'rgba(139, 92, 246, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(249, 115, 22, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const coursesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 16,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        displayColors: true,
        callbacks: {
          label: function(context: TooltipItem<'bar'>) {
            return `${context.parsed.y} estudiantes`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 12,
            weight: 'bold' as const,
          }
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          display: false, // Ocultar labels del eje X - solo tooltips
        },
      },
    },
  };

  // Configuración del gráfico de dona - Provincias/Países
  const locationsChartData = {
    labels: topLocations.map(l => l.name),
    datasets: [
      {
        label: 'Estudiantes',
        data: topLocations.map(l => l.students),
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(249, 115, 22, 0.8)',
        ],
        borderColor: [
          'rgba(139, 92, 246, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(249, 115, 22, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const locationsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          padding: 15,
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-violet-500/20 border-t-violet-500 mb-4"></div>
          <p className="text-base text-slate-300 font-medium">Cargando Mateatletas OS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col relative">
      {/* Partículas flotantes de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-violet-400 rounded-full animate-ping opacity-20" />
        <div className="absolute top-40 right-40 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-20 animation-delay-2000" />
        <div className="absolute bottom-40 left-60 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-20 animation-delay-4000" />
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-amber-400 rounded-full animate-ping opacity-20 animation-delay-1000" />
      </div>

      {/* Header estilo OS - Más compacto */}
      <div className="flex items-center justify-between mb-6 relative z-10 max-w-full">
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-violet-200 to-blue-200 bg-clip-text text-transparent drop-shadow-lg mb-1">
            {greeting}, {user?.nombre || 'Admin'}
          </h1>
          <p className="text-sm text-slate-300 font-medium">
            Tu centro de comando de Mateatletas Club
          </p>
        </div>

        {/* Reloj en tiempo real estilo OS */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <div className="text-right">
                <div className="text-xs text-slate-400 font-medium">Sistema</div>
                <div className="text-xs text-white font-bold">Operativo</div>
              </div>
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-emerald-500/10 backdrop-blur-xl border border-white/20 shadow-xl">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">
                {currentTime.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })}
              </div>
              <div className="text-xs text-white font-bold tabular-nums">
                {currentTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="flex flex-col gap-6 relative z-10">

        {/* Stats Grid - SUPER COLORIDAS CON ORGANIZACIÓN PERFECTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {mainStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                onClick={() => setSelectedStat({
                  label: stat.label,
                  value: stat.displayValue,
                  fullValue: stat.fullValue
                })}
                className="group relative rounded-2xl transition-all duration-300 cursor-pointer"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Fondo con gradiente colorido */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.cardBg} backdrop-blur-xl rounded-2xl`} />

                {/* Borde brillante */}
                <div className={`absolute inset-0 rounded-2xl border-2 ${stat.borderColor} transition-all duration-300 group-hover:shadow-xl ${stat.shadowColor}`} />

                {/* Contenido */}
                <div className="relative p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/60 mb-2.5 font-bold uppercase tracking-wide">{stat.label}</p>
                      <p className="text-4xl font-black text-white mb-3 drop-shadow-lg leading-none">
                        {stat.displayValue}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${stat.trendUp ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                          <ArrowUpRight className={`w-3.5 h-3.5 ${stat.trendUp ? 'text-emerald-300' : 'text-red-300 rotate-90'}`} strokeWidth={2.5} />
                          <span className={`text-xs font-bold ${stat.trendUp ? 'text-emerald-300' : 'text-red-300'}`}>
                            {stat.trend}
                          </span>
                        </div>
                        <span className="text-xs text-white/40 font-medium">vs mes anterior</span>
                      </div>
                    </div>

                    {/* Icono */}
                    <div className="relative flex-shrink-0 ml-3">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.iconBg} flex items-center justify-center shadow-lg ${stat.shadowColor}`}>
                        <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid asimétrico: Cursos (2/3) y Provincias (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Cursos Más Elegidos - Gráfico de Barras CON CHART.JS (2/3 del espacio) */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl flex flex-col min-h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-2xl" />
            <div className="absolute inset-0 rounded-2xl border-2 border-white/20" />

            <div className="relative p-5 flex flex-col h-full">
              <div className="flex items-center gap-2.5 mb-4 flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <BarChart3 className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-black text-white">
                  Cursos Más Elegidos
                </h2>
                <div className="ml-auto text-xs text-white/50 font-bold">
                  {topCourses.reduce((acc, c) => acc + c.students, 0)} estudiantes
                </div>
              </div>

              <div className="flex-1 min-h-0">
                <Bar data={coursesChartData} options={coursesChartOptions} />
              </div>
            </div>
          </div>

          {/* Distribución por Provincias - Gráfico de Dona CON CHART.JS (1/3 del espacio) */}
          <div className="relative overflow-hidden rounded-2xl flex flex-col min-h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-2xl" />
            <div className="absolute inset-0 rounded-2xl border-2 border-white/20" />

            <div className="relative p-5 flex flex-col h-full">
              <div className="flex items-center gap-2.5 mb-3 flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <MapPin className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-lg font-black text-white">
                  {regionFilter === 'argentina' ? 'Provincias' : 'Países'}
                </h2>
              </div>

              {/* Filtro Argentina / Latinoamérica */}
              <div className="flex gap-2 mb-3 flex-shrink-0">
                <button
                  onClick={() => setRegionFilter('argentina')}
                  className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                    regionFilter === 'argentina'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  Argentina
                </button>
                <button
                  onClick={() => setRegionFilter('latinoamerica')}
                  className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                    regionFilter === 'latinoamerica'
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  LATAM
                </button>
              </div>

              <div className="flex-1 min-h-0 flex items-center justify-center">
                <div className="w-full h-full">
                  <Doughnut data={locationsChartData} options={locationsChartOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de 2 columnas: Próximos Inicios y Novedades Docentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Próximos Inicios de Cursos */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-2xl" />
            <div className="absolute inset-0 rounded-2xl border-2 border-white/20" />

            <div className="relative p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Calendar className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-black text-white">
                  Próximos Inicios
                </h2>
                <div className="ml-auto text-xs text-white/50 font-bold">
                  {upcomingStarts.length} cursos
                </div>
              </div>

              <div className="space-y-2.5">
                {upcomingStarts.map((start, index) => {
                  const Icon = start.icon;
                  return (
                    <div
                      key={start.id}
                      className="relative group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-xl" />
                      <div className="absolute inset-0 rounded-xl border border-white/10 group-hover:border-white/30 transition-all" />

                      <div className="relative p-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${start.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                            <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white leading-tight">{start.course}</p>
                            <p className="text-xs text-white/60 mt-0.5">{start.students} estudiantes inscritos</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-bold text-emerald-400">{start.date}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Novedades Docentes */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-2xl" />
            <div className="absolute inset-0 rounded-2xl border-2 border-white/20" />

            <div className="relative p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Award className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-black text-white">
                  Novedades Docentes
                </h2>
                <div className="ml-auto text-xs text-white/50 font-bold">
                  Últimas {teacherUpdates.length}
                </div>
              </div>

              <div className="space-y-2.5">
                {teacherUpdates.map((update, index) => {
                  const Icon = update.icon;
                  return (
                    <div
                      key={update.id}
                      className="relative group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-xl" />
                      <div className="absolute inset-0 rounded-xl border border-white/10 group-hover:border-white/30 transition-all" />

                      <div className="relative p-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${update.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                            <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white leading-tight">{update.title}</p>
                            <p className="text-xs text-white/60 mt-0.5">{update.name}</p>
                            <p className="text-xs text-white/40 mt-0.5">{update.specialty}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para mostrar número completo */}
      {selectedStat && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setSelectedStat(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
            <div className="relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl" />
              <div className="absolute inset-0 rounded-2xl border-2 border-white/30" />

              <div className="relative p-8">
                <h3 className="text-xl font-black text-white mb-2">
                  {selectedStat.label}
                </h3>
                <p className="text-sm text-white/60 mb-6">Valor completo</p>

                <div className="bg-white/5 rounded-xl p-6 border border-white/20 mb-6">
                  <p className="text-5xl font-black text-white text-center break-all">
                    {typeof selectedStat.fullValue === 'number'
                      ? selectedStat.label.includes('Ingreso')
                        ? `$${selectedStat.fullValue.toLocaleString('es-AR')}`
                        : selectedStat.fullValue.toLocaleString('es-AR')
                      : selectedStat.fullValue
                    }
                  </p>
                </div>

                <button
                  onClick={() => setSelectedStat(null)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/30"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
