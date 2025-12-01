'use client';

import React from 'react';
import { Check, Construction, Loader2 } from 'lucide-react';
import { BloqueMetadata } from '../blocks/types';

interface Props {
  componente: BloqueMetadata;
  onToggle: (tipo: string, habilitado: boolean) => void;
  isToggling?: boolean;
}

const CATEGORIA_COLORS: Record<string, string> = {
  INTERACTIVO: 'bg-purple-100 text-purple-700',
  CONTENIDO: 'bg-blue-100 text-blue-700',
  EDITOR_CODIGO: 'bg-green-100 text-green-700',
  MULTIMEDIA: 'bg-orange-100 text-orange-700',
  GAMIFICACION: 'bg-yellow-100 text-yellow-700',
  EVALUACION: 'bg-red-100 text-red-700',
};

export function ComponenteCard({
  componente,
  onToggle,
  isToggling = false,
}: Props): React.ReactElement {
  const handleToggle = (): void => {
    if (!componente.implementado || isToggling) return;
    onToggle(componente.tipo, !componente.habilitado);
  };

  return (
    <div
      className={`rounded-lg border bg-white p-4 transition-all ${
        componente.implementado
          ? 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
          : 'border-gray-100 bg-gray-50 opacity-60'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{componente.icono}</span>
          <div>
            <h3 className="font-medium text-gray-900">{componente.nombre}</h3>
            <span
              className={`inline-block mt-1 rounded px-2 py-0.5 text-xs font-medium ${
                CATEGORIA_COLORS[componente.categoria] ?? 'bg-gray-100 text-gray-700'
              }`}
            >
              {componente.categoria}
            </span>
          </div>
        </div>

        {/* Toggle */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={!componente.implementado || isToggling}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            !componente.implementado
              ? 'cursor-not-allowed bg-gray-200'
              : componente.habilitado
                ? 'bg-blue-600'
                : 'bg-gray-200'
          }`}
        >
          {isToggling ? (
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            </span>
          ) : (
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                componente.habilitado ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          )}
        </button>
      </div>

      {/* Descripción */}
      <p className="mt-3 text-sm text-gray-600 line-clamp-2">{componente.descripcion}</p>

      {/* Estado */}
      <div className="mt-3 flex items-center gap-2">
        {componente.implementado ? (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <Check className="h-3.5 w-3.5" />
            Implementado
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-amber-600">
            <Construction className="h-3.5 w-3.5" />
            Pendiente
          </span>
        )}
      </div>
    </div>
  );
}
