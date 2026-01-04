import React from 'react';
import { Clock, ArrowUpRight, Shield } from 'lucide-react';
import { Comision } from '../../types/docente.types';

interface ComisionCardProps {
  comision: Comision;
}

export const ComisionCard: React.FC<ComisionCardProps> = ({ comision }) => {
  const percentage = Math.round((comision.inscripciones / comision.cupo_maximo) * 100);

  const getCasaColor = (casa: string) => {
    switch (casa) {
      case 'QUANTUM':
        return {
          text: 'text-amber-300',
          bg: 'bg-gradient-to-br from-amber-500 to-orange-600',
          border: 'border-amber-400/40',
          badgeBg: 'bg-amber-500/20',
        };
      case 'VERTEX':
        return {
          text: 'text-emerald-300',
          bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
          border: 'border-emerald-400/40',
          badgeBg: 'bg-emerald-500/20',
        };
      case 'PULSAR':
        return {
          text: 'text-violet-300',
          bg: 'bg-gradient-to-br from-violet-500 to-purple-600',
          border: 'border-violet-400/40',
          badgeBg: 'bg-violet-500/20',
        };
      default:
        return {
          text: 'text-slate-300',
          bg: 'bg-gradient-to-br from-slate-500 to-slate-600',
          border: 'border-slate-400/40',
          badgeBg: 'bg-slate-500/20',
        };
    }
  };

  const theme = getCasaColor(comision.casa);

  return (
    <div className="group relative bg-slate-900/40 border border-slate-800 rounded-xl p-3 hover:bg-slate-800/60 hover:border-slate-700 transition-all duration-300 cursor-pointer overflow-hidden flex items-center gap-4">
      {/* Casa Badge */}
      <div
        className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border shadow-lg ${theme.bg} ${theme.border}`}
      >
        <Shield size={18} className="text-white drop-shadow-sm" fill="currentColor" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors truncate">
            {comision.producto}
          </h3>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${theme.badgeBg} ${theme.border} ${theme.text}`}
          >
            {comision.casa}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {comision.horario}
          </span>
          <span
            className={`font-semibold ${percentage >= 90 ? 'text-amber-400' : 'text-slate-300'}`}
          >
            {comision.inscripciones}/{comision.cupo_maximo} alumnos
          </span>
        </div>
      </div>

      {/* Capacity indicator + Arrow */}
      <div className="shrink-0 flex items-center gap-3">
        <div className="w-16">
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${theme.bg}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 text-center mt-1">{percentage}%</p>
        </div>
        <div className="p-2 bg-slate-950/50 rounded-full text-slate-500 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all duration-300">
          <ArrowUpRight size={16} />
        </div>
      </div>
    </div>
  );
};
