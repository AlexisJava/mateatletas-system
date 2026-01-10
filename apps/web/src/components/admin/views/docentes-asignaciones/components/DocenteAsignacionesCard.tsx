'use client';

import { Plus, X, ChevronRight } from 'lucide-react';
import type { DocenteAsignacionesPerfil, CasaTipo, MundoTipo } from '../types/asignaciones.types';
import { CASA_CONFIG, MUNDO_CONFIG, TIPO_ASIGNACION_CONFIG } from '../types/asignaciones.types';

interface DocenteAsignacionesCardProps {
  docente: DocenteAsignacionesPerfil;
  onAsignarCasa: (casaTipo: CasaTipo) => void;
  onRemoverCasa: (casaTipo: CasaTipo) => void;
  onAsignarMundo: (mundoTipo: MundoTipo) => void;
  onRemoverMundo: (mundoTipo: MundoTipo) => void;
  onSelect: () => void;
}

const ALL_CASAS: CasaTipo[] = ['QUANTUM', 'VERTEX', 'PULSAR'];
const ALL_MUNDOS: MundoTipo[] = ['MATEMATICA', 'PROGRAMACION', 'CIENCIAS'];

export function DocenteAsignacionesCard({
  docente,
  onAsignarCasa,
  onRemoverCasa,
  onAsignarMundo,
  onRemoverMundo,
  onSelect,
}: DocenteAsignacionesCardProps) {
  const casasAsignadas = docente.casas.map((c) => c.casa_tipo);
  const mundosAsignados = docente.mundos.map((m) => m.mundo_tipo);
  const casasDisponibles = ALL_CASAS.filter((c) => !casasAsignadas.includes(c));
  const mundosDisponibles = ALL_MUNDOS.filter((m) => !mundosAsignados.includes(m));

  const tipoConfig = TIPO_ASIGNACION_CONFIG[docente.tipo_asignacion];

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {docente.nombre[0]}
              {docente.apellido[0]}
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {docente.nombre} {docente.apellido}
              </h3>
              <p className="text-xs text-slate-400">{tipoConfig.label}</p>
            </div>
          </div>
          <button
            onClick={onSelect}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            title="Ver detalles"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Casas */}
      <div className="p-4 border-b border-slate-700/50">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Casas</p>
        <div className="flex flex-wrap gap-2">
          {/* Casas asignadas */}
          {docente.casas.map((casa) => {
            const config = CASA_CONFIG[casa.casa_tipo];
            return (
              <span
                key={casa.id}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md ${config.bgColor} ${config.color}`}
              >
                {config.label.split(' ')[0]}
                <button
                  onClick={() => onRemoverCasa(casa.casa_tipo)}
                  className="p-0.5 hover:bg-black/20 rounded"
                  title="Remover casa"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          {/* Botón agregar casa */}
          {casasDisponibles.length > 0 && (
            <div className="relative group">
              <button className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <Plus className="w-3 h-3" />
                Casa
              </button>
              {/* Dropdown */}
              <div className="absolute left-0 top-full mt-1 z-10 hidden group-hover:block bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 min-w-[120px]">
                {casasDisponibles.map((casa) => {
                  const config = CASA_CONFIG[casa];
                  return (
                    <button
                      key={casa}
                      onClick={() => onAsignarCasa(casa)}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-700/50 ${config.color}`}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {docente.casas.length === 0 && casasDisponibles.length === 0 && (
            <span className="text-xs text-slate-500 italic">Sin casas</span>
          )}
        </div>
      </div>

      {/* Mundos */}
      <div className="p-4">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Mundos</p>
        <div className="flex flex-wrap gap-2">
          {/* Mundos asignados */}
          {docente.mundos.map((mundo) => {
            const config = MUNDO_CONFIG[mundo.mundo_tipo];
            return (
              <span
                key={mundo.id}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md ${config.bgColor} ${config.color}`}
              >
                {config.label}
                <button
                  onClick={() => onRemoverMundo(mundo.mundo_tipo)}
                  className="p-0.5 hover:bg-black/20 rounded"
                  title="Remover mundo"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          {/* Botón agregar mundo */}
          {mundosDisponibles.length > 0 && (
            <div className="relative group">
              <button className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <Plus className="w-3 h-3" />
                Mundo
              </button>
              {/* Dropdown */}
              <div className="absolute left-0 top-full mt-1 z-10 hidden group-hover:block bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 min-w-[120px]">
                {mundosDisponibles.map((mundo) => {
                  const config = MUNDO_CONFIG[mundo];
                  return (
                    <button
                      key={mundo}
                      onClick={() => onAsignarMundo(mundo)}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-700/50 ${config.color}`}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {docente.mundos.length === 0 && mundosDisponibles.length === 0 && (
            <span className="text-xs text-slate-500 italic">Sin mundos</span>
          )}
        </div>
      </div>
    </div>
  );
}
