'use client';

import { Search, X, Filter } from 'lucide-react';
import type {
  FiltrosAsignaciones,
  CasaTipo,
  MundoTipo,
  TipoAsignacionDocente,
} from '../types/asignaciones.types';
import { CASA_CONFIG, MUNDO_CONFIG, TIPO_ASIGNACION_CONFIG } from '../types/asignaciones.types';

interface AsignacionesFiltersProps {
  filtros: FiltrosAsignaciones;
  onFiltrosChange: React.Dispatch<React.SetStateAction<FiltrosAsignaciones>>;
  onClear: () => void;
}

const CASAS: CasaTipo[] = ['QUANTUM', 'VERTEX', 'PULSAR'];
const MUNDOS: MundoTipo[] = ['MATEMATICA', 'PROGRAMACION', 'CIENCIAS'];
const TIPOS: TipoAsignacionDocente[] = ['CLASE_GRUPOS', 'COMISIONES', 'AMBOS'];

export function AsignacionesFilters({
  filtros,
  onFiltrosChange,
  onClear,
}: AsignacionesFiltersProps) {
  const hasActiveFilters =
    filtros.casa_tipo || filtros.mundo_tipo || filtros.tipo_asignacion || filtros.busqueda;

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 space-y-4">
      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={filtros.busqueda ?? ''}
          onChange={(e) => onFiltrosChange((prev) => ({ ...prev, busqueda: e.target.value }))}
          className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        />
      </div>

      {/* Filtros por Casa/Mundo/Tipo */}
      <div className="flex flex-wrap gap-3">
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

        {/* Filtro Tipo */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Tipo:</span>
          <div className="flex gap-1">
            {TIPOS.map((tipo) => {
              const config = TIPO_ASIGNACION_CONFIG[tipo];
              const isActive = filtros.tipo_asignacion === tipo;
              return (
                <button
                  key={tipo}
                  onClick={() =>
                    onFiltrosChange((prev) => ({
                      ...prev,
                      tipo_asignacion: isActive ? undefined : tipo,
                    }))
                  }
                  className={`px-2 py-1 text-xs rounded-md transition-all ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-400'
                      : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {config.label}
                </button>
              );
            })}
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
              filtros.tipo_asignacion &&
                `Tipo: ${TIPO_ASIGNACION_CONFIG[filtros.tipo_asignacion].label}`,
              filtros.busqueda && `Búsqueda: "${filtros.busqueda}"`,
            ]
              .filter(Boolean)
              .join(' • ')}
          </span>
        </div>
      )}
    </div>
  );
}
