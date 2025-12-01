'use client';

import React from 'react';
import { Save, Eye, Code, LayoutGrid, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

type ModoEdicion = 'visual' | 'json';

interface Props {
  modo: ModoEdicion;
  onModoChange: (modo: ModoEdicion) => void;
  onGuardar: () => void;
  onPreview: () => void;
  isDirty: boolean;
  isSaving: boolean;
  error: string | null;
}

export function EditorToolbar({
  modo,
  onModoChange,
  onGuardar,
  onPreview,
  isDirty,
  isSaving,
  error,
}: Props): React.ReactElement {
  const renderEstado = (): React.ReactElement => {
    if (isSaving) {
      return (
        <div className="flex items-center gap-2 text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Guardando...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm truncate max-w-48" title={error}>
            Error: {error}
          </span>
        </div>
      );
    }

    if (isDirty) {
      return (
        <div className="flex items-center gap-2 text-amber-600">
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-sm">Cambios sin guardar</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">Guardado</span>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
      {/* Modo toggle */}
      <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => onModoChange('visual')}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            modo === 'visual'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          Visual
        </button>
        <button
          type="button"
          onClick={() => onModoChange('json')}
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            modo === 'json'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Code className="h-4 w-4" />
          JSON
        </button>
      </div>

      {/* Estado */}
      <div className="flex-1 flex justify-center">{renderEstado()}</div>

      {/* Acciones */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPreview}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
        <button
          type="button"
          onClick={onGuardar}
          disabled={!isDirty || isSaving}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            isDirty && !isSaving
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar
        </button>
      </div>
    </div>
  );
}
