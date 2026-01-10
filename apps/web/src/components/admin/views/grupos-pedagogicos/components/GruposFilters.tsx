'use client';

import { Search, X, Filter } from 'lucide-react';
import type { FiltrosGrupoPedagogico, CasaTipo, MundoTipo } from '../types/grupos.types';
import { CASA_CONFIG, MUNDO_CONFIG } from '../types/grupos.types';

interface GruposFiltersProps {
  filtros: FiltrosGrupoPedagogico;
  onFiltrosChange: React.Dispatch<React.SetStateAction<FiltrosGrupoPedagogico>>;
  onClear: () => void;
}

const CASAS: CasaTipo[] = ['QUANTUM', 'VERTEX', 'PULSAR'];
const MUNDOS: MundoTipo[] = ['MATEMATICA', 'PROGRAMACION', 'CIENCIAS'];

export function GruposFilters({ filtros, onFiltrosChange, onClear }: GruposFiltersProps) {
  const hasActiveFilters = filtros.casa_tipo || filtros.mundo_tipo || filtros.activo !== undefined;

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 space-y-4">
      {/* Filtros por Casa/Mundo */}
      <div className="flex flex-wrap gap-4">
        {/* Filtro Casa */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Casa:</span>
          <div className="flex gap-1">
            {CASAS.map((casa) => {
              const config = CASA_CONFIG[casa];
              const isActive = filtros.casa_tipo === casa;
              return (
                <button
                  key={casa}
                  onClick={() =>
                    onFiltrosChange((prev) => ({
                      ...prev,
                      casa_tipo: isActive ? undefined : casa,
                    }))
                  }
                  className={`px-2 py-1 text-xs rounded-md transition-all ${
                    isActive
                      ? `${config.bgColor} ${config.color} ring-1 ring-current`
                      : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {config.label.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtro Mundo */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Mundo:</span>
          <div className="flex gap-1">
            {MUNDOS.map((mundo) => {
              const config = MUNDO_CONFIG[mundo];
              const isActive = filtros.mundo_tipo === mundo;
              return (
                <button
                  key={mundo}
                  onClick={() =>
                    onFiltrosChange((prev) => ({
                      ...prev,
                      mundo_tipo: isActive ? undefined : mundo,
                    }))
                  }
                  className={`px-2 py-1 text-xs rounded-md transition-all ${
                    isActive
                      ? `${config.bgColor} ${config.color} ring-1 ring-current`
                      : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtro Activo */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Estado:</span>
          <div className="flex gap-1">
            <button
              onClick={() =>
                onFiltrosChange((prev) => ({
                  ...prev,
                  activo: prev.activo === true ? undefined : true,
                }))
              }
              className={`px-2 py-1 text-xs rounded-md transition-all ${
                filtros.activo === true
                  ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-400'
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() =>
                onFiltrosChange((prev) => ({
                  ...prev,
                  activo: prev.activo === false ? undefined : false,
                }))
              }
              className={`px-2 py-1 text-xs rounded-md transition-all ${
                filtros.activo === false
                  ? 'bg-red-500/20 text-red-400 ring-1 ring-red-400'
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Inactivos
            </button>
          </div>
        </div>

        {/* Botón limpiar */}
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-md transition-colors"
          >
            <X className="w-3 h-3" />
            Limpiar
          </button>
        )}
      </div>

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Filter className="w-3 h-3" />
          <span>
            Filtros activos:{' '}
            {[
              filtros.casa_tipo && `Casa: ${CASA_CONFIG[filtros.casa_tipo].label}`,
              filtros.mundo_tipo && `Mundo: ${MUNDO_CONFIG[filtros.mundo_tipo].label}`,
              filtros.activo !== undefined && `Estado: ${filtros.activo ? 'Activos' : 'Inactivos'}`,
            ]
              .filter(Boolean)
              .join(' • ')}
          </span>
        </div>
      )}
    </div>
  );
}
