'use client';

import { Users, Trophy } from 'lucide-react';
import type { Companero } from '../page';
import { ActivityFeed } from '@/components/estudiante/ActivityFeed';

interface ActividadEquipoProps {
  companeros: Companero[];
}

export function ActividadEquipo({ companeros }: ActividadEquipoProps) {
  return (
    <div className="flex-1 min-h-[400px] lg:h-full rounded-2xl bg-gradient-to-br from-cyan-950/40 via-[#0f0f1a]/95 to-purple-950/30 backdrop-blur-sm border border-cyan-500/20 overflow-hidden flex flex-col shadow-lg shadow-cyan-500/5">
      {/* Header */}
      <div className="p-4 border-b border-cyan-500/10 flex justify-between items-center shrink-0 bg-gradient-to-r from-cyan-500/5 to-transparent">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Users className="w-3.5 h-3.5 text-white" />
          </div>
          Mi Equipo
        </h3>
        {companeros.length > 0 && (
          <span className="text-[10px] text-white/50">
            {companeros.length} {companeros.length === 1 ? 'compañero' : 'compañeros'}
          </span>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {companeros.length === 0 ? (
          /* Estado vacio - Sin companeros */
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/40 text-sm font-medium mb-2">
              Aun no tienes companeros de equipo
            </p>
            <p className="text-white/25 text-xs max-w-[200px]">
              Inscribite a una clase grupal para ver a tu equipo
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Lista de compañeros */}
            <div className="space-y-2">
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider">
                Compañeros
              </p>
              <div className="grid gap-2">
                {companeros.map((companero) => (
                  <div
                    key={companero.id}
                    className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/8 transition-colors"
                  >
                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{
                        background:
                          'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
                      }}
                    >
                      {companero.nombre.charAt(0).toUpperCase()}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {companero.nombre} {companero.apellido}
                      </p>
                    </div>
                    {/* Puntos */}
                    <div className="flex items-center gap-1 text-yellow-400/80">
                      <Trophy className="w-3 h-3" />
                      <span className="text-xs font-medium">{companero.puntos}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Separador */}
            <div className="border-t border-white/5" />

            {/* Activity Feed */}
            <div className="space-y-2">
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider">
                Actividad reciente
              </p>
              <ActivityFeed mode="comision" compact showTitle={false} limit={10} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
