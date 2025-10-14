'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useGamificacionStore } from '@/store/gamificacion.store';
import { useAuthStore } from '@/store/auth.store';
import { LoadingSpinner, LevelUpAnimation, AchievementToast, GlowingBadge } from '@/components/effects';

export default function EstudianteDashboard() {
  const { dashboard, fetchDashboard, isLoading } = useGamificacionStore();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Obtener dashboard del estudiante actual
    if (user?.id && user?.role === 'estudiante') {
      fetchDashboard(user.id);
    }

    // Demo: Mostrar achievement después de 3 segundos
    const achievementTimer = setTimeout(() => {
      setShowAchievement(true);
    }, 3000);

    return () => clearTimeout(achievementTimer);
  }, [user?.id]);

  // Datos de ejemplo mientras conectamos con backend
  const mockData = {
    estudiante: {
      nombre: 'Juan',
      apellido: 'Pérez',
      equipo: { nombre: 'ASTROS', color: '#F59E0B' },
    },
    stats: {
      puntosToales: 1250,
      clasesAsistidas: 23,
      clasesTotales: 30,
      racha: 7,
    },
    proximasClases: [
      {
        id: '1',
        ruta_curricular: { nombre: 'Geometría', color: '#10B981' },
        docente: { nombre: 'María', apellido: 'González' },
        fecha_hora_inicio: new Date(Date.now() + 86400000), // Mañana
      },
    ],
    equipoRanking: [
      { nombre: 'María', apellido: 'López', puntos: 1890, id: '1' },
      { nombre: 'Juan', apellido: 'Pérez', puntos: 1250, id: '2' },
      { nombre: 'Ana', apellido: 'Martínez', puntos: 1100, id: '3' },
    ],
  };

  const data = dashboard || mockData;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Cargando tu dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Level Up Animation */}
      <LevelUpAnimation
        show={showLevelUp}
        level={user?.nivel_actual || 5}
        onComplete={() => setShowLevelUp(false)}
      />

      {/* Achievement Toast */}
      <AchievementToast
        show={showAchievement}
        title="¡Primera Clase Completada!"
        description="Has asistido a tu primera clase"
        icon="🎓"
        points={50}
        onClose={() => setShowAchievement(false)}
      />
      {/* Header con saludo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-r from-purple-800/50 to-blue-800/50 backdrop-blur-xl rounded-2xl p-8 border border-cyan-400/30 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 animate-pulse" />
        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl font-bold text-white mb-2"
          >
            ¡Hola, {data.estudiante.nombre}! 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-cyan-300 text-lg"
          >
            Equipo:{' '}
            <span
              className="font-bold"
              style={{ color: data.estudiante.equipo.color }}
            >
              {data.estudiante.equipo.nombre}
            </span>
          </motion.p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Puntos Totales */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="relative bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-6 border border-yellow-400/30 shadow-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-orange-400/5 animate-pulse" />
          <div className="relative z-10">
            <div className="text-yellow-400 text-4xl mb-2">⭐</div>
            <div className="text-sm text-yellow-300 mb-1">Puntos Totales</div>
            <div className="text-4xl font-bold text-white">
              {mounted && (
                <CountUp
                  end={data.stats.puntosToales}
                  duration={2}
                  separator=","
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* Clases Asistidas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="relative bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-6 border border-green-400/30 shadow-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-emerald-400/5 animate-pulse" />
          <div className="relative z-10">
            <div className="text-green-400 text-4xl mb-2">📚</div>
            <div className="text-sm text-green-300 mb-1">Clases Asistidas</div>
            <div className="text-4xl font-bold text-white">
              {mounted && (
                <CountUp end={data.stats.clasesAsistidas} duration={2} />
              )}
              <span className="text-xl text-green-300">
                /{data.stats.clasesTotales}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="mt-3 w-full bg-green-900/30 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(data.stats.clasesAsistidas / data.stats.clasesTotales) * 100}%`,
                }}
                transition={{ delay: 0.5, duration: 1.5, ease: 'easeOut' }}
                className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Racha */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="relative bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-6 border border-red-400/30 shadow-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-400/5 to-orange-400/5 animate-pulse" />
          <div className="relative z-10">
            <div className="text-red-400 text-4xl mb-2">🔥</div>
            <div className="text-sm text-red-300 mb-1">Racha Actual</div>
            <div className="text-4xl font-bold text-white">
              {mounted && <CountUp end={data.stats.racha} duration={2} />}
              <span className="text-xl text-red-300"> días</span>
            </div>
          </div>
        </motion.div>

        {/* Posición en Equipo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="relative bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/30 shadow-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-pink-400/5 animate-pulse" />
          <div className="relative z-10">
            <div className="text-purple-400 text-4xl mb-2">🏆</div>
            <div className="text-sm text-purple-300 mb-1">En tu Equipo</div>
            <div className="text-4xl font-bold text-white">
              #{data.equipoRanking.findIndex((e) => e.id === '2') + 1}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Próximas Clases */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="bg-gradient-to-br from-blue-800/30 to-purple-800/30 backdrop-blur-xl rounded-2xl p-6 border border-blue-400/30 shadow-xl"
      >
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📅</span> Próximas Clases
        </h2>

        {data.proximasClases.length === 0 ? (
          <p className="text-cyan-300">No tenés clases programadas próximamente</p>
        ) : (
          <div className="space-y-3">
            {data.proximasClases.map((clase, index) => (
              <motion.div
                key={clase.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-cyan-400/20 hover:border-cyan-400/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: clase.ruta_curricular.color }}
                    />
                    <div>
                      <p className="text-white font-semibold">
                        {clase.ruta_curricular.nombre}
                      </p>
                      <p className="text-sm text-cyan-300">
                        Prof. {clase.docente.nombre} {clase.docente.apellido}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-cyan-400">Mañana</p>
                    <p className="text-xs text-cyan-300">16:00 hs</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Ranking Rápido del Equipo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="bg-gradient-to-br from-purple-800/30 to-pink-800/30 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/30 shadow-xl"
      >
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span>👥</span> Top 3 de tu Equipo
        </h2>

        <div className="space-y-3">
          {data.equipoRanking.slice(0, 3).map((estudiante, index) => {
            const medals = ['🥇', '🥈', '🥉'];
            const gradients = [
              'from-yellow-500/20 to-orange-500/20',
              'from-gray-400/20 to-gray-500/20',
              'from-orange-700/20 to-yellow-700/20',
            ];

            return (
              <motion.div
                key={estudiante.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className={`bg-gradient-to-r ${gradients[index]} backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/30 transition-all ${
                  estudiante.id === '2' ? 'ring-2 ring-cyan-400' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{medals[index]}</span>
                    <div>
                      <p className="text-white font-semibold">
                        {estudiante.nombre} {estudiante.apellido}
                        {estudiante.id === '2' && (
                          <span className="ml-2 text-xs bg-cyan-500 px-2 py-1 rounded-full">
                            Vos
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-cyan-300">{estudiante.puntos} pts</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.a
          href="/estudiante/ranking"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 block text-center py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-semibold transition-all"
        >
          Ver Ranking Completo →
        </motion.a>
      </motion.div>
    </div>
  );
}
