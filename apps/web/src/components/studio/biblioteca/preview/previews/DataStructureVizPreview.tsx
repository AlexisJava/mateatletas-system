'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Minus,
  Trash2,
  Eye,
  ArrowRight,
  Circle,
  Square,
  Info,
  RotateCcw,
} from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Tipos para DataStructureViz
 */
type DataStructureType = 'stack' | 'queue' | 'linkedList' | 'binaryTree' | 'array';

interface TreeNode {
  valor: number;
  izquierda?: TreeNode;
  derecha?: TreeNode;
}

interface LinkedListNode {
  valor: number;
  siguiente?: number; // índice del siguiente
}

interface DataStructureVizExampleData {
  instruccion: string;
  estructura: DataStructureType;
  datosIniciales: number[];
  capacidadMaxima?: number;
  permitirOperaciones?: boolean;
  explicacion?: string;
}

const nombresEstructuras: Record<DataStructureType, string> = {
  stack: 'Pila (Stack)',
  queue: 'Cola (Queue)',
  linkedList: 'Lista Enlazada',
  binaryTree: 'Árbol Binario',
  array: 'Arreglo (Array)',
};

/**
 * Componente para visualizar Stack
 */
function StackViz({
  datos,
  onPush,
  onPop,
  capacidad,
  editable,
}: {
  datos: number[];
  onPush: (valor: number) => void;
  onPop: () => void;
  capacidad: number;
  editable: boolean;
}): ReactElement {
  const [nuevoValor, setNuevoValor] = useState('');

  const handlePush = () => {
    const valor = parseInt(nuevoValor, 10);
    if (!isNaN(valor)) {
      onPush(valor);
      setNuevoValor('');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-end gap-4">
        {/* Stack visual */}
        <div className="relative">
          <div className="w-32 border-l-4 border-r-4 border-b-4 border-slate-600 rounded-b-lg min-h-[200px] flex flex-col-reverse items-center p-2 gap-1">
            {datos.map((valor, i) => (
              <div
                key={i}
                className={`
                  w-full py-2 px-4 rounded text-center font-mono text-sm transition-all
                  ${i === datos.length - 1 ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}
                `}
              >
                {valor}
              </div>
            ))}
          </div>
          {datos.length > 0 && (
            <div className="absolute -right-8 top-2 flex items-center gap-1 text-xs text-green-400">
              <ArrowRight className="w-3 h-3" />
              TOP
            </div>
          )}
          <div className="absolute -left-16 bottom-0 text-xs text-slate-500">
            {datos.length}/{capacidad}
          </div>
        </div>

        {/* Controles */}
        {editable && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-1">
              <input
                type="number"
                value={nuevoValor}
                onChange={(e) => setNuevoValor(e.target.value)}
                placeholder="Valor"
                className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
              />
              <button
                type="button"
                onClick={handlePush}
                disabled={datos.length >= capacidad}
                className="p-1.5 rounded bg-green-600 hover:bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                title="Push"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={onPop}
              disabled={datos.length === 0}
              className="flex items-center justify-center gap-1 px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4" />
              Pop
            </button>
          </div>
        )}
      </div>

      {/* Operaciones disponibles */}
      <div className="mt-4 text-xs text-slate-500">
        <span className="font-medium">LIFO:</span> Last In, First Out
      </div>
    </div>
  );
}

/**
 * Componente para visualizar Queue
 */
