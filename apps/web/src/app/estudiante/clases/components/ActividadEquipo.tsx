'use client';

import { Users, Sparkles } from 'lucide-react';
import type { Companero } from '../page';

interface ActividadEquipoProps {
  companeros: Companero[];
}

export function ActividadEquipo({ companeros }: ActividadEquipoProps) {
  const onlineCount = Math.min(companeros.length, 5);

  return (
    <div className="flex-1 min-h-[400px] lg:h-full rounded-2xl bg-gradient-to-br from-cyan-950/40 via-[#0f0f1a]/95 to-purple-950/30 backdrop-blur-sm border border-cyan-500/20 overflow-hidden flex flex-col shadow-lg shadow-cyan-500/5">
      {/* Header */}
      <div className="p-4 border-b border-cyan-500/10 flex justify-between items-center shrink-0 bg-gradient-to-r from-cyan-500/5 to-transparent">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Users className="w-3.5 h-3.5 text-white" />
          </div>
          Actividad de Mi Equipo
        </h3>
        {companeros.length > 0 && (
          <span className="text-[10px] text-emerald-400/80 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            {onlineCount} en linea
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
              Cuando tengas companeros, veras su actividad aqui
            </p>
          </div>
        ) : (
          /* Lista de companeros con placeholder de actividad */
          <div className="space-y-3">
            {/* Mensaje de proximamente */}
            <div className="rounded-xl bg-gradient-to-br from-cyan-500/5 to-purple-500/5 border border-white/5 p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-white/60">Proximamente</span>
              </div>
              <p className="text-white/40 text-xs leading-relaxed">
                Pronto podras ver la actividad de tus companeros, enviar felicitaciones y celebrar
                sus logros juntos.
              </p>
            </div>

            {/* Lista de companeros */}
            {companeros.slice(0, 10).map((companero, idx) => (
              <div
                key={companero.id}
                className="flex items-center gap-3 p-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-xl transition"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                    style={{
                      background:
                        idx % 3 === 0
                          ? 'linear-gradient(135deg, #06b6d4, #3b82f6)'
                          : idx % 3 === 1
                            ? 'linear-gradient(135deg, #a855f7, #ec4899)'
                            : 'linear-gradient(135deg, #10b981, #22c55e)',
                    }}
                  >
                    {companero.nombre.charAt(0)}
                  </div>
                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0c0c1d] rounded-full" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80 truncate">
                    {companero.nombre} {companero.apellido}
                  </p>
                  <p className="text-[11px] text-white/40 truncate">
                    {companero.puntos.toLocaleString()} puntos
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
