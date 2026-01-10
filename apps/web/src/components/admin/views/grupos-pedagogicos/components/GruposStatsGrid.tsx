'use client';

import { Layers, Home, Globe, Users, BookOpen } from 'lucide-react';
import type { GruposStats } from '../types/grupos.types';

interface GruposStatsGridProps {
  stats: GruposStats;
  isLoading: boolean;
}

export function GruposStatsGrid({ stats, isLoading }: GruposStatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-800/50 rounded-xl p-4 animate-pulse">
            <div className="h-16 bg-slate-700/50 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Grupos',
      value: stats.totalGrupos,
      icon: Layers,
      color: 'text-white',
      bgColor: 'bg-slate-700/50',
    },
    {
      label: 'Con Casa Asignada',
      value: stats.totalGrupos - stats.porCasa.SIN_ASIGNAR,
      icon: Home,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      label: 'Con Mundo Asignado',
      value: stats.totalGrupos - stats.porMundo.SIN_ASIGNAR,
      icon: Globe,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Con Clases Activas',
      value: stats.conClases,
      icon: BookOpen,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div key={stat.label} className={`${stat.bgColor} rounded-xl p-4`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-slate-800/50`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
