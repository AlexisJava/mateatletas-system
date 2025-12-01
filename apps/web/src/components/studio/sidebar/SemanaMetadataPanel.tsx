'use client';

import React from 'react';
import { Plus, X } from 'lucide-react';
import { SemanaMetadata } from '../blocks/types';

interface Props {
  metadata: SemanaMetadata;
  onChange: (metadata: Partial<SemanaMetadata>) => void;
}

export function SemanaMetadataPanel({ metadata, onChange }: Props): React.ReactElement {
  const handleAddObjetivo = (): void => {
    const nuevosObjetivos = [...(metadata.objetivos ?? []), ''];
    onChange({ objetivos: nuevosObjetivos });
  };

  const handleObjetivoChange = (index: number, value: string): void => {
    const nuevosObjetivos = [...(metadata.objetivos ?? [])];
    nuevosObjetivos[index] = value;
    onChange({ objetivos: nuevosObjetivos });
  };

  const handleRemoveObjetivo = (index: number): void => {
    const nuevosObjetivos = (metadata.objetivos ?? []).filter((_, i) => i !== index);
    onChange({ objetivos: nuevosObjetivos });
  };

  return (
    <div className="space-y-4">
      {/* Título */}
      <div>
        <label htmlFor="semana-titulo" className="block text-sm font-medium text-gray-700">
          Título de la semana
        </label>
        <input
          id="semana-titulo"
          type="text"
          value={metadata.titulo}
          onChange={(e) => onChange({ titulo: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Ej: Semana 1 - Introducción"
        />
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="semana-descripcion" className="block text-sm font-medium text-gray-700">
          Descripción
        </label>
        <textarea
          id="semana-descripcion"
          value={metadata.descripcion ?? ''}
          onChange={(e) => onChange({ descripcion: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Describe brevemente el contenido de esta semana..."
        />
      </div>

      {/* Objetivos */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Objetivos</label>
          <button
            type="button"
            onClick={handleAddObjetivo}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {(metadata.objetivos ?? []).length === 0 ? (
            <p className="text-sm text-gray-500 italic">Sin objetivos definidos</p>
          ) : (
            (metadata.objetivos ?? []).map((objetivo, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={objetivo}
                  onChange={(e) => handleObjetivoChange(index, e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={`Objetivo ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveObjetivo(index)}
                  className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
