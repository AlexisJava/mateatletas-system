'use client';

import React, { useState, useMemo } from 'react';
import { CodePreview } from './CodePreview';
import type { Lesson, HouseConfig, NodoContenido } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Flatten tree to get all leaf nodes (nodes without children) in order */
function getLeafNodes(nodos: NodoContenido[]): NodoContenido[] {
  const leaves: NodoContenido[] = [];

  function traverse(node: NodoContenido) {
    if (node.hijos.length === 0) {
      leaves.push(node);
    } else {
      // Sort children by order before traversing
      const sortedHijos = [...node.hijos].sort((a, b) => a.orden - b.orden);
      sortedHijos.forEach(traverse);
    }
  }

  // Sort root nodes by order
  const sortedRoots = [...nodos].sort((a, b) => a.orden - b.orden);
  sortedRoots.forEach(traverse);

  return leaves;
}

// ─────────────────────────────────────────────────────────────────────────────
// LESSON PLAYER
// ─────────────────────────────────────────────────────────────────────────────

interface LessonPlayerProps {
  lesson: Lesson;
  houseStyles: HouseConfig;
  onClose: () => void;
}

/**
 * Fullscreen lesson player - how students will see the content.
 * Includes navigation, progress bar, and house-themed styling.
 * Navigates through leaf nodes (nodes without children) in hierarchical order.
 */
export function LessonPlayer({ lesson, houseStyles, onClose }: LessonPlayerProps) {
  // Get all navigable content (leaf nodes only)
  const leafNodes = useMemo(() => getLeafNodes(lesson.nodos), [lesson.nodos]);

  const [currentIdx, setCurrentIdx] = useState(0);

  // Handle empty content
  if (leafNodes.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#030014] flex flex-col items-center justify-center font-sans text-slate-200">
        <div className="text-center p-8">
          <div className="w-20 h-20 rounded-2xl bg-[#131b2e] flex items-center justify-center mb-6 mx-auto">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-[#64748b]"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Sin contenido</h2>
          <p className="text-sm text-[#64748b] mb-6">
            Esta lección no tiene nodos de contenido para mostrar.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-[#a855f7] text-white font-bold text-sm hover:bg-[#9333ea] transition-colors"
          >
            Volver al Editor
          </button>
        </div>
      </div>
    );
  }

  const currentNode = leafNodes[currentIdx]!;

  // Dynamic CSS variables for house theming
  const playerStyle = {
    '--house-primary': houseStyles.primaryColor,
    '--house-secondary': houseStyles.secondaryColor,
    '--house-accent': houseStyles.accentColor,
  } as React.CSSProperties;

  const progressPercent = ((currentIdx + 1) / leafNodes.length) * 100;
  const isLastNode = currentIdx === leafNodes.length - 1;

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#030014] flex flex-col font-sans text-slate-200"
      style={playerStyle}
    >
      {/* LAYER 0: CONTENT (Full Screen) */}
      <div className="absolute inset-0 z-0">
        {/* Key forces remount on node change for animations */}
        <CodePreview code={currentNode.contenidoJson || '{}'} key={currentNode.id} />
      </div>

      {/* LAYER 1: HUD (Floating Controls) */}
      <div className="absolute inset-0 z-10 flex flex-col pointer-events-none justify-between">
        {/* Header HUD */}
        <header className="h-24 px-6 pt-4 flex items-start justify-between bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-auto transition-opacity duration-300 hover:opacity-100">
          <div className="flex items-center gap-6 flex-1">
            <button
              onClick={onClose}
              className="group w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white backdrop-blur-md border border-white/5 transition-all hover:scale-105 active:scale-95"
              aria-label="Salir de la lección"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="flex-1 max-w-md hidden md:block">
              <div className="flex items-center justify-between text-[9px] font-bold text-[#94a3b8] mb-1.5 uppercase tracking-widest px-1">
                <span>Progreso de Misión</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                <div
                  className="h-full transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] rounded-full bg-gradient-to-r from-[var(--house-primary)] to-white shadow-[0_0_15px_var(--house-primary-alpha)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--house-primary)]/10 border border-[var(--house-primary)]/30 backdrop-blur-md mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--house-primary)] animate-pulse" />
              <p className="text-[10px] font-black text-[var(--house-primary)] uppercase tracking-widest font-mono">
                {lesson.house}
              </p>
            </div>
            <h1 className="text-sm font-bold text-white drop-shadow-md opacity-90">
              {lesson.title}
            </h1>
            <p className="text-[10px] text-[#64748b] mt-0.5">{currentNode.titulo}</p>
          </div>
        </header>

        {/* Spacer */}
        <div className="flex-1 pointer-events-none" />

        {/* Footer HUD */}
        <footer className="h-28 px-8 pb-8 flex items-end justify-between bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-auto">
          <button
            onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#94a3b8] hover:text-white transition-all px-4 py-3 rounded-xl hover:bg-white/5 ${currentIdx === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            aria-label="Nodo anterior"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Anterior
          </button>

          <div className="flex flex-col items-center pb-2">
            <span className="text-2xl font-black text-white/20 tracking-tighter font-mono select-none">
              {String(currentIdx + 1).padStart(2, '0')} /{' '}
              {String(leafNodes.length).padStart(2, '0')}
            </span>
          </div>

          <button
            onClick={() => {
              if (isLastNode) {
                onClose();
              } else {
                setCurrentIdx((prev) => Math.min(leafNodes.length - 1, prev + 1));
              }
            }}
            className="group relative px-8 py-3.5 rounded-xl font-black text-sm text-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.3)] overflow-hidden"
            style={{
              background: isLastNode
                ? 'linear-gradient(135deg, #00ffa3, #06b6d4)'
                : 'linear-gradient(135deg, var(--house-primary), var(--house-accent))',
            }}
            aria-label={isLastNode ? 'Finalizar lección' : 'Siguiente nodo'}
          >
            <div className="absolute inset-0 bg-white/20 group-hover:opacity-100 opacity-0 transition-opacity" />
            <span className="relative flex items-center gap-2">
              {isLastNode ? 'FINALIZAR MISIÓN' : 'SIGUIENTE'}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="transition-transform group-hover:translate-x-1"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </button>
        </footer>
      </div>
    </div>
  );
}

export default LessonPlayer;
