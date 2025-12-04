'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para ScaleBalance
 */
interface Pesa {
  id: string;
  valor: number;
  etiqueta: string;
}

interface ScaleBalanceExampleData {
  instruccion: string;
  pesasDisponibles: Pesa[];
  pesoObjetivo: number;
  tolerancia?: number;
  feedback?: {
    correcto: string;
    incorrecto: string;
  };
}

/**
 * Preview interactivo del componente ScaleBalance
 */
function ScaleBalancePreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as ScaleBalanceExampleData;

  const [pesasEnBalanza, setPesasEnBalanza] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);

  const pesoActual = useMemo(() => {
    return pesasEnBalanza.reduce((sum, pesaId) => {
      const pesa = data.pesasDisponibles.find((p) => p.id === pesaId);
      return sum + (pesa?.valor ?? 0);
    }, 0);
  }, [pesasEnBalanza, data.pesasDisponibles]);

  const diferencia = pesoActual - data.pesoObjetivo;
  const tolerancia = data.tolerancia ?? 0;
  const isBalanced = Math.abs(diferencia) <= tolerancia;

  // Calcular ángulo de inclinación
  const tiltAngle = useMemo(() => {
    if (isBalanced) return 0;
    const maxTilt = 12;
    const ratio = diferencia / data.pesoObjetivo;
    return Math.max(-maxTilt, Math.min(maxTilt, ratio * maxTilt));
  }, [diferencia, data.pesoObjetivo, isBalanced]);

  const handleAddPesa = useCallback(
    (pesaId: string) => {
      if (!interactive || verified) return;
      setPesasEnBalanza((prev) => [...prev, pesaId]);
    },
    [interactive, verified],
  );

  const handleRemovePesa = useCallback(
    (index: number) => {
      if (!interactive || verified) return;
      setPesasEnBalanza((prev) => prev.filter((_, i) => i !== index));
    },
    [interactive, verified],
  );

  const handleVerify = useCallback(() => {
    setVerified(true);
  }, []);

  const handleReset = useCallback(() => {
    setVerified(false);
    setPesasEnBalanza([]);
  }, []);

  const getPesaById = (id: string) => data.pesasDisponibles.find((p) => p.id === id);

  return (
    <div className="relative">
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
        <p className="text-sm text-slate-400 mt-1">
          Objetivo: <span className="text-blue-400 font-bold">{data.pesoObjetivo}g</span>
        </p>
      </div>

      {/* Scale visualization - Diseño mejorado */}
      <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-6 mb-4">
        {/* Fulcrum/Base */}
        <div className="flex flex-col items-center">
          {/* Beam container */}
          <div
            className="relative w-72 transition-transform duration-500 ease-out"
            style={{ transform: `rotate(${tiltAngle}deg)` }}
          >
            {/* The beam */}
            <div className="h-3 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 rounded-full shadow-lg" />

            {/* Left pan - Objetivo */}
            <div className="absolute -left-6 top-3 flex flex-col items-center">
              <div className="w-1 h-6 bg-amber-800" />
              <div className="w-20 h-4 bg-gradient-to-b from-amber-600 to-amber-700 rounded-b-lg shadow-md" />
              <div className="mt-2 bg-slate-700/80 rounded-lg px-3 py-2 text-center backdrop-blur-sm">
                <div className="text-[10px] text-slate-400 uppercase tracking-wide">Objetivo</div>
                <div className="text-lg font-bold text-amber-400">{data.pesoObjetivo}g</div>
              </div>
            </div>

            {/* Right pan - Usuario */}
            <div className="absolute -right-6 top-3 flex flex-col items-center">
              <div className="w-1 h-6 bg-amber-800" />
              <div className="w-20 h-4 bg-gradient-to-b from-amber-600 to-amber-700 rounded-b-lg shadow-md" />
              <div
                className={`mt-2 rounded-lg px-3 py-2 text-center backdrop-blur-sm transition-colors ${isBalanced ? 'bg-green-600/80' : 'bg-slate-700/80'}`}
              >
                <div className="text-[10px] text-slate-300 uppercase tracking-wide">Tu peso</div>
                <div className={`text-lg font-bold ${isBalanced ? 'text-white' : 'text-blue-400'}`}>
                  {pesoActual}g
                </div>
              </div>
            </div>

            {/* Center pivot point */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-2">
              <div
                className={`w-5 h-5 rounded-full border-4 transition-colors ${isBalanced ? 'bg-green-500 border-green-400' : 'bg-slate-600 border-slate-500'}`}
              />
            </div>
          </div>

          {/* Stand */}
          <div className="w-4 h-12 bg-gradient-to-b from-slate-600 to-slate-700 rounded-b-sm mt-1" />
          <div className="w-24 h-3 bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg" />
        </div>

        {/* Balance status indicator */}
        <div className="absolute top-3 right-3">
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${isBalanced ? 'bg-green-500/20 text-green-400' : diferencia > 0 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}
          >
            {isBalanced ? '⚖️ Equilibrado' : diferencia > 0 ? '⬇️ Muy pesado' : '⬆️ Muy liviano'}
          </div>
        </div>
      </div>

      {/* Pesas en balanza */}
      <div className="mb-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
        <p className="text-xs text-slate-400 mb-3 font-medium">
          📦 Pesas en tu platillo <span className="text-slate-500">(click para quitar)</span>:
        </p>
        <div className="flex flex-wrap gap-2 min-h-[44px]">
          {pesasEnBalanza.length === 0 ? (
            <span className="text-slate-500 text-sm italic">Agrega pesas desde abajo...</span>
          ) : (
            pesasEnBalanza.map((pesaId, index) => {
              const pesa = getPesaById(pesaId);
              if (!pesa) return null;
              return (
                <button
                  key={`${pesaId}-${index}`}
                  type="button"
                  onClick={() => handleRemovePesa(index)}
                  disabled={!interactive || verified}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  {pesa.etiqueta}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Pesas disponibles */}
      <div className="mb-4 p-4 bg-slate-700/50 rounded-xl border border-slate-600">
        <p className="text-xs text-slate-400 mb-3 font-medium">
          🎯 Pesas disponibles{' '}
          <span className="text-slate-500">(click para agregar, puedes usar varias veces)</span>:
        </p>
        <div className="flex flex-wrap gap-2">
          {data.pesasDisponibles.map((pesa) => (
            <button
              key={pesa.id}
              type="button"
              onClick={() => handleAddPesa(pesa.id)}
              disabled={!interactive || verified}
              className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-600 text-white hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow hover:shadow-md active:scale-95"
            >
              {pesa.etiqueta}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {verified && data.feedback && (
        <div
          className={`p-4 rounded-xl mb-4 text-center border ${isBalanced ? 'bg-green-900/30 border-green-600' : 'bg-red-900/30 border-red-600'}`}
        >
          <p className={`font-medium ${isBalanced ? 'text-green-400' : 'text-red-400'}`}>
            {isBalanced ? data.feedback.correcto : data.feedback.incorrecto}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {interactive && (
        <div className="flex justify-center gap-3">
          {!verified ? (
            <button
              type="button"
              onClick={handleVerify}
              className="px-6 py-2.5 rounded-lg font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors duration-150 shadow-lg"
            >
              Verificar
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 rounded-lg font-medium bg-slate-600 hover:bg-slate-500 text-white transition-colors duration-150"
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
 * Documentación de props para ScaleBalance
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'pesasDisponibles',
    type: 'array',
    description: 'Array de pesas disponibles con id, valor y etiqueta',
    required: true,
  },
  {
    name: 'pesoObjetivo',
    type: 'number',
    description: 'Peso objetivo que se debe alcanzar',
    required: true,
  },
  {
    name: 'tolerancia',
    type: 'number',
    description: 'Tolerancia permitida para considerar equilibrado',
    required: false,
    defaultValue: '0',
  },
  {
    name: 'feedback',
    type: 'object',
    description: 'Mensajes de feedback al verificar',
    required: false,
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: ScaleBalanceExampleData = {
  instruccion: 'Equilibra la balanza agregando pesas',
  pesasDisponibles: [
    { id: 'p1', valor: 10, etiqueta: '10g' },
    { id: 'p2', valor: 5, etiqueta: '5g' },
    { id: 'p3', valor: 2, etiqueta: '2g' },
    { id: 'p4', valor: 1, etiqueta: '1g' },
  ],
  pesoObjetivo: 18,
  tolerancia: 0,
  feedback: {
    correcto: '¡Perfecto! La balanza está equilibrada.',
    incorrecto: 'La balanza no está equilibrada. Ajusta las pesas.',
  },
};

/**
 * Definición del preview para el registry
 */
export const ScaleBalancePreview: PreviewDefinition = {
  component: ScaleBalancePreviewComponent,
  exampleData,
  propsDocumentation,
};
