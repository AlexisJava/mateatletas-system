'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { BloqueCategoria } from '../blocks/types';

type EstadoFiltro = 'TODOS' | 'IMPLEMENTADOS' | 'PENDIENTES' | 'HABILITADOS';

interface Contadores {
  total: number;
  implementados: number;
  pendientes: number;
  habilitados: number;
}

interface Props {
  categoriaActiva: BloqueCategoria | 'TODAS';
  estadoActivo: EstadoFiltro;
  busqueda: string;
  onCategoriaChange: (cat: BloqueCategoria | 'TODAS') => void;
  onEstadoChange: (estado: EstadoFiltro) => void;
  onBusquedaChange: (busqueda: string) => void;
  contadores: Contadores;
}

const CATEGORIAS: Array<{ value: BloqueCategoria | 'TODAS'; label: string }> = [
  { value: 'TODAS', label: 'Todas' },
  { value: 'INTERACTIVO', label: 'Interactivos' },
  { value: 'CONTENIDO', label: 'Contenido' },
  { value: 'EDITOR_CODIGO', label: 'Editor código' },
  { value: 'MULTIMEDIA', label: 'Multimedia' },
  { value: 'GAMIFICACION', label: 'Gamificación' },
  { value: 'EVALUACION', label: 'Evaluación' },
];

const ESTADOS: Array<{ value: EstadoFiltro; label: string; contadorKey: keyof Contadores }> = [
  { value: 'TODOS', label: 'Todos', contadorKey: 'total' },
  { value: 'IMPLEMENTADOS', label: 'Implementados', contadorKey: 'implementados' },
  { value: 'PENDIENTES', label: 'Pendientes', contadorKey: 'pendientes' },
  { value: 'HABILITADOS', label: 'Habilitados', contadorKey: 'habilitados' },
];

export function BibliotecaFiltros({
  categoriaActiva,
  estadoActivo,
  busqueda,
  onCategoriaChange,
  onEstadoChange,
  onBusquedaChange,
  contadores,
}: Props): React.ReactElement {
  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          placeholder="Buscar componente..."
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Filtros por categoría */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => onCategoriaChange(cat.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              categoriaActiva === cat.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filtros por estado */}
      <div className="flex gap-4 border-t border-gray-200 pt-4">
        {ESTADOS.map((estado) => (
          <button
            key={estado.value}
            type="button"
            onClick={() => onEstadoChange(estado.value)}
            className={`flex items-center gap-2 text-sm transition-colors ${
              estadoActivo === estado.value
                ? 'font-medium text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                estadoActivo === estado.value ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
            {estado.label}
            <span className="text-gray-400">({contadores[estado.contadorKey]})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
