'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGamificacionStore } from '@/store/gamificacion.store';
import { useAuthStore } from '@/store/auth.store';
import { Crown, Users, TrendingUp, Trophy } from 'lucide-react';
import type { Ranking } from '@/lib/api/gamificacion.api';

export default function RankingPage() {
  const { ranking, fetchRanking, isLoading } = useGamificacionStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id && user?.role === 'estudiante') {
      fetchRanking(user.id);
    }
  }, [user?.id]);

  // Mock data
  const mockRanking: Ranking = {
    equipoActual: { id: 'equipo-fenix', nombre: 'Fénix', color: '#F59E0B' },
    posicionEquipo: 2,
    posicionGlobal: 15,
    rankingEquipo: [
      {
        id: '1',
        nombre: 'María',
        apellido: 'López',
        puntos: 1890,
        avatar: 'avataaars',
      },
      {
        id: '2',
        nombre: 'Ana',
        apellido: 'García',
        puntos: 1250,
        avatar: 'avataaars',
      },
      {
        id: '3',
        nombre: 'Carlos',
        apellido: 'Martínez',
        puntos: 1100,
        avatar: null,
      },
      {
        id: '4',
        nombre: 'Juan',
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
        equipo: { id: 'equipo-cometas', nombre: 'Cometas', color: '#3B82F6' },
      },
      {
        id: '2',
        nombre: 'Diego',
        apellido: 'Ramírez',
        puntos: 2100,
        equipo: { id: 'equipo-meteoros', nombre: 'Meteoros', color: '#EF4444' },
      },
      {
        id: '3',
        nombre: 'María',
        apellido: 'López',
        puntos: 1890,
        equipo: { id: 'equipo-fenix', nombre: 'Fénix', color: '#F59E0B' },
      },
    ],
  };

  const data: Ranking = ranking ?? mockRanking;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const medals = ['🥇', '🥈', '🥉'];
  const podiumColors = [
    { bg: 'from-yellow-500 to-orange-500', border: 'yellow-500' },
    { bg: 'from-gray-400 to-gray-500', border: 'gray-400' },
    { bg: 'from-orange-600 to-yellow-700', border: 'orange-600' },
  ];

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="h-full max-w-7xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl shadow-2xl border-2 border-purple-400 p-6 flex-shrink-0"
        >
          <div className="flex items-center gap-4 mb-4">
            <Trophy className="w-14 h-14 text-white" />
            <div>
              <h1 className="text-4xl font-black text-white drop-shadow-lg">Rankings</h1>
              <p className="text-white/90 text-lg font-semibold">Compite con tus compañeros</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 rounded-xl p-4 border border-white/20">
              <p className="text-white/80 text-sm mb-1 font-semibold">Tu Equipo</p>
              <p
                className="text-2xl font-black text-white"
                style={{ color: data.equipoActual?.color ?? data.equipoActual?.color_primario ?? '#3B82F6' }}
              >
                {data.equipoActual?.nombre ?? 'Sin equipo'}
              </p>
            </div>
            <div className="bg-black/20 rounded-xl p-4 border border-white/20">
              <p className="text-white/80 text-sm mb-1 font-semibold">Tu Posición</p>
              <p className="text-2xl font-black text-white">
                #{data.posicionEquipo} en equipo
              </p>
            </div>
          </div>
        </motion.div>

        {/* Grid - Responsive: 1 col stacked mobile, 2 cols side-by-side desktop */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto lg:overflow-hidden">
          {/* Ranking del Equipo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative flex flex-col"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-xl opacity-30" />
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl border-2 border-purple-500/50 p-6 flex flex-col h-full">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Users className="w-7 h-7 text-purple-400" />
                Ranking de {data.equipoActual?.nombre ?? 'Tu Equipo'}
              </h2>

              <div className="flex-1 space-y-4 overflow-hidden">
                {data.rankingEquipo.slice(0, 5).map((estudiante, index) => {
                  const isCurrentUser = estudiante.id === user?.id;
                  const isPodium = index < 3;

                  return (
                    <motion.div
                      key={estudiante.id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.5 }}
                      whileHover={{ scale: 1.03, x: 8 }}
                      className={`relative rounded-2xl p-5 border-2 transition-all ${
                        isCurrentUser
                          ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-500/50 shadow-lg shadow-purple-500/30'
                          : isPodium
                            ? 'bg-white/5 border-yellow-500/40'
                            : 'bg-white/5 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      {isCurrentUser && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-pink-400/5 animate-pulse rounded-2xl" />
                      )}

                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Posición */}
                          <div className={`text-4xl font-bold ${isPodium ? '' : 'text-gray-400'}`}>
                            {isPodium ? medals[index] : `#${index + 1}`}
                          </div>

                          {/* Avatar */}
                          <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden ${
                              isCurrentUser ? 'ring-4 ring-purple-500' : ''
                            }`}
                          >
                            {estudiante.avatar_url ? (
                              <img
                                src={`https://api.dicebear.com/7.x/${estudiante.avatar_url}/svg?seed=${estudiante.id}`}
                                alt="Avatar"
                                className="w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                                {estudiante.nombre.charAt(0)}
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div>
                            <p className="text-white font-bold text-lg">
                              {estudiante.nombre} {estudiante.apellido}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                                  Tú
                                </span>
                              )}
                            </p>
                            <p className="text-purple-300 text-sm flex items-center gap-1 font-semibold">
                              <TrendingUp className="w-4 h-4" />
                              {estudiante.puntos} puntos
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Podio Global */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative flex flex-col"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl blur-xl opacity-30" />
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl border-2 border-yellow-500/50 p-6 flex flex-col h-full">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Crown className="w-7 h-7 text-yellow-400" />
                Top 3 Global
              </h2>

              <div className="flex-1 grid grid-cols-3 gap-4 items-end">
                {data.rankingGlobal.slice(0, 3).map((estudiante, index) => {
                  const heights = ['h-full', 'h-5/6', 'h-4/6'];
                  const orders = [1, 0, 2]; // Para el efecto de podio (2do, 1ro, 3ro)
                  const podium = podiumColors[index];

                  return (
                    <motion.div
                      key={estudiante.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + orders[index] * 0.15, duration: 0.6 }}
                      style={{ order: orders[index] }}
                      className="relative group h-full flex items-end"
                    >
                      {/* Glow effect */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${podium.bg} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity`} />

                      {/* Card */}
                      <div
                        className={`relative w-full ${heights[index]} bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border-2 border-${podium.border}/50 shadow-2xl flex flex-col items-center justify-end`}
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
                          className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-3 border-4 shadow-lg"
                          style={{
                            background: `linear-gradient(to bottom right, ${estudiante.equipo?.color || '#8B5CF6'}, #EC4899)`,
                            borderColor: estudiante.equipo?.color || '#8B5CF6',
                          }}
                        >
                          {estudiante.nombre.charAt(0)}
                        </div>

                        {/* Info */}
                        <p className="text-white font-bold text-base text-center">
                          {estudiante.nombre}
                        </p>
                        <p
                          className="text-sm font-semibold mb-3"
                          style={{ color: estudiante.equipo?.color }}
                        >
                          {estudiante.equipo?.nombre}
                        </p>
                        <div className="bg-black/40 px-4 py-2 rounded-full border border-yellow-500/30">
                          <p className="text-yellow-300 font-bold text-sm flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {estudiante.puntos} pts
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
