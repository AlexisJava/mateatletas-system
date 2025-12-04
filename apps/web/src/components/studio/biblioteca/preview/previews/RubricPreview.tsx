'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para Rubric
 */
interface RubricCriterio {
  id: string;
  nombre: string;
  descripcion?: string;
  niveles: {
    id: string;
    nombre: string;
    puntos: number;
    descripcion: string;
  }[];
}

interface RubricExampleData {
  instruccion: string;
  titulo: string;
  criterios: RubricCriterio[];
  mostrarPuntaje?: boolean;
  permitirAutoeval?: boolean;
}

/**
 * Preview interactivo del componente Rubric (rúbrica de evaluación)
 */
function RubricPreviewComponent({ exampleData, interactive }: PreviewComponentProps): ReactElement {
  const data = exampleData as RubricExampleData;

  const [selecciones, setSelecciones] = useState<Record<string, string>>({});

  const handleSeleccion = useCallback(
    (criterioId: string, nivelId: string) => {
      if (!interactive || !data.permitirAutoeval) return;
      setSelecciones((prev) => ({
        ...prev,
        [criterioId]: nivelId,
      }));
    },
    [interactive, data.permitirAutoeval],
  );

  const puntajeTotal = useMemo(() => {
    let total = 0;
    Object.entries(selecciones).forEach(([criterioId, nivelId]) => {
      const criterio = data.criterios.find((c) => c.id === criterioId);
      const nivel = criterio?.niveles.find((n) => n.id === nivelId);
      if (nivel) total += nivel.puntos;
    });
    return total;
  }, [selecciones, data.criterios]);

  const puntajeMaximo = useMemo(() => {
    return data.criterios.reduce((sum, criterio) => {
      const maxPuntos = Math.max(...criterio.niveles.map((n) => n.puntos));
      return sum + maxPuntos;
    }, 0);
  }, [data.criterios]);

  const todosSeleccionados = Object.keys(selecciones).length === data.criterios.length;

  return (
    <div className="relative">
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
        <p className="text-sm text-slate-400 mt-1">{data.titulo}</p>
      </div>

      {/* Rubric Table */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-4 py-3 border-b border-slate-700">
          <div className="grid grid-cols-5 gap-2 text-center">
            <div className="text-left">
              <span className="text-sm font-medium text-slate-300">Criterio</span>
            </div>
            {data.criterios[0]?.niveles.map((nivel) => (
              <div key={nivel.id}>
                <span className="text-sm font-medium text-slate-300">{nivel.nombre}</span>
                {data.mostrarPuntaje !== false && (
                  <span className="block text-xs text-slate-500">{nivel.puntos} pts</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Criterios */}
        <div className="divide-y divide-slate-700">
          {data.criterios.map((criterio) => {
            const seleccionActual = selecciones[criterio.id];

            return (
              <div key={criterio.id} className="px-4 py-3">
                <div className="grid grid-cols-5 gap-2">
                  {/* Criterio name */}
                  <div className="text-left">
                    <span className="text-sm font-medium text-white">{criterio.nombre}</span>
                    {criterio.descripcion && (
                      <span className="block text-xs text-slate-400 mt-0.5">
                        {criterio.descripcion}
                      </span>
                    )}
                  </div>

                  {/* Niveles */}
                  {criterio.niveles.map((nivel) => {
                    const isSelected = seleccionActual === nivel.id;

                    return (
                      <button
                        key={nivel.id}
                        type="button"
                        onClick={() => handleSeleccion(criterio.id, nivel.id)}
                        disabled={!interactive || !data.permitirAutoeval}
                        className={`
                          p-2 rounded-lg text-left transition-all text-xs
                          ${
                            isSelected
                              ? 'bg-blue-600/30 border-2 border-blue-500 ring-1 ring-blue-400'
                              : 'bg-slate-700/50 border border-slate-600 hover:border-slate-500'
                          }
                          ${data.permitirAutoeval && interactive ? 'cursor-pointer' : 'cursor-default'}
                          disabled:cursor-default
                        `}
                      >
                        <div className="flex items-start gap-1.5">
                          {isSelected ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                          )}
                          <span className={`${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {nivel.descripcion}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Score Summary */}
        {data.mostrarPuntaje !== false && data.permitirAutoeval && (
          <div className="px-4 py-3 bg-slate-900 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">
                {todosSeleccionados
                  ? 'Autoevaluación completa'
                  : `${Object.keys(selecciones).length}/${data.criterios.length} criterios evaluados`}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Puntaje:</span>
                <span
                  className={`text-lg font-bold ${todosSeleccionados ? 'text-green-400' : 'text-blue-400'}`}
                >
                  {puntajeTotal} / {puntajeMaximo}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Documentación de props para Rubric
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'titulo',
    type: 'string',
    description: 'Título de la rúbrica',
    required: true,
  },
  {
    name: 'criterios',
    type: 'array',
    description: 'Lista de criterios de evaluación con sus niveles',
    required: true,
  },
  {
    name: 'mostrarPuntaje',
    type: 'boolean',
    description: 'Si se muestra el puntaje de cada nivel',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'permitirAutoeval',
    type: 'boolean',
    description: 'Si el estudiante puede autoevaluarse',
    required: false,
    defaultValue: 'false',
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: RubricExampleData = {
  instruccion: 'Evalúa tu trabajo según los criterios',
  titulo: 'Rúbrica de Presentación Oral',
  criterios: [
    {
      id: 'c1',
      nombre: 'Contenido',
      descripcion: 'Información presentada',
      niveles: [
        { id: 'c1n1', nombre: 'Inicial', puntos: 1, descripcion: 'Ideas confusas o incompletas' },
        {
          id: 'c1n2',
          nombre: 'En desarrollo',
          puntos: 2,
          descripcion: 'Ideas básicas pero claras',
        },
        {
          id: 'c1n3',
          nombre: 'Logrado',
          puntos: 3,
          descripcion: 'Ideas claras y bien organizadas',
        },
        { id: 'c1n4', nombre: 'Destacado', puntos: 4, descripcion: 'Ideas profundas y creativas' },
      ],
    },
    {
      id: 'c2',
      nombre: 'Expresión oral',
      descripcion: 'Claridad al hablar',
      niveles: [
        { id: 'c2n1', nombre: 'Inicial', puntos: 1, descripcion: 'Difícil de entender' },
        { id: 'c2n2', nombre: 'En desarrollo', puntos: 2, descripcion: 'Se entiende con esfuerzo' },
        { id: 'c2n3', nombre: 'Logrado', puntos: 3, descripcion: 'Clara y fluida' },
        { id: 'c2n4', nombre: 'Destacado', puntos: 4, descripcion: 'Excelente dicción y ritmo' },
      ],
    },
    {
      id: 'c3',
      nombre: 'Material visual',
      descripcion: 'Apoyo gráfico',
      niveles: [
        { id: 'c3n1', nombre: 'Inicial', puntos: 1, descripcion: 'Sin apoyo visual' },
        { id: 'c3n2', nombre: 'En desarrollo', puntos: 2, descripcion: 'Básico pero funcional' },
        { id: 'c3n3', nombre: 'Logrado', puntos: 3, descripcion: 'Claro y atractivo' },
        { id: 'c3n4', nombre: 'Destacado', puntos: 4, descripcion: 'Creativo y profesional' },
      ],
    },
  ],
  mostrarPuntaje: true,
  permitirAutoeval: true,
};

/**
 * Definición del preview para el registry
 */
export const RubricPreview: PreviewDefinition = {
  component: RubricPreviewComponent,
  exampleData,
  propsDocumentation,
};
