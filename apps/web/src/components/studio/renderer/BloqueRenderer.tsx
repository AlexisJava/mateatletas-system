import React from 'react';
import { obtenerBloque } from '../blocks/registry';
import { BloqueModo, BloqueResultado, BloqueJson } from '../blocks/types';
import { BloqueNoImplementado } from './BloqueNoImplementado';

interface Props {
  bloque: BloqueJson;
  modo: BloqueModo;
  onComplete?: (resultado: BloqueResultado) => void;
  onProgress?: (progreso: number) => void;
  onConfigChange?: (id: string, nuevoConfig: Record<string, unknown>) => void;
  disabled?: boolean;
}

export function BloqueRenderer({
  bloque,
  modo,
  onComplete,
  onProgress,
  onConfigChange,
  disabled = false,
}: Props): React.ReactElement {
  const Componente = obtenerBloque(bloque.componente);

  if (!Componente) {
    return (
      <BloqueNoImplementado
        id={bloque.id}
        tipo={bloque.componente}
        config={bloque.contenido}
        modo={modo}
      />
    );
  }

  return (
    <Componente
      id={bloque.id}
      config={bloque.contenido}
      modo={modo}
      onComplete={onComplete}
      onProgress={onProgress}
      onConfigChange={
        onConfigChange ? (nuevoConfig): void => onConfigChange(bloque.id, nuevoConfig) : undefined
      }
      disabled={disabled}
    />
  );
}
