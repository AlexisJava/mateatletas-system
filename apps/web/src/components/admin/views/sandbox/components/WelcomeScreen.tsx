'use client';

import React, { useState } from 'react';
import { HOUSES, SUBJECTS } from '../constants';
import { SandboxIcons } from './SandboxIcons';
import { House, type Subject } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ContentType = 'microleccion' | 'planificacion';

export interface StartParams {
  house: House;
  subject: Subject;
  pattern: string;
  contentType: ContentType;
  /** Solo para planificación: cantidad de clases */
  cantidadClases?: number;
  /** Título personalizado (opcional) */
  titulo?: string;
}

interface WelcomeScreenProps {
  onStart: (params: StartParams) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────

const ContentTypeIcons = {
  Microleccion: () => (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Planificacion: () => (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
};

const SUBJECT_ICONS: Record<Subject, React.FC> = {
  MATH: SandboxIcons.Math,
  CODE: SandboxIcons.Code,
  SCIENCE: SandboxIcons.Science,
};

// ─────────────────────────────────────────────────────────────────────────────
// WELCOME SCREEN
// ─────────────────────────────────────────────────────────────────────────────

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [step, setStep] = useState<'type' | 'config'>('type');
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<House>(House.QUANTUM);
  const [selectedSubject, setSelectedSubject] = useState<Subject>('MATH');
  const [cantidadClases, setCantidadClases] = useState(8);
  const [titulo, setTitulo] = useState('');

  const handleSelectType = (type: ContentType) => {
    setContentType(type);
    setStep('config');
  };

  const handleBack = () => {
    setStep('type');
    setContentType(null);
  };

  const handleStart = () => {
    if (!contentType) return;

    onStart({
      house: selectedHouse,
      subject: selectedSubject,
      pattern: 'cyber-grid',
      contentType,
      cantidadClases: contentType === 'planificacion' ? cantidadClases : undefined,
      titulo: titulo || undefined,
    });
  };

  // ─── STEP 1: Select Content Type ───
  if (step === 'type') {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-[var(--estudiante-bg)] text-slate-200 p-6 overflow-hidden font-sans">
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

        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
          {/* Header */}
          <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-top-8 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1b4b]/80 border border-[#a855f7]/30 text-xs font-bold text-[#a855f7] shadow-[0_0_20px_rgba(168,85,247,0.2)] backdrop-blur-md mb-2">
              <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse" />
              <span>SANDBOX EDITOR v2.0</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-purple-100 to-[#a855f7] drop-shadow-[0_0_40px_rgba(168,85,247,0.3)]">
              ¿Qué querés crear?
            </h1>
            <p className="text-xl text-[#94a3b8] font-light tracking-wide max-w-lg mx-auto">
              Seleccioná el tipo de contenido educativo
            </p>
          </div>

          {/* Content Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            {/* Planificación Card */}
            <button
              onClick={() => handleSelectType('planificacion')}
              className="group relative h-80 rounded-3xl border border-white/5 bg-[#0f0720]/60 hover:bg-[#1e1b4b]/60 hover:border-[#06b6d4]/50 transition-all duration-500 overflow-hidden text-left p-8 flex flex-col"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#06b6d4]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity bg-[#06b6d4]" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-[#06b6d4]/10 border border-[#06b6d4]/30 flex items-center justify-center text-[#06b6d4] mb-6 group-hover:scale-110 transition-transform duration-500">
                  <ContentTypeIcons.Planificacion />
                </div>

                <h3 className="text-3xl font-bold text-white mb-3 group-hover:text-[#06b6d4] transition-colors">
                  Planificación
                </h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed flex-1">
                  Curso estructurado con múltiples clases. Ideal para programas de varias semanas
                  con teoría, práctica y tareas por cada encuentro.
                </p>

                <div className="flex items-center gap-2 mt-4 text-[#64748b] text-xs font-medium">
                  <span className="px-2 py-1 rounded-full bg-[#06b6d4]/10 text-[#06b6d4]">
                    4-52 clases
                  </span>
                  <span className="px-2 py-1 rounded-full bg-white/5">Teoría + Práctica</span>
                  <span className="px-2 py-1 rounded-full bg-white/5">Tareas</span>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-[#06b6d4]/10 flex items-center justify-center text-[#06b6d4] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <SandboxIcons.Arrow />
              </div>
            </button>

            {/* Microlección Card */}
            <button
              onClick={() => handleSelectType('microleccion')}
              className="group relative h-80 rounded-3xl border border-white/5 bg-[#0f0720]/60 hover:bg-[#1e1b4b]/60 hover:border-[#a855f7]/50 transition-all duration-500 overflow-hidden text-left p-8 flex flex-col"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#a855f7]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity bg-[#a855f7]" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/30 flex items-center justify-center text-[#a855f7] mb-6 group-hover:scale-110 transition-transform duration-500">
                  <ContentTypeIcons.Microleccion />
                </div>

                <h3 className="text-3xl font-bold text-white mb-3 group-hover:text-[#a855f7] transition-colors">
                  Microlección
                </h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed flex-1">
                  Cápsula de contenido autoguiada. Perfecta para conceptos puntuales, ejercicios
                  interactivos o material de consulta rápida.
                </p>

                <div className="flex items-center gap-2 mt-4 text-[#64748b] text-xs font-medium">
                  <span className="px-2 py-1 rounded-full bg-[#a855f7]/10 text-[#a855f7]">
                    Autocontenida
                  </span>
                  <span className="px-2 py-1 rounded-full bg-white/5">Interactiva</span>
                  <span className="px-2 py-1 rounded-full bg-white/5">5-15 min</span>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-[#a855f7]/10 flex items-center justify-center text-[#a855f7] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <SandboxIcons.Arrow />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 2: Configure Content ───
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[var(--estudiante-bg)] text-slate-200 p-6 overflow-hidden font-sans">
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
        {/* Back Button & Header */}
        <div className="w-full mb-8 animate-in fade-in slide-in-from-top-8 duration-700">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#64748b] hover:text-white transition-colors mb-8"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Cambiar tipo</span>
          </button>

          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1b4b]/80 border border-[#a855f7]/30 text-xs font-bold text-[#a855f7] shadow-[0_0_20px_rgba(168,85,247,0.2)] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse" />
              <span>
                {contentType === 'planificacion' ? 'NUEVA PLANIFICACIÓN' : 'NUEVA MICROLECCIÓN'}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-purple-100 to-[#a855f7]">
              Configurá tu contenido
            </h1>
          </div>
        </div>

        {/* Configuration Grid */}
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
                  className={`group relative h-56 rounded-3xl border transition-all duration-500 overflow-hidden text-left p-6 flex flex-col justify-end ${
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

          {/* Subject Selection & Config */}
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            {/* Subject */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#06b6d4]/50 to-transparent" />
                <span className="text-sm font-bold text-[#06b6d4] uppercase tracking-[0.2em]">
                  Materia
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#06b6d4]/50 to-transparent" />
              </div>
              <div className="space-y-2">
                {SUBJECTS.map((sub) => {
                  const Icon = SUBJECT_ICONS[sub.id];
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubject(sub.id)}
                      className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all duration-300 ${
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
                      <span className="font-bold tracking-wide text-sm">{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title Input (optional) */}
            <div>
              <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2">
                Título (opcional)
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder={
                  contentType === 'planificacion'
                    ? 'Ej: Scratch Nivel 1'
                    : 'Ej: Intro a las fracciones'
                }
                className="w-full px-4 py-3 rounded-xl bg-[#0f0720]/60 border border-white/10 text-white placeholder-[#475569] focus:border-[#a855f7]/50 focus:outline-none focus:ring-1 focus:ring-[#a855f7]/30 transition-all"
              />
            </div>

            {/* Cantidad de Clases (solo para planificación) */}
            {contentType === 'planificacion' && (
              <div>
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2">
                  Cantidad de clases
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="4"
                    max="24"
                    value={cantidadClases}
                    onChange={(e) => setCantidadClases(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-[#1e1b4b] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#06b6d4] [&::-webkit-slider-thumb]:shadow-[0_0_10px_#06b6d4]"
                  />
                  <div className="w-16 h-12 rounded-xl bg-[#06b6d4]/10 border border-[#06b6d4]/30 flex items-center justify-center">
                    <span className="text-xl font-bold text-[#06b6d4]">{cantidadClases}</span>
                  </div>
                </div>
                <p className="text-[10px] text-[#475569] mt-2">
                  Cada clase tendrá su teoría y práctica editables
                </p>
              </div>
            )}

            {/* Start Button */}
            <div className="mt-auto">
              <button
                onClick={handleStart}
                className="group relative w-full py-5 rounded-2xl bg-white text-black font-black text-base tracking-widest uppercase overflow-hidden hover:scale-[1.02] transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#a855f7] via-[#06b6d4] to-[#a855f7] opacity-0 group-hover:opacity-20 transition-opacity" />
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {contentType === 'planificacion' ? 'Crear Planificación' : 'Crear Microlección'}
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
