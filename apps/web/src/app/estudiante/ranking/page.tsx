'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGamificacionStore } from '@/store/gamificacion.store';
import { useAuthStore } from '@/store/auth.store';

export default function RankingPage() {
  const { ranking, fetchRanking, isLoading } = useGamificacionStore();
  const { user } = useAuthStore();

  useEffect(() => {
    // Obtener ranking del estudiante actual
    if (user?.id && user?.role === 'estudiante') {
      fetchRanking(user.id);
    }
  }, [user?.id]);

  // Mock data
  const mockRanking = {
    equipoActual: { nombre: 'ASTROS', color: '#F59E0B' },
    posicionEquipo: 2,
    posicionGlobal: 15,
    rankingEquipo: [
      {
        id: '1',
        nombre: 'María',
        apellido: 'López',
        puntos: 1890,
        avatar: null,
      },
      {
        id: '2',
        nombre: 'Juan',
        apellido: 'Pérez',
        puntos: 1250,
        avatar: null,
      },
      {
        id: '3',
        nombre: 'Ana',
        apellido: 'Martínez',
        puntos: 1100,
        avatar: null,
      },
      {
        id: '4',
        nombre: 'Carlos',
        apellido: 'Ruiz',
        puntos: 980,
        avatar: null,
      },
      {
        id: '5',
        nombre: 'Sofía',
        apellido: 'González',
        puntos: 850,
        avatar: null,
      },
    ],
    rankingGlobal: [
      {
        id: '1',
        nombre: 'Lucía',
        apellido: 'Fernández',
        puntos: 2450,
        equipo: { nombre: 'COMETAS', color: '#3B82F6' },
      },
      {
        id: '2',
        nombre: 'Diego',
        apellido: 'Ramírez',
        puntos: 2100,
        equipo: { nombre: 'METEOROS', color: '#EF4444' },
      },
      { id: '3', nombre: 'María', apellido: 'López', puntos: 1890, equipo: { nombre: 'ASTROS', color: '#F59E0B' } },
    ],
  };

  const data = ranking || mockRanking;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const medals = ['🥇', '🥈', '🥉'];
  const podiumColors = [
    'from-yellow-500 to-orange-500',
    'from-gray-400 to-gray-600',
    'from-orange-600 to-yellow-700',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-800/50 to-blue-800/50 backdrop-blur-xl rounded-2xl p-8 border border-cyan-400/30 shadow-2xl"
      >
        <h1 className="text-4xl font-bold text-white mb-4">📊 Rankings</h1>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-4 border border-cyan-400/20">
            <p className="text-cyan-300 text-sm mb-1">Tu Equipo</p>
            <p
              className="text-2xl font-bold"
              style={{ color: data.equipoActual.color }}
            >
              {data.equipoActual.nombre}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-cyan-400/20">
            <p className="text-cyan-300 text-sm mb-1">Tu Posición</p>
            <p className="text-2xl font-bold text-white">
              #{data.posicionEquipo} en equipo
            </p>
          </div>
        </div>
      </motion.div>

      {/* Ranking del Equipo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 backdrop-blur-xl rounded-2xl p-6 border border-purple-400/30 shadow-xl"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span>🏆</span> Ranking de {data.equipoActual.nombre}
        </h2>

        <div className="space-y-3">
          {data.rankingEquipo.map((estudiante, index) => {
            const isCurrentUser = estudiante.id === '2';
            const isPodium = index < 3;

            return (
              <motion.div
                key={estudiante.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className={`relative rounded-xl p-4 border-2 transition-all ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400 shadow-lg shadow-cyan-500/30'
                    : isPodium
                      ? `bg-gradient-to-r ${podiumColors[index]}/20 border-${medals[index] === '🥇' ? 'yellow' : medals[index] === '🥈' ? 'gray' : 'orange'}-400/30`
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                {isCurrentUser && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 animate-pulse rounded-xl" />
                )}

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Posición */}
                    <div className="text-3xl font-bold">
                      {isPodium ? medals[index] : `#${index + 1}`}
                    </div>

                    {/* Avatar */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                        isCurrentUser
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-500 ring-2 ring-cyan-400'
                          : 'bg-gradient-to-br from-purple-500 to-pink-500'
                      }`}
                    >
                      {estudiante.nombre.charAt(0)}
                    </div>

                    {/* Info */}
                    <div>
                      <p className="text-white font-semibold text-lg">
                        {estudiante.nombre} {estudiante.apellido}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-cyan-500 px-2 py-1 rounded-full">
                            VOS
                          </span>
                        )}
                      </p>
                      <p className="text-cyan-300 text-sm">{estudiante.puntos} puntos</p>
                    </div>
                  </div>

                  {/* Barra de progreso relativo */}
                  <div className="hidden md:block w-32">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(estudiante.puntos / data.rankingEquipo[0].puntos) * 100}%`,
                        }}
                        transition={{ delay: 0.2 + index * 0.1, duration: 1 }}
                        className={`h-full ${
                          isCurrentUser
                            ? 'bg-gradient-to-r from-cyan-400 to-blue-400'
                            : 'bg-gradient-to-r from-purple-400 to-pink-400'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Podio Global */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-yellow-800/30 to-orange-800/30 backdrop-blur-xl rounded-2xl p-6 border border-yellow-400/30 shadow-xl"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span>👑</span> Top 3 Global
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.rankingGlobal.slice(0, 3).map((estudiante, index) => {
            const heights = ['h-64', 'h-56', 'h-48'];
            const orders = [1, 0, 2]; // Para el efecto de podio (2do, 1ro, 3ro)

            return (
              <motion.div
                key={estudiante.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + orders[index] * 0.15, duration: 0.6 }}
                style={{ order: orders[index] }}
                className={`relative ${heights[index]} bg-gradient-to-br ${podiumColors[index]}/30 backdrop-blur-xl rounded-2xl p-6 border-2 border-${medals[index] === '🥇' ? 'yellow' : medals[index] === '🥈' ? 'gray' : 'orange'}-400/50 shadow-2xl flex flex-col items-center justify-end`}
              >
                {/* Medal floating */}
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-8 text-6xl"
                >
                  {medals[index]}
                </motion.div>

                {/* Avatar */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-3 border-4"
                  style={{
                    background: `linear-gradient(to bottom right, ${estudiante.equipo?.color || '#8B5CF6'}, #EC4899)`,
                    borderColor: estudiante.equipo?.color || '#8B5CF6',
                  }}
                >
                  {estudiante.nombre.charAt(0)}
                </div>

                {/* Info */}
                <p className="text-white font-bold text-lg text-center">
                  {estudiante.nombre} {estudiante.apellido}
                </p>
                <p
                  className="text-sm font-semibold mb-2"
                  style={{ color: estudiante.equipo?.color }}
                >
                  {estudiante.equipo?.nombre}
                </p>
                <div className="bg-black/30 px-4 py-2 rounded-full">
                  <p className="text-yellow-300 font-bold">{estudiante.puntos} pts</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
