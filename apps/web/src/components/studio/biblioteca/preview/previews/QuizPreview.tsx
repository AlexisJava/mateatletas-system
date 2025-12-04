'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import { CheckCircle, XCircle, Circle } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para Quiz
 */
interface QuizPregunta {
  id: string;
  pregunta: string;
  opciones: {
    id: string;
    texto: string;
    esCorrecta: boolean;
  }[];
  explicacion?: string;
}

interface QuizExampleData {
  instruccion: string;
  titulo: string;
  preguntas: QuizPregunta[];
  mostrarProgreso?: boolean;
  permitirNavegacion?: boolean;
  mostrarExplicaciones?: boolean;
  puntosPorPregunta?: number;
}

/**
 * Preview interactivo del componente Quiz
 */
function QuizPreviewComponent({ exampleData, interactive }: PreviewComponentProps): ReactElement {
  const data = exampleData as QuizExampleData;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [verified, setVerified] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const preguntaActual = data.preguntas[currentQuestion];

  const resultados = useMemo(() => {
    let correctas = 0;
    data.preguntas.forEach((pregunta) => {
      const respuestaId = respuestas[pregunta.id];
      const opcionSeleccionada = pregunta.opciones.find((o) => o.id === respuestaId);
      if (opcionSeleccionada?.esCorrecta) {
        correctas++;
      }
    });
    return {
      correctas,
      total: data.preguntas.length,
      porcentaje: Math.round((correctas / data.preguntas.length) * 100),
    };
  }, [respuestas, data.preguntas]);

  const handleSelectOption = useCallback(
    (preguntaId: string, opcionId: string) => {
      if (!interactive || verified) return;
      setRespuestas((prev) => ({
        ...prev,
        [preguntaId]: opcionId,
      }));
    },
    [interactive, verified],
  );

  const handleNext = useCallback(() => {
    if (currentQuestion < data.preguntas.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  }, [currentQuestion, data.preguntas.length]);

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  }, [currentQuestion]);

  const handleVerify = useCallback(() => {
    setVerified(true);
    setShowResults(true);
  }, []);

  const handleReset = useCallback(() => {
    setVerified(false);
    setShowResults(false);
    setRespuestas({});
    setCurrentQuestion(0);
  }, []);

  const allAnswered = data.preguntas.every((p) => respuestas[p.id]);

  const getOptionClasses = (
    preguntaId: string,
    opcion: { id: string; esCorrecta: boolean },
  ): string => {
    const isSelected = respuestas[preguntaId] === opcion.id;
    let baseClasses =
      'flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-150 cursor-pointer';

    if (verified) {
      if (opcion.esCorrecta) {
        baseClasses += ' border-green-500 bg-green-900/30';
      } else if (isSelected && !opcion.esCorrecta) {
        baseClasses += ' border-red-500 bg-red-900/30';
      } else {
        baseClasses += ' border-slate-600 bg-slate-800 opacity-50';
      }
    } else {
      if (isSelected) {
        baseClasses += ' border-blue-500 bg-blue-900/30';
      } else {
        baseClasses += ' border-slate-600 bg-slate-800 hover:border-slate-500';
      }
    }

    return baseClasses;
  };

  if (showResults) {
    return (
      <div className="relative">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">{data.titulo}</h2>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 text-center">
          <div className="mb-6">
            <div
              className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${resultados.porcentaje >= 70 ? 'bg-green-900/30' : 'bg-red-900/30'}`}
            >
              <span
                className={`text-3xl font-bold ${resultados.porcentaje >= 70 ? 'text-green-400' : 'text-red-400'}`}
              >
                {resultados.porcentaje}%
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {resultados.porcentaje >= 70 ? '¡Buen trabajo!' : 'Sigue practicando'}
            </h3>
            <p className="text-slate-400">
              Respondiste correctamente {resultados.correctas} de {resultados.total} preguntas
            </p>
          </div>

          {/* Question summary */}
          <div className="space-y-2 mb-6">
            {data.preguntas.map((pregunta, index) => {
              const respuestaId = respuestas[pregunta.id];
              const opcionSeleccionada = pregunta.opciones.find((o) => o.id === respuestaId);
              const esCorrecta = opcionSeleccionada?.esCorrecta ?? false;

              return (
                <div
                  key={pregunta.id}
                  className={`flex items-center gap-2 p-2 rounded ${esCorrecta ? 'bg-green-900/20' : 'bg-red-900/20'}`}
                >
                  {esCorrecta ? (
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                  <span className="text-sm text-slate-300 text-left">
                    {index + 1}. {pregunta.pregunta.substring(0, 50)}...
                  </span>
                </div>
              );
            })}
          </div>

          {interactive && (
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors duration-150"
            >
              Reintentar
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.titulo}</h2>
        <p className="text-sm text-slate-400 mt-1">{data.instruccion}</p>
      </div>

      {/* Progress */}
      {data.mostrarProgreso !== false && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-400 mb-1">
            <span>
              Pregunta {currentQuestion + 1} de {data.preguntas.length}
            </span>
            <span>{Object.keys(respuestas).length} respondidas</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / data.preguntas.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Question Card */}
      <div className="bg-slate-800 rounded-xl p-4 mb-4">
        <h3 className="text-white font-medium mb-4">{preguntaActual?.pregunta}</h3>

        <div className="space-y-2">
          {preguntaActual?.opciones.map((opcion) => (
            <div
              key={opcion.id}
              className={getOptionClasses(preguntaActual.id, opcion)}
              onClick={() => handleSelectOption(preguntaActual.id, opcion.id)}
            >
              {verified ? (
                opcion.esCorrecta ? (
                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                ) : respuestas[preguntaActual.id] === opcion.id ? (
                  <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500 shrink-0" />
                )
              ) : (
                <Circle
                  className={`w-5 h-5 shrink-0 ${respuestas[preguntaActual.id] === opcion.id ? 'text-blue-400' : 'text-slate-500'}`}
                />
              )}
              <span className="text-white">{opcion.texto}</span>
            </div>
          ))}
        </div>

        {/* Explanation */}
        {verified && data.mostrarExplicaciones && preguntaActual?.explicacion && (
          <div className="mt-4 p-3 bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-300">{preguntaActual.explicacion}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        {data.permitirNavegacion !== false ? (
          <>
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentQuestion === 0 || !interactive}
              className="px-4 py-2 rounded-lg font-medium bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>

            {currentQuestion < data.preguntas.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!interactive}
                className="px-4 py-2 rounded-lg font-medium bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                onClick={handleVerify}
                disabled={!interactive || !allAnswered}
                className="px-6 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Finalizar
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={handleVerify}
            disabled={!interactive || !allAnswered}
            className="w-full px-6 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Verificar Respuestas
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Documentación de props para Quiz
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
    description: 'Título del quiz',
    required: true,
  },
  {
    name: 'preguntas',
    type: 'array',
    description: 'Array de preguntas con id, pregunta, opciones y explicación',
    required: true,
  },
  {
    name: 'mostrarProgreso',
    type: 'boolean',
    description: 'Mostrar barra de progreso',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'permitirNavegacion',
    type: 'boolean',
    description: 'Permitir navegar entre preguntas',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'mostrarExplicaciones',
    type: 'boolean',
    description: 'Mostrar explicaciones al verificar',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'puntosPorPregunta',
    type: 'number',
    description: 'Puntos otorgados por respuesta correcta',
    required: false,
    defaultValue: '1',
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: QuizExampleData = {
  instruccion: 'Responde las siguientes preguntas sobre matemáticas',
  titulo: 'Quiz de Fracciones',
  preguntas: [
    {
      id: 'q1',
      pregunta: '¿Cuál es el resultado de 1/2 + 1/4?',
      opciones: [
        { id: 'q1o1', texto: '2/6', esCorrecta: false },
        { id: 'q1o2', texto: '3/4', esCorrecta: true },
        { id: 'q1o3', texto: '1/6', esCorrecta: false },
        { id: 'q1o4', texto: '2/4', esCorrecta: false },
      ],
      explicacion:
        'Para sumar fracciones, necesitamos un denominador común. 1/2 = 2/4, entonces 2/4 + 1/4 = 3/4',
    },
    {
      id: 'q2',
      pregunta: '¿Qué fracción es equivalente a 2/4?',
      opciones: [
        { id: 'q2o1', texto: '1/2', esCorrecta: true },
        { id: 'q2o2', texto: '3/6', esCorrecta: false },
        { id: 'q2o3', texto: '4/8', esCorrecta: false },
        { id: 'q2o4', texto: 'Todas las anteriores', esCorrecta: false },
      ],
      explicacion: '2/4 se simplifica dividiendo numerador y denominador entre 2, resultando 1/2',
    },
    {
      id: 'q3',
      pregunta: '¿Cuál es el resultado de 3/4 - 1/2?',
      opciones: [
        { id: 'q3o1', texto: '2/2', esCorrecta: false },
        { id: 'q3o2', texto: '1/4', esCorrecta: true },
        { id: 'q3o3', texto: '2/4', esCorrecta: false },
        { id: 'q3o4', texto: '1/2', esCorrecta: false },
      ],
      explicacion: '1/2 = 2/4, entonces 3/4 - 2/4 = 1/4',
    },
  ],
  mostrarProgreso: true,
  permitirNavegacion: true,
  mostrarExplicaciones: true,
  puntosPorPregunta: 1,
};

/**
 * Definición del preview para el registry
 */
export const QuizPreview: PreviewDefinition = {
  component: QuizPreviewComponent,
  exampleData,
  propsDocumentation,
};
