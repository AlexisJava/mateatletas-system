'use client';

import { useState, useEffect } from 'react';
import { X, Save, Home, Globe, Check } from 'lucide-react';
import type { GrupoPedagogico, CasaTipo, MundoTipo } from '../types/grupos.types';
import { CASA_CONFIG, MUNDO_CONFIG } from '../types/grupos.types';

interface GrupoEditModalProps {
  grupo: GrupoPedagogico | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    grupoId: string,
    casaTipo: CasaTipo | null,
    mundoTipo: MundoTipo | null,
  ) => Promise<void>;
}

const CASAS: CasaTipo[] = ['QUANTUM', 'VERTEX', 'PULSAR'];
const MUNDOS: MundoTipo[] = ['MATEMATICA', 'PROGRAMACION', 'CIENCIAS'];

export function GrupoEditModal({ grupo, isOpen, onClose, onSave }: GrupoEditModalProps) {
  const [selectedCasa, setSelectedCasa] = useState<CasaTipo | null>(null);
  const [selectedMundo, setSelectedMundo] = useState<MundoTipo | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar con el grupo seleccionado
  useEffect(() => {
    if (grupo) {
      setSelectedCasa(grupo.casa_tipo);
      setSelectedMundo(grupo.mundo_tipo);
    }
  }, [grupo]);

  if (!isOpen || !grupo) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(grupo.id, selectedCasa, selectedMundo);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = selectedCasa !== grupo.casa_tipo || selectedMundo !== grupo.mundo_tipo;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div>
            <h3 className="text-lg font-semibold text-white">Editar Grupo</h3>
            <p className="text-sm text-slate-400 mt-0.5">
              {grupo.codigo} - {grupo.nombre ?? 'Sin nombre'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Info del grupo */}
          <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
            {grupo.descripcion && <p className="text-sm text-slate-300">{grupo.descripcion}</p>}
            {(grupo.edad_minima !== null || grupo.edad_maxima !== null) && (
              <p className="text-xs text-slate-400">
                Rango de edad:{' '}
                {grupo.edad_minima !== null && grupo.edad_maxima !== null
                  ? `${grupo.edad_minima}-${grupo.edad_maxima} años`
                  : grupo.edad_minima !== null
                    ? `Desde ${grupo.edad_minima} años`
                    : `Hasta ${grupo.edad_maxima} años`}
              </p>
            )}
            <div className="flex gap-4 text-xs text-slate-500">
              <span>{grupo._count?.claseGrupos ?? 0} clases</span>
              <span>{grupo._count?.comisionesProducto ?? 0} comisiones</span>
            </div>
          </div>

          {/* Selector de Casa */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
              <Home className="w-4 h-4" />
              Casa
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CASAS.map((casa) => {
                const config = CASA_CONFIG[casa];
                const isSelected = selectedCasa === casa;
                return (
                  <button
                    key={casa}
                    onClick={() => setSelectedCasa(isSelected ? null : casa)}
                    className={`
                      relative p-3 rounded-lg border-2 transition-all text-left
                      ${
                        isSelected
                          ? `${config.bgColor} ${config.color} border-current`
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                      }
                    `}
                  >
                    {isSelected && <Check className="absolute top-2 right-2 w-4 h-4" />}
                    <span className="text-sm font-medium">{config.label.split(' ')[0]}</span>
                    <span className="block text-xs opacity-70 mt-0.5">
                      {config.label.match(/\(([^)]+)\)/)?.[1]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selector de Mundo */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
              <Globe className="w-4 h-4" />
              Mundo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MUNDOS.map((mundo) => {
                const config = MUNDO_CONFIG[mundo];
                const isSelected = selectedMundo === mundo;
                return (
                  <button
                    key={mundo}
                    onClick={() => setSelectedMundo(isSelected ? null : mundo)}
                    className={`
                      relative p-3 rounded-lg border-2 transition-all text-left
                      ${
                        isSelected
                          ? `${config.bgColor} ${config.color} border-current`
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                      }
                    `}
                  >
                    {isSelected && <Check className="absolute top-2 right-2 w-4 h-4" />}
                    <span className="text-sm font-medium">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${
                hasChanges && !isSaving
                  ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }
            `}
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
