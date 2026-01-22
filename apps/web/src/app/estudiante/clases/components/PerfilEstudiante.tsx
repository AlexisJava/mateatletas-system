'use client';

import { Trophy, Zap, Crown } from 'lucide-react';

interface User {
  id?: string;
  nombre?: string;
  apellido?: string;
  nivelActual?: number;
  xpTotal?: number;
}

interface PerfilEstudianteProps {
  user: User | null;
}

export function PerfilEstudiante({ user }: PerfilEstudianteProps) {
  const nivel = user?.nivelActual ?? 1;
  const xp = user?.xpTotal ?? 0;
  const xpParaSiguiente = nivel * 100;
  const progreso = Math.min((xp / xpParaSiguiente) * 100, 100);

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-amber-950/30 via-[#0f0f1a]/95 to-rose-950/20 backdrop-blur-sm border border-amber-500/20 p-5 shrink-0 shadow-lg shadow-amber-500/5 overflow-hidden">
      {/* Brillo sutil superior */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent rounded-full blur-sm" />

      {/* Online indicator */}
      <div className="relative flex justify-end mb-2">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
          <span className="text-[10px] font-semibold text-emerald-400">En linea</span>
        </div>
      </div>

      {/* Avatar */}
      <div className="relative flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center text-2xl font-bold text-white">
            {user?.nombre?.charAt(0)?.toUpperCase() || '?'}
          </div>
          {/* Trophy badge */}
          <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
            <Trophy className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* Name */}
        <h2 className="text-lg font-bold text-white">{user?.nombre || 'Estudiante'}</h2>

        {/* Rank badge */}
        <span className="text-xs text-white/50 mt-1 mb-4">Rango: Explorador</span>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="rounded-xl bg-white/5 p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Crown className="w-3 h-3 text-amber-400" />
              <p className="text-[10px] text-white/50">Nivel</p>
            </div>
            <p className="text-xl font-bold text-amber-400">{nivel}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-3 h-3 text-violet-400" />
              <p className="text-[10px] text-white/50">XP Total</p>
            </div>
            <p className="text-xl font-bold text-violet-400">
              {xp >= 1000 ? `${(xp / 1000).toFixed(1)}k` : xp}
            </p>
          </div>
        </div>

        {/* Level progress */}
        <div className="w-full mt-4">
          <div className="flex justify-between text-[10px] text-white/40 mb-1.5">
            <span>Nivel {nivel + 1}</span>
            <span>{Math.round(progreso)}%</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
