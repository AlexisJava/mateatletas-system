'use client';

import React, { useState } from 'react';
import type { Planificacion, ClasePlanificacion } from '@/lib/api/planificaciones-admin.api';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type ContentSection = 'teoria' | 'practica';

interface PlanificacionSidebarProps {
  planificacion: Planificacion;
  activeClaseIndex: number;
  activeSection: ContentSection;
  onSelectClase: (index: number, section: ContentSection) => void;
  onUpdatePlanificacion?: (plan: Planificacion) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────

const Icons = {
  Book: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  ),
  Code: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Check: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ChevronDown: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  ChevronRight: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// CLASE ITEM COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface ClaseItemProps {
  clase: ClasePlanificacion;
  index: number;
  isActive: boolean;
  activeSection: ContentSection;
  onSelectSection: (section: ContentSection) => void;
}

function ClaseItem({ clase, index, isActive, activeSection, onSelectSection }: ClaseItemProps) {
  const [isExpanded, setIsExpanded] = useState(isActive);

  // Expandir automáticamente cuando se activa
  React.useEffect(() => {
    if (isActive && !isExpanded) {
      setIsExpanded(true);
    }
  }, [isActive, isExpanded]);

  const teoriaComplete = clase.teoria?.estado === 'PUBLICADO';
  const practicaComplete = clase.practica?.estado === 'PUBLICADO';

  return (
    <div className="mb-1">
      {/* Clase Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
          isActive
            ? 'bg-[#06b6d4]/10 border border-[#06b6d4]/30'
            : 'hover:bg-white/5 border border-transparent'
        }`}
      >
        <span
          className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''} ${
            isActive ? 'text-[#06b6d4]' : 'text-[#475569]'
          }`}
        >
          <Icons.ChevronRight />
        </span>

        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
            isActive
              ? 'bg-[#06b6d4] text-black'
              : teoriaComplete && practicaComplete
                ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30'
                : 'bg-[#1e1b4b] text-[#94a3b8]'
          }`}
        >
          {clase.numero}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium truncate ${
              isActive ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'
            }`}
          >
            {clase.titulo}
          </p>
        </div>

        {/* Completion Indicators */}
        <div className="flex gap-1">
          <div
            className={`w-2 h-2 rounded-full ${
              teoriaComplete ? 'bg-[#10b981]' : 'bg-[#475569]/50'
            }`}
            title={teoriaComplete ? 'Teoría completa' : 'Teoría pendiente'}
          />
          <div
            className={`w-2 h-2 rounded-full ${
              practicaComplete ? 'bg-[#10b981]' : 'bg-[#475569]/50'
            }`}
            title={practicaComplete ? 'Práctica completa' : 'Práctica pendiente'}
          />
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="ml-6 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
          {/* Teoría */}
          <button
            onClick={() => onSelectSection('teoria')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
              isActive && activeSection === 'teoria'
                ? 'bg-[#a855f7]/20 border border-[#a855f7]/40 text-[#a855f7]'
                : 'hover:bg-white/5 text-[#64748b] hover:text-white border border-transparent'
            }`}
          >
            <Icons.Book />
            <span className="text-sm">Teoría</span>
            {teoriaComplete && (
              <span className="ml-auto text-[#10b981]">
                <Icons.Check />
              </span>
            )}
          </button>

          {/* Práctica */}
          <button
            onClick={() => onSelectSection('practica')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
              isActive && activeSection === 'practica'
                ? 'bg-[#06b6d4]/20 border border-[#06b6d4]/40 text-[#06b6d4]'
                : 'hover:bg-white/5 text-[#64748b] hover:text-white border border-transparent'
            }`}
          >
            <Icons.Code />
            <span className="text-sm">Práctica</span>
            {practicaComplete && (
              <span className="ml-auto text-[#10b981]">
                <Icons.Check />
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function PlanificacionSidebar({
  planificacion,
  activeClaseIndex,
  activeSection,
  onSelectClase,
}: PlanificacionSidebarProps) {
  const completedClases = planificacion.clases.filter(
    (c) => c.teoria?.estado === 'PUBLICADO' && c.practica?.estado === 'PUBLICADO',
  ).length;

  const progressPercent = Math.round((completedClases / planificacion.clases.length) * 100);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/30 flex items-center justify-center">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
            >
              <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-white truncate">{planificacion.titulo}</h2>
            <p className="text-[10px] text-[#64748b] uppercase tracking-wide">
              {planificacion.cantidad_clases} clases
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-[#64748b]">Progreso</span>
            <span className="text-[#06b6d4] font-medium">
              {completedClases}/{planificacion.cantidad_clases}
            </span>
          </div>
          <div className="h-1.5 bg-[#1e1b4b] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#06b6d4] to-[#a855f7] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Clases List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
        <div className="mb-3">
          <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider px-3 mb-2">
            Clases
          </p>
        </div>

        {planificacion.clases.map((clase, index) => (
          <ClaseItem
            key={clase.id}
            clase={clase}
            index={index}
            isActive={index === activeClaseIndex}
            activeSection={activeSection}
            onSelectSection={(section) => onSelectClase(index, section)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-2 text-[10px] text-[#475569]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span>Publicado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#475569]/50" />
            <span>Pendiente</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { ContentSection };
export default PlanificacionSidebar;
