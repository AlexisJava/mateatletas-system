'use client';

/**
 * PropsEditor - Editor de propiedades con estado LOCAL
 *
 * IMPORTANTE: Este componente usa estado local para evitar
 * el bug de loop infinito del editor anterior.
 *
 * Los cambios NO se aplican al store hasta que el usuario
 * hace click en "Aplicar".
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useHojaStore } from '../stores/hoja.store';
import { getBlockDefinition } from '@/components/blocks/registry';
import type { BentoPosition } from '../types/studio.types';
import { BENTO_CONFIG } from '../types/studio.types';

/**
 * Editor de propiedades del bloque seleccionado
 */
export function PropsEditor() {
  const { bloques, selectedId, updateBloquePosition, updateBloqueProps, removeBloque } =
    useHojaStore();

  // Obtener bloque seleccionado
  const selectedBloque = useMemo(
    () => bloques.find((b) => b.id === selectedId),
    [bloques, selectedId],
  );

  const blockDef = useMemo(
    () => (selectedBloque ? getBlockDefinition(selectedBloque.componentType) : undefined),
    [selectedBloque],
  );

  // Estado LOCAL para posición (patrón de bento-generator)
  const [localPosition, setLocalPosition] = useState<BentoPosition>({
    colStart: 1,
    colSpan: 4,
    rowStart: 1,
    rowSpan: 2,
  });

  // Estado LOCAL para props
  const [localProps, setLocalProps] = useState<Record<string, unknown>>({});

  // Estado para confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Track si hay cambios sin guardar
  const [hasChanges, setHasChanges] = useState(false);

  // Sincronizar estado local SOLO cuando cambia la SELECCIÓN
  useEffect(() => {
    if (selectedBloque) {
      setLocalPosition({ ...selectedBloque.position });
      setLocalProps({ ...selectedBloque.props });
      setHasChanges(false);
      setShowDeleteConfirm(false);
    }
  }, [selectedId]); // Solo depende de selectedId, NO de selectedBloque

  // Handlers para cambios locales (NO actualizan store)
  const handlePositionChange = useCallback((field: keyof BentoPosition, value: number) => {
    setLocalPosition((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  const handlePropChange = useCallback((key: string, value: unknown) => {
    setLocalProps((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  // Aplicar cambios al store
  const handleApply = useCallback(() => {
    if (!selectedId) return;

    updateBloquePosition(selectedId, localPosition);
    updateBloqueProps(selectedId, localProps);
    setHasChanges(false);
  }, [selectedId, localPosition, localProps, updateBloquePosition, updateBloqueProps]);

  // Cancelar cambios (resetear a valores del store)
  const handleCancel = useCallback(() => {
    if (selectedBloque) {
      setLocalPosition({ ...selectedBloque.position });
      setLocalProps({ ...selectedBloque.props });
      setHasChanges(false);
    }
  }, [selectedBloque]);

  // Eliminar bloque
  const handleDelete = useCallback(() => {
    if (selectedId) {
      removeBloque(selectedId);
      setShowDeleteConfirm(false);
    }
  }, [selectedId, removeBloque]);

  // Estado vacío
  if (!selectedBloque) {
    return (
      <div className="w-[300px] h-full bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Propiedades</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-3">👆</div>
            <p className="text-sm">Seleccioná un bloque</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[300px] h-full bg-white border-l border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Propiedades</h2>
        {hasChanges && <span className="text-xs text-amber-600 ml-2">• Sin guardar</span>}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Info del bloque */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{blockDef?.icon ?? '❓'}</span>
            <div>
              <p className="font-medium text-gray-900">
                {blockDef?.displayName ?? selectedBloque.componentType}
              </p>
              <p className="text-xs text-gray-400 font-mono">{selectedBloque.id.slice(0, 8)}...</p>
            </div>
          </div>
        </div>

        {/* Posición en grilla */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Posición en Grilla
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Columna inicio</label>
              <input
                type="number"
                data-testid="input-colStart"
                value={localPosition.colStart}
                onChange={(e) => handlePositionChange('colStart', parseInt(e.target.value) || 1)}
                min={1}
                max={BENTO_CONFIG.COLUMNS}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Ancho (cols)</label>
              <input
                type="number"
                data-testid="input-colSpan"
                value={localPosition.colSpan}
                onChange={(e) =>
                  handlePositionChange(
                    'colSpan',
                    Math.max(BENTO_CONFIG.MIN_COL_SPAN, parseInt(e.target.value) || 2),
                  )
                }
                min={BENTO_CONFIG.MIN_COL_SPAN}
                max={BENTO_CONFIG.COLUMNS}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Fila inicio</label>
              <input
                type="number"
                data-testid="input-rowStart"
                value={localPosition.rowStart}
                onChange={(e) => handlePositionChange('rowStart', parseInt(e.target.value) || 1)}
                min={1}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Alto (filas)</label>
              <input
                type="number"
                data-testid="input-rowSpan"
                value={localPosition.rowSpan}
                onChange={(e) =>
                  handlePositionChange(
                    'rowSpan',
                    Math.max(BENTO_CONFIG.MIN_ROW_SPAN, parseInt(e.target.value) || 2),
                  )
                }
                min={BENTO_CONFIG.MIN_ROW_SPAN}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Props del componente */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Propiedades del Componente
          </h3>
          {Object.keys(localProps).length === 0 ? (
            <p className="text-sm text-gray-400 italic">Sin propiedades</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(localProps).map(([key, value]) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 block mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  {typeof value === 'boolean' ? (
                    <button
                      onClick={() => handlePropChange(key, !value)}
                      className={`px-3 py-1.5 text-sm rounded ${
                        value ? 'bg-cyan-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {value ? 'Sí' : 'No'}
                    </button>
                  ) : typeof value === 'number' ? (
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handlePropChange(key, parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                    />
                  ) : typeof value === 'string' ? (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handlePropChange(key, e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500"
                    />
                  ) : (
                    <span className="text-xs text-gray-400 font-mono">
                      {JSON.stringify(value).slice(0, 50)}...
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botones de acción (siempre visibles al fondo) */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
        {/* Aplicar / Cancelar */}
        <div className="flex gap-2">
          <button
            onClick={handleApply}
            disabled={!hasChanges}
            className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
              hasChanges
                ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Aplicar
          </button>
          <button
            onClick={handleCancel}
            disabled={!hasChanges}
            className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
              hasChanges
                ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Cancelar
          </button>
        </div>

        {/* Eliminar */}
        {showDeleteConfirm ? (
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="flex-1 px-3 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              Confirmar
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg"
          >
            Eliminar bloque
          </button>
        )}
      </div>
    </div>
  );
}
