'use client';

import React, { ReactElement, useState, useCallback } from 'react';
import { Eye, ArrowRight, Circle, Square, Info, RotateCcw } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';
import {
  StackViz,
  QueueViz,
  LinkedListViz,
  ArrayViz,
  nombresEstructuras,
  type DataStructureType,
} from '../hooks/useDataStructures';

interface DataStructureVizExampleData {
  instruccion: string;
  estructura: DataStructureType;
  datosIniciales: number[];
  capacidadMaxima?: number;
  permitirOperaciones?: boolean;
  explicacion?: string;
}

/**
 * Preview interactivo del componente DataStructureViz
 */
function DataStructureVizPreviewComponent({ exampleData }: PreviewComponentProps): ReactElement {
  const data = exampleData as DataStructureVizExampleData;

  const [datos, setDatos] = useState<number[]>([...data.datosIniciales]);
  const capacidad = data.capacidadMaxima ?? 10;
  const editable = data.permitirOperaciones !== false;

  const reiniciar = useCallback(() => {
    setDatos([...data.datosIniciales]);
  }, [data.datosIniciales]);

  // Operaciones para Stack
  const handlePush = useCallback(
    (valor: number) => {
      if (datos.length < capacidad) {
        setDatos((prev) => [...prev, valor]);
      }
    },
    [datos.length, capacidad],
  );

  const handlePop = useCallback(() => {
    setDatos((prev) => prev.slice(0, -1));
  }, []);

  // Operaciones para Queue
  const handleEnqueue = useCallback(
    (valor: number) => {
      if (datos.length < capacidad) {
        setDatos((prev) => [...prev, valor]);
      }
    },
    [datos.length, capacidad],
  );

  const handleDequeue = useCallback(() => {
    setDatos((prev) => prev.slice(1));
  }, []);

  // Operaciones para LinkedList
  const handleAddNode = useCallback((valor: number) => {
    setDatos((prev) => [...prev, valor]);
  }, []);

  const handleRemoveNode = useCallback((index: number) => {
    setDatos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Operaciones para Array
  const handleUpdateArray = useCallback((index: number, valor: number) => {
    setDatos((prev) => {
      const nuevo = [...prev];
      nuevo[index] = valor;
      return nuevo;
    });
  }, []);

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-1 bg-blue-600/30 text-blue-400 text-xs font-medium rounded">
              {nombresEstructuras[data.estructura]}
            </span>
            <span className="text-xs text-slate-500">{datos.length} elementos</span>
          </div>
        </div>
        <button
          type="button"
          onClick={reiniciar}
          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
          title="Reiniciar"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Visualización */}
      <div className="rounded-xl border border-slate-700 overflow-hidden">
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-700 flex items-center gap-2">
          {data.estructura === 'stack' && <Square className="w-4 h-4 text-blue-400" />}
          {data.estructura === 'queue' && <ArrowRight className="w-4 h-4 text-blue-400" />}
          {data.estructura === 'linkedList' && <Circle className="w-4 h-4 text-blue-400" />}
          {data.estructura === 'array' && <Eye className="w-4 h-4 text-blue-400" />}
          <span className="text-sm text-slate-300">{nombresEstructuras[data.estructura]}</span>
        </div>

        <div className="bg-slate-800/50 p-8 flex justify-center">
          {data.estructura === 'stack' && (
            <StackViz
              datos={datos}
              onPush={handlePush}
              onPop={handlePop}
              capacidad={capacidad}
              editable={editable}
            />
          )}
          {data.estructura === 'queue' && (
            <QueueViz
              datos={datos}
              onEnqueue={handleEnqueue}
              onDequeue={handleDequeue}
              capacidad={capacidad}
              editable={editable}
            />
          )}
          {data.estructura === 'linkedList' && (
            <LinkedListViz
              datos={datos}
              onAdd={handleAddNode}
              onRemove={handleRemoveNode}
              editable={editable}
            />
          )}
          {data.estructura === 'array' && (
            <ArrayViz datos={datos} onUpdate={handleUpdateArray} editable={editable} />
          )}
        </div>
      </div>

      {/* Explicación */}
      {data.explicacion && (
        <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-white mb-1">Sobre esta estructura</h4>
              <p className="text-sm text-slate-400">{data.explicacion}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Documentación de props para DataStructureViz
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'estructura',
    type: 'string',
    description: 'Tipo de estructura: stack, queue, linkedList, binaryTree, array',
    required: true,
  },
  {
    name: 'datosIniciales',
    type: 'array',
    description: 'Datos iniciales de la estructura',
    required: true,
  },
  {
    name: 'capacidadMaxima',
    type: 'number',
    description: 'Capacidad máxima de elementos',
    required: false,
    defaultValue: '10',
  },
  {
    name: 'permitirOperaciones',
    type: 'boolean',
    description: 'Si se permiten operaciones interactivas',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'explicacion',
    type: 'string',
    description: 'Explicación de la estructura de datos',
    required: false,
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: DataStructureVizExampleData = {
  instruccion: 'Experimenta con las operaciones de una Pila (Stack)',
  estructura: 'stack',
  datosIniciales: [10, 20, 30],
  capacidadMaxima: 6,
  permitirOperaciones: true,
  explicacion:
    'Una pila (Stack) es una estructura de datos LIFO (Last In, First Out). El último elemento en entrar es el primero en salir. Las operaciones principales son Push (agregar al tope) y Pop (remover del tope).',
};

/**
 * Definición del preview para el registry
 */
export const DataStructureVizPreview: PreviewDefinition = {
  component: DataStructureVizPreviewComponent,
  exampleData,
  propsDocumentation,
};
