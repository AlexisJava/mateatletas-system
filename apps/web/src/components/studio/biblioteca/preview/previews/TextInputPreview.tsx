'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para TextInput
 */
interface TextInputExampleData {
  instruccion: string;
  label: string;
  placeholder?: string;
  respuestaCorrecta?: string;
  respuestasAlternativas?: string[];
  caseSensitive?: boolean;
  descripcion?: string;
  maxLength?: number;
  multiline?: boolean;
  rows?: number;
  feedback?: {
    correcto: string;
    incorrecto: string;
  };
}

/**
 * Preview interactivo del componente TextInput
 */
function TextInputPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as TextInputExampleData;

  const [valorActual, setValorActual] = useState<string>('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasCorrectAnswer = data.respuestaCorrecta !== undefined;
  const caseSensitive = data.caseSensitive ?? false;

  const isCorrect = useMemo(() => {
    if (!hasCorrectAnswer) return false;
    const trimmedValue = valorActual.trim();
    if (!trimmedValue) return false;

    const compareValue = caseSensitive ? trimmedValue : trimmedValue.toLowerCase();
    const correctValue = caseSensitive
      ? data.respuestaCorrecta!
      : data.respuestaCorrecta!.toLowerCase();

    if (compareValue === correctValue) return true;

    if (data.respuestasAlternativas) {
      return data.respuestasAlternativas.some((alt) => {
        const altValue = caseSensitive ? alt : alt.toLowerCase();
        return compareValue === altValue;
      });
    }

    return false;
  }, [
    valorActual,
    data.respuestaCorrecta,
    data.respuestasAlternativas,
    hasCorrectAnswer,
    caseSensitive,
  ]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!interactive || verified) return;
      setError(null);
      setValorActual(e.target.value);
    },
    [interactive, verified],
  );

  const handleVerify = useCallback(() => {
    const trimmedValue = valorActual.trim();
    if (!trimmedValue) {
      setError('Ingresa una respuesta');
      return;
    }
    setVerified(true);
  }, [valorActual]);

  const handleRetry = useCallback(() => {
    setVerified(false);
    setValorActual('');
    setError(null);
  }, []);

  const getInputClass = (): string => {
    let baseClass =
      'w-full px-4 py-3 rounded-lg bg-slate-800 border-2 text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200';

    if (!interactive || verified) {
      baseClass += ' opacity-70';
    }

    if (verified) {
      if (isCorrect) {
        baseClass += ' border-green-500 bg-green-900/20';
      } else {
        baseClass += ' border-red-500 bg-red-900/20';
      }
    } else if (error) {
      baseClass += ' border-red-500';
    } else {
      baseClass += ' border-slate-600';
    }

    return baseClass;
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      {/* Instruction */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">{data.instruccion}</h3>
        {data.descripcion && <p className="text-sm text-slate-400 mt-1">{data.descripcion}</p>}
      </div>

      {/* Label */}
      <div className="mb-2">
        <label className="text-sm text-white font-medium">{data.label}</label>
      </div>

      {/* Input */}
      <div className="mb-3">
        {data.multiline ? (
          <textarea
            value={valorActual}
            onChange={handleChange}
            disabled={!interactive || verified}
            placeholder={data.placeholder}
            maxLength={data.maxLength}
            rows={data.rows || 4}
            className={getInputClass()}
          />
        ) : (
          <input
            type="text"
            value={valorActual}
            onChange={handleChange}
            disabled={!interactive || verified}
            placeholder={data.placeholder}
            maxLength={data.maxLength}
            className={getInputClass()}
          />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-2 rounded mb-3 bg-red-900/30 border border-red-700">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Feedback */}
      {verified && data.feedback && (
        <div
          className={`p-3 rounded mb-3 text-center ${
            isCorrect
              ? 'bg-green-900/30 border border-green-700'
              : 'bg-red-900/30 border border-red-700'
          }`}
        >
          <p className={`text-sm font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? data.feedback.correcto : data.feedback.incorrecto}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {interactive && hasCorrectAnswer && (
        <div className="flex justify-center gap-2">
          {!verified && (
            <button
              type="button"
              onClick={handleVerify}
              className="px-4 py-2 rounded font-medium text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              Verificar
            </button>
          )}
          {verified && !isCorrect && (
            <button
              type="button"
              onClick={handleRetry}
              className="px-4 py-2 rounded font-medium text-sm bg-slate-600 hover:bg-slate-500 text-white transition-colors"
            >
              Reintentar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Documentación de props para TextInput
 */
const propDocs: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    required: true,
    description: 'Instrucción o pregunta para el estudiante',
  },
  {
    name: 'label',
    type: 'string',
    required: true,
    description: 'Etiqueta del campo de texto',
  },
  {
    name: 'placeholder',
    type: 'string',
    required: false,
    description: 'Texto de ayuda dentro del input',
  },
  {
    name: 'respuestaCorrecta',
    type: 'string',
    required: false,
    description: 'Respuesta correcta esperada (si no se especifica, modo libre)',
  },
  {
    name: 'respuestasAlternativas',
    type: 'array',
    required: false,
    description: 'Respuestas alternativas aceptadas como correctas',
  },
  {
    name: 'caseSensitive',
    type: 'boolean',
    required: false,
    defaultValue: 'false',
    description: 'Si la comparación distingue mayúsculas/minúsculas',
  },
  {
    name: 'descripcion',
    type: 'string',
    required: false,
    description: 'Descripción adicional o ayuda contextual',
  },
  {
    name: 'maxLength',
    type: 'number',
    required: false,
    description: 'Longitud máxima de caracteres permitidos',
  },
  {
    name: 'multiline',
    type: 'boolean',
    required: false,
    defaultValue: 'false',
    description: 'Si el input es un textarea multilínea',
  },
  {
    name: 'rows',
    type: 'number',
    required: false,
    defaultValue: '4',
    description: 'Número de filas del textarea (si multiline=true)',
  },
  {
    name: 'feedback',
    type: 'object',
    required: false,
    description: 'Mensajes de feedback para respuestas correctas/incorrectas',
  },
  {
    name: 'intentosMaximos',
    type: 'number',
    required: false,
    description: 'Número máximo de intentos permitidos',
  },
  {
    name: 'mostrarRespuestaTras',
    type: 'number',
    required: false,
    description: 'Mostrar respuesta correcta después de N intentos',
  },
];

/**
 * Definición del preview para TextInput
 */
/**
 * Datos de ejemplo para el preview
 */
const exampleData: TextInputExampleData = {
  instruccion: '¿Cuál es el símbolo químico del agua?',
  label: 'Símbolo químico',
  placeholder: 'Ej: H2O',
  respuestaCorrecta: 'H2O',
  respuestasAlternativas: ['agua', 'water'],
  caseSensitive: false,
  descripcion: 'Escribe la fórmula molecular del agua',
  feedback: {
    correcto: '¡Correcto! El agua es H₂O.',
    incorrecto: 'Incorrecto. Pista: tiene 2 hidrógenos y 1 oxígeno.',
  },
};

export const TextInputPreview: PreviewDefinition = {
  component: TextInputPreviewComponent,
  exampleData,
  propsDocumentation: propDocs,
};
