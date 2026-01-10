'use client';

import { Users, Home, Globe, Briefcase } from 'lucide-react';
import type { AsignacionesStats } from '../types/asignaciones.types';

interface AsignacionesStatsGridProps {
  stats: AsignacionesStats;
  isLoading: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtext?: string;
  color: string;
}

function StatCard({ icon, label, value, subtext, color }: StatCardProps) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-sm text-slate-400">{label}</p>
          {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

export function AsignacionesStatsGrid({ stats, isLoading }: AsignacionesStatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-800/50 rounded-xl p-4 animate-pulse">
            <div className="h-16 bg-slate-700/50 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const porcentajeCasa =
    stats.totalDocentes > 0 ? Math.round((stats.conCasaAsignada / stats.totalDocentes) * 100) : 0;
  const porcentajeMundo =
    stats.totalDocentes > 0 ? Math.round((stats.conMundoAsignado / stats.totalDocentes) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Users className="w-5 h-5 text-cyan-400" />}
        label="Total Docentes"
        value={stats.totalDocentes}
        color="bg-cyan-500/20"
      />

      <StatCard
        icon={<Home className="w-5 h-5 text-purple-400" />}
        label="Con Casa"
        value={stats.conCasaAsignada}
        subtext={`${porcentajeCasa}% asignados`}
        color="bg-purple-500/20"
      />

      <StatCard
        icon={<Globe className="w-5 h-5 text-green-400" />}
        label="Con Mundo"
        value={stats.conMundoAsignado}
        subtext={`${porcentajeMundo}% asignados`}
        color="bg-green-500/20"
      />

      <StatCard
        icon={<Briefcase className="w-5 h-5 text-amber-400" />}
        label="Por Tipo"
        value={stats.porTipoAsignacion.AMBOS}
        subtext={`${stats.porTipoAsignacion.CLASE_GRUPOS} grupos, ${stats.porTipoAsignacion.COMISIONES} comisiones`}
        color="bg-amber-500/20"
      />
    </div>
  );
}
