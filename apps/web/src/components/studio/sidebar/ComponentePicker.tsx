'use client';

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { BloqueMetadata, BloqueCategoria } from '../blocks/types';

interface Props {
  componentes: BloqueMetadata[];
  onSeleccionar: (tipo: string) => void;
}

const CATEGORIA_LABELS: Record<BloqueCategoria, string> = {
  INTERACTIVO: 'Interactivos',
  MOTRICIDAD_FINA: 'Motricidad Fina',
  SIMULADOR: 'Simuladores',
  EDITOR_CODIGO: 'Editor de Código',
  CREATIVO: 'Creativos',
  MULTIMEDIA: 'Multimedia',
  EVALUACION: 'Evaluación',
  MULTIPLAYER: 'Multiplayer',
};

const CATEGORIA_ORDEN: BloqueCategoria[] = [
  'INTERACTIVO',
  'MOTRICIDAD_FINA',
  'SIMULADOR',
  'EDITOR_CODIGO',
  'CREATIVO',
  'MULTIMEDIA',
  'EVALUACION',
  'MULTIPLAYER',
];

export function ComponentePicker({ componentes, onSeleccionar }: Props): React.ReactElement {
  const [busqueda, setBusqueda] = useState('');

  const componentesFiltrados = useMemo(() => {
    if (!busqueda.trim()) return componentes;

    const termino = busqueda.toLowerCase();
    return componentes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(termino) ||
        c.descripcion.toLowerCase().includes(termino) ||
        c.tipo.toLowerCase().includes(termino),
    );
  }, [componentes, busqueda]);

  const componentesPorCategoria = useMemo(() => {
    const grupos = new Map<BloqueCategoria, BloqueMetadata[]>();

    for (const comp of componentesFiltrados) {
      const lista = grupos.get(comp.categoria) ?? [];
      lista.push(comp);
      grupos.set(comp.categoria, lista);
    }

    return grupos;
  }, [componentesFiltrados]);

  return (
    <div className="flex flex-col h-full">
      {/* Buscador */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar componente..."
          className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Lista por categorías */}
      <div className="flex-1 overflow-auto space-y-4">
        {componentesFiltrados.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No se encontraron componentes</p>
        ) : (
          CATEGORIA_ORDEN.map((categoria) => {
            const items = componentesPorCategoria.get(categoria);
            if (!items || items.length === 0) return null;

            return (
              <div key={categoria}>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {CATEGORIA_LABELS[categoria]}
                </h4>
                <div className="space-y-1">
                  {items.map((comp) => (
                    <button
                      key={comp.tipo}
                      type="button"
                      onClick={() => onSeleccionar(comp.tipo)}
                      className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-100"
                    >
                      <span className="text-xl">{comp.icono}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">{comp.nombre}</p>
                        <p className="truncate text-xs text-gray-500">{comp.descripcion}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
