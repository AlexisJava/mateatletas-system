'use client';

import React, { useState } from 'react';
import { HOUSES, SUBJECTS } from '../constants';
import { SandboxIcons } from './SandboxIcons';
import { House, type Subject } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// WELCOME SCREEN
// ─────────────────────────────────────────────────────────────────────────────

interface WelcomeScreenProps {
  onStart: (house: House, subject: Subject, pattern: string) => void;
}

const SUBJECT_ICONS: Record<Subject, React.FC> = {
  MATH: SandboxIcons.Math,
  CODE: SandboxIcons.Code,
  SCIENCE: SandboxIcons.Science,
};

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [selectedHouse, setSelectedHouse] = useState<House>(House.QUANTUM);
  const [selectedSubject, setSelectedSubject] = useState<Subject>('MATH');

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#030014] text-slate-200 p-6 overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#2e1065_0%,_transparent_40%)] opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-[#a855f7]/10 blur-[150px] rounded-full pointer-events-none" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-top-8 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1b4b]/80 border border-[#a855f7]/30 text-xs font-bold text-[#a855f7] shadow-[0_0_20px_rgba(168,85,247,0.2)] backdrop-blur-md mb-2">
            <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse" />
            <span>SANDBOX EDITOR v1.0</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-purple-100 to-[#a855f7] drop-shadow-[0_0_40px_rgba(168,85,247,0.3)]">
            Mateatletas
          </h1>
          <p className="text-xl text-[#94a3b8] font-light tracking-wide max-w-lg mx-auto">
            Editor de contenido educativo gamificado.
          </p>
        </div>

        {/* Selection Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full items-stretch">
          {/* House Selection */}
          <div className="lg:col-span-2 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#a855f7]/50 to-transparent" />
              <span className="text-sm font-bold text-[#a855f7] uppercase tracking-[0.2em]">
                Selecciona tu Facción
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#a855f7]/50 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Object.keys(HOUSES) as House[]).map((h) => (
                <button
                  key={h}
                  onClick={() => setSelectedHouse(h)}
                  className={`group relative h-64 rounded-3xl border transition-all duration-500 overflow-hidden text-left p-6 flex flex-col justify-end ${
                    selectedHouse === h
                      ? 'border-[#a855f7] bg-[#1e1b4b]/60 shadow-[0_0_50px_rgba(168,85,247,0.2)]'
                      : 'border-white/5 bg-[#0f0720]/40 hover:bg-[#1e1b4b]/40 hover:border-[#a855f7]/40'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  <div
                    className="absolute top-0 right-0 p-32 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"
                    style={{ backgroundColor: HOUSES[h].primaryColor }}
                  />
                  <div className="relative z-10 transform group-hover:-translate-y-2 transition-transform duration-500">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 backdrop-blur-sm"
                      style={{
                        backgroundColor: `${HOUSES[h].primaryColor}20`,
                        borderColor: `${HOUSES[h].primaryColor}50`,
                        borderWidth: 1,
                      }}
                    >
                      {HOUSES[h].name[0]}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{HOUSES[h].name}</h3>
                    <p className="text-[#94a3b8] text-xs font-mono">{HOUSES[h].ageRange}</p>
                  </div>
                  {selectedHouse === h && (
                    <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-[#a855f7] shadow-[0_0_10px_#a855f7]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Selection & Start Button */}
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#06b6d4]/50 to-transparent" />
                <span className="text-sm font-bold text-[#06b6d4] uppercase tracking-[0.2em]">
                  Materia
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#06b6d4]/50 to-transparent" />
              </div>
              <div className="space-y-3">
                {SUBJECTS.map((sub) => {
                  const Icon = SUBJECT_ICONS[sub.id];
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubject(sub.id)}
                      className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all duration-300 ${
                        selectedSubject === sub.id
                          ? 'bg-[#06b6d4]/10 border-[#06b6d4] text-white shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                          : 'bg-[#0f0720]/40 border-white/5 text-[#64748b] hover:text-white hover:bg-[#1e1b4b]/40'
                      }`}
                    >
                      <span
                        className={selectedSubject === sub.id ? 'text-[#06b6d4]' : 'text-current'}
                      >
                        <Icon />
                      </span>
                      <span className="font-bold tracking-wide">{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-auto">
              <button
                onClick={() => onStart(selectedHouse, selectedSubject, 'cyber-grid')}
                className="group relative w-full py-6 rounded-2xl bg-white text-black font-black text-lg tracking-widest uppercase overflow-hidden hover:scale-[1.02] transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#a855f7] via-[#06b6d4] to-[#a855f7] opacity-0 group-hover:opacity-20 transition-opacity" />
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Inicializar
                  <SandboxIcons.Arrow />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;
