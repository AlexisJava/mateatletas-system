'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  Video,
  BookOpen,
  Target,
  Star,
  CheckCircle2,
  ArrowRight,
  Calendar,
  FileText,
  Zap,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { toast } from '@/components/ui/Toast';
import { LoadingSpinner } from '@/components/effects';

/**
 * Dashboard Docente 10/10 - Ultra Intuitivo
 *
 * Filosofía de diseño:
 * 1. Lo más importante PRIMERO (clase inminente)
 * 2. Alertas que requieren acción
 * 3. Contexto y stats relevantes
 * 4. Quick actions siempre visibles
 */

interface ClaseInminente {
  id: string;
  titulo: string;
  grupoNombre: string;
  grupoId: string;
  fecha_hora: string;
  duracion: number;
  estudiantesInscritos: number;
  cupo_maximo: number;
  estado: 'PRÓXIMA' | 'AHORA' | 'PASADA';
  minutosParaEmpezar: number;
}

interface Alerta {
  id: string;
  tipo: 'warning' | 'info' | 'urgent';
  mensaje: string;
  accion?: {
    label: string;
    href: string;
  };
}

interface StatsResumen {
  clasesHoy: number;
  clasesEstaSemana: number;
  asistenciaPromedio: number;
  tendenciaAsistencia: 'up' | 'down' | 'stable';
  observacionesPendientes: number;
  estudiantesTotal: number;
}

