'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para ToggleSwitch
 */
interface ToggleSwitchExampleData {
  instruccion: string;
  label: string;
  valorInicial: boolean;
  valorCorrecto?: boolean;
  descripcion?: string;
  labelOff?: string;
  labelOn?: string;
  feedback?: {
    correcto: string;
    incorrecto: string;
  };
}

/**
 * Preview interactivo del componente ToggleSwitch
 */
function ToggleSwitchPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as ToggleSwitchExampleData;

  const [valorActual, setValorActual] = useState(data.valorInicial);
  const [verified, setVerified] = useState(false);

  const hasCorrectValue = data.valorCorrecto !== undefined;
  const isCorrect = useMemo(
    () => (hasCorrectValue ? valorActual === data.valorCorrecto : true),
    [valorActual, data.valorCorrecto, hasCorrectValue],
  );

  const labelOff = data.labelOff ?? 'Off';
  const labelOn = data.labelOn ?? 'On';

  const handleToggle = useCallback(() => {
    if (!interactive || verified) return;
    setValorActual((prev) => !prev);
  }, [interactive, verified]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggle();
      }
    },
    [handleToggle],
  );

  const handleVerify = useCallback(() => {
    setVerified(true);
  }, []);

  const handleReset = useCallback(() => {
    setVerified(false);
    setValorActual(data.valorInicial);
  }, [data.valorInicial]);

  const getToggleTrackClass = (): string => {
    let baseClass = 'w-14 h-8 rounded-full transition-colors duration-200 ease-in-out';
    if (!interactive || verified) {
      baseClass += ' opacity-50 cursor-not-allowed';
    }
    if (verified) {
      baseClass += isCorrect ? ' bg-green-600' : ' bg-red-600';
    } else {
      baseClass += valorActual ? ' bg-blue-600' : ' bg-slate-600';
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

      {/* Toggle Switch */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <span className={`text-sm font-medium ${!valorActual ? 'text-white' : 'text-slate-500'}`}>
          {labelOff}
        </span>

        <div className="relative inline-flex items-center cursor-pointer">
          <div
            role="switch"
            tabIndex={!interactive || verified ? -1 : 0}
            aria-checked={valorActual}
            aria-disabled={!interactive || verified}
            aria-label={data.label}
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            className={getToggleTrackClass()}
          >
            <span
              className={`
                absolute top-1 w-6 h-6 bg-white rounded-full shadow-md
                transition-transform duration-200 ease-in-out
                ${valorActual ? 'translate-x-7' : 'translate-x-1'}
              `}
            />
          </div>
        </div>

        <span className={`text-sm font-medium ${valorActual ? 'text-white' : 'text-slate-500'}`}>
          {labelOn}
        </span>
      </div>

      {/* Label */}
      <div className="text-center mb-4">
        <span className="text-white font-medium">{data.label}</span>
      </div>

      {/* Feedback */}
      {verified && data.feedback && (
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
      {verified && hasCorrectValue && !isCorrect && (
        <div className="p-4 rounded-lg mb-4 bg-blue-900/30 border border-blue-700 text-center">
          <p className="text-blue-400 font-medium">
            La respuesta correcta es: {data.valorCorrecto ? labelOn : labelOff}
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
 * Documentación de props para ToggleSwitch
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'label',
    type: 'string',
    description: 'Etiqueta del toggle switch',
    required: true,
  },
  {
    name: 'valorInicial',
    type: 'boolean',
    description: 'Valor inicial (true = on, false = off)',
    required: true,
  },
  {
    name: 'valorCorrecto',
    type: 'boolean',
    description: 'Valor correcto (opcional, si no se especifica es exploración libre)',
    required: false,
  },
  {
    name: 'descripcion',
    type: 'string',
    description: 'Descripción adicional del toggle',
    required: false,
  },
  {
    name: 'labelOff',
    type: 'string',
    description: 'Etiqueta personalizada para estado OFF (default: "Off")',
    required: false,
  },
  {
    name: 'labelOn',
    type: 'string',
    description: 'Etiqueta personalizada para estado ON (default: "On")',
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
const exampleData: ToggleSwitchExampleData = {
  instruccion: '¿Debe activarse el catalizador para esta reacción?',
  label: 'Catalizador',
  valorInicial: false,
  valorCorrecto: true,
  descripcion: 'El catalizador acelera la reacción sin consumirse',
  labelOff: 'Inactivo',
  labelOn: 'Activo',
  feedback: {
    correcto: '¡Correcto! El catalizador debe estar activo para acelerar la reacción.',
    incorrecto: 'No es correcto. Piensa en el efecto del catalizador.',
  },
};

/**
 * Definición del preview para el registry
 */
export const ToggleSwitchPreview: PreviewDefinition = {
  component: ToggleSwitchPreviewComponent,
  exampleData,
  propsDocumentation,
};
