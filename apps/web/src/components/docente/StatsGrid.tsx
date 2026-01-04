import React from 'react';
import { CalendarCheck, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { StatMetric } from '../../types/docente.types';

const stats: StatMetric[] = [
  {
    label: 'Clases Semanales',
    value: 12,
    icon: CalendarCheck,
    color: 'text-purple-400',
  },
  {
    label: 'Total Alumnos',
    value: 148,
    icon: Users,
    color: 'text-green-400',
  },
  {
    label: 'Asistencia',
    value: '94%',
    icon: TrendingUp,
    color: 'text-blue-400',
    trend: '+2.5%',
    trendUp: true,
  },
  {
    label: 'Alertas',
    value: 3,
    icon: AlertCircle,
    color: 'text-yellow-400',
  },
];

export const StatsGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="relative bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 hover:bg-slate-800/40 transition-colors"
        >
          <div className={`p-2.5 rounded-xl bg-slate-950 border border-slate-800 ${stat.color}`}>
            <stat.icon size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white leading-none mb-1">{stat.value}</h3>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {stat.label}
            </p>
          </div>
          {stat.trend && (
            <div className="absolute top-4 right-4 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              {stat.trend}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
