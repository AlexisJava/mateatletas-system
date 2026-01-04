'use client';

import React from 'react';
import { Clock, Users, Play, AlertCircle } from 'lucide-react';
import type { LiveClassConfig, RoomState } from './types';

interface PreClassViewProps {
  config: LiveClassConfig;
  onStart: () => void;
  isLoading: boolean;
  error: string | null;
}

export const PreClassView: React.FC<PreClassViewProps> = ({
  config,
  onStart,
  isLoading,
  error,
}) => {
  return (
    <div className="flex flex-col h-full bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden relative backdrop-blur-sm">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950/0 to-slate-950/0 pointer-events-none" />

      <div className="p-8 pb-4 flex flex-col items-center text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Clock size={12} />
          Clase en Vivo
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
          {config.title}
        </h1>
        {config.subtitle && <p className="text-slate-400 text-lg">{config.subtitle}</p>}
      </div>

      <div className="flex justify-center my-6 z-10">
        <div className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl">
          <div className="p-3 bg-slate-900 rounded-xl">
            <Users size={24} className="text-slate-500" />
          </div>
          <div className="text-left">
            <div className="text-2xl font-bold text-white leading-none">
              0<span className="text-slate-500 text-lg">/--</span>
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Esperando conexión
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 z-10">
          <AlertCircle size={20} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="flex-1 z-10" />

      <div className="p-6 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800 flex flex-col items-center gap-4 z-20">
        <button
          onClick={onStart}
          disabled={isLoading}
          className={`w-full max-w-md py-4 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95 ${
            isLoading
              ? 'bg-slate-800 text-slate-500 cursor-wait'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-emerald-500/25'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              <Play size={24} fill="currentColor" />
              INICIAR CLASE
            </>
          )}
        </button>
      </div>
    </div>
  );
};
