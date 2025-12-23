'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useCanvasStore } from '../../stores/canvas.store';
import { getBlockDefinition } from '@/components/blocks/registry';

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function PropertiesPanel() {
  const {
    selectedId,
    elements,
    updatePosition,
    updateSize,
    updateProps,
    removeElement,
    duplicateElement,
    bringToFront,
    sendToBack,
  } = useCanvasStore();

  const selectedElement = useMemo(
    () => elements.find((el) => el.id === selectedId),
    [elements, selectedId],
  );

  const blockDefinition = useMemo(
    () => (selectedElement ? getBlockDefinition(selectedElement.componentType) : undefined),
    [selectedElement],
  );

  // Local state for inputs (for debouncing)
  const [localPosition, setLocalPosition] = useState({ x: 0, y: 0 });
  const [localSize, setLocalSize] = useState({ width: 0, height: 0 });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync local state with selected element
  useEffect(() => {
    if (selectedElement) {
      setLocalPosition(selectedElement.position);
      setLocalSize(selectedElement.size);
    }
  }, [selectedElement]);

  // Debounced values
  const debouncedPosition = useDebounce(localPosition, 300);
  const debouncedSize = useDebounce(localSize, 300);

  // Update store when debounced values change
  useEffect(() => {
    if (selectedId && selectedElement) {
      if (
        debouncedPosition.x !== selectedElement.position.x ||
        debouncedPosition.y !== selectedElement.position.y
      ) {
        updatePosition(selectedId, debouncedPosition);
      }
    }
  }, [debouncedPosition, selectedId, selectedElement, updatePosition]);

  useEffect(() => {
    if (selectedId && selectedElement) {
      if (
        debouncedSize.width !== selectedElement.size.width ||
        debouncedSize.height !== selectedElement.size.height
      ) {
        updateSize(selectedId, debouncedSize);
      }
    }
  }, [debouncedSize, selectedId, selectedElement, updateSize]);

  const handlePositionChange = useCallback((axis: 'x' | 'y', value: number) => {
    setLocalPosition((prev) => ({ ...prev, [axis]: value }));
  }, []);

  const handleSizeChange = useCallback((dimension: 'width' | 'height', value: number) => {
    setLocalSize((prev) => ({ ...prev, [dimension]: Math.max(50, value) }));
  }, []);

  const handlePropChange = useCallback(
    (key: string, value: unknown) => {
      if (selectedId) {
        updateProps(selectedId, { [key]: value });
      }
    },
    [selectedId, updateProps],
  );

  const handleDelete = useCallback(() => {
    if (selectedId) {
      removeElement(selectedId);
      setShowDeleteConfirm(false);
    }
  }, [selectedId, removeElement]);

  const handleDuplicate = useCallback(() => {
    if (selectedId) {
      duplicateElement(selectedId);
    }
  }, [selectedId, duplicateElement]);

  const handleToggleLock = useCallback(() => {
    if (selectedId && selectedElement) {
      updateProps(selectedId, { locked: !selectedElement.locked });
    }
  }, [selectedId, selectedElement, updateProps]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  // No selection state
  if (!selectedElement) {
    return (
      <div
        className="w-[300px] h-full bg-white border-l border-gray-200 flex flex-col"
        data-testid="properties-panel"
      >
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Propiedades</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-3">👆</div>
            <p className="text-sm">Seleccioná un elemento</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-[300px] h-full bg-white border-l border-gray-200 flex flex-col overflow-hidden"
      data-testid="properties-panel"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Propiedades</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Info Section */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Información
          </h3>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{blockDefinition?.icon ?? '❓'}</span>
            <span className="font-medium text-gray-900">
              {blockDefinition?.displayName ?? selectedElement.componentType}
            </span>
          </div>
          <button
            onClick={() => copyToClipboard(selectedElement.id)}
            className="text-xs text-gray-400 hover:text-gray-600 font-mono truncate block w-full text-left"
            title="Click para copiar ID"
          >
            ID: {selectedElement.id}
          </button>
        </div>

        {/* Position & Size Section */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Posición y Tamaño
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">X</label>
              <input
                type="number"
                value={localPosition.x}
                onChange={(e) => handlePositionChange('x', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                data-testid="input-x"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Y</label>
              <input
                type="number"
                value={localPosition.y}
                onChange={(e) => handlePositionChange('y', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                data-testid="input-y"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Ancho</label>
              <input
                type="number"
                value={localSize.width}
                onChange={(e) => handleSizeChange('width', parseInt(e.target.value) || 50)}
                min={50}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                data-testid="input-width"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Alto</label>
              <input
                type="number"
                value={localSize.height}
                onChange={(e) => handleSizeChange('height', parseInt(e.target.value) || 50)}
                min={50}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                data-testid="input-height"
              />
            </div>
          </div>
        </div>

        {/* Props Section */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Propiedades del Componente
          </h3>
          {Object.keys(selectedElement.props).length === 0 ? (
            <p className="text-sm text-gray-400 italic">Sin propiedades configuradas</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(selectedElement.props).map(([key, value]) => (
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
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  ) : typeof value === 'string' ? (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handlePropChange(key, e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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

        {/* Actions Section */}
        <div className="p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Acciones
          </h3>
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                onClick={handleDuplicate}
                className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                data-testid="btn-duplicate"
              >
                Duplicar
              </button>
              <button
                onClick={handleToggleLock}
                className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedElement.locked
                    ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                data-testid="btn-lock"
              >
                {selectedElement.locked ? '🔒 Desbloquear' : '🔓 Bloquear'}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => selectedId && bringToFront(selectedId)}
                className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                data-testid="btn-front"
              >
                ↑ Al frente
              </button>
              <button
                onClick={() => selectedId && sendToBack(selectedId)}
                className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                data-testid="btn-back"
              >
                ↓ Atrás
              </button>
            </div>
            {showDeleteConfirm ? (
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="flex-1 px-3 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  data-testid="btn-confirm-delete"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                data-testid="btn-delete"
              >
                Eliminar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
