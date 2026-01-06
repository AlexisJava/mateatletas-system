'use client';

import { Trophy, Flame, Zap } from 'lucide-react';

export function RachaSemanal() {
  return (
    <div className="h-auto min-h-[180px] lg:flex-1 rounded-2xl bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-orange-500/10 border border-white/10 p-5 flex flex-col justify-center items-center text-center">
      {/* Trophy icon */}
      <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <Trophy className="w-7 h-7 text-amber-400" />
      </div>

      {/* Title */}
      <h3 className="text-white font-bold text-lg mb-1">Racha Semanal</h3>

      {/* Subtitle */}
      <p className="text-sm text-amber-400/80 flex items-center gap-1 mb-3">
        <Flame className="w-4 h-4" />
        ¡Imparable!
      </p>

      {/* Description */}
      <p className="text-white/50 text-xs leading-relaxed max-w-[200px] mb-4">
        Has completado <span className="text-white/80 font-medium">3 tareas</span> seguidas.
      </p>

      {/* Bonus badge */}
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <Zap className="w-4 h-4 text-amber-400" />
        <span className="text-white font-semibold text-sm">+15% XP</span>
        <span className="text-white/50 text-xs">bonus activo</span>
      </div>
    </div>
  );
}
