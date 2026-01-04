import React from 'react';
import { Video, Mic, MonitorPlay } from 'lucide-react';
import { LiveSession } from '../../types/docente.types';

interface LiveClassHeroProps {
  session: LiveSession;
}

export const LiveClassHero: React.FC<LiveClassHeroProps> = ({ session }) => {
  return (
    <div className="h-full relative w-full rounded-3xl overflow-hidden border border-indigo-500/30 shadow-[0_0_40px_rgba(79,70,229,0.1)] group flex flex-col">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={session.thumbnail}
          alt="Class Background"
          className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-indigo-950/40" />
      </div>

      <div className="relative z-10 p-6 flex flex-col h-full">
        {/* Top Header */}
        <div className="flex justify-between items-start mb-auto">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            En Vivo
          </div>
          <div className="px-3 py-1 rounded-full bg-slate-950/60 border border-slate-700 text-slate-300 text-xs font-medium backdrop-blur-md">
            {session.duration} transcurridos
          </div>
        </div>

        {/* Content */}
        <div className="mt-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 leading-tight">
            {session.title}
          </h1>
          <p className="text-sm md:text-base text-slate-400 font-medium line-clamp-1">
            <span className="text-indigo-400">Tema:</span> {session.topic}
          </p>
        </div>

        {/* Action Bar */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <img
                key={i}
                className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover"
                src={`https://picsum.photos/seed/${i + 50}/100/100`}
                alt={`Student ${i}`}
              />
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
              +{session.totalStudents - 3}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors backdrop-blur-sm">
              <Mic size={18} />
            </button>
            <button className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors backdrop-blur-sm">
              <Video size={18} />
            </button>
            <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
              <MonitorPlay size={18} />
              Entrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
