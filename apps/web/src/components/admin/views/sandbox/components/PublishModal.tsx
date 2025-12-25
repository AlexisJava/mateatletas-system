'use client';

import React from 'react';
import { SandboxIcons } from './SandboxIcons';

// ─────────────────────────────────────────────────────────────────────────────
// PUBLISH MODAL
// ─────────────────────────────────────────────────────────────────────────────

interface PublishModalProps {
  onClose: () => void;
  onConfirm: () => void;
  isPublishing: boolean;
  lessonTitle: string;
  slideCount: number;
}

export function PublishModal({
  onClose,
  onConfirm,
  isPublishing,
  lessonTitle,
  slideCount,
}: PublishModalProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#030014]/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-[#0f0720] rounded-[2rem] border border-[#8b5cf6]/20 shadow-2xl relative overflow-hidden transform transition-all scale-100 p-0 ring-1 ring-white/5">
        <div className="absolute -top-32 -inset-x-32 h-64 bg-[#a855f7]/20 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 p-8 flex flex-col items-center">
          <div className="mb-6">
            {isPublishing ? (
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-[#a855f7]/20 rounded-full" />
                <div className="absolute inset-0 border-2 border-[#06b6d4] rounded-full border-t-transparent animate-spin" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#1e1b4b] to-[#0f0720] border border-[#a855f7]/20 flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] group">
                <div className="text-[#a855f7] drop-shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-transform group-hover:-translate-y-1">
                  <SandboxIcons.Upload />
                </div>
              </div>
            )}
          </div>

          <h2 className="text-xl font-bold text-white mb-2 text-center tracking-tight">
            {isPublishing ? 'Desplegando Sistema...' : 'Confirmar Publicación'}
          </h2>

          {!isPublishing && (
            <div className="mb-6 px-4 py-1.5 rounded-full bg-[#1e1b4b] border border-[#a855f7]/30 text-[10px] font-mono font-bold text-[#a855f7] tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] shadow-[0_0_5px_currentColor]" />
              {slideCount} {slideCount === 1 ? 'MÓDULO' : 'MÓDULOS'} • {lessonTitle.toUpperCase()}
            </div>
          )}

          <p className="text-[#94a3b8] text-center text-sm leading-relaxed mb-8 px-4">
            {isPublishing
              ? `Empaquetando ${slideCount} diapositivas y sincronizando con la base de datos central.`
              : 'Se subirá la lección completa como un único paquete optimizado.'}
          </p>

          {!isPublishing && (
            <div className="flex w-full gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#1e1b4b] text-[#94a3b8] border border-white/5 hover:bg-[#2e1065] hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#a855f7] hover:bg-[#c084fc] text-black shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all hover:-translate-y-0.5"
              >
                Publicar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUCCESS TOAST
// ─────────────────────────────────────────────────────────────────────────────

export function SuccessToast() {
  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none">
      <div className="bg-[#0f0720]/90 backdrop-blur-md border border-[#00ffa3]/30 text-white px-6 py-3 rounded-full shadow-[0_0_30px_rgba(0,255,163,0.15)] flex items-center gap-3 font-bold text-sm ring-1 ring-[#00ffa3]/20">
        <div className="w-6 h-6 rounded-full bg-[#00ffa3]/20 flex items-center justify-center text-[#00ffa3]">
          <SandboxIcons.Check />
        </div>
        <span className="text-white tracking-wide">LECCIÓN PUBLICADA</span>
      </div>
    </div>
  );
}

export default PublishModal;
