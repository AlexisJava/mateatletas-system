'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import { Check, Circle, Lock } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para ProgressTracker
 */
interface ProgressStep {
  id: string;
  titulo: string;
  descripcion?: string;
  completado: boolean;
  bloqueado?: boolean;
}

interface ProgressTrackerExampleData {
  instruccion: string;
  titulo: string;
  pasos: ProgressStep[];
  mostrarDescripcion?: boolean;
  permitirNavegacion?: boolean;
  estilo?: 'horizontal' | 'vertical';
}

/**
 * Preview interactivo del componente ProgressTracker
 */
function ProgressTrackerPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as ProgressTrackerExampleData;

  const [pasos, setPasos] = useState<ProgressStep[]>(data.pasos);
  const [pasoActivo, setPasoActivo] = useState<string | null>(() => {
    const primerIncompleto = data.pasos.find((p) => !p.completado && !p.bloqueado);
    return primerIncompleto?.id ?? null;
  });

  const progreso = useMemo(() => {
    const completados = pasos.filter((p) => p.completado).length;
    return {
      completados,
      total: pasos.length,
      porcentaje: Math.round((completados / pasos.length) * 100),
    };
  }, [pasos]);

  const handleTogglePaso = useCallback(
    (pasoId: string) => {
      if (!interactive) return;

      const paso = pasos.find((p) => p.id === pasoId);
      if (!paso || paso.bloqueado) return;

      setPasos((prev) =>
        prev.map((p) => (p.id === pasoId ? { ...p, completado: !p.completado } : p)),
      );
    },
    [interactive, pasos],
  );

  const handleSelectPaso = useCallback(
    (pasoId: string) => {
      if (!interactive || !data.permitirNavegacion) return;
      const paso = pasos.find((p) => p.id === pasoId);
      if (paso?.bloqueado) return;
      setPasoActivo(pasoId);
    },
    [interactive, data.permitirNavegacion, pasos],
  );

  const isHorizontal = data.estilo === 'horizontal';

  const getStepClasses = (paso: ProgressStep): string => {
    let classes = 'flex items-center gap-3 p-3 rounded-lg transition-all duration-150';

    if (paso.bloqueado) {
      classes += ' bg-slate-800 opacity-50 cursor-not-allowed';
    } else if (paso.completado) {
      classes += ' bg-green-900/20 border border-green-700';
    } else if (pasoActivo === paso.id) {
      classes += ' bg-blue-900/20 border border-blue-500';
    } else {
      classes += ' bg-slate-800 hover:bg-slate-700 cursor-pointer';
    }

    return classes;
  };

  const getIconClasses = (paso: ProgressStep): ReactElement => {
    if (paso.bloqueado) {
      return <Lock className="w-5 h-5 text-slate-500" />;
    }
    if (paso.completado) {
      return <Check className="w-5 h-5 text-green-400" />;
    }
    return <Circle className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.titulo}</h2>
        <p className="text-sm text-slate-400 mt-1">{data.instruccion}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>Progreso del módulo</span>
          <span>
            {progreso.completados}/{progreso.total} completados
          </span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
            style={{ width: `${progreso.porcentaje}%` }}
          />
        </div>
        <div className="text-center mt-2">
          <span className="text-2xl font-bold text-white">{progreso.porcentaje}%</span>
        </div>
      </div>

      {/* Steps */}
      {isHorizontal ? (
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {pasos.map((paso, index) => (
            <React.Fragment key={paso.id}>
              <div
                className={`
                  flex flex-col items-center shrink-0 cursor-pointer
                  ${paso.bloqueado ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => handleSelectPaso(paso.id)}
              >
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center mb-2
                    ${paso.completado ? 'bg-green-600' : paso.bloqueado ? 'bg-slate-700' : pasoActivo === paso.id ? 'bg-blue-600' : 'bg-slate-600'}
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePaso(paso.id);
                  }}
                >
                  {getIconClasses(paso)}
                </div>
                <span className="text-xs text-slate-300 text-center max-w-[80px] truncate">
                  {paso.titulo}
                </span>
              </div>
              {index < pasos.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded ${pasos[index + 1]?.completado || paso.completado ? 'bg-green-600' : 'bg-slate-700'}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {pasos.map((paso, index) => (
            <div key={paso.id} className="flex gap-3">
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer
                    ${paso.completado ? 'bg-green-600' : paso.bloqueado ? 'bg-slate-700' : 'bg-slate-600 hover:bg-slate-500'}
                  `}
                  onClick={() => handleTogglePaso(paso.id)}
                >
                  {getIconClasses(paso)}
                </div>
                {index < pasos.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 my-1 ${paso.completado ? 'bg-green-600' : 'bg-slate-700'}`}
                  />
                )}
              </div>

              {/* Content */}
              <div className={getStepClasses(paso)} onClick={() => handleSelectPaso(paso.id)}>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{paso.titulo}</h4>
                  {data.mostrarDescripcion !== false && paso.descripcion && (
                    <p className="text-sm text-slate-400 mt-1">{paso.descripcion}</p>
                  )}
                </div>
                {paso.completado && (
                  <span className="text-xs text-green-400 shrink-0">Completado</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active step details */}
      {pasoActivo && data.permitirNavegacion && (
        <div className="mt-6 p-4 bg-slate-800 rounded-xl border border-slate-700">
          <h3 className="text-white font-semibold mb-2">
            {pasos.find((p) => p.id === pasoActivo)?.titulo}
          </h3>
          <p className="text-slate-400 text-sm">
            {pasos.find((p) => p.id === pasoActivo)?.descripcion ||
              'Haz click en el círculo para marcar como completado.'}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Documentación de props para ProgressTracker
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
    description: 'Título del tracker de progreso',
    required: true,
  },
  {
    name: 'pasos',
    type: 'array',
    description: 'Array de pasos con id, titulo, descripcion, completado y bloqueado',
    required: true,
  },
  {
    name: 'mostrarDescripcion',
    type: 'boolean',
    description: 'Mostrar descripción de cada paso',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'permitirNavegacion',
    type: 'boolean',
    description: 'Permitir seleccionar pasos',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'estilo',
    type: 'string',
    description: 'Estilo de visualización: horizontal o vertical',
    required: false,
    defaultValue: 'vertical',
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: ProgressTrackerExampleData = {
  instruccion: 'Completa todos los pasos del módulo',
  titulo: 'Módulo 1: Introducción a las Fracciones',
  pasos: [
    {
      id: 'p1',
      titulo: '¿Qué es una fracción?',
      descripcion: 'Aprende el concepto básico de fracciones',
      completado: true,
      bloqueado: false,
    },
    {
      id: 'p2',
      titulo: 'Partes de una fracción',
      descripcion: 'Numerador y denominador explicados',
      completado: true,
      bloqueado: false,
    },
    {
      id: 'p3',
      titulo: 'Fracciones equivalentes',
      descripcion: 'Cómo identificar fracciones iguales',
      completado: false,
      bloqueado: false,
    },
    {
      id: 'p4',
      titulo: 'Suma de fracciones',
      descripcion: 'Operaciones básicas con fracciones',
      completado: false,
      bloqueado: true,
    },
    {
      id: 'p5',
      titulo: 'Evaluación final',
      descripcion: 'Demuestra lo que aprendiste',
      completado: false,
      bloqueado: true,
    },
  ],
  mostrarDescripcion: true,
  permitirNavegacion: true,
  estilo: 'vertical',
};

/**
 * Definición del preview para el registry
 */
export const ProgressTrackerPreview: PreviewDefinition = {
  component: ProgressTrackerPreviewComponent,
  exampleData,
  propsDocumentation,
};
