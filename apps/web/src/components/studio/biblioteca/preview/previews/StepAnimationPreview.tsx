'use client';

import React, { ReactElement, useState, useCallback, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para StepAnimation
 */
interface AnimationStep {
  id: string;
  titulo: string;
  descripcion: string;
  visual: string; // Emoji o representación visual
  duracion?: number; // ms
}

interface StepAnimationExampleData {
  instruccion: string;
  pasos: AnimationStep[];
  autoPlay?: boolean;
  velocidad?: 'lento' | 'normal' | 'rapido';
  mostrarControles?: boolean;
  repetir?: boolean;
}

/**
 * Preview interactivo del componente StepAnimation
 * Muestra una secuencia animada paso a paso
 */
function StepAnimationPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as StepAnimationExampleData;

  const [pasoActual, setPasoActual] = useState(0);
  const [isPlaying, setIsPlaying] = useState(data.autoPlay ?? false);
  const [progress, setProgress] = useState(0);

  const velocidades = {
    lento: 3000,
    normal: 2000,
    rapido: 1000,
  };
  const duracionPaso = velocidades[data.velocidad ?? 'normal'];

  useEffect(() => {
    if (!isPlaying) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, duracionPaso / 50);

    const stepInterval = setInterval(() => {
      setPasoActual((prev) => {
        const next = prev + 1;
        if (next >= data.pasos.length) {
          if (data.repetir) {
            setProgress(0);
            return 0;
          } else {
            setIsPlaying(false);
            return prev;
          }
        }
        setProgress(0);
        return next;
      });
    }, duracionPaso);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [isPlaying, duracionPaso, data.pasos.length, data.repetir]);

  const handlePlayPause = useCallback(() => {
    if (!interactive) return;
    setIsPlaying((prev) => !prev);
    if (!isPlaying) {
      setProgress(0);
    }
  }, [interactive, isPlaying]);

  const handlePrevious = useCallback(() => {
    if (!interactive) return;
    setIsPlaying(false);
    setPasoActual((prev) => Math.max(0, prev - 1));
    setProgress(0);
  }, [interactive]);

  const handleNext = useCallback(() => {
    if (!interactive) return;
    setIsPlaying(false);
    setPasoActual((prev) => Math.min(data.pasos.length - 1, prev + 1));
    setProgress(0);
  }, [interactive, data.pasos.length]);

  const handleReset = useCallback(() => {
    if (!interactive) return;
    setIsPlaying(false);
    setPasoActual(0);
    setProgress(0);
  }, [interactive]);

  const paso = data.pasos[pasoActual] ?? data.pasos[0];
  if (!paso) return <div className="text-white">No hay pasos configurados</div>;

  return (
    <div className="relative">
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
      </div>

      {/* Animation Display */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        {/* Visual Area */}
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 p-8 min-h-[200px] flex items-center justify-center">
          {/* Step indicator */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-slate-700 rounded-full">
            <span className="text-sm text-slate-300">
              Paso {pasoActual + 1} de {data.pasos.length}
            </span>
          </div>

          {/* Visual representation */}
          <div
            className={`
              text-8xl transition-all duration-500
              ${isPlaying ? 'animate-pulse' : ''}
            `}
            style={{
              transform: isPlaying ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {paso.visual}
          </div>

          {/* Playing indicator */}
          {isPlaying && (
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">Reproduciendo</span>
            </div>
          )}
        </div>

        {/* Step Progress Bar */}
        <div className="h-1 bg-slate-700">
          <div
            className="h-full bg-blue-500 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step Info */}
        <div className="p-4 bg-slate-800">
          <h3 className="text-white font-semibold mb-1">{paso.titulo}</h3>
          <p className="text-slate-400 text-sm">{paso.descripcion}</p>
        </div>

        {/* Timeline */}
        <div className="px-4 py-3 bg-slate-900 border-t border-slate-700">
          <div className="flex items-center justify-center gap-1">
            {data.pasos.map((p, index) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  if (!interactive) return;
                  setIsPlaying(false);
                  setPasoActual(index);
                  setProgress(0);
                }}
                disabled={!interactive}
                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center text-lg
                  transition-all duration-200
                  ${
                    index === pasoActual
                      ? 'bg-blue-600 ring-2 ring-blue-400'
                      : index < pasoActual
                        ? 'bg-green-600/50'
                        : 'bg-slate-700 hover:bg-slate-600'
                  }
                  disabled:cursor-default
                `}
              >
                {p.visual}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        {data.mostrarControles !== false && interactive && (
          <div className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 border-t border-slate-700">
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
              title="Reiniciar"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handlePrevious}
              disabled={pasoActual === 0}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Anterior"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handlePlayPause}
              className={`
                p-3 rounded-xl font-medium transition-all
                ${isPlaying ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'}
                text-white shadow-lg
              `}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={pasoActual === data.pasos.length - 1}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Siguiente"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Documentación de props para StepAnimation
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'pasos',
    type: 'array',
    description: 'Lista de pasos con id, titulo, descripcion y visual',
    required: true,
  },
  {
    name: 'autoPlay',
    type: 'boolean',
    description: 'Si la animación inicia automáticamente',
    required: false,
    defaultValue: 'false',
  },
  {
    name: 'velocidad',
    type: 'string',
    description: 'Velocidad de la animación: lento, normal, o rapido',
    required: false,
    defaultValue: 'normal',
  },
  {
    name: 'mostrarControles',
    type: 'boolean',
    description: 'Si se muestran los controles de reproducción',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'repetir',
    type: 'boolean',
    description: 'Si la animación se repite al terminar',
    required: false,
    defaultValue: 'false',
  },
];

/**
 * Datos de ejemplo para el preview - Ciclo del agua
 */
const exampleData: StepAnimationExampleData = {
  instruccion: 'Observa el ciclo del agua paso a paso',
  pasos: [
    {
      id: 's1',
      titulo: 'Evaporación',
      descripcion: 'El sol calienta el agua de los océanos y ríos, convirtiéndola en vapor.',
      visual: '☀️',
    },
    {
      id: 's2',
      titulo: 'Condensación',
      descripcion: 'El vapor de agua sube y se enfría, formando nubes.',
      visual: '☁️',
    },
    {
      id: 's3',
      titulo: 'Precipitación',
      descripcion: 'Las gotas de agua caen como lluvia, nieve o granizo.',
      visual: '🌧️',
    },
    {
      id: 's4',
      titulo: 'Recolección',
      descripcion: 'El agua se acumula en ríos, lagos y océanos, y el ciclo vuelve a empezar.',
      visual: '🌊',
    },
  ],
  autoPlay: false,
  velocidad: 'normal',
  mostrarControles: true,
  repetir: true,
};

/**
 * Definición del preview para el registry
 */
export const StepAnimationPreview: PreviewDefinition = {
  component: StepAnimationPreviewComponent,
  exampleData,
  propsDocumentation,
};
