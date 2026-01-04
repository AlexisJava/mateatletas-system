import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { Comision } from '../../types/docente.types';
import { ComisionCard } from './ComisionCard';

interface ComisionesGridProps {
  comisiones: Comision[];
  onSelect?: (id: string) => void;
}

export const ComisionesGrid: React.FC<ComisionesGridProps> = ({ comisiones, onSelect }) => {
  // Limitar a 4 comisiones para que quepan en el grid sin scroll
  const visibleComisiones = comisiones.slice(0, 4);

  return (
    <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden h-full min-h-0 flex flex-col">
      <div className="px-4 py-2 border-b border-slate-800/50 flex items-center justify-between shrink-0 bg-slate-950/20">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <LayoutGrid size={14} className="text-indigo-400" />
          Mis Comisiones
        </h3>
        {comisiones.length > 4 && (
          <button className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wide">
            +{comisiones.length - 4} más
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 p-2 flex flex-col gap-2 overflow-y-auto no-scrollbar">
        {visibleComisiones.map((comision) => (
          <div
            key={comision.id}
            onClick={() => onSelect && onSelect(comision.id)}
            className={`shrink-0 ${onSelect ? 'cursor-pointer transition-transform hover:scale-[1.01]' : ''}`}
          >
            <ComisionCard comision={comision} />
          </div>
        ))}
      </div>
    </div>
  );
};
