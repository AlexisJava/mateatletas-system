'use client';

import { Check, Calendar, Clock } from 'lucide-react';
import type { ClaseGrupoInfo } from '../types';

interface HorarioStepProps {
  readonly claseGrupos: ClaseGrupoInfo[];
  readonly selectedClaseGrupo: ClaseGrupoInfo | null;
  readonly onSelectHorario: (claseGrupo: ClaseGrupoInfo) => void;
}

/**
 * Paso 4: Selección de horario para plan Sincrónico
 *
 * Solo se muestra cuando el tier seleccionado es STEAM_SINCRONICO.
 */
export function HorarioStep({
  claseGrupos,
  selectedClaseGrupo,
  onSelectHorario,
}: HorarioStepProps): React.ReactElement {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Elegí tu horario</h2>
      <p className="text-slate-400 mb-8">
        Las clases en vivo son semanales. Elegí el horario que más te convenga.
      </p>

      <div className="space-y-3">
        {claseGrupos.map((grupo) => (
          <HorarioCard
            key={grupo.id}
            grupo={grupo}
            isSelected={selectedClaseGrupo?.id === grupo.id}
            onSelect={() => onSelectHorario(grupo)}
          />
        ))}
      </div>
    </div>
  );
}

interface HorarioCardProps {
  readonly grupo: ClaseGrupoInfo;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}

/**
 * Card de horario seleccionable
 */
function HorarioCard({ grupo, isSelected, onSelect }: HorarioCardProps): React.ReactElement {
  const sinCupo = grupo.cupoDisponible <= 0;

  return (
    <button
      onClick={() => !sinCupo && onSelect()}
      disabled={sinCupo}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
        sinCupo
          ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
          : isSelected
            ? 'bg-cyan-500/10 border-cyan-500/50 ring-2 ring-cyan-500/30'
            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
      }`}
    >
      <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
        <Calendar className="w-7 h-7 text-white" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-white">{grupo.diaSemana}</p>
        <p className="text-sm text-slate-400 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {grupo.horaInicio} - {grupo.horaFin}
        </p>
        {grupo.docente && (
          <p className="text-sm text-slate-500 mt-1">
            Prof. {grupo.docente.nombre} {grupo.docente.apellido}
          </p>
        )}
      </div>
      <div className="text-right">
        {sinCupo ? (
          <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full">
            Sin cupo
          </span>
        ) : (
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm rounded-full">
            {grupo.cupoDisponible} lugares
          </span>
        )}
      </div>
      {isSelected && (
        <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
    </button>
  );
}