export default function DocenteDashboardNew() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [claseInminente, setClaseInminente] = useState<ClaseInminente | null>(null);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [stats, setStats] = useState<StatsResumen | null>(null);

  // Update clock every minute
  useEffect(() => {
    const interval = setInterval(() => {
      // setNow(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // TODO: Conectar con backend real
      // const response = await apiClient.get('/docentes/dashboard');

      // MOCK DATA - Reemplazar con backend
      await new Promise(resolve => setTimeout(resolve, 800));

      // Clase inminente
      const mockClase: ClaseInminente = {
        id: 'clase-1',
        titulo: 'Álgebra Básica',
        grupoNombre: 'Grupo Alfa',
        grupoId: 'grupo-alfa',
        fecha_hora: new Date(Date.now() + 15 * 60000).toISOString(), // En 15 minutos
        duracion: 60,
        estudiantesInscritos: 12,
        cupo_maximo: 15,
        estado: 'PRÓXIMA',
        minutosParaEmpezar: 15,
      };

      // Alertas
      const mockAlertas: Alerta[] = [
        {
          id: '1',
          tipo: 'warning',
          mensaje: '3 estudiantes con 2+ faltas consecutivas',
          accion: { label: 'Ver estudiantes', href: '/docente/mis-clases' },
        },
        {
          id: '2',
          tipo: 'info',
          mensaje: '5 observaciones sin leer por tutores',
          accion: { label: 'Ver observaciones', href: '/docente/observaciones' },
        },
      ];

      // Stats
      const mockStats: StatsResumen = {
        clasesHoy: 3,
        clasesEstaSemana: 12,
        asistenciaPromedio: 87,
        tendenciaAsistencia: 'up',
        observacionesPendientes: 5,
        estudiantesTotal: 45,
      };

      setClaseInminente(mockClase);
      setAlertas(mockAlertas);
      setStats(mockStats);
    } catch (error: any) {
      toast.error('Error al cargar el dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIniciarClase = () => {
    if (!claseInminente) return;

    // TODO: Implementar lógica real
    toast.loading('Preparando sala de clase...', { duration: 2000 });

    setTimeout(() => {
      toast.success('¡Sala de clase lista! Redirigiendo...');
      // router.push(`/docente/clase/${claseInminente.id}/sala`);
    }, 2000);
  };

  const handleVerGrupo = () => {
    if (!claseInminente) return;
    router.push(`/docente/grupos/${claseInminente.grupoId}`);
  };

  const getCountdownColor = (minutos: number) => {
    if (minutos <= 5) return 'text-red-600 dark:text-red-400';
    if (minutos <= 15) return 'text-orange-600 dark:text-orange-400';
    return 'text-indigo-900 dark:text-white';
  };

  const getCountdownText = (minutos: number) => {
    if (minutos <= 0) return '¡AHORA!';
    if (minutos < 60) return `en ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    return `en ${horas}h ${minutos % 60}m`;
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando dashboard..." />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden p-6">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col gap-6 overflow-hidden">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: 'Dashboard' }]} />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-black text-indigo-900 dark:text-white mb-2">
            ¡Bienvenido de vuelta! 👋
          </h1>
          <p className="text-purple-600 dark:text-purple-300 font-semibold">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </motion.div>

        {/* SECCIÓN 1: CLASE INMINENTE - Lo más importante */}
        {claseInminente && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 relative overflow-hidden"
          >
            {/* Background gradient animado */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent opacity-50"></div>

            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-300 uppercase tracking-wide">
                      Próxima Clase
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-indigo-900 dark:text-white mb-1">
                    {claseInminente.titulo}
                  </h2>
                  <button
                    onClick={handleVerGrupo}
                    className="text-sm text-purple-600 dark:text-purple-300 hover:text-indigo-900 dark:hover:text-white font-semibold transition-colors flex items-center gap-1 group"
                  >
                    <Users className="w-4 h-4" />
                    {claseInminente.grupoNombre} •{' '}
                    {claseInminente.estudiantesInscritos}/{claseInminente.cupo_maximo} estudiantes
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Countdown */}
                <motion.div
                  className="text-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <div className={`text-4xl font-black ${getCountdownColor(claseInminente.minutosParaEmpezar)}`}>
                    {getCountdownText(claseInminente.minutosParaEmpezar)}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-300 font-bold mt-1">
                    {new Date(claseInminente.fecha_hora).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                <motion.button
                  onClick={handleIniciarClase}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <Video className="w-5 h-5" />
                  Iniciar Clase
                </motion.button>

                <button
                  onClick={handleVerGrupo}
                  className="glass-card px-4 py-3 hover-lift font-bold text-purple-600 dark:text-purple-300 flex items-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Ver Grupo
                </button>

                <button className="glass-card px-4 py-3 hover-lift font-bold text-purple-600 dark:text-purple-300 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Materiales
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* SECCIÓN 2: ALERTAS - Requieren atención */}
        {alertas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <h3 className="text-sm font-bold text-indigo-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Requiere tu atención
            </h3>
            {alertas.map((alerta, index) => (
              <motion.div
                key={alerta.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="glass-card p-4 hover-lift flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      alerta.tipo === 'urgent'
                        ? 'bg-red-500 animate-pulse'
                        : alerta.tipo === 'warning'
                        ? 'bg-orange-500'
                        : 'bg-blue-500'
                    }`}
                  ></div>
                  <span className="text-sm font-semibold text-indigo-900 dark:text-white">
                    {alerta.mensaje}
                  </span>
                </div>
                {alerta.accion && (
                  <button
                    onClick={() => router.push(alerta.accion!.href)}
                    className="text-sm font-bold text-purple-600 dark:text-purple-300 hover:text-indigo-900 dark:hover:text-white transition-colors flex items-center gap-1 group"
                  >
                    {alerta.accion.label}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* SECCIÓN 3: STATS RESUMEN - Grid compacto */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-sm font-bold text-indigo-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Resumen
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Clases Hoy */}
              <div className="glass-card p-4 text-center group cursor-default hover-lift">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-purple-500/50">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-black text-indigo-900 dark:text-white">{stats.clasesHoy}</div>
                <div className="text-xs text-purple-600 dark:text-purple-300 font-bold">Clases Hoy</div>
              </div>

              {/* Asistencia */}
              <div className="glass-card p-4 text-center group cursor-default hover-lift">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-green-500/50">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center justify-center gap-1">
                  <div className="text-2xl font-black text-green-600 dark:text-green-400">
                    {stats.asistenciaPromedio}%
                  </div>
                  {stats.tendenciaAsistencia === 'up' && (
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-300 font-bold">Asistencia Prom</div>
              </div>

              {/* Observaciones */}
              <div className="glass-card p-4 text-center group cursor-default hover-lift">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-yellow-500/50">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-black text-indigo-900 dark:text-white">
                  {stats.observacionesPendientes}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-300 font-bold">Observaciones</div>
              </div>

              {/* Estudiantes */}
              <div className="glass-card p-4 text-center group cursor-default hover-lift">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-pink-500/50">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-black text-indigo-900 dark:text-white">{stats.estudiantesTotal}</div>
                <div className="text-xs text-purple-600 dark:text-purple-300 font-bold">Estudiantes</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SECCIÓN 4: QUICK ACCESS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-bold text-indigo-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Acceso Rápido
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => router.push('/docente/mis-clases')}
              className="glass-card p-4 hover-lift text-left group"
            >
              <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-bold text-indigo-900 dark:text-white">Mis Clases</div>
            </button>

            <button
              onClick={() => router.push('/docente/calendario')}
              className="glass-card p-4 hover-lift text-left group"
            >
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-bold text-indigo-900 dark:text-white">Calendario</div>
            </button>

            <button
              onClick={() => router.push('/docente/observaciones')}
              className="glass-card p-4 hover-lift text-left group"
            >
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-bold text-indigo-900 dark:text-white">Observaciones</div>
            </button>

            <button
              onClick={() => router.push('/docente/reportes')}
              className="glass-card p-4 hover-lift text-left group"
            >
              <Star className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-bold text-indigo-900 dark:text-white">Reportes</div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
