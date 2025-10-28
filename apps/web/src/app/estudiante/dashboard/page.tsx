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
                <div className="relative w-full h-4 bg-orange-900/40 rounded-full overflow-hidden border-2 border-yellow-400/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${nivel.porcentajeProgreso}%` }}
                    transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 rounded-full shadow-lg"
                    style={{
                      boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5), 0 2px 8px rgba(234, 179, 8, 0.6)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                  </motion.div>
                </div>
              </div>
            )}
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

        {/* Grid 2x2 - Paleta Consistente Tipo Consola */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto md:overflow-hidden min-h-0">

          {/* CARD 1: Próxima Clase - NARANJA CRASH */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-2xl border-4 border-orange-500 p-4 hover:border-orange-600 transition-all h-full flex flex-col overflow-hidden"
            style={{
              boxShadow: '0 8px 32px rgba(249, 115, 22, 0.3), inset 0 -3px 0 rgba(249, 115, 22, 0.2)'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-black text-orange-600">Tu Próxima Clase</h3>
              <Calendar className="w-6 h-6 text-orange-500" />
            </div>

            {proximasClases && proximasClases.length > 0 ? (
              (() => {
                const primeraClase = proximasClases[0];
                if (!primeraClase) {
                  return (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-gray-500 text-sm text-center">No hay clases programadas</p>
                    </div>
                  );
                }

                const claseStatus = getClaseStatus(primeraClase);
                const isActiva = claseStatus.tipo === 'activa';
                const isProximamente = claseStatus.tipo === 'proximamente';

                return (
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="bg-gradient-to-br from-orange-100 to-yellow-50 rounded-2xl p-4 mb-3 border-2 border-orange-300 flex-1 overflow-hidden shadow-inner">
                      <h4 className="font-black text-orange-700 text-xl mb-3">
                        Con {primeraClase.docente.nombre}
                      </h4>
                      <div className="flex items-center gap-2 text-orange-600 mb-2">
                        <Clock className="w-6 h-6 flex-shrink-0" />
                        <span className="text-2xl font-black">
                          {format(new Date(primeraClase.fecha_hora_inicio), "HH:mm", { locale: es })}
                        </span>
                      </div>
                      <p className="text-sm text-orange-600/80 font-semibold">
                        {format(new Date(primeraClase.fecha_hora_inicio), "EEEE d 'de' MMMM", { locale: es })}
                      </p>
                    </div>

                    {/* Botón CRASH STYLE */}
                    <button
                      disabled={!isActiva && !isProximamente}
                      onClick={() => {
                        if (isActiva || isProximamente) {
                          // Redirección externa a Google Meet/Zoom
                          window.open(`https://meet.google.com/clase-${primeraClase.id}`, '_blank');
                        }
                      }}
                      className={`
                        w-full font-black py-4 text-lg rounded-2xl transition-all relative overflow-hidden border-4
                        ${isActiva || isProximamente
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-600 shadow-xl hover:scale-105'
                          : 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'}
                      `}
                      style={isActiva || isProximamente ? {
                        boxShadow: '0 8px 24px rgba(34, 197, 94, 0.4), inset 0 -4px 0 rgba(0, 0, 0, 0.2)'
                      } : {}}
                    >
                      {isActiva && <span className="absolute inset-0 bg-white/30 animate-ping" />}
                      <span className="relative z-10 drop-shadow-lg">
                        {isActiva && '🔴 '}{claseStatus.texto}
                      </span>
                    </button>
                  </div>
                );
              })()
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="text-6xl mb-3">📅</div>
                <p className="text-gray-400 text-sm">No hay clases programadas</p>
              </div>
            )}
          </motion.div>

          {/* CARD 2: Mis Logros - AMARILLO DORADO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl border-4 border-yellow-500 p-4 hover:border-yellow-600 transition-all h-full flex flex-col overflow-hidden"
            style={{
              boxShadow: '0 8px 32px rgba(234, 179, 8, 0.3), inset 0 -3px 0 rgba(234, 179, 8, 0.2)'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-black text-yellow-700">Mis Logros</h3>
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>

            {logrosTop3.length > 0 ? (
              <div className="flex-1 space-y-2 overflow-y-auto min-h-0">
                {logrosTop3.map((logro, index) => (
                  <div
                    key={logro.id || index}
                    className="bg-gradient-to-r from-yellow-100 to-orange-50 rounded-xl p-3 border-2 border-yellow-400 hover:scale-105 transition-all shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{logro.icono || '🏆'}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-yellow-800 truncate">{logro.nombre}</h4>
                        <p className="text-xs text-orange-600 font-bold">+{logro.puntos} puntos</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="text-6xl mb-3">🏆</div>
                <p className="text-gray-400 text-sm">Aún no tienes logros</p>
                <p className="text-gray-500 text-xs">¡Asiste a clases para desbloquearlos!</p>
              </div>
            )}

            <button
              onClick={() => window.location.href = '/estudiante/logros'}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-2.5 text-sm rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all mt-3"
            >
              Ver Todos los Logros
            </button>
          </motion.div>

          {/* CARD 3: Juegos - CYAN */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900 rounded-2xl shadow-xl border border-cyan-500/30 p-4 hover:border-cyan-500/50 transition-all h-full flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-white">Juegos</h3>
              <Gamepad2 className="w-6 h-6 text-cyan-400" />
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto min-h-0">
              <button
                onClick={() => window.location.href = '/estudiante/cursos/calculo-mental'}
                className="w-full bg-cyan-500/10 rounded-xl p-3 border border-cyan-500/20 text-left hover:bg-cyan-500/15 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🧮</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">Cálculo Mental</p>
                    <p className="text-xs text-cyan-400">+10 pts</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => window.location.href = '/estudiante/cursos/algebra-challenge'}
                className="w-full bg-blue-500/10 rounded-xl p-3 border border-blue-500/20 text-left hover:bg-blue-500/15 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎯</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">Álgebra Challenge</p>
                    <p className="text-xs text-blue-400">+20 pts</p>
                  </div>
                </div>
              </button>

              <button
                className="w-full bg-cyan-500/10 rounded-xl p-3 border border-cyan-500/20 text-left hover:bg-cyan-500/15 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📐</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">Geometría Quiz</p>
                    <p className="text-xs text-cyan-400">+15 pts</p>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => window.location.href = '/estudiante/cursos'}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-2.5 text-sm rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all mt-3"
            >
              Ver Todos 🎮
            </button>
          </motion.div>

          {/* CARD 4: Mi Equipo - BLUE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900 rounded-2xl shadow-xl border border-blue-500/30 p-4 hover:border-blue-500/50 transition-all h-full flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-white">Mi Equipo</h3>
              <Users className="w-6 h-6 text-blue-400" />
            </div>

            {estudiante.equipo ? (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="bg-blue-500/10 rounded-xl p-3 mb-3 border border-blue-500/20">
                  <h4 className="font-bold text-white text-lg mb-1">
                    {estudiante.equipo.nombre}
                  </h4>
                  <p className="text-sm text-blue-300">Top 3 del equipo</p>
                </div>

                {equipoRanking && equipoRanking.length > 0 ? (
                  <div className="flex-1 space-y-2 overflow-y-auto min-h-0">
                    {equipoRanking.slice(0, 3).map((miembro, index) => (
                      <div
                        key={miembro.id}
                        className={`flex items-center gap-3 p-2 rounded-lg ${
                          miembro.id === estudiante.id
                            ? 'bg-blue-500/20 border border-blue-500/40'
                            : 'bg-blue-500/5'
                        }`}
                      >
                        <div className="text-lg font-bold text-blue-300 w-6">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {miembro.nombre}
                          </p>
                          <p className="text-xs text-blue-400">{miembro.puntos} pts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center">
                    <p className="text-gray-500 text-sm">Tu equipo está vacío</p>
                  </div>
                )}

                <button
                  onClick={() => window.location.href = '/estudiante/ranking'}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-2.5 text-sm rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all mt-3"
                >
                  Ver Ranking Completo
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="text-6xl mb-3">👥</div>
                <p className="text-gray-400 text-sm">No estás en un equipo</p>
              </div>
            )}
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
