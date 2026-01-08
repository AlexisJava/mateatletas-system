'use client';

import { useState, useEffect } from 'react';
import {
  getLeaderboard,
  type LeaderboardResponse,
  type LeaderboardEntry,
} from '@/lib/api/estudiante-aula.api';
import { Trophy, Medal, Crown, Loader2, Users, Target, Zap } from 'lucide-react';

interface PlanificacionLeaderboardProps {
  asignacionId: string;
  showTitle?: boolean;
  compact?: boolean;
  maxEntries?: number;
}

const POSICION_ICONS = {
  1: <Crown className="w-5 h-5 text-yellow-400" />,
  2: <Medal className="w-5 h-5 text-gray-300" />,
  3: <Medal className="w-5 h-5 text-amber-600" />,
};

export function PlanificacionLeaderboard({
  asignacionId,
  showTitle = true,
  compact = false,
  maxEntries = 10,
}: PlanificacionLeaderboardProps) {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [asignacionId]);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getLeaderboard(asignacionId);
      setData(response);
    } catch (err) {
      console.error('Error cargando leaderboard:', err);
      setError('No se pudo cargar el ranking');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-8">
        <p className="text-white/50 text-sm">{error || 'Sin datos'}</p>
      </div>
    );
  }

  const entries = data.leaderboard.slice(0, maxEntries);

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Ranking del Grupo
          </h3>
          <div className="flex items-center gap-1 text-white/50 text-sm">
            <Users className="w-4 h-4" />
            {data.total_participantes}
          </div>
        </div>
      )}

      {/* Mi posición destacada */}
      <div className="rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 p-3">
        <div className="flex items-center justify-between">
          <span className="text-white/70 text-sm">Tu posición</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">#{data.mi_posicion}</span>
            <span className="text-white/50 text-sm">de {data.total_participantes}</span>
          </div>
        </div>
      </div>

      {/* Lista de participantes */}
      <div className="space-y-2">
        {entries.map((entry) => (
          <LeaderboardRow key={entry.estudiante.id} entry={entry} compact={compact} />
        ))}
      </div>

      {/* Info de planificación */}
      {!compact && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
          <p className="text-white/50 text-xs">
            <Target className="w-3 h-3 inline mr-1" />
            {data.planificacion.titulo} - {data.grupo.nombre}
          </p>
        </div>
      )}
    </div>
  );
}

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  compact?: boolean;
}

function LeaderboardRow({ entry, compact }: LeaderboardRowProps) {
  const isTopThree = entry.posicion <= 3;
  const posicionIcon = POSICION_ICONS[entry.posicion as keyof typeof POSICION_ICONS];

  return (
    <div
      className={`rounded-xl border transition-colors ${
        entry.es_yo
          ? 'bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30'
          : 'bg-white/5 border-white/10 hover:bg-white/8'
      } ${compact ? 'p-2' : 'p-3'}`}
    >
      <div className="flex items-center gap-3">
        {/* Posición */}
        <div
          className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl flex items-center justify-center shrink-0 ${
            isTopThree ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20' : 'bg-white/10'
          }`}
        >
          {posicionIcon || (
            <span className={`font-bold ${isTopThree ? 'text-yellow-400' : 'text-white/70'}`}>
              {entry.posicion}
            </span>
          )}
        </div>

        {/* Avatar */}
        <div
          className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl flex items-center justify-center text-white font-bold shrink-0`}
          style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
          }}
        >
          {entry.estudiante.nombre.charAt(0).toUpperCase()}
        </div>

        {/* Nombre y progreso */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium text-white ${compact ? 'text-sm' : ''} truncate`}>
              {entry.estudiante.nombre} {entry.estudiante.apellido.charAt(0)}.
            </span>
            {entry.es_yo && (
              <span className="px-1.5 py-0.5 rounded text-xs bg-purple-500/30 text-purple-300">
                Tú
              </span>
            )}
          </div>

          {!compact && (
            <div className="flex items-center gap-3 mt-1">
              <span className="text-white/50 text-xs">
                {entry.progreso.clases_completadas}/{entry.progreso.clases_totales} clases
              </span>
              <span className="text-white/50 text-xs">
                {entry.progreso.tareas_completadas}/{entry.progreso.tareas_totales} tareas
              </span>
            </div>
          )}
        </div>

        {/* Puntos y porcentaje */}
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1 justify-end">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="font-bold text-white text-sm">{entry.puntos_planificacion}</span>
          </div>
          {!compact && (
            <div className="text-white/50 text-xs mt-0.5">{entry.progreso.porcentaje}%</div>
          )}
        </div>
      </div>

      {/* Barra de progreso */}
      {!compact && (
        <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${entry.progreso.porcentaje}%`,
              background: entry.es_yo
                ? 'linear-gradient(90deg, #a855f7, #06b6d4)'
                : 'linear-gradient(90deg, #3b82f6, #06b6d4)',
            }}
          />
        </div>
      )}
    </div>
  );
}

export default PlanificacionLeaderboard;
