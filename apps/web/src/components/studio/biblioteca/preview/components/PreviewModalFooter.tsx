'use client';

import React, { ReactElement } from 'react';
import { Loader2 } from 'lucide-react';
import { PreviewModalFooterProps } from '../types';

/**
 * Footer del modal de preview
 * Contiene el toggle de habilitado/deshabilitado
 */
export function PreviewModalFooter({
  componente,
  onToggle,
  isToggling = false,
}: PreviewModalFooterProps): ReactElement | null {
  // No mostrar footer si no está implementado o no hay callback
  if (!componente.implementado || !onToggle) {
    return null;
  }

  const handleToggle = (): void => {
    if (isToggling) return;
    onToggle(componente.tipo, !componente.habilitado);
  };

  return (
    <div className="flex items-center justify-between p-6 border-t border-white/10 bg-white/[0.02]">
      <div className="flex items-center gap-3">
        <span className="text-sm text-white/60">Estado en el editor:</span>
        <span
          className={`text-sm font-medium ${
            componente.habilitado ? 'text-emerald-400' : 'text-white/40'
          }`}
        >
          {componente.habilitado ? 'Habilitado' : 'Deshabilitado'}
        </span>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={componente.habilitado}
        onClick={handleToggle}
        disabled={isToggling}
        className={`
          relative inline-flex h-7 w-14 flex-shrink-0 rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900
          ${isToggling ? 'cursor-wait' : 'cursor-pointer'}
          ${componente.habilitado ? 'bg-orange-500' : 'bg-white/20'}
        `}
      >
        <span className="sr-only">
          {componente.habilitado ? 'Deshabilitar' : 'Habilitar'} componente
        </span>
        {isToggling ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-white/50" />
          </span>
        ) : (
          <span
            className={`
              pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow
              ring-0 transition-transform duration-200 ease-in-out
              ${componente.habilitado ? 'translate-x-7' : 'translate-x-0'}
            `}
          />
        )}
      </button>
    </div>
  );
}
