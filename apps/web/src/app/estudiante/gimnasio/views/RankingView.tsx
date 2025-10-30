'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, Medal, Crown, TrendingUp, Users } from 'lucide-react';
import { gamificacionApi, type Ranking, type RankingEquipoEntry, type RankingGlobalEntry } from '@/lib/api/gamificacion.api';
import { useOverlayStack } from '../contexts/OverlayStackProvider';

interface RankingViewProps {
  estudiante: {
    id: string;
    nombre: string;
    apellido?: string;
  };
}

type Tab = 'equipo' | 'global';

export function RankingView({ estudiante }: RankingViewProps) {
  const { popOverlay } = useOverlayStack();
  const [tab, setTab] = useState<Tab>('equipo');
  const [ranking, setRanking] = useState<Ranking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarRanking = async () => {
      try {
        setLoading(true);
        const data = await gamificacionApi.getRanking(estudiante.id);
        setRanking(data);
      } catch (error) {
        console.error('Error cargando ranking:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarRanking();
  }, [estudiante.id]);

  const miPosicionEquipo = ranking?.ranking_equipo?.findIndex(
    (m) => m.estudiante_id === estudiante.id
  ) ?? -1;

  const miPosicionGlobal = ranking?.ranking_global?.findIndex(
    (m) => m.estudiante_id === estudiante.id
  ) ?? -1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <div className="relative flex items-center justify-between p-4 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">RANKING</h1>
            <p className="text-sm text-white/60">
              {tab === 'equipo' ? 'Compite con tu equipo' : 'Ranking global de todos los estudiantes'}
            </p>
          </div>
        </div>
        <button
          onClick={popOverlay}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-4 bg-black/10">
        <button
          onClick={() => setTab('equipo')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-all ${
            tab === 'equipo'
              ? 'bg-white text-purple-900 shadow-lg scale-105'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <Users className="w-5 h-5" />
          Mi Equipo
        </button>
        <button
          onClick={() => setTab('global')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-all ${
            tab === 'global'
              ? 'bg-white text-purple-900 shadow-lg scale-105'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          Global
        </button>
      </div>

      {/* Mi Posición */}
      {!loading && ranking && (
        <div className="mx-4 mt-2 p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">Tu Posición</p>
              <p className="text-2xl font-black text-white">
                #{tab === 'equipo' ? miPosicionEquipo + 1 : miPosicionGlobal + 1}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/60 uppercase tracking-wide">Tus Puntos</p>
              <p className="text-2xl font-black text-white">
                {tab === 'equipo'
                  ? ranking.ranking_equipo?.[miPosicionEquipo]?.puntos_totales || 0
                  : ranking.ranking_global?.[miPosicionGlobal]?.puntos_totales || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Ranking */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-lg">Cargando ranking...</div>
          </div>
        ) : (
          <div className="space-y-2 pb-20">
            {tab === 'equipo' && ranking?.ranking_equipo?.map((entry, index) => (
              <RankingCard
                key={entry.estudiante_id}
                posicion={index + 1}
                nombre={entry.estudiante_nombre}
                apellido={entry.estudiante_apellido}
                puntos={entry.puntos_totales}
                esYo={entry.estudiante_id === estudiante.id}
              />
            ))}
            {tab === 'global' && ranking?.ranking_global?.map((entry, index) => (
              <RankingCard
                key={entry.estudiante_id}
                posicion={index + 1}
                nombre={entry.estudiante_nombre}
                apellido={entry.estudiante_apellido}
                puntos={entry.puntos_totales}
                equipo={entry.equipo_nombre}
                esYo={entry.estudiante_id === estudiante.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface RankingCardProps {
  posicion: number;
  nombre: string;
  apellido?: string;
  puntos: number;
  equipo?: string;
  esYo: boolean;
}

function RankingCard({ posicion, nombre, apellido, puntos, equipo, esYo }: RankingCardProps) {
  const getMedalIcon = (pos: number) => {
    if (pos === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (pos === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (pos === 3) return <Medal className="w-6 h-6 text-orange-400" />;
    return null;
  };

  const getBgColor = (pos: number) => {
    if (pos === 1) return 'from-yellow-500/20 to-orange-500/20 border-yellow-400/50';
    if (pos === 2) return 'from-gray-400/20 to-gray-500/20 border-gray-400/50';
    if (pos === 3) return 'from-orange-400/20 to-orange-600/20 border-orange-400/50';
    return 'from-white/5 to-white/10 border-white/10';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: posicion * 0.05 }}
      className={`relative p-4 rounded-xl bg-gradient-to-r ${getBgColor(posicion)} border-2 ${
        esYo ? 'ring-4 ring-cyan-400/50 scale-105' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Posición */}
          <div className="flex items-center justify-center w-12 h-12">
            {getMedalIcon(posicion) || (
              <span className="text-2xl font-black text-white/70">#{posicion}</span>
            )}
          </div>

          {/* Nombre */}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-white">
                {nombre} {apellido || ''}
              </p>
              {esYo && (
                <span className="px-2 py-0.5 text-xs font-bold bg-cyan-400 text-cyan-900 rounded-full">
                  TÚ
                </span>
              )}
            </div>
            {equipo && (
              <p className="text-sm text-white/60">Equipo: {equipo}</p>
            )}
          </div>
        </div>

        {/* Puntos */}
        <div className="text-right">
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-xl font-black text-white">{puntos}</span>
          </div>
          <p className="text-xs text-white/60">puntos</p>
        </div>
      </div>
    </motion.div>
  );
}
