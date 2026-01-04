import React from 'react';
import { CalendarCheck, Users, Percent, Award, ArrowUpRight } from 'lucide-react';
import { DashboardStats } from '../../types/docente.types';

interface StatsDocenteProps {
  stats: DashboardStats;
  onStatClick: (statId: string) => void;
}

export const StatsDocente: React.FC<StatsDocenteProps> = ({ stats, onStatClick }) => {
  const items = [
    {
      id: 'classes',
      label: 'Clases Semana',
      value: stats.clasesSemana,
      icon: CalendarCheck,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
    },
    {
      id: 'students',
      label: 'Total Estudiantes',
      value: stats.totalEstudiantes,
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      id: 'attendance',
      label: 'Asistencia Avg',
      value: `${stats.asistenciaPromedio}%`,
      icon: Percent,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      id: 'points',
      label: 'Puntos Otorgados',
      value: stats.puntosOtorgados,
      icon: Award,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onStatClick(item.id)}
          className="relative bg-slate-900/40 border border-slate-800 hover:border-slate-600 hover:bg-slate-800/60 rounded-xl p-4 flex items-center gap-4 transition-all duration-300 group cursor-pointer text-left shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 active:scale-95"
        >
          <div
            className={`p-3 rounded-xl border transition-colors duration-300 ${item.bg} ${item.border} ${item.color} group-hover:bg-opacity-20`}
          >
            <item.icon size={22} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-2xl font-black text-white leading-none mb-1 group-hover:scale-105 transition-transform origin-left">
              {item.value}
            </p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-300 transition-colors">
              {item.label}
            </p>
          </div>

          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300 text-slate-400">
            <ArrowUpRight size={16} />
          </div>
        </button>
      ))}
    </div>
  );
};
