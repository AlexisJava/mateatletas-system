'use client';

import { useState } from 'react';
import { MessageSquare, CheckCircle, AlertCircle, Plus } from 'lucide-react';

interface ForumThread {
  id: string;
  question: string;
  author: { name: string; avatar?: string };
  replies: number;
  isResolved: boolean;
  timestamp: string;
}

// Mock data - después conectar con backend
const MOCK_THREADS: ForumThread[] = [
  {
    id: 'f1',
    question: '¿Cómo puedo mejorar mi racha de ejercicios?',
    author: { name: 'Mateo R.' },
    replies: 3,
    isResolved: true,
    timestamp: 'Hace 2h',
  },
  {
    id: 'f2',
    question: 'Duda sobre la tarea de fracciones',
    author: { name: 'Sofia G.' },
    replies: 1,
    isResolved: false,
    timestamp: 'Hace 30m',
  },
  {
    id: 'f3',
    question: '¿Alguien más tuvo problemas con el ejercicio 5?',
    author: { name: 'Lucas P.' },
    replies: 5,
    isResolved: true,
    timestamp: 'Hace 1h',
  },
];

export function CanalComunicacion() {
  const [threads] = useState<ForumThread[]>(MOCK_THREADS);

  return (
    <div className="flex-1 min-h-[350px] lg:min-h-0 rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex justify-between items-center shrink-0">
        <h3 className="text-xs font-semibold text-white/60 flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-violet-500/20 flex items-center justify-center">
            <MessageSquare className="w-3 h-3 text-violet-400" />
          </div>
          Canal de Comunicación
        </h3>
        <button className="flex items-center gap-1.5 text-[10px] font-medium px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition">
          <Plus className="w-3 h-3" />
          Nueva Consulta
        </button>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {threads.map((thread) => (
          <div
            key={thread.id}
            className="rounded-xl p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 cursor-pointer transition"
          >
            <div className="flex gap-3">
              {/* Status icon */}
              <div className="mt-0.5 shrink-0">
                {thread.isResolved ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400/70" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400/70" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h4 className="text-sm font-medium text-white/80 leading-tight line-clamp-2">
                    {thread.question}
                  </h4>
                  <span className="text-[10px] text-white/30 whitespace-nowrap shrink-0">
                    {thread.timestamp}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-white/40">
                  <span>{thread.author.name}</span>
                  <span>•</span>
                  <span>
                    {thread.replies} respuesta{thread.replies !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
