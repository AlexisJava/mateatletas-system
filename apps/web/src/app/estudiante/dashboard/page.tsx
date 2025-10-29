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
import { Calendar, Trophy, BookOpen, Users, Clock, Gamepad2 } from 'lucide-react';
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
        return { tipo: 'proximamente', texto: `Comienza en ${minutosParaInicio} min`, color: 'cyan' };
      }
      return { tipo: 'pendiente', texto: 'Próximamente', color: 'gray' };
    } else if (now >= inicio && now < fin) {
      // Durante la clase
      if (minutosDesdeInicio <= 15) {
        return { tipo: 'activa', texto: '¡ENTRAR A CLASE!', color: 'cyan' };
      }
      return { tipo: 'en_progreso', texto: 'Clase en progreso', color: 'cyan' };
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-400 via-blue-300 to-cyan-300">
        <LoadingSpinner size="lg" text="Cargando tu dashboard..." />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center min-h-screen bg-gradient-to-br from-sky-400 via-blue-300 to-cyan-300 p-6 text-center">
        <div className="text-6xl">😵‍💫</div>
        <h2 className="text-2xl font-bold text-white drop-shadow-lg">No pudimos cargar tu información</h2>
        <p className="text-white/90 max-w-md drop-shadow">
          {error ?? 'Reintenta nuevamente o avísanos si el problema persiste.'}
        </p>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold shadow-lg hover:shadow-orange-500/50 transition-all"
        >
          Intentar otra vez
        </button>
      </div>
    );
  }

  const { estudiante, stats, nivel, proximasClases: proximasClasesBackend, logrosRecientes, equipoRanking } = dashboard;

  // Próximas clases con fallback
  const proximasClases = proximasClasesBackend && proximasClasesBackend.length > 0
    ? proximasClasesBackend
    : [];

  // Logros recientes (top 3)
  const logrosTop3 = logrosRecientes?.slice(0, 3) || [];

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-sky-400 via-blue-300 to-cyan-300 p-4">
      <div className="h-full max-w-7xl mx-auto flex flex-col gap-4">

        {/* Header - Saludo Grande CRASH STYLE */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 rounded-3xl shadow-2xl overflow-hidden border-4 border-yellow-400 flex-shrink-0"
          style={{
            boxShadow: '0 10px 40px rgba(249, 115, 22, 0.4), inset 0 -4px 0 rgba(0,0,0,0.2)'
          }}
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

              {/* Badge de Nivel - WUMPA STYLE */}
              {nivel && (
                <div className="bg-white rounded-2xl p-3 border-4 border-yellow-300 shadow-lg">
                  <div className="text-center">
                    <div className="text-xs text-orange-600 font-black">NIVEL {nivel.nivelActual}</div>
                    <div className="text-lg font-black text-orange-600">{nivel.nombre}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Estrellas ganadas HOY - Visual inmediato */}
            <div className="relative z-10 mt-3">
              <div className="flex justify-center items-center gap-2">
                <span className="text-2xl font-black text-white drop-shadow-lg">
                  Hoy ganaste:
                </span>
                <div className="flex gap-1">
                  {[...Array(Math.min(stats.racha || 0, 5))].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.1 * i, type: "spring", stiffness: 200 }}
                      className="text-4xl drop-shadow-lg"
                    >
                      ⭐
                    </motion.span>
                  ))}
                  {[...Array(Math.max(0, 5 - (stats.racha || 0)))].map((_, i) => (
                    <span key={`empty-${i}`} className="text-4xl opacity-30">⭐</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid - CRASH POWER-UPS */}
          <div className="grid grid-cols-4 divide-x divide-orange-600/30 bg-gradient-to-r from-orange-600/20 via-yellow-600/20 to-orange-600/20 backdrop-blur-sm border-t-4 border-orange-600/30">
            <div className="p-3 text-center hover:bg-white/10 transition-colors">
              <div className="text-3xl mb-0.5">💎</div>
              <div className="text-2xl font-black text-white drop-shadow-lg">{stats.puntosToales}</div>
              <div className="text-[10px] text-white/90 font-black">PUNTOS</div>
            </div>
            <div className="p-3 text-center hover:bg-white/10 transition-colors">
              <div className="text-3xl mb-0.5">📚</div>
              <div className="text-2xl font-black text-white drop-shadow-lg">{stats.clasesAsistidas}</div>
              <div className="text-[10px] text-white/90 font-black">CLASES</div>
            </div>
            <div className="p-3 text-center hover:bg-white/10 transition-colors">
              <div className="text-3xl mb-0.5">🔥</div>
              <div className="text-2xl font-black text-white drop-shadow-lg">{stats.racha}</div>
              <div className="text-[10px] text-white/90 font-black">RACHA</div>
            </div>
            <div className="p-3 text-center hover:bg-white/10 transition-colors">
              <div className="text-3xl mb-0.5">⭐</div>
              <div className="text-2xl font-black text-white drop-shadow-lg">{nivel?.nivelActual || 1}</div>
              <div className="text-[10px] text-white/90 font-black">NIVEL</div>
            </div>
          </div>
        </motion.div>

        {/* Grid 2 CARDS GIGANTES - SIMETRÍA PERFECTA */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto md:overflow-hidden min-h-0">

          {/* CARD 1: JUGAR - CRASH STYLE IGUAL QUE HEADER */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
            className="bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 rounded-3xl shadow-2xl border-4 border-yellow-400 p-6 transition-all h-full flex flex-col overflow-hidden"
            style={{
              boxShadow: '0 10px 40px rgba(249, 115, 22, 0.4), inset 0 -4px 0 rgba(0,0,0,0.2)'
            }}
          >
            {/* Patrón de fondo igual que header */}
            <div className="absolute inset-0 opacity-10 rounded-3xl overflow-hidden">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />
            </div>

            <div className="relative z-10 flex items-center justify-between mb-4">
              <h3 className="text-3xl font-black text-white drop-shadow-lg">Jugar</h3>
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>

            {/* 3 JUEGOS - Badges blancos igual que nivel */}
            <div className="relative z-10 flex-1 space-y-3 overflow-y-auto min-h-0">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.location.href = '/estudiante/cursos/calculo-mental'}
                className="w-full bg-white rounded-2xl p-4 border-4 border-yellow-300 shadow-lg text-left transition-all"
              >
                <div className="flex items-center gap-4">
                  <BookOpen className="w-10 h-10 text-orange-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-black text-orange-800">Cálculo Mental</p>
                    <p className="text-sm text-orange-600 font-bold">+10 pts</p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.location.href = '/estudiante/cursos/algebra-challenge'}
                className="w-full bg-white rounded-2xl p-4 border-4 border-yellow-300 shadow-lg text-left transition-all"
              >
                <div className="flex items-center gap-4">
                  <Trophy className="w-10 h-10 text-orange-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-black text-orange-800">Álgebra Challenge</p>
                    <p className="text-sm text-orange-600 font-bold">+20 pts</p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-white rounded-2xl p-4 border-4 border-yellow-300 shadow-lg text-left transition-all"
              >
                <div className="flex items-center gap-4">
                  <Gamepad2 className="w-10 h-10 text-orange-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-black text-orange-800">Geometría Quiz</p>
                    <p className="text-sm text-orange-600 font-bold">+15 pts</p>
                  </div>
                </div>
              </motion.button>
            </div>

            {/* BOTÓN - Badge blanco igual que los juegos */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => window.location.href = '/estudiante/cursos'}
              className="relative z-10 w-full bg-white rounded-2xl py-4 px-6 border-4 border-yellow-300 shadow-lg mt-4 transition-all"
            >
              <span className="text-xl font-black text-orange-600">Ver todos los juegos</span>
            </motion.button>
          </motion.div>

          {/* CARD 2: CRECER - CRASH STYLE IGUAL QUE HEADER */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 rounded-3xl shadow-2xl border-4 border-yellow-400 p-6 transition-all h-full flex flex-col overflow-hidden"
            style={{
              boxShadow: '0 10px 40px rgba(249, 115, 22, 0.4), inset 0 -4px 0 rgba(0,0,0,0.2)'
            }}
          >
            {/* Patrón de fondo igual que header */}
            <div className="absolute inset-0 opacity-10 rounded-3xl overflow-hidden">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />
            </div>

            <div className="relative z-10 flex items-center justify-between mb-4">
              <h3 className="text-3xl font-black text-white drop-shadow-lg">Crecer</h3>
              <Trophy className="w-8 h-8 text-white" />
            </div>

            {/* MIS LOGROS - Badges blancos */}
            <div className="relative z-10 mb-4">
              <h4 className="text-lg font-bold text-white/90 mb-2">Mis Logros</h4>
              {logrosTop3.length > 0 ? (
                <div className="space-y-2">
                  {logrosTop3.map((logro, index) => (
                    <motion.div
                      key={logro.id || index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                      className="bg-white rounded-2xl p-3 border-4 border-yellow-300 shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-orange-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-base font-black text-orange-800 truncate">{logro.nombre}</h5>
                          <p className="text-xs text-orange-600 font-bold">+{logro.puntos} puntos</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-4 border-4 border-yellow-300 shadow-lg text-center">
                  <Trophy className="w-12 h-12 text-orange-600 mx-auto mb-1" />
                  <p className="text-orange-600 text-sm font-bold">Juega para ganar logros</p>
                </div>
              )}
            </div>

            {/* PROGRESO - Badge blanco */}
            <div className="relative z-10 mb-4">
              <h4 className="text-lg font-bold text-white/90 mb-2">Mi Progreso</h4>
              <div className="bg-white rounded-2xl p-4 border-4 border-yellow-300 shadow-lg">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                    <div className="text-2xl font-black text-orange-700">{stats.puntosToales}</div>
                    <div className="text-xs text-orange-600 font-bold">Puntos</div>
                  </div>
                  <div>
                    <BookOpen className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                    <div className="text-2xl font-black text-orange-700">{stats.clasesTotales}</div>
                    <div className="text-xs text-orange-600 font-bold">Clases</div>
                  </div>
                  <div>
                    <Trophy className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                    <div className="text-2xl font-black text-orange-700">{stats.racha}</div>
                    <div className="text-xs text-orange-600 font-bold">Racha</div>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTÓN - Badge blanco */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => window.location.href = '/estudiante/logros'}
              className="relative z-10 w-full bg-white rounded-2xl py-4 px-6 border-4 border-yellow-300 shadow-lg mt-auto transition-all"
            >
              <span className="text-xl font-black text-orange-600">Ver todos los logros</span>
            </motion.button>
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
