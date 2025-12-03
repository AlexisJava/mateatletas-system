'use client';

import React, { ReactElement, useState } from 'react';
import { Check, X, CheckCircle2 } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para MultipleChoice
 */
interface MultipleChoiceExampleData {
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number;
  feedback: boolean;
  explicacion?: string;
}

/**
 * Preview interactivo del componente MultipleChoice
 */
function MultipleChoicePreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as MultipleChoiceExampleData;
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (index: number): void => {
    if (!interactive || submitted) return;
    setSelected(index);
  };

  const handleSubmit = (): void => {
    if (selected === null || !interactive) return;
    setSubmitted(true);
  };

  const handleReset = (): void => {
    setSelected(null);
    setSubmitted(false);
  };

  const isCorrect = submitted && selected === data.respuestaCorrecta;
  const isIncorrect = submitted && selected !== data.respuestaCorrecta;

  return (
    <div className="space-y-4">
      {/* Pregunta */}
      <div className="text-lg font-medium text-white">{data.pregunta}</div>

      {/* Opciones */}
      <div className="space-y-2">
        {data.opciones.map((opcion, index) => {
          const isSelected = selected === index;
          const isCorrectOption = index === data.respuestaCorrecta;
          const showCorrect = submitted && isCorrectOption;
          const showIncorrect = submitted && isSelected && !isCorrectOption;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(index)}
              disabled={!interactive || submitted}
              className={`
                w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all
                ${!submitted && isSelected ? 'border-orange-500 bg-orange-500/10' : ''}
                ${!submitted && !isSelected ? 'border-white/10 bg-white/[0.02] hover:border-white/20' : ''}
                ${showCorrect ? 'border-emerald-500 bg-emerald-500/10' : ''}
                ${showIncorrect ? 'border-red-500 bg-red-500/10' : ''}
                ${submitted && !isSelected && !isCorrectOption ? 'opacity-50' : ''}
                ${!interactive || submitted ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              {/* Radio/Check indicator */}
              <div
                className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${!submitted && isSelected ? 'border-orange-500 bg-orange-500' : ''}
                  ${!submitted && !isSelected ? 'border-white/30' : ''}
                  ${showCorrect ? 'border-emerald-500 bg-emerald-500' : ''}
                  ${showIncorrect ? 'border-red-500 bg-red-500' : ''}
                  ${submitted && !isSelected && isCorrectOption ? 'border-emerald-500' : ''}
                `}
              >
                {(isSelected || showCorrect) && <Check className="w-3 h-3 text-white" />}
              </div>

              {/* Option text */}
              <span
                className={`
                  flex-1
                  ${!submitted ? 'text-white/80' : ''}
                  ${showCorrect ? 'text-emerald-400' : ''}
                  ${showIncorrect ? 'text-red-400' : ''}
                  ${submitted && !isSelected && !isCorrectOption ? 'text-white/40' : ''}
                `}
              >
                {opcion}
              </span>

              {/* Result icon */}
              {showCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {showIncorrect && <X className="w-5 h-5 text-red-400" />}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {data.feedback && submitted && (
        <div
          className={`
            p-4 rounded-lg border
            ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : ''}
            ${isIncorrect ? 'bg-red-500/10 border-red-500/30' : ''}
          `}
        >
          <div className="flex items-center gap-2 mb-1">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-medium text-emerald-400">¡Correcto!</span>
              </>
            ) : (
              <>
                <X className="w-5 h-5 text-red-400" />
                <span className="font-medium text-red-400">Incorrecto</span>
              </>
            )}
          </div>
          {data.explicacion && <p className="text-sm text-white/60 mt-2">{data.explicacion}</p>}
        </div>
      )}

      {/* Actions */}
      {interactive && (
        <div className="flex gap-2">
          {!submitted ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={selected === null}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  selected === null
                    ? 'bg-white/10 text-white/30 cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }
              `}
            >
              Verificar respuesta
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
            >
              Intentar de nuevo
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Documentación de props para MultipleChoice
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'pregunta',
    type: 'string',
    description: 'El texto de la pregunta a mostrar',
    required: true,
  },
  {
    name: 'opciones',
    type: 'array',
    description: 'Lista de strings con las opciones de respuesta',
    required: true,
  },
  {
    name: 'respuestaCorrecta',
    type: 'number',
    description: 'Índice (0-based) de la opción correcta',
    required: true,
  },
  {
    name: 'feedback',
    type: 'boolean',
    description: 'Si se muestra feedback al responder',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'explicacion',
    type: 'string',
    description: 'Texto explicativo que se muestra en el feedback',
    required: false,
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: MultipleChoiceExampleData = {
  pregunta: '¿Cuánto es 7 × 8?',
  opciones: ['54', '56', '58', '64'],
  respuestaCorrecta: 1,
  feedback: true,
  explicacion: '7 × 8 = 56. Una forma de recordarlo es que 5678 (cinco, seis, siete, ocho).',
};

/**
 * Definición del preview para el registry
 */
export const MultipleChoicePreview: PreviewDefinition = {
  component: MultipleChoicePreviewComponent,
  exampleData,
  propsDocumentation,
};
