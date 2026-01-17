'use client';

import { Calendar, User, ArrowUpRight } from 'lucide-react';
import type { ClaseProxima } from '@/lib/api/tutores.api';

interface ProximasClasesListProps {
  clases: ClaseProxima[];
  onSelectClase: (clase: ClaseProxima) => void;
}

/**
 * Lista compacta de próximas clases
 * Muestra fecha, nombre, estudiante y docente
 */
export function ProximasClasesList({ clases, onSelectClase }: ProximasClasesListProps) {
  if (clases.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-slate-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg mb-1">Sin clases programadas</p>
          <p className="text-sm">Las próximas clases aparecerán acá</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {clases.map((clase) => (
        <ClaseItem key={clase.id} clase={clase} onClick={() => onSelectClase(clase)} />
      ))}
    </div>
  );
}

interface ClaseItemProps {
  clase: ClaseProxima;
  onClick: () => void;
}

function ClaseItem({ clase, onClick }: ClaseItemProps) {
  const fechaLabel = clase.labelFecha;
  const hora = new Date(clase.fechaHoraInicio).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Color del indicador según si es hoy/mañana
  const indicatorColor = clase.esHoy
    ? 'bg-emerald-500'
    : clase.esManana
      ? 'bg-cyan-500'
      : 'bg-slate-500';

  const labelColor = clase.esHoy
    ? 'text-emerald-400'
    : clase.esManana
      ? 'text-cyan-400'
      : 'text-slate-400';

  return (
    <button
      onClick={onClick}
      className="group w-full bg-slate-900/40 border border-slate-800 rounded-xl p-3 hover:bg-slate-800/60 hover:border-slate-700 transition-all duration-300 text-left"
    >
      <div className="flex items-center gap-3">
        {/* Indicador de fecha */}
        <div className="flex flex-col items-center shrink-0 w-16">
          <div className={`w-2 h-2 rounded-full ${indicatorColor} mb-1`} />
          <span className={`text-xs font-bold ${labelColor}`}>{fechaLabel}</span>
          <span className="text-sm font-semibold text-white">{hora}</span>
        </div>

        {/* Info de la clase */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white truncate mb-1">{clase.nombre}</h4>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {clase.estudiante.nombre}
            </span>
            <span>•</span>
            <span>
              Prof. {clase.docente.nombre} {clase.docente.apellido[0]}.
            </span>
          </div>
        </div>

        {/* Arrow */}
        <div className="shrink-0 p-1.5 text-slate-500 group-hover:text-cyan-400 transition-colors">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
}
