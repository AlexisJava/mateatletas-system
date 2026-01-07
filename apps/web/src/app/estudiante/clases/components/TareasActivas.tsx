'use client';

import { useState } from 'react';
import { Target, Star, Clock, ChevronRight, CheckCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'graded';
  xp: number;
  grade?: string;
}

// Mock data - después conectar con backend
const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Completar 10 ejercicios de fracciones',
    dueDate: '20 Ene',
    status: 'pending',
    xp: 500,
  },
  {
    id: 't2',
    title: 'Quiz: Números decimales',
    dueDate: '15 Ene',
    status: 'graded',
    grade: 'A+',
    xp: 150,
  },
  {
    id: 't3',
    title: 'Práctica: Operaciones combinadas',
    dueDate: '25 Ene',
    status: 'pending',
    xp: 300,
  },
];

export function TareasActivas() {
  const [tasks] = useState<Task[]>(MOCK_TASKS);
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;

  return (
    <div className="flex-[2] min-h-[350px] lg:min-h-0 rounded-2xl bg-gradient-to-br from-amber-950/30 via-[#0f0f1a]/95 to-orange-950/20 backdrop-blur-sm border border-amber-500/20 overflow-hidden flex flex-col shadow-lg shadow-amber-500/5">
      {/* Header */}
      <div className="p-4 border-b border-amber-500/10 flex justify-between items-center shrink-0 bg-gradient-to-r from-amber-500/5 to-transparent">
        <h3 className="text-xs font-semibold text-white flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Target className="w-3 h-3 text-white" />
          </div>
          Tareas Activas
        </h3>
        <span className="text-[10px] text-white/40">{pendingCount} pendientes</span>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`rounded-xl p-4 cursor-pointer transition border ${
              task.status === 'pending'
                ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                : 'bg-white/[0.01] border-white/[0.03] opacity-60 hover:opacity-100'
            }`}
          >
            {/* Top row */}
            <div className="flex justify-between items-center mb-2">
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                  task.status === 'pending'
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'bg-emerald-500/10 text-emerald-400'
                }`}
              >
                {task.status === 'pending' ? 'En Curso' : 'Completada'}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-amber-400/70">
                <Star className="w-3 h-3" />+{task.xp} XP
              </span>
            </div>

            {/* Title */}
            <h4 className="text-sm font-medium text-white/80 leading-tight mb-3 line-clamp-2">
              {task.title}
            </h4>

            {/* Bottom row */}
            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <span className="text-[10px] text-white/40 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {task.dueDate}
              </span>
              {task.status === 'pending' ? (
                <ChevronRight className="w-4 h-4 text-white/30" />
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <CheckCircle className="w-3 h-3" />
                  {task.grade}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
