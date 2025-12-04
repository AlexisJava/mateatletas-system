'use client';

import React, { ReactElement, useState, useCallback, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, FastForward, Info } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';
import {
  generarPasos,
  nombresAlgoritmos,
  codigoAlgoritmos,
  type AlgorithmStep,
  type AlgorithmType,
} from '../hooks/useSortingAlgorithms';

interface AlgorithmVizExampleData {
  instruccion: string;
  algoritmo: AlgorithmType;
  datosIniciales: number[];
  velocidad?: number;
  mostrarCodigo?: boolean;
  explicacion?: string;
}

/**
 * Preview interactivo del componente AlgorithmViz
 */
function AlgorithmVizPreviewComponent({ exampleData }: PreviewComponentProps): ReactElement {
  const data = exampleData as AlgorithmVizExampleData;

  const [pasos, setPasos] = useState<AlgorithmStep[]>(() =>
    generarPasos(data.algoritmo, data.datosIniciales),
  );
  const [pasoActual, setPasoActual] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [velocidad, setVelocidad] = useState(data.velocidad ?? 500);
  const [mostrarCodigo, setMostrarCodigo] = useState(data.mostrarCodigo ?? false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reproducción automática
  useEffect(() => {
    if (reproduciendo) {
      intervalRef.current = setInterval(() => {
        setPasoActual((p) => {
          if (p >= pasos.length - 1) {
            setReproduciendo(false);
            return p;
          }
          return p + 1;
        });
      }, velocidad);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [reproduciendo, velocidad, pasos.length]);

  const reiniciar = useCallback(() => {
    setReproduciendo(false);
    setPasoActual(0);
    setPasos(generarPasos(data.algoritmo, data.datosIniciales));
  }, [data.algoritmo, data.datosIniciales]);

  const toggleReproduccion = useCallback(() => {
    if (pasoActual >= pasos.length - 1) {
      setPasoActual(0);
    }
    setReproduciendo((r) => !r);
  }, [pasoActual, pasos.length]);

  // Obtener paso actual con fallback
  const paso = pasos[pasoActual];
  if (!paso) {
    return <div className="text-slate-400">Cargando...</div>;
  }

  const maxValor = Math.max(...data.datosIniciales);

  const getBarColor = (index: number): string => {
    if (paso.ordenado?.includes(index)) {
      return 'bg-green-500';
    }
    if (paso.intercambiando?.includes(index)) {
      return 'bg-red-500';
    }
    if (paso.comparando?.includes(index)) {
      return 'bg-yellow-500';
    }
    if (paso.pivote === index) {
      return 'bg-purple-500';
    }
    return 'bg-blue-500';
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2 py-1 bg-blue-600/30 text-blue-400 text-xs font-medium rounded">
            {nombresAlgoritmos[data.algoritmo]}
          </span>
          <span className="text-xs text-slate-500">
            Paso {pasoActual + 1} de {pasos.length}
          </span>
        </div>
      </div>

      {/* Visualización */}
      <div className="rounded-xl border border-slate-700 overflow-hidden mb-4">
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-700">
          <p className="text-sm text-slate-300">{paso.descripcion}</p>
          {paso.mensaje && <p className="text-xs text-slate-500 mt-1">{paso.mensaje}</p>}
        </div>

        <div className="bg-slate-800/50 p-6">
          {/* Barras */}
          <div className="flex items-end justify-center gap-2 h-48">
            {paso.datos.map((valor, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2"
                style={{ width: `${100 / paso.datos.length}%`, maxWidth: '60px' }}
              >
                <div
                  className={`
                    w-full rounded-t-lg transition-all duration-300
                    ${getBarColor(index)}
                  `}
                  style={{
                    height: `${(valor / maxValor) * 160}px`,
                    minHeight: '20px',
                  }}
                />
                <span className="text-sm font-mono text-slate-300">{valor}</span>
              </div>
            ))}
          </div>

          {/* Leyenda */}
          <div className="flex items-center justify-center gap-4 mt-6 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-500" />
              <span className="text-slate-400">Comparando</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-slate-400">Intercambiando</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-slate-400">Ordenado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-purple-500" />
              <span className="text-slate-400">Pivote</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reiniciar}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
            title="Reiniciar"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setPasoActual((p) => Math.max(0, p - 1))}
            disabled={pasoActual === 0 || reproduciendo}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Paso anterior"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={toggleReproduccion}
            className={`
              p-2 rounded-lg transition-colors
              ${reproduciendo ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}
              text-white
            `}
            title={reproduciendo ? 'Pausar' : 'Reproducir'}
          >
            {reproduciendo ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={() => setPasoActual((p) => Math.min(pasos.length - 1, p + 1))}
            disabled={pasoActual === pasos.length - 1 || reproduciendo}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Paso siguiente"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <FastForward className="w-4 h-4 text-slate-400" />
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={2100 - velocidad}
            onChange={(e) => setVelocidad(2100 - parseInt(e.target.value, 10))}
            className="w-24"
          />
          <span className="text-xs text-slate-500 w-16">{velocidad}ms</span>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mb-4">
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((pasoActual + 1) / pasos.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Código (toggle) */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setMostrarCodigo(!mostrarCodigo)}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          {mostrarCodigo ? 'Ocultar código' : 'Ver código'}
        </button>

        {mostrarCodigo && (
          <div className="mt-2 rounded-xl border border-slate-700 overflow-hidden">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-700">
              <span className="text-sm text-slate-300">{nombresAlgoritmos[data.algoritmo]}</span>
            </div>
            <pre className="p-4 bg-slate-800/50 text-sm text-slate-300 overflow-x-auto font-mono">
              {codigoAlgoritmos[data.algoritmo]}
            </pre>
          </div>
        )}
      </div>

      {/* Explicación */}
      {data.explicacion && (
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-white mb-1">Sobre el algoritmo</h4>
              <p className="text-sm text-slate-400">{data.explicacion}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Documentación de props para AlgorithmViz
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'algoritmo',
    type: 'string',
    description: 'Tipo de algoritmo: bubble, selection, insertion, quick, merge',
    required: true,
  },
  {
    name: 'datosIniciales',
    type: 'array',
    description: 'Arreglo de números a ordenar',
    required: true,
  },
  {
    name: 'velocidad',
    type: 'number',
    description: 'Velocidad de reproducción en milisegundos',
    required: false,
    defaultValue: '500',
  },
  {
    name: 'mostrarCodigo',
    type: 'boolean',
    description: 'Si se muestra el código del algoritmo',
    required: false,
    defaultValue: 'false',
  },
  {
    name: 'explicacion',
    type: 'string',
    description: 'Explicación del funcionamiento del algoritmo',
    required: false,
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: AlgorithmVizExampleData = {
  instruccion: 'Observa cómo funciona el algoritmo Bubble Sort paso a paso',
  algoritmo: 'bubble',
  datosIniciales: [64, 34, 25, 12, 22, 11, 90],
  velocidad: 600,
  mostrarCodigo: false,
  explicacion:
    'Bubble Sort compara elementos adyacentes y los intercambia si están en el orden incorrecto. Este proceso se repite hasta que la lista está ordenada. Tiene complejidad O(n²) en el peor caso.',
};

/**
 * Definición del preview para el registry
 */
export const AlgorithmVizPreview: PreviewDefinition = {
  component: AlgorithmVizPreviewComponent,
  exampleData,
  propsDocumentation,
};
