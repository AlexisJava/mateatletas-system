'use client';

import { Users } from 'lucide-react';
import type { Companero } from '../page';

interface CompanerosEquipoProps {
  companeros: Companero[];
}

export function CompanerosEquipo({ companeros }: CompanerosEquipoProps) {
  const onlineCount = Math.min(companeros.length, 5);

  return (
    <div className="flex-1 min-h-[280px] lg:min-h-0 rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex justify-between items-center shrink-0">
        <h3 className="text-xs font-semibold text-white/60 flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-cyan-500/20 flex items-center justify-center">
            <Users className="w-3 h-3 text-cyan-400" />
          </div>
          Compañeros de Equipo
        </h3>
        <span className="text-[10px] text-emerald-400/80">{onlineCount} en línea</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {companeros.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/30 text-xs text-center">Aún no tienes compañeros de equipo</p>
          </div>
        ) : (
          companeros.slice(0, 8).map((companero, idx) => (
            <div
              key={companero.id}
              className="flex items-center gap-3 p-2.5 hover:bg-white/5 rounded-xl cursor-pointer transition"
            >
              {/* Avatar */}
              <div className="relative">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-white"
                  style={{
                    background: idx % 2 === 0 ? '#0891b2' : '#9333ea',
                  }}
                >
                  {companero.nombre.charAt(0)}
                </div>
                {/* Online indicator */}
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border-2 border-[#0c0c1d] rounded-full" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/80 truncate">
                  {companero.nombre} {companero.apellido.charAt(0)}.
                </p>
                <p className="text-[11px] text-white/40 truncate">
                  {companero.puntos.toLocaleString()} pts
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
