'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { BloqueJson } from '../blocks/types';

interface Props {
  bloque: BloqueJson | null;
  onChange: (contenido: Record<string, unknown>) => void;
}

export function PropiedadesPanel({ bloque, onChange }: Props): React.ReactElement {
  const [jsonValue, setJsonValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bloque) {
      setJsonValue(JSON.stringify(bloque.contenido, null, 2));
      setError(null);
    } else {
      setJsonValue('');
    }
  }, [bloque]);

  const handleJsonChange = (value: string): void => {
    setJsonValue(value);

    try {
      const parsed = JSON.parse(value) as Record<string, unknown>;
      setError(null);
      onChange(parsed);
    } catch {
      setError('JSON inválido');
    }
  };

  if (!bloque) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-gray-500">
        <div className="mb-2 text-4xl">🎯</div>
        <p className="text-sm">Seleccioná un bloque para ver sus propiedades</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info del bloque */}
      <div className="rounded-lg bg-gray-50 p-3">
        <p className="text-xs text-gray-500">Tipo de componente</p>
        <p className="font-medium text-gray-900">{bloque.componente}</p>
      </div>

      {/* Editor de contenido */}
      <div>
        <label htmlFor="bloque-contenido" className="block text-sm font-medium text-gray-700">
          Configuración (JSON)
        </label>
        <div className="relative mt-1">
          <textarea
            id="bloque-contenido"
            value={jsonValue}
            onChange={(e) => handleJsonChange(e.target.value)}
            rows={12}
            className={`block w-full rounded-md border px-3 py-2 font-mono text-xs focus:outline-none focus:ring-1 ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            spellCheck={false}
          />
          {error && (
            <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
