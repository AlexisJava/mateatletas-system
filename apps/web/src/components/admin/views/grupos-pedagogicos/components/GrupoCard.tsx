'use client';

import { Users, BookOpen, Briefcase, Edit2 } from 'lucide-react';
import type { GrupoPedagogico, CasaTipo, MundoTipo } from '../types/grupos.types';
import { CASA_CONFIG, MUNDO_CONFIG } from '../types/grupos.types';

interface GrupoCardProps {
  grupo: GrupoPedagogico;
  onSelect: () => void;
}

export function GrupoCard({ grupo, onSelect }: GrupoCardProps) {
  const casaConfig = grupo.casa_tipo ? CASA_CONFIG[grupo.casa_tipo] : null;
  const mundoConfig = grupo.mundo_tipo ? MUNDO_CONFIG[grupo.mundo_tipo] : null;

  const totalClases = grupo._count?.claseGrupos ?? 0;
  const totalComisiones = grupo._count?.comisionesProducto ?? 0;

  return (
    <div
      className={`
        bg-slate-800/50 rounded-xl p-4 border border-slate-700/50
        hover:border-slate-600/50 transition-all cursor-pointer
        ${!grupo.activo ? 'opacity-60' : ''}
      `}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{grupo.codigo}</h3>
            {!grupo.activo && (
              <span className="px-1.5 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">
                Inactivo
              </span>
            )}
          </div>
          {grupo.nombre && <p className="text-sm text-slate-400 mt-0.5">{grupo.nombre}</p>}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {/* Badges Casa/Mundo */}
      <div className="flex flex-wrap gap-2 mb-3">
        {casaConfig ? (
          <span
            className={`px-2 py-1 text-xs rounded-md ${casaConfig.bgColor} ${casaConfig.color}`}
          >
            {casaConfig.label}
          </span>
        ) : (
          <span className="px-2 py-1 text-xs rounded-md bg-slate-700/50 text-slate-500">
            Sin Casa
          </span>
        )}
        {mundoConfig ? (
          <span
            className={`px-2 py-1 text-xs rounded-md ${mundoConfig.bgColor} ${mundoConfig.color}`}
          >
            {mundoConfig.label}
          </span>
        ) : (
          <span className="px-2 py-1 text-xs rounded-md bg-slate-700/50 text-slate-500">
            Sin Mundo
          </span>
        )}
      </div>

      {/* Edad range */}
      {(grupo.edad_minima !== null || grupo.edad_maxima !== null) && (
        <div className="flex items-center gap-1.5 mb-3 text-xs text-slate-400">
          <Users className="w-3.5 h-3.5" />
          <span>
            Edad:{' '}
            {grupo.edad_minima !== null && grupo.edad_maxima !== null
              ? `${grupo.edad_minima}-${grupo.edad_maxima} años`
              : grupo.edad_minima !== null
                ? `Desde ${grupo.edad_minima} años`
                : `Hasta ${grupo.edad_maxima} años`}
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-1.5 text-xs">
          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-300">{totalClases}</span>
          <span className="text-slate-500">clases</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <Briefcase className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-slate-300">{totalComisiones}</span>
          <span className="text-slate-500">comisiones</span>
        </div>
      </div>
    </div>
  );
}
