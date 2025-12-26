'use client';

import React from 'react';
import type { SaveStatus } from '../hooks';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  errorMessage?: string | null;
}

/**
 * Indicador visual del estado de guardado automático
 *
 * Estados:
 * - draft: ● Borrador (gris)
 * - saving: ◉ Guardando... (amarillo pulsante)
 * - saved: ✓ Guardado (verde)
 * - error: ⚠ Error (rojo)
 */
export function SaveStatusIndicator({ status, errorMessage }: SaveStatusIndicatorProps) {
  const configs: Record<SaveStatus, { icon: React.ReactNode; text: string; className: string }> = {
    draft: {
      icon: <span className="w-2 h-2 rounded-full bg-slate-500" />,
      text: 'Borrador',
      className: 'text-slate-500',
    },
    saving: {
      icon: <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />,
      text: 'Guardando...',
      className: 'text-amber-400',
    },
    saved: {
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      text: 'Guardado',
      className: 'text-emerald-400',
    },
    error: {
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      text: 'Error',
      className: 'text-red-400',
    },
  };

  const config = configs[status];

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 ${config.className}`}
      title={status === 'error' && errorMessage ? errorMessage : undefined}
    >
      {config.icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{config.text}</span>
    </div>
  );
}
