import React from 'react';
import { BloqueJson, BloqueModo, BloqueResultado } from '../blocks/types';
import { BloqueRenderer } from './BloqueRenderer';

interface Props {
  bloques: BloqueJson[];
  modo: BloqueModo;
  onBloqueComplete?: (bloqueId: string, resultado: BloqueResultado) => void;
  onBloqueProgress?: (bloqueId: string, progreso: number) => void;
  onBloqueConfigChange?: (bloqueId: string, nuevoConfig: Record<string, unknown>) => void;
  bloqueActualId?: string;
}

export function SemanaRenderer({
  bloques,
  modo,
  onBloqueComplete,
  onBloqueProgress,
  onBloqueConfigChange,
  bloqueActualId,
}: Props): React.ReactElement {
  const bloquesOrdenados = [...bloques].sort((a, b) => a.orden - b.orden);

  return (
    <div className="space-y-6">
      {bloquesOrdenados.map((bloque) => (
        <div
          key={bloque.id}
          className={`transition-opacity ${
            bloqueActualId && bloqueActualId !== bloque.id ? 'opacity-50' : 'opacity-100'
          }`}
        >
          <BloqueRenderer
            bloque={bloque}
            modo={modo}
            onComplete={
              onBloqueComplete
                ? (resultado): void => onBloqueComplete(bloque.id, resultado)
                : undefined
            }
            onProgress={
              onBloqueProgress
                ? (progreso): void => onBloqueProgress(bloque.id, progreso)
                : undefined
            }
            onConfigChange={onBloqueConfigChange}
            disabled={bloqueActualId !== undefined && bloqueActualId !== bloque.id}
          />
        </div>
      ))}
    </div>
  );
}