function QueueViz({
  datos,
  onEnqueue,
  onDequeue,
  capacidad,
  editable,
}: {
  datos: number[];
  onEnqueue: (valor: number) => void;
  onDequeue: () => void;
  capacidad: number;
  editable: boolean;
}): ReactElement {
  const [nuevoValor, setNuevoValor] = useState('');

  const handleEnqueue = () => {
    const valor = parseInt(nuevoValor, 10);
    if (!isNaN(valor)) {
      onEnqueue(valor);
      setNuevoValor('');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-4">
        {/* Controles izquierda - Dequeue */}
        {editable && (
          <button
            type="button"
            onClick={onDequeue}
            disabled={datos.length === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4" />
            Dequeue
          </button>
        )}

        {/* Queue visual */}
        <div className="relative">
          <div className="flex items-center border-t-4 border-b-4 border-slate-600 min-w-[200px] min-h-[50px] px-2 py-2 gap-1">
            {datos.length === 0 ? (
              <span className="text-slate-500 text-sm px-4">Cola vacía</span>
            ) : (
              datos.map((valor, i) => (
                <div
                  key={i}
                  className={`
                    py-2 px-4 rounded font-mono text-sm transition-all
                    ${i === 0 ? 'bg-red-500 text-white' : ''}
                    ${i === datos.length - 1 && i !== 0 ? 'bg-green-500 text-white' : ''}
                    ${i !== 0 && i !== datos.length - 1 ? 'bg-blue-500 text-white' : ''}
                  `}
                >
                  {valor}
                </div>
              ))
            )}
          </div>
          {datos.length > 0 && (
            <>
              <div className="absolute -bottom-6 left-2 text-xs text-red-400">FRONT</div>
              <div className="absolute -bottom-6 right-2 text-xs text-green-400">REAR</div>
            </>
          )}
        </div>

        {/* Controles derecha - Enqueue */}
        {editable && (
          <div className="flex gap-1">
            <input
              type="number"
              value={nuevoValor}
              onChange={(e) => setNuevoValor(e.target.value)}
              placeholder="Valor"
              className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
            />
            <button
              type="button"
              onClick={handleEnqueue}
              disabled={datos.length >= capacidad}
              className="p-1.5 rounded bg-green-600 hover:bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              title="Enqueue"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 text-xs text-slate-500">
        <span className="font-medium">FIFO:</span> First In, First Out ({datos.length}/{capacidad})
      </div>
    </div>
  );
}

/**
 * Componente para visualizar Lista Enlazada
 */
function LinkedListViz({
  datos,
  onAdd,
  onRemove,
  editable,
}: {
  datos: number[];
  onAdd: (valor: number) => void;
  onRemove: (index: number) => void;
  editable: boolean;
}): ReactElement {
  const [nuevoValor, setNuevoValor] = useState('');

  const handleAdd = () => {
    const valor = parseInt(nuevoValor, 10);
    if (!isNaN(valor)) {
      onAdd(valor);
      setNuevoValor('');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center flex-wrap gap-1 min-h-[80px]">
        {datos.length === 0 ? (
          <span className="text-slate-500 text-sm">Lista vacía (null)</span>
        ) : (
          datos.map((valor, i) => (
            <React.Fragment key={i}>
              <div className="relative group">
                <div className="flex items-center">
                  <div className="flex flex-col border-2 border-blue-500 rounded overflow-hidden">
                    <div className="px-4 py-2 bg-blue-500 text-white font-mono text-sm">
                      {valor}
                    </div>
                    <div className="px-2 py-1 bg-slate-700 text-xs text-slate-400 text-center">
                      {i < datos.length - 1 ? `→${i + 1}` : 'null'}
                    </div>
                  </div>
                </div>
                {editable && (
                  <button
                    type="button"
                    onClick={() => onRemove(i)}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              {i < datos.length - 1 && <ArrowRight className="w-5 h-5 text-slate-500" />}
            </React.Fragment>
          ))
        )}
      </div>

      {editable && (
        <div className="mt-4 flex gap-2">
          <input
            type="number"
            value={nuevoValor}
            onChange={(e) => setNuevoValor(e.target.value)}
            placeholder="Valor"
            className="w-24 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-green-600 hover:bg-green-500 text-white text-sm"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>
      )}

      <div className="mt-4 text-xs text-slate-500">HEAD → {datos.length} nodos → NULL</div>
    </div>
  );
}

/**
 * Componente para visualizar Array
 */
function ArrayViz({
  datos,
  onUpdate,
  editable,
}: {
  datos: number[];
  onUpdate: (index: number, valor: number) => void;
  editable: boolean;
}): ReactElement {
  const [editando, setEditando] = useState<number | null>(null);
  const [valorTemp, setValorTemp] = useState('');

  const handleStartEdit = (index: number) => {
    if (!editable) return;
    setEditando(index);
    setValorTemp(String(datos[index]));
  };

  const handleFinishEdit = () => {
    if (editando !== null) {
      const valor = parseInt(valorTemp, 10);
      if (!isNaN(valor)) {
        onUpdate(editando, valor);
      }
      setEditando(null);
      setValorTemp('');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-0.5">
        {datos.map((valor, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-xs text-slate-500 mb-1">[{i}]</span>
            {editando === i ? (
              <input
                type="number"
                value={valorTemp}
                onChange={(e) => setValorTemp(e.target.value)}
                onBlur={handleFinishEdit}
                onKeyDown={(e) => e.key === 'Enter' && handleFinishEdit()}
                autoFocus
                className="w-12 h-12 text-center bg-yellow-500 text-white font-mono text-sm rounded"
              />
            ) : (
              <button
                type="button"
                onClick={() => handleStartEdit(i)}
                disabled={!editable}
                className={`
                  w-12 h-12 flex items-center justify-center font-mono text-sm rounded
                  border-2 border-blue-500 bg-blue-500/20 text-blue-300
                  ${editable ? 'hover:bg-blue-500/40 cursor-pointer' : 'cursor-default'}
                `}
              >
                {valor}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-slate-500">
        Arreglo de {datos.length} elementos • Índices: 0 a {datos.length - 1}
      </div>
    </div>
  );
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
