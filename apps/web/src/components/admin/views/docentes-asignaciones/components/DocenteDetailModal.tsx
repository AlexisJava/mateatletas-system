'use client';

import { X, Home, Globe, Briefcase, Calendar } from 'lucide-react';
import type {
  DocenteAsignacionesPerfil,
  CasaTipo,
  MundoTipo,
  TipoAsignacionDocente,
} from '../types/asignaciones.types';
import { CASA_CONFIG, MUNDO_CONFIG, TIPO_ASIGNACION_CONFIG } from '../types/asignaciones.types';

interface DocenteDetailModalProps {
  docente: DocenteAsignacionesPerfil;
  isOpen: boolean;
  onClose: () => void;
  onAsignarCasa: (casaTipo: CasaTipo) => void;
  onRemoverCasa: (casaTipo: CasaTipo) => void;
  onAsignarMundo: (mundoTipo: MundoTipo) => void;
  onRemoverMundo: (mundoTipo: MundoTipo) => void;
  onActualizarTipo: (tipo: TipoAsignacionDocente) => void;
}

const ALL_CASAS: CasaTipo[] = ['QUANTUM', 'VERTEX', 'PULSAR'];
const ALL_MUNDOS: MundoTipo[] = ['MATEMATICA', 'PROGRAMACION', 'CIENCIAS'];
const ALL_TIPOS: TipoAsignacionDocente[] = ['CLASE_GRUPOS', 'COMISIONES', 'AMBOS'];

export function DocenteDetailModal({
  docente,
  isOpen,
  onClose,
  onAsignarCasa,
  onRemoverCasa,
  onAsignarMundo,
  onRemoverMundo,
  onActualizarTipo,
}: DocenteDetailModalProps) {
  if (!isOpen) return null;

  const casasAsignadas = docente.casas.map((c) => c.casa_tipo);
  const mundosAsignados = docente.mundos.map((m) => m.mundo_tipo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
              {docente.nombre[0]}
              {docente.apellido[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {docente.nombre} {docente.apellido}
              </h2>
              <p className="text-sm text-slate-400">Gestión de asignaciones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tipo de Asignación */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-medium text-white">Tipo de Asignación</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {ALL_TIPOS.map((tipo) => {
                const config = TIPO_ASIGNACION_CONFIG[tipo];
                const isActive = docente.tipo_asignacion === tipo;
                return (
                  <button
                    key={tipo}
                    onClick={() => !isActive && onActualizarTipo(tipo)}
                    className={`p-3 rounded-lg border transition-all text-center ${
                      isActive
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                    }`}
                  >
                    <p className="text-sm font-medium">{config.label}</p>
                    <p className="text-xs mt-1 opacity-70">{config.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Casas */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Home className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-medium text-white">Casas Asignadas</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {ALL_CASAS.map((casa) => {
                const config = CASA_CONFIG[casa];
                const isAsignada = casasAsignadas.includes(casa);
                const asignacion = docente.casas.find((c) => c.casa_tipo === casa);
                return (
                  <button
                    key={casa}
                    onClick={() => (isAsignada ? onRemoverCasa(casa) : onAsignarCasa(casa))}
                    className={`p-3 rounded-lg border transition-all ${
                      isAsignada
                        ? `${config.bgColor} border-current ${config.color}`
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <p className="text-sm font-medium">{config.label}</p>
                    {asignacion && (
                      <p className="text-xs mt-1 opacity-70 flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(asignacion.asignado_en).toLocaleDateString()}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mundos */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-green-400" />
              <h3 className="text-sm font-medium text-white">Mundos Asignados</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {ALL_MUNDOS.map((mundo) => {
                const config = MUNDO_CONFIG[mundo];
                const isAsignado = mundosAsignados.includes(mundo);
                const asignacion = docente.mundos.find((m) => m.mundo_tipo === mundo);
                return (
                  <button
                    key={mundo}
                    onClick={() => (isAsignado ? onRemoverMundo(mundo) : onAsignarMundo(mundo))}
                    className={`p-3 rounded-lg border transition-all ${
                      isAsignado
                        ? `${config.bgColor} border-current ${config.color}`
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <p className="text-sm font-medium">{config.label}</p>
                    {asignacion && (
                      <p className="text-xs mt-1 opacity-70 flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(asignacion.asignado_en).toLocaleDateString()}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Resumen</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-purple-400">{docente.casas.length}</p>
                <p className="text-xs text-slate-400">Casas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{docente.mundos.length}</p>
                <p className="text-xs text-slate-400">Mundos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-indigo-400">
                  {docente.casas.length * docente.mundos.length}
                </p>
                <p className="text-xs text-slate-400">Combinaciones</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
