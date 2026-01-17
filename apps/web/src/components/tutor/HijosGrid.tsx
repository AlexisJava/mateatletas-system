'use client';

import { HijoCard } from './HijoCard';
import type { HijoInfo } from '@/lib/api/tutores.api';

interface HijosGridProps {
  hijos: HijoInfo[];
  onSelectHijo: (hijo: HijoInfo) => void;
}

/**
 * Grid de cards de hijos
 * Muestra cada estudiante como una card clickeable
 */
export function HijosGrid({ hijos, onSelectHijo }: HijosGridProps) {
  if (hijos.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-slate-400">
          <p className="text-lg mb-2">No hay estudiantes registrados</p>
          <p className="text-sm">Los datos aparecerán cuando tengas hijos inscriptos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full content-start">
      {hijos.map((hijo) => (
        <HijoCard key={hijo.id} hijo={hijo} onClick={() => onSelectHijo(hijo)} />
      ))}
    </div>
  );
}
