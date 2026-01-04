'use client';

import React, { useState } from 'react';
import {
  ClipboardList,
  Clock,
  ChevronRight,
  ArrowLeft,
  Layers,
  Eye,
  MonitorPlay,
  Lock,
  Unlock,
} from 'lucide-react';

interface Week {
  number: number;
  topic: string;
  isActive: boolean;
  status: 'completed' | 'current' | 'pending';
  completedCount: number;
  totalStudents: number;
  avgTime: string;
}

interface Planning {
  id: string;
  title: string;
  comision: string;
  totalWeeks: number;
  currentWeek: number;
  progress: number;
  weeks: Week[];
}

const mockPlannings: Planning[] = [
  {
    id: 'p1',
    title: 'Full Stack Development: Integración de APIs',
    comision: '101',
    totalWeeks: 12,
    currentWeek: 3,
    progress: 25,
    weeks: Array.from({ length: 12 }, (_, i) => ({
      number: i + 1,
      topic: `Unidad ${i + 1}: ${['Intro a APIs', 'REST vs GraphQL', 'Express Setup', 'Middleware', 'Controllers', 'DB Connection', 'Models', 'Auth JWT', 'Deploy', 'Testing', 'Project', 'Final Review'][i]}`,
      isActive: i < 3,
      status: i < 2 ? 'completed' : i === 2 ? 'current' : 'pending',
      completedCount: i < 2 ? 18 : i === 2 ? 5 : 0,
      totalStudents: 20,
      avgTime: '45m',
    })),
  },
  {
    id: 'p2',
    title: 'Intro a Unity 3D: Físicas y Colisiones',
    comision: '102',
    totalWeeks: 8,
    currentWeek: 5,
    progress: 62,
    weeks: Array.from({ length: 8 }, (_, i) => ({
      number: i + 1,
      topic: `Semana ${i + 1}: Conceptos Core`,
      isActive: i < 5,
      status: i < 4 ? 'completed' : i === 4 ? 'current' : 'pending',
      completedCount: i < 4 ? 15 : 8,
      totalStudents: 15,
      avgTime: '60m',
    })),
  },
  {
    id: 'p3',
    title: 'Python Data Science: Pandas & NumPy',
    comision: '103',
    totalWeeks: 10,
    currentWeek: 1,
    progress: 10,
    weeks: Array.from({ length: 10 }, (_, i) => ({
      number: i + 1,
      topic: `Módulo ${i + 1}: Análisis de Datos`,
      isActive: i === 0,
      status: i === 0 ? 'current' : 'pending',
      completedCount: 2,
      totalStudents: 25,
      avgTime: '30m',
    })),
  },
];

export const PlanificacionesPage: React.FC = () => {
  const [selectedPlanningId, setSelectedPlanningId] = useState<string | null>(null);
  const [plannings, setPlannings] = useState<Planning[]>(mockPlannings);

  const selectedPlanning = plannings.find((p) => p.id === selectedPlanningId);

  const toggleWeekLock = (planningId: string, weekNumber: number) => {
    setPlannings((prev) =>
      prev.map((p) => {
        if (p.id !== planningId) return p;
        return {
          ...p,
          weeks: p.weeks.map((w) =>
            w.number === weekNumber ? { ...w, isActive: !w.isActive } : w,
          ),
        };
      }),
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden relative">
      {/* Header */}
      <div className="p-6 border-b border-slate-800/50 flex items-center justify-between bg-slate-950/20">
        <div className="flex items-center gap-4">
          {selectedPlanning ? (
            <button
              onClick={() => setSelectedPlanningId(null)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
          ) : null}
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <ClipboardList className="text-indigo-500" />
              {selectedPlanning ? 'Detalle de Planificación' : 'Mis Planificaciones'}
            </h2>
            <p className="text-sm text-slate-400">
              {selectedPlanning
                ? `Gestionando contenido para Comisión ${selectedPlanning.comision}`
                : 'Gestiona el progreso y contenido de tus comisiones'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
        {!selectedPlanning ? (
          // List View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plannings.map((planning) => (
              <div
                key={planning.id}
                className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 hover:bg-slate-800/40 hover:border-slate-700 transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-lg">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">
                      Comisión {planning.comision}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-lg text-slate-500 group-hover:text-white transition-colors">
                    <Layers size={18} />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white leading-tight mb-2 line-clamp-2 min-h-[3rem]">
                    {planning.title}
                  </h3>
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <Clock size={14} />
                    Semana {planning.currentWeek} de {planning.totalWeeks}
                  </p>
                </div>

                <div className="mt-auto">
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>Progreso</span>
                    <span>{planning.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all duration-1000"
                      style={{ width: `${planning.progress}%` }}
                    />
                  </div>

                  <button
                    onClick={() => setSelectedPlanningId(planning.id)}
                    className="w-full mt-6 py-3 bg-slate-800 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-indigo-600/20"
                  >
                    Ver Contenido
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Detail View
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="text-lg font-bold text-white">{selectedPlanning.title}</h3>
              <div className="text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                Progreso General: {selectedPlanning.progress}%
              </div>
            </div>

            {selectedPlanning.weeks.map((week) => (
              <div
                key={week.number}
                className={`flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl border transition-all ${
                  week.isActive
                    ? 'bg-slate-900/60 border-slate-700'
                    : 'bg-slate-950/30 border-slate-800 opacity-70'
                }`}
              >
                {/* Week Indicator */}
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                      week.status === 'current'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : week.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}
                  >
                    <span className="font-bold text-lg">{week.number}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={`font-bold truncate ${week.isActive ? 'text-white' : 'text-slate-400'}`}
                      >
                        {week.topic}
                      </h4>
                      {week.status === 'current' && (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 font-bold uppercase">
                          Actual
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>
                        {week.completedCount}/{week.totalStudents} completaron
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {week.avgTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 md:border-l border-slate-800 md:pl-4 pt-2 md:pt-0 justify-end">
                  <button
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Previsualizar"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                    title="Presentar en Clase"
                  >
                    <MonitorPlay size={18} />
                  </button>

                  <div className="h-6 w-[1px] bg-slate-800 mx-1"></div>

                  <button
                    onClick={() => toggleWeekLock(selectedPlanning.id, week.number)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      week.isActive
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {week.isActive ? <Unlock size={14} /> : <Lock size={14} />}
                    {week.isActive ? 'Habilitado' : 'Bloqueado'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
