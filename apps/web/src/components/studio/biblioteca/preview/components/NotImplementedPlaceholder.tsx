'use client';

import React, { ReactElement } from 'react';
import { Construction, Code2, Clock } from 'lucide-react';
import { NotImplementedPlaceholderProps } from '../types';
import { getCategoryColors, CATEGORY_LABELS } from '../constants';

/**
 * Placeholder que se muestra cuando un componente no está implementado
 */
export function NotImplementedPlaceholder({
  nombre,
  descripcion,
  icono,
  categoria,
}: NotImplementedPlaceholderProps): ReactElement {
  const colors = getCategoryColors(categoria);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] p-8 text-center">
      {/* Icono animado */}
      <div className="relative mb-6">
        <div
          className={`w-24 h-24 rounded-2xl ${colors.bg} ${colors.border} border-2 border-dashed flex items-center justify-center`}
        >
          <span className="text-5xl opacity-50">{icono}</span>
        </div>
        <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-amber-500/20 border border-amber-500/30">
          <Construction className="w-5 h-5 text-amber-400" />
        </div>
      </div>

      {/* Mensaje */}
      <h3 className="text-lg font-semibold text-white mb-2">
        Este componente aún no está implementado
      </h3>
      <p className="text-sm text-white/50 max-w-md mb-6">{descripcion}</p>

      {/* Info */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/40">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4" />
          <span>Próximamente</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>En desarrollo</span>
        </div>
        <div className={`flex items-center gap-2 ${colors.text}`}>
          <span>{CATEGORY_LABELS[categoria]}</span>
        </div>
      </div>

      {/* Decoración */}
      <div className="mt-8 flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${colors.bg} animate-pulse`}
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
