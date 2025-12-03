'use client';

import React, { ReactElement } from 'react';
import { X, CheckCircle2, Construction } from 'lucide-react';
import { PreviewModalHeaderProps } from '../types';
import { getCategoryColors, CATEGORY_LABELS } from '../constants';

/**
 * Header del modal de preview
 * Muestra nombre, icono, categoría y estado del componente
 */
export function PreviewModalHeader({ componente, onClose }: PreviewModalHeaderProps): ReactElement {
  const colors = getCategoryColors(componente.categoria);

  return (
    <div className="flex items-start justify-between gap-4 p-6 border-b border-white/10">
      <div className="flex items-start gap-4 min-w-0">
        {/* Icono */}
        <div
          className={`flex-shrink-0 w-14 h-14 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center`}
        >
          <span className="text-3xl">{componente.icono}</span>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h2 id="preview-modal-title" className="text-xl font-bold text-white truncate">
            {componente.nombre}
          </h2>
          <p className="text-sm text-white/60 mt-1 line-clamp-2">{componente.descripcion}</p>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {/* Categoria */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}
            >
              {CATEGORY_LABELS[componente.categoria]}
            </span>

            {/* Estado */}
            {componente.implementado ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" />
                Implementado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Construction className="w-3 h-3" />
                Pendiente
              </span>
            )}

            {/* Tipo */}
            <span className="px-2 py-1 rounded-md text-xs font-mono text-white/40 bg-white/5 border border-white/10">
              {componente.tipo}
            </span>
          </div>
        </div>
      </div>

      {/* Boton cerrar */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar modal"
        className="flex-shrink-0 p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
