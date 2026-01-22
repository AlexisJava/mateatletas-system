'use client';

import { X, Star, BarChart3, Trophy, BookOpen, Shield } from 'lucide-react';
import type { HijoInfo } from '@/lib/api/tutores.api';

interface HijoDetalleModalProps {
  hijo: HijoInfo;
  onClose: () => void;
}

interface CasaTheme {
  gradient: string;
  text: string;
}

const DEFAULT_THEME: CasaTheme = { gradient: 'from-blue-500 to-cyan-500', text: 'text-blue-300' };

const CASA_THEMES: Record<string, CasaTheme> = {
  QUANTUM: { gradient: 'from-pink-500 to-orange-500', text: 'text-pink-300' },
  VERTEX: DEFAULT_THEME,
  PULSAR: { gradient: 'from-emerald-500 to-teal-500', text: 'text-emerald-300' },
};

function getCasaTheme(casa: string): CasaTheme {
  return CASA_THEMES[casa] ?? DEFAULT_THEME;
}

/**
 * Modal con detalle completo de un hijo
 * Muestra estadísticas, últimas clases, logros
 */
export function HijoDetalleModal({ hijo, onClose }: HijoDetalleModalProps) {
  const theme = getCasaTheme(hijo.casa ?? 'VERTEX');
  const initials = `${hijo.nombre[0] ?? ''}${hijo.apellido[0] ?? ''}`.toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg`}
            >
              <span className="text-2xl font-bold text-white">{initials}</span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                {hijo.nombre} {hijo.apellido}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Shield className={`w-4 h-4 ${theme.text}`} />
                <span className={`text-sm font-semibold ${theme.text}`}>
                  Casa {hijo.casa ?? 'Sin asignar'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-6 pb-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Estadísticas
          </h3>
          <div className="grid grid-cols-4 gap-3">
            <StatBox
              icon={Star}
              label="Puntos"
              value={hijo.xpTotal.toString()}
              color="text-amber-400"
              bgColor="bg-amber-500/10"
            />
            <StatBox
              icon={BarChart3}
              label="Asistencia"
              value={`${hijo.asistenciaPromedio}%`}
              color="text-cyan-400"
              bgColor="bg-cyan-500/10"
            />
            <StatBox
              icon={Trophy}
              label="Logros"
              value="--"
              color="text-purple-400"
              bgColor="bg-purple-500/10"
            />
            <StatBox
              icon={BookOpen}
              label="Clases"
              value="--"
              color="text-emerald-400"
              bgColor="bg-emerald-500/10"
            />
          </div>
        </div>

        {/* Últimas clases - Placeholder */}
        <div className="px-6 pb-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Últimas Clases
          </h3>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-slate-400 text-sm">Próximamente: historial de clases y asistencia</p>
          </div>
        </div>

        {/* Logros recientes - Placeholder */}
        <div className="px-6 pb-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Logros Recientes
          </h3>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-slate-400 text-sm">Próximamente: logros y medallas obtenidas</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatBoxProps {
  icon: typeof Star;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}

function StatBox({ icon: Icon, label, value, color, bgColor }: StatBoxProps) {
  return (
    <div className={`${bgColor} rounded-xl p-3 text-center`}>
      <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
