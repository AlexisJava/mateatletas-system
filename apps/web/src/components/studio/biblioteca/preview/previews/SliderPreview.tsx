'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para Slider
 */
interface SliderMarker {
  valor: number;
  etiqueta: string;
}

interface SliderExampleData {
  instruccion: string;
  min: number;
  max: number;
  paso: number;
  valorInicial: number;
  valorCorrecto?: number;
  tolerancia?: number;
  unidad?: string;
  marcadores?: SliderMarker[];
  feedback?: {
    correcto: string;
    incorrecto: string;
  };
}

function isValueCorrect(value: number, data: SliderExampleData): boolean {
  if (data.valorCorrecto === undefined) return true;
  const tolerance = data.tolerancia ?? 0;
  return Math.abs(value - data.valorCorrecto) <= tolerance;
}

function calculatePosition(value: number, min: number, max: number): number {
  return ((value - min) / (max - min)) * 100;
}

/**
 * Preview interactivo del componente Slider
 */
function SliderPreviewComponent({ exampleData, interactive }: PreviewComponentProps): ReactElement {
  const data = exampleData as SliderExampleData;

  const [valorActual, setValorActual] = useState(data.valorInicial);
  const [verified, setVerified] = useState(false);

  const hasCorrectValue = data.valorCorrecto !== undefined;
  const isCorrect = useMemo(() => isValueCorrect(valorActual, data), [valorActual, data]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!interactive || verified) return;
      setValorActual(Number(e.target.value));
    },
    [interactive, verified],
  );

  const handleVerify = useCallback(() => {
    setVerified(true);
  }, []);

  const handleReset = useCallback(() => {
    setVerified(false);
    setValorActual(data.valorInicial);
  }, [data.valorInicial]);

  const formatValue = (value: number): string => {
    return data.unidad ? `${value} ${data.unidad}` : String(value);
  };

  return (
    <div className="relative">
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
      </div>

      {/* Current value display */}
      <div className="text-center mb-4">
        <span className="text-3xl font-bold text-white">{formatValue(valorActual)}</span>
      </div>

      {/* Slider container */}
      <div className="relative px-2 mb-4">
        {/* Markers */}
        {data.marcadores && (
          <div className="relative h-6 mb-2">
            {data.marcadores.map((marker) => {
              const position = calculatePosition(marker.valor, data.min, data.max);
              return (
                <div
                  key={marker.valor}
                  className="absolute transform -translate-x-1/2 text-xs text-slate-400"
                  style={{ left: `${position}%` }}
                >
                  {marker.etiqueta}
                </div>
              );
            })}
          </div>
        )}

        {/* Slider input */}
        <input
          type="range"
          min={data.min}
          max={data.max}
          step={data.paso}
          value={valorActual}
          onChange={handleChange}
          disabled={!interactive || verified}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-blue-500
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-blue-500
            [&::-moz-range-thumb]:border-0
            disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Correct value indicator */}
        {verified && hasCorrectValue && !isCorrect && (
          <div
            className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
            style={{
              left: `calc(${calculatePosition(data.valorCorrecto!, data.min, data.max)}% - 6px)`,
            }}
            title={`Valor correcto: ${data.valorCorrecto}`}
          />
        )}

        {/* Min/Max labels */}
        <div className="flex justify-between mt-2 text-sm text-slate-400">
          <span>{data.min}</span>
          <span>{data.max}</span>
        </div>
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
 * Documentación de props para Slider
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'min',
    type: 'number',
    description: 'Valor mínimo del slider',
    required: true,
  },
  {
    name: 'max',
    type: 'number',
    description: 'Valor máximo del slider',
    required: true,
  },
  {
    name: 'paso',
    type: 'number',
    description: 'Incremento del paso',
    required: true,
  },
  {
    name: 'valorInicial',
    type: 'number',
    description: 'Valor inicial del slider',
    required: true,
  },
  {
    name: 'valorCorrecto',
    type: 'number',
    description: 'Valor correcto (opcional, si no se especifica es exploración libre)',
    required: false,
  },
  {
    name: 'tolerancia',
    type: 'number',
    description: 'Tolerancia para aceptar respuesta como correcta (default: 0)',
    required: false,
  },
  {
    name: 'unidad',
    type: 'string',
    description: 'Unidad a mostrar (ej: "°C", "kg", "%")',
    required: false,
  },
  {
    name: 'marcadores',
    type: 'array',
    description: 'Marcadores opcionales con valor y etiqueta',
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
const exampleData: SliderExampleData = {
  instruccion: 'Ajusta la temperatura para el experimento',
  min: 0,
  max: 100,
  paso: 1,
  valorInicial: 50,
  valorCorrecto: 75,
  tolerancia: 5,
  unidad: '°C',
  marcadores: [
    { valor: 0, etiqueta: 'Frío' },
    { valor: 50, etiqueta: 'Templado' },
    { valor: 100, etiqueta: 'Caliente' },
  ],
  feedback: {
    correcto: '¡Perfecto! 75°C es la temperatura ideal.',
    incorrecto: 'No es la temperatura correcta. Intenta de nuevo.',
  },
};

/**
 * Definición del preview para el registry
 */
export const SliderPreview: PreviewDefinition = {
  component: SliderPreviewComponent,
  exampleData,
  propsDocumentation,
};
