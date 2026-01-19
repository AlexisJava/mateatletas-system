'use client';

import { useQuery } from '@tanstack/react-query';
import { gamificacionApi, type RankingEquipoEntry } from '@/lib/api/gamificacion.api';
import { Trophy, Medal, Award, Crown, Users, ChevronUp, Loader2 } from 'lucide-react';

interface RankingCasaProps {
  estudianteId: string;
  className?: string;
}

/**
 * Componente de Ranking por Casa
 * Muestra la posición del estudiante en su casa y el top de integrantes
 * Estilo: Dark Solid Premium (sin backdrop-blur para evitar ruido visual)
 */
export function RankingCasa({ estudianteId, className = '' }: RankingCasaProps) {
  const {
    data: ranking,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['ranking', estudianteId],
    queryFn: () => gamificacionApi.getRanking(estudianteId),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!estudianteId,
  });

  if (isLoading) {
    return (
      <div className={`rounded-2xl p-6 ${className}`} style={cardStyle}>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !ranking) {
    return (
      <div className={`rounded-2xl p-6 ${className}`} style={cardStyle}>
        <div className="text-center text-white/50 py-8">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No se pudo cargar el ranking</p>
        </div>
      </div>
    );
  }

  // Sistema 2026: usar casa si existe, sino fallback a equipo (legacy)
  const casaActual = ranking.casaActual ?? ranking.equipoActual;
  const posicionCasa = ranking.posicionCasa ?? ranking.posicionEquipo ?? 0;
  const rankingCasa = ranking.rankingCasa ?? ranking.rankingEquipo ?? [];
  const posicionGlobal = ranking.posicionGlobal;

  if (!casaActual) {
    return (
      <div className={`rounded-2xl p-6 ${className}`} style={cardStyle}>
        <div className="text-center text-white/50 py-8">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No tienes casa asignada</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-3xl overflow-hidden h-[310px] flex flex-col ${className}`}
      style={cardStyle}
    >
      {/* Header con info de casa */}
      <div
        className="px-4 py-3 relative overflow-hidden shrink-0"
        style={{
          background: 'var(--casa-gradient)',
        }}
      >
        {/* Shine effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
          }}
        />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.2)',
                boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2)',
              }}
            >
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{casaActual.nombre}</h3>
              <p className="text-white/80 text-xs font-medium">Top 3 de tu casa</p>
            </div>
          </div>

          {/* Posición del estudiante - Sin mostrar total para evitar competencia */}
          <div className="text-right">
            <div className="flex items-center gap-1 text-white/80 text-[10px] font-medium">
              <ChevronUp className="w-3 h-3" />
              Tu posición
            </div>
            <span className="text-2xl font-black text-white">#{posicionCasa}</span>
          </div>
        </div>
      </div>

      {/* Lista de ranking - Solo top 3 para no afectar autoestima */}
      <div className="px-3 py-2 space-y-1.5 flex-1 overflow-hidden">
        {rankingCasa.slice(0, 3).map((integrante, index) => (
          <RankingItem
            key={integrante.id}
            integrante={integrante}
            posicion={index + 1}
            isCurrentUser={integrante.id === estudianteId}
          />
        ))}

        {rankingCasa.length === 0 && (
          <p className="text-center text-white/40 text-sm py-2">
            No hay integrantes en tu casa aún
          </p>
        )}
      </div>

      {/* Footer con posición global */}
      <div
        className="px-4 py-2 border-t border-white/5 flex items-center justify-between mt-auto"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <span className="text-white/50 text-xs font-medium">Posición global</span>
        <span className="text-white font-bold text-sm">#{posicionGlobal}</span>
      </div>
    </div>
  );
}

// Estilo sólido premium (sin backdrop-blur para evitar ruido visual)
const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(145deg, #1a1a2e 0%, #16162a 50%, #0f0f1a 100%)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
};

// Item individual del ranking
function RankingItem({
  integrante,
  posicion,
  isCurrentUser,
}: {
  integrante: RankingEquipoEntry;
  posicion: number;
  isCurrentUser: boolean;
}) {
  const getMedalIcon = () => {
    switch (posicion) {
      case 1:
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case 2:
        return <Medal className="w-4 h-4 text-gray-300" />;
      case 3:
        return <Award className="w-4 h-4 text-amber-600" />;
      default:
        return <span className="text-white/40 text-sm font-bold">#{posicion}</span>;
    }
  };

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
        isCurrentUser
          ? 'ring-2 ring-[var(--casa-primary)] ring-offset-1 ring-offset-transparent'
          : 'hover:bg-white/5'
      }`}
      style={{
        background: isCurrentUser
          ? 'linear-gradient(135deg, var(--casa-glow) 0%, rgba(255,255,255,0.05) 100%)'
          : 'rgba(255,255,255,0.03)',
      }}
    >
      {/* Posición/Medalla */}
      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
        {getMedalIcon()}
      </div>

      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
        style={{
          background: isCurrentUser
            ? 'var(--casa-gradient)'
            : 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
          boxShadow: isCurrentUser ? '0 2px 8px var(--casa-glow)' : 'none',
        }}
      >
        {integrante.avatar ? (
          <img
            src={integrante.avatar}
            alt={integrante.nombre}
            className="w-full h-full rounded-xl object-cover"
          />
        ) : (
          integrante.nombre.charAt(0).toUpperCase()
        )}
      </div>

      {/* Nombre */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold truncate ${
            isCurrentUser ? 'text-white' : 'text-white/80'
          }`}
        >
          {integrante.nombre} {integrante.apellido.charAt(0)}.
          {isCurrentUser && <span className="ml-1 text-xs text-[var(--casa-primary)]">(Tú)</span>}
        </p>
      </div>

      {/* Puntos */}
      <div className="text-right shrink-0">
        <span
          className={`text-sm font-bold ${
            isCurrentUser ? 'text-[var(--casa-primary)]' : 'text-white/60'
          }`}
        >
          {integrante.puntos.toLocaleString()}
        </span>
        <span className="text-white/40 text-xs ml-1">XP</span>
      </div>
    </div>
  );
}

export default RankingCasa;
