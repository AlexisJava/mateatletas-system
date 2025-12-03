'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para NumberInput
 */
interface NumberInputExampleData {
  instruccion: string;
  label: string;
  min: number;
  max: number;
  valorCorrecto?: number;
  tolerancia?: number;
  decimales?: number;
  unidad?: string;
  descripcion?: string;
  placeholder?: string;
  feedback?: {
    correcto: string;
    incorrecto: string;
  };
}

/**
 * Preview interactivo del componente NumberInput
 */
function NumberInputPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as NumberInputExampleData;

  const [valorActual, setValorActual] = useState<number | null>(null);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasCorrectValue = data.valorCorrecto !== undefined;
  const tolerancia = data.tolerancia ?? 0;

  const isCorrect = useMemo(() => {
    if (!hasCorrectValue || valorActual === null) return false;
    return Math.abs(valorActual - data.valorCorrecto!) <= tolerancia;
  }, [valorActual, data.valorCorrecto, hasCorrectValue, tolerancia]);

  // Calculate step based on decimales
  const step = useMemo(() => {
    if (data.decimales === undefined || data.decimales === 0) return '1';
    return (1 / Math.pow(10, data.decimales)).toString();
  }, [data.decimales]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!interactive || verified) return;
      setError(null);

      const value = e.target.value;
      if (value === '') {
        setValorActual(null);
        return;
      }

      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setValorActual(numValue);
      }
    },
    [interactive, verified],
  );

  const validateValue = useCallback((): boolean => {
    if (valorActual === null) {
      setError('Ingresa un valor');
      return false;
    }
    if (valorActual < data.min || valorActual > data.max) {
      setError(`El valor debe estar entre ${data.min} y ${data.max}`);
      return false;
    }
    return true;
  }, [valorActual, data.min, data.max]);

  const handleVerify = useCallback(() => {
    if (!validateValue()) return;
    setVerified(true);
  }, [validateValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && interactive && !verified && hasCorrectValue) {
        e.preventDefault();
        handleVerify();
      }
    },
    [interactive, verified, hasCorrectValue, handleVerify],
  );

  const handleReset = useCallback(() => {
    setVerified(false);
    setValorActual(null);
    setError(null);
  }, []);

  const getInputClass = (): string => {
    let baseClass =
      'w-full px-4 py-3 rounded-lg bg-slate-800 border-2 text-white text-lg font-medium text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200';

    if (!interactive || verified) {
      baseClass += ' opacity-50 cursor-not-allowed';
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
      baseClass += ' border-slate-600 hover:border-slate-500';
    }

    return baseClass;
  };

  return (
    <div className="relative">
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
        {data.descripcion && <p className="text-sm text-slate-400 mt-1">{data.descripcion}</p>}
      </div>

      {/* Label */}
      <div className="mb-2">
        <label className="text-white font-medium">{data.label}</label>
      </div>

      {/* Input with unit */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <input
            type="number"
            value={valorActual ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={!interactive || verified}
            min={data.min}
            max={data.max}
            step={step}
            placeholder={data.placeholder}
            aria-label={data.label}
            className={getInputClass()}
          />
        </div>
        {data.unidad && <span className="text-lg font-medium text-slate-300">{data.unidad}</span>}
      </div>

      {/* Validation Error */}
      {error && (
        <div className="p-3 rounded-lg mb-4 bg-red-900/30 border border-red-700">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Feedback */}
      {verified && data.feedback && !error && (
        <div
          className={`
            p-4 rounded-lg mb-4 text-center
            ${isCorrect ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}
          `}
        >
          <p className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? data.feedback.correcto : data.feedback.incorrecto}
          </p>
        </div>
      )}

      {/* Show correct answer if incorrect */}
      {verified && hasCorrectValue && !isCorrect && !error && (
        <div className="p-4 rounded-lg mb-4 bg-blue-900/30 border border-blue-700 text-center">
          <p className="text-blue-400 font-medium">
            La respuesta correcta es: {data.valorCorrecto}
            {data.unidad && ` ${data.unidad}`}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {interactive && hasCorrectValue && (
        <div className="flex justify-center gap-3">
          {!verified ? (
            <button
              type="button"
              onClick={handleVerify}
              className="px-6 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors duration-150"
            >
              Verificar
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 rounded-lg font-medium bg-slate-600 hover:bg-slate-500 text-white transition-colors duration-150"
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
 * Documentacion de props para NumberInput
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instruccion para el estudiante',
    required: true,
  },
  {
    name: 'label',
    type: 'string',
    description: 'Etiqueta del campo de entrada',
    required: true,
  },
  {
    name: 'min',
    type: 'number',
    description: 'Valor minimo permitido',
    required: true,
  },
  {
    name: 'max',
    type: 'number',
    description: 'Valor maximo permitido',
    required: true,
  },
  {
    name: 'valorCorrecto',
    type: 'number',
    description: 'Valor correcto (opcional, si no se especifica es entrada libre)',
    required: false,
  },
  {
    name: 'tolerancia',
    type: 'number',
    description: 'Tolerancia para considerar correcta la respuesta (default: 0)',
    required: false,
  },
  {
    name: 'decimales',
    type: 'number',
    description: 'Cantidad de decimales permitidos (default: 0)',
    required: false,
  },
  {
    name: 'unidad',
    type: 'string',
    description: 'Unidad de medida a mostrar junto al input',
    required: false,
  },
  {
    name: 'descripcion',
    type: 'string',
    description: 'Descripcion adicional del campo',
    required: false,
  },
  {
    name: 'placeholder',
    type: 'string',
    description: 'Texto placeholder del input',
    required: false,
  },
  {
    name: 'feedback',
    type: 'object',
    description: 'Mensajes de feedback con propiedades correcto e incorrecto',
    required: false,
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: NumberInputExampleData = {
  instruccion: '¿Cual es la masa molar del agua (H2O)?',
  label: 'Masa molar',
  min: 0,
  max: 1000,
  valorCorrecto: 18,
  tolerancia: 0.5,
  decimales: 1,
  unidad: 'g/mol',
  descripcion: 'La masa molar se calcula sumando las masas atomicas de los elementos',
  placeholder: 'Ej: 18.0',
  feedback: {
    correcto: '¡Correcto! La masa molar del agua es aproximadamente 18 g/mol.',
    incorrecto: 'No es correcto. Recuerda: H=1 y O=16, entonces H2O = 2(1) + 16 = 18',
  },
};

/**
 * Definicion del preview para el registry
 */
export const NumberInputPreview: PreviewDefinition = {
  component: NumberInputPreviewComponent,
  exampleData,
  propsDocumentation,
};
