'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGamificacionStore } from '@/store/gamificacion.store';
import { useAuthStore } from '@/store/auth.store';
import { LoadingSpinner } from '@/components/effects';
import AvatarSelector from '@/components/estudiantes/AvatarSelector';
import AvatarWithInitials from '@/components/estudiantes/AvatarWithInitials';
import { WelcomeAnimation } from '@/components/animations/WelcomeAnimation';
import { LevelUpAnimation } from '@/components/animations/LevelUpAnimation';
import apiClient from '@/lib/axios';
import { Calendar, Bell, TrendingUp, BookOpen, User, Clock } from 'lucide-react';
import type { Clase } from '@/types/clases.types';
import type { ProximaClase } from '@/lib/api/gamificacion.api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function EstudianteDashboard() {
  const { dashboard, fetchDashboard, loading, error } = useGamificacionStore();
  const { user } = useAuthStore();
  const [avatarSelectorOpen, setAvatarSelectorOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (user?.id && user?.role === 'estudiante') {
      fetchDashboard(user.id);
    }
  }, [user?.id, user?.role, fetchDashboard]);

  useEffect(() => {
    if (!dashboard?.nivel) {
      return;
    }

    const welcomeShown = sessionStorage.getItem('welcomeShown');
    if (!welcomeShown) {
      setShowWelcome(true);
    }
  }, [dashboard?.nivel]);

  useEffect(() => {
    if (dashboard?.nivel?.nivelActual) {
      if (previousLevel && dashboard.nivel.nivelActual > previousLevel) {
        setShowLevelUp(true);
      }
      setPreviousLevel(dashboard.nivel.nivelActual);
    }
  }, [dashboard?.nivel?.nivelActual]);

  // Update current time every minute for class button
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Calculate class status
  const getClaseStatus = (clase: Clase | ProximaClase | undefined) => {
    if (!clase) {
      return { tipo: 'sin_clase', texto: 'Sin clases programadas', color: 'gray' };
    }

    const now = currentTime.getTime();
    const inicio = new Date(clase.fecha_hora_inicio).getTime();
    const fin = inicio + (clase.duracion_minutos * 60 * 1000);

    const minutosParaInicio = Math.floor((inicio - now) / (60 * 1000));
    const minutosDesdeInicio = Math.floor((now - inicio) / (60 * 1000));

    if (now < inicio) {
      // Antes de la clase
      if (minutosParaInicio <= 15) {
        return { tipo: 'proximamente', texto: `Comienza en ${minutosParaInicio} min`, color: 'yellow' };
      }
      return { tipo: 'pendiente', texto: 'Próximamente', color: 'gray' };
    } else if (now >= inicio && now < fin) {
      // Durante la clase
      if (minutosDesdeInicio <= 15) {
        return { tipo: 'activa', texto: '¡ENTRAR A CLASE EN VIVO!', color: 'green' };
      }
      return { tipo: 'en_progreso', texto: 'Clase en progreso', color: 'yellow' };
    } else {
      // Después de la clase
      return { tipo: 'finalizada', texto: 'Clase finalizada', color: 'gray' };
    }
  };

  const handleAvatarSelect = async (gradientId: number) => {
    if (!dashboard?.estudiante?.id) {
      return;
    }

    try {
      await apiClient.patch(`/estudiantes/${dashboard.estudiante.id}/avatar`, {
        avatar_gradient: gradientId,
      });

      if (user?.id) {
        await fetchDashboard(user.id);
      }
    } catch (error) {
      console.error('Error al actualizar avatar:', error);
      throw error;
    }
  };

  const handleWelcomeComplete = () => {
    sessionStorage.setItem('welcomeShown', 'true');
    setShowWelcome(false);
  };

  const handleRetry = () => {
    if (user?.id && user?.role === 'estudiante') {
      fetchDashboard(user.id);
    }
  };

  const isDashboardLoading = loading.dashboard;

  if (isDashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <LoadingSpinner size="lg" text="Cargando tu dashboard..." />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center min-h-screen bg-slate-950 p-6 text-center">
        <div className="text-6xl">😵‍💫</div>
        <h2 className="text-2xl font-bold text-white">No pudimos cargar tu información</h2>
        <p className="text-slate-300 max-w-md">
          {error ?? 'Reintenta nuevamente o avísanos si el problema persiste.'}
        </p>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:shadow-purple-500/40 transition-all"
        >
          Intentar otra vez
        </button>
      </div>
    );
  }

  const { estudiante, stats, nivel, proximasClases: proximasClasesBackend } = dashboard;

  // Mock de próximas clases si no hay ninguna
  const proximasClases = proximasClasesBackend && proximasClasesBackend.length > 0
    ? proximasClasesBackend
    : [
        {
          id: 'mock-clase-1',
          ruta_curricular: {
            nombre: 'Álgebra Básica',
            color: '#8B5CF6'
          },
          docente: {
            nombre: 'María',
            apellido: 'González'
          },
          fecha_hora_inicio: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // En 5 minutos
          duracion_minutos: 60
        }
      ];

  // Mock de tareas asignadas (luego conectar con backend)
  const tareasAsignadas = [
    {
      id: '1',
      titulo: 'Ejercicios de Álgebra',
      descripcion: 'Resolver ecuaciones lineales del tema 3',
      profesor: 'Prof. García',
      fechaLimite: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 días
      completada: false,
      rutaCurricular: { nombre: 'Álgebra', color: '#8B5CF6' },
    },
    {
      id: '2',
      titulo: 'Práctica de Geometría',
      descripcion: 'Identificar ángulos y triángulos',
      profesor: 'Prof. Martínez',
      fechaLimite: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 días
      completada: false,
      rutaCurricular: { nombre: 'Geometría', color: '#10B981' },
    },
  ];

  return (
    <div className="h-screen overflow-hidden bg-slate-950 p-4">
      <div className="h-full max-w-7xl mx-auto flex flex-col gap-4">

        {/* Header - TAMAÑOS ORIGINALES */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-400 flex-shrink-0"
        >
          <div className="p-4 relative overflow-hidden">
            {/* Patrón de fondo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />
            </div>

            <div className="relative z-10 flex items-center gap-4">
              {/* Avatar */}
              <button
                onClick={() => setAvatarSelectorOpen(true)}
                className="relative group"
              >
                <div className="absolute inset-0 bg-white rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative border-4 border-white shadow-xl rounded-full">
                  <AvatarWithInitials
                    nombre={estudiante.nombre}
                    apellido={estudiante.apellido}
                    gradientId={estudiante.avatar_gradient ?? 0}
                    size="lg"
                  />
                </div>
              </button>

              {/* Info del estudiante */}
              <div className="flex-1">
                <h2 className="text-4xl font-black text-white drop-shadow-lg">
                  ¡Hola, {estudiante.nombre}! 👋
                </h2>
                <p className="text-white/90 text-base font-semibold">
                  Equipo {estudiante.equipo?.nombre}
                </p>
              </div>

              {/* Badge de Nivel */}
              {nivel && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <div className="text-center">
                    <div className="text-xs text-gray-200 font-semibold">NIVEL {nivel.nivelActual}</div>
                    <div className="text-lg font-bold text-white">{nivel.nombre}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Barra de Progreso */}
            {nivel && (
              <div className="relative z-10 mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-white/90 font-bold">
                    💎 {stats.puntosToales} pts
                  </span>
                  {nivel.siguienteNivel && (
                    <span className="text-xs text-white/90 font-bold">
                      {nivel.puntosParaSiguienteNivel} pts para nivel {nivel.siguienteNivel.nivel}
                    </span>
                  )}
                </div>
                <div className="relative w-full h-3 bg-black/30 rounded-full overflow-hidden backdrop-blur-sm border border-white/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${nivel.porcentajeProgreso}%` }}
                    transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                  </motion.div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 divide-x divide-white/10 bg-black/20 backdrop-blur-sm">
            <div className="p-3 text-center hover:bg-white/5 transition-colors">
              <div className="text-2xl mb-0.5">💎</div>
              <div className="text-2xl font-black text-yellow-400">{stats.puntosToales}</div>
              <div className="text-[10px] text-gray-300 font-semibold">Puntos</div>
            </div>
            <div className="p-3 text-center hover:bg-white/5 transition-colors">
              <div className="text-2xl mb-0.5">📚</div>
              <div className="text-2xl font-black text-blue-400">{stats.clasesAsistidas}</div>
              <div className="text-[10px] text-gray-300 font-semibold">Clases</div>
            </div>
            <div className="p-3 text-center hover:bg-white/5 transition-colors">
              <div className="text-2xl mb-0.5">🔥</div>
              <div className="text-2xl font-black text-orange-400">{stats.racha}</div>
              <div className="text-[10px] text-gray-300 font-semibold">Racha</div>
            </div>
            <div className="p-3 text-center hover:bg-white/5 transition-colors">
              <div className="text-2xl mb-0.5">⭐</div>
              <div className="text-2xl font-black text-purple-400">{nivel?.nivelActual || 1}</div>
              <div className="text-[10px] text-gray-300 font-semibold">Nivel</div>
            </div>
          </div>
        </motion.div>

        {/* Grid 2x2 - Paleta consistente tipo consola */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto md:overflow-hidden min-h-0">

          {/* CARD 1: Próxima Clase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border-2 border-blue-500/50 p-4 hover:border-blue-500 transition-all h-full flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-white">Próxima Clase</h3>
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>

              {proximasClases && proximasClases.length > 0 ? (
                (() => {
                  const primeraClase = proximasClases[0];
                  if (!primeraClase) {
                    return (
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-400 text-sm text-center">No hay clases programadas</p>
                      </div>
                    );
                  }

                  const claseStatus = getClaseStatus(primeraClase);
                  const isActiva = claseStatus.tipo === 'activa';
                  const isProximamente = claseStatus.tipo === 'proximamente';
                  const isPendiente = claseStatus.tipo === 'pendiente';

                  // Obtener ruta curricular (compatible con ambos formatos)
                  const rutaCurricular = 'ruta_curricular' in primeraClase
                    ? primeraClase.ruta_curricular
                    : ('rutaCurricular' in primeraClase ? (primeraClase as any).rutaCurricular : null);

                  return (
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-3 mb-3 border border-blue-500/30 flex-1 overflow-hidden">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{
                              backgroundColor: rutaCurricular?.color || '#6366F1',
                            }}
                          />
                          <h4 className="font-bold text-white text-base truncate">
                            {rutaCurricular?.nombre || 'Sin ruta'}
                          </h4>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-gray-300 truncate">
                            <User className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">Prof. {primeraClase.docente.nombre}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">
                              {format(new Date(primeraClase.fecha_hora_inicio), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Botón Dinámico */}
                      <button
                        disabled={isPendiente || claseStatus.tipo === 'finalizada'}
                        onClick={() => {
                          if (isActiva || isProximamente) {
                            // TODO: Abrir sala de videollamada
                            window.open(`/clase/${primeraClase.id}/sala`, '_blank');
                          }
                        }}
                        className={`
                          w-full font-bold py-2.5 text-sm rounded-xl transition-all relative overflow-hidden
                          ${isActiva ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50 animate-pulse' : ''}
                          ${isProximamente ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/50' : ''}
                          ${isPendiente ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : ''}
                          ${claseStatus.tipo === 'en_progreso' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' : ''}
                          ${claseStatus.tipo === 'finalizada' ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : ''}
                        `}
                      >
                        {isActiva && (
                          <span className="absolute inset-0 bg-white/20 animate-ping" />
                        )}
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {isActiva && '🔴'} {claseStatus.texto}
                        </span>
                      </button>
                    </div>
                  );
                })()
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-400 text-sm text-center">No hay clases programadas</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* CARD 2: Mi Progreso */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border-2 border-orange-500/50 p-4 hover:border-orange-500 transition-all h-full flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-white">Mi Progreso</h3>
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>

              <div className="flex-1 grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-3 border border-orange-500/30 text-center">
                  <div className="text-3xl font-black text-yellow-400 mb-0.5">{stats.puntosToales}</div>
                  <div className="text-xs text-gray-300 font-semibold">Puntos Totales</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-3 border border-orange-500/30 text-center">
                  <div className="text-3xl font-black text-blue-400 mb-0.5">{stats.clasesAsistidas}</div>
                  <div className="text-xs text-gray-300 font-semibold">Clases Asistidas</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-3 border border-orange-500/30 text-center">
                  <div className="text-3xl font-black text-orange-400 mb-0.5">{stats.racha}</div>
                  <div className="text-xs text-gray-300 font-semibold">Racha 🔥</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-3 border border-orange-500/30 text-center">
                  <div className="text-3xl font-black text-purple-400 mb-0.5">{nivel?.nivelActual || 1}</div>
                  <div className="text-xs text-gray-300 font-semibold">Nivel Actual</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CARD 3: Estudiar (Juegos Educativos) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border-2 border-cyan-500/50 p-4 hover:border-cyan-500 transition-all h-full flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-white">Estudiar</h3>
                <BookOpen className="w-6 h-6 text-cyan-400" />
              </div>

              {/* Botón DESTACADO: Evaluación Diagnóstica */}
              <button
                onClick={() => window.location.href = '/estudiante/evaluacion'}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 text-sm rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all mb-3 border-2 border-orange-400 animate-pulse"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">🧠</span>
                  <span>Evaluación Diagnóstica</span>
                </div>
              </button>

              <div className="flex-1 space-y-2 overflow-y-auto min-h-0">
                <button
                  onClick={() => window.location.href = '/estudiante/cursos/calculo-mental'}
                  className="w-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-3 border border-blue-500/30 text-left hover:from-blue-500/30 hover:to-cyan-500/30 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">🧮</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">Cálculo Mental Rápido</p>
                      <p className="text-xs text-cyan-400">Resuelve operaciones • +10 pts</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => window.location.href = '/estudiante/cursos/algebra-challenge'}
                  className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-3 border border-purple-500/30 text-left hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">🎯</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">Álgebra Challenge</p>
                      <p className="text-xs text-purple-400">Despeja ecuaciones • +20 pts</p>
                    </div>
                  </div>
                </button>

                <button className="w-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-3 border border-green-500/30 text-left hover:from-green-500/30 hover:to-emerald-500/30 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">📐</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">Geometría Quiz</p>
                      <p className="text-xs text-green-400">Identifica figuras • +15 pts</p>
                    </div>
                  </div>
                </button>
              </div>

              <button
                onClick={() => window.location.href = '/estudiante/cursos'}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-2.5 text-sm rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all mt-3"
              >
                Ver Todos los Juegos 🎮
              </button>
            </div>
          </motion.div>

          {/* CARD 4: Tareas Asignadas (NUEVA) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border-2 border-pink-500/50 p-4 hover:border-pink-500 transition-all h-full flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-white">Tareas Asignadas</h3>
                <div className="relative">
                  <Bell className="w-6 h-6 text-pink-400" />
                  {tareasAsignadas.length > 0 && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-slate-900"
                    >
                      {tareasAsignadas.length}
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto min-h-0">
                {tareasAsignadas.length > 0 ? (
                  tareasAsignadas.map((tarea) => (
                    <div
                      key={tarea.id}
                      className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl p-3 border border-pink-500/30 hover:from-pink-500/30 hover:to-purple-500/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-2 mb-1.5">
                        <div
                          className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                          style={{ backgroundColor: tarea.rutaCurricular.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white mb-0.5 truncate">{tarea.titulo}</h4>
                          <p className="text-xs text-gray-400 line-clamp-1">{tarea.descripcion}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-400">{tarea.profesor}</span>
                        <span className="text-pink-400 font-semibold">
                          Vence: {format(tarea.fechaLimite, "d MMM", { locale: es })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="text-5xl mb-2">✅</div>
                    <p className="text-gray-400 text-sm">No hay tareas pendientes</p>
                    <p className="text-gray-500 text-xs">¡Estás al día!</p>
                  </div>
                )}
              </div>

              {tareasAsignadas.length > 0 && (
                <button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-2.5 text-sm rounded-xl hover:shadow-lg hover:shadow-pink-500/50 transition-all mt-3">
                  Ver Todas las Tareas
                </button>
              )}
            </div>
          </motion.div>

        </div>
      </div>

      {/* Modals */}
      {avatarSelectorOpen && (
        <AvatarSelector
          isOpen={avatarSelectorOpen}
          currentGradientId={estudiante.avatar_gradient ?? 0}
          nombre={estudiante.nombre}
          apellido={estudiante.apellido}
          onSelect={handleAvatarSelect}
          onClose={() => setAvatarSelectorOpen(false)}
        />
      )}

      {showWelcome && dashboard && nivel && (
        <WelcomeAnimation
          studentName={estudiante.nombre}
          nivel={nivel}
          onComplete={handleWelcomeComplete}
        />
      )}

      {showLevelUp && nivel && previousLevel && (
        <LevelUpAnimation
          nivelAnterior={{
            numero: previousLevel,
            nombre: `Nivel ${previousLevel}`,
            icono: nivel.icono,
          }}
          nivelNuevo={{
            numero: nivel.nivelActual,
            nombre: nivel.nombre,
            icono: nivel.icono,
            color: nivel.color,
          }}
          onComplete={() => setShowLevelUp(false)}
        />
      )}
    </div>
  );
}
