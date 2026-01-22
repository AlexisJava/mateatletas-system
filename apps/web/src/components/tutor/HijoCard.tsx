'use client';

import { Star, BarChart3, Shield, ArrowUpRight } from 'lucide-react';
import type { HijoInfo } from '@/lib/api/tutores.api';

interface HijoCardProps {
  hijo: HijoInfo;
  onClick: () => void;
}

interface CasaTheme {
  gradient: string;
  border: string;
  text: string;
  badge: string;
}

const DEFAULT_THEME: CasaTheme = {
  gradient: 'from-blue-500 to-cyan-500',
  border: 'border-blue-500/30',
  text: 'text-blue-300',
  badge: 'bg-blue-500/20',
};

const CASA_THEMES: Record<string, CasaTheme> = {
  QUANTUM: {
    gradient: 'from-pink-500 to-orange-500',
    border: 'border-pink-500/30',
    text: 'text-pink-300',
    badge: 'bg-pink-500/20',
  },
  VERTEX: DEFAULT_THEME,
  PULSAR: {
    gradient: 'from-emerald-500 to-teal-500',
    border: 'border-emerald-500/30',
    text: 'text-emerald-300',
    badge: 'bg-emerald-500/20',
  },
};

function getCasaTheme(casa: string): CasaTheme {
  return CASA_THEMES[casa] ?? DEFAULT_THEME;
}

/**
 * Card individual de un hijo/estudiante
 * Estilo glass con gradiente según la casa
 */
export function HijoCard({ hijo, onClick }: HijoCardProps) {
  const theme = getCasaTheme(hijo.casa ?? 'VERTEX');

  // Generar iniciales para avatar
  const initials = `${hijo.nombre[0] ?? ''}${hijo.apellido[0] ?? ''}`.toUpperCase();

  return (
    <button
      onClick={onClick}
      className="group relative bg-slate-900/40 border border-slate-800 rounded-xl p-4 hover:bg-slate-800/60 hover:border-slate-700 transition-all duration-300 text-left w-full"
    >
      <div className="flex items-start gap-4">
        {/* Avatar con gradiente de casa */}
        <div
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shrink-0 shadow-lg`}
        >
          <span className="text-xl font-bold text-white">{initials}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-white truncate">
              {hijo.nombre} {hijo.apellido}
            </h3>
          </div>

          {/* Casa badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${theme.badge} ${theme.border} border mb-3`}
          >
            <Shield className={`w-3 h-3 ${theme.text}`} />
            <span className={`text-xs font-semibold ${theme.text}`}>{hijo.casa ?? 'Sin casa'}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-white">{hijo.xpTotal}</span>
              <span className="text-xs text-slate-400">pts</span>
            </div>

            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-white">{hijo.asistenciaPromedio}%</span>
              <span className="text-xs text-slate-400">asist.</span>
            </div>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="shrink-0 p-2 bg-slate-950/50 rounded-full text-slate-500 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-all duration-300">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
}
