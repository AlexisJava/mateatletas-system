'use client';

import { Terminal } from 'lucide-react';
import { TypingCode } from '@/components/ui/TypingCode';
import { codeLines } from '../data/landing-data';

export function CodeTerminal() {
  return (
    <div className="relative group">
      {/* Borde del terminal con efecto de luz recorriéndolo */}
      <div className="absolute -inset-[1px] rounded-3xl overflow-hidden">
        {/* SVG para dibujar el camino del borde */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{
            filter: 'drop-shadow(0 0 12px rgba(16, 255, 180, 0.8)) drop-shadow(0 0 4px rgba(16, 255, 180, 1))',
          }}
        >
          <defs>
            {/* Gradiente lineal para la estela del fotón - MÁS VERDE NEÓN */}
            <linearGradient id="photon-trail" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" stopOpacity="0" />
              <stop offset="30%" stopColor="rgba(16, 185, 129, 0.15)" stopOpacity="0.15" />
              <stop offset="50%" stopColor="rgba(16, 211, 153, 0.4)" stopOpacity="0.4" />
              <stop offset="65%" stopColor="rgba(16, 240, 180, 0.7)" stopOpacity="0.7" />
              <stop offset="80%" stopColor="rgba(16, 255, 180, 0.95)" stopOpacity="0.95" />
              <stop offset="90%" stopColor="#10ffb4" stopOpacity="1" />
              <stop offset="96%" stopColor="#5fffcf" stopOpacity="0.8" />
              <stop offset="100%" stopColor="rgba(16, 255, 180, 0)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Rectángulo redondeado que sigue el borde */}
          <rect
            x="1"
            y="1"
            width="calc(100% - 2px)"
            height="calc(100% - 2px)"
            rx="24"
            ry="24"
            fill="none"
            stroke="url(#photon-trail)"
            strokeWidth="4"
            strokeDasharray="150 1300"
            strokeDashoffset="0"
            strokeLinecap="round"
            style={{
              animation: 'dash 4s linear infinite',
            }}
          />
        </svg>
      </div>

      {/* Añadir keyframes para la animación */}
      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -1450;
          }
        }
      `}</style>

      <div className="relative border-2 border-emerald-500/40 rounded-3xl bg-gradient-to-br from-zinc-950 via-black to-zinc-950 backdrop-blur-xl overflow-hidden shadow-2xl shadow-emerald-500/30">
        {/* Header del terminal - ÉPICO */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-emerald-950/40">
          {/* Efecto de brillo en el header */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="flex gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:scale-110 transition-all cursor-pointer shadow-lg shadow-red-500/40 ring-1 ring-red-400/20" />
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 hover:scale-110 transition-all cursor-pointer shadow-lg shadow-yellow-500/40 ring-1 ring-yellow-400/20" />
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 hover:scale-110 transition-all cursor-pointer shadow-lg shadow-emerald-500/40 ring-1 ring-emerald-400/20" />
            </div>
            <div className="flex items-center gap-2.5 ml-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-400/30 shadow-inner">
              <Terminal className="w-4 h-4 text-emerald-300" strokeWidth={2.5} />
              <span className="text-xs text-emerald-200 font-mono font-bold tracking-wide">
                entrenamiento.py
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-400/30">
              <div className="text-[11px] text-emerald-300 font-mono font-bold">Python 3.11.5</div>
            </div>
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/60" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
          </div>
        </div>

        {/* Código con fondo ÉPICO */}
        <div className="relative p-8 h-[380px] overflow-hidden bg-gradient-to-br from-emerald-950/8 via-black to-teal-950/8">
          {/* Grid pattern más visible */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(16, 255, 180, 0.4) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(16, 255, 180, 0.4) 1px, transparent 1px)
              `,
              backgroundSize: '32px 32px',
            }}
          />

          {/* Efecto de spotlight desde arriba */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-emerald-500/10 to-transparent blur-2xl" />

          {/* Partículas flotantes sutiles */}
          <div className="absolute top-10 left-10 w-1 h-1 rounded-full bg-emerald-400/30 animate-pulse" />
          <div
            className="absolute top-20 right-16 w-1 h-1 rounded-full bg-teal-400/30 animate-pulse"
            style={{ animationDelay: '0.5s' }}
          />
          <div
            className="absolute bottom-20 left-20 w-1 h-1 rounded-full bg-emerald-400/30 animate-pulse"
            style={{ animationDelay: '1s' }}
          />
          <div
            className="absolute bottom-16 right-12 w-1 h-1 rounded-full bg-teal-400/30 animate-pulse"
            style={{ animationDelay: '1.5s' }}
          />

          <div className="relative z-10">
            <TypingCode codeLines={codeLines} />
          </div>
        </div>
      </div>

      {/* Glow effect épico */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/25 via-teal-500/20 to-green-500/25 blur-[60px] -z-10 opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-emerald-500/20 rounded-full blur-[100px] -z-20 opacity-30" />
    </div>
  );
}
