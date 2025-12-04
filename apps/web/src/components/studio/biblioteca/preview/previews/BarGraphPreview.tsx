'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para BarGraph
 */
interface BarGraphBarra {
  id: string;
  etiqueta: string;
  valor: number;
  color: string;
}

interface BarGraphExampleData {
  instruccion: string;
  barras: BarGraphBarra[];
  valorMaximo: number;
  valoresCorrectos?: Record<string, number>;
  esInteractivo?: boolean;
  mostrarValores?: boolean;
  mostrarEtiquetas?: boolean;
  unidad?: string;
  feedback?: {
    correcto: string;
    incorrecto: string;
  };
}

/**
 * Preview interactivo del componente BarGraph
 */
function BarGraphPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as BarGraphExampleData;

  const [valores, setValores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    data.barras.forEach((b) => {
      initial[b.id] = b.valor;
    });
    return initial;
  });
  const [verified, setVerified] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  const isCorrect = useMemo(() => {
    if (!data.valoresCorrectos) return true;
    return Object.entries(data.valoresCorrectos).every(([id, correctVal]) => {
      const currentVal = valores[id] ?? 0;
      return Math.abs(currentVal - correctVal) <= 2; // Tolerancia de 2
    });
  }, [valores, data.valoresCorrectos]);

  const handleValueChange = useCallback(
    (id: string, newValue: number) => {
      if (!interactive || verified || !data.esInteractivo) return;
      setValores((prev) => ({
        ...prev,
        [id]: Math.max(0, Math.min(data.valorMaximo, newValue)),
      }));
    },
    [interactive, verified, data.esInteractivo, data.valorMaximo],
  );

  const handleVerify = useCallback(() => {
    setVerified(true);
  }, []);

  const handleReset = useCallback(() => {
    setVerified(false);
    const initial: Record<string, number> = {};
    data.barras.forEach((b) => {
      initial[b.id] = b.valor;
    });
    setValores(initial);
  }, [data.barras]);

  const unidad = data.unidad ?? '';

  // Generar líneas de grid
  const gridLines = useMemo(() => {
    const lines = [];
    const step = data.valorMaximo / 4;
    for (let i = 0; i <= 4; i++) {
      lines.push(Math.round(step * i));
    }
    return lines;
  }, [data.valorMaximo]);

  return (
    <div className="relative">
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
      </div>

      {/* Bar Graph Container */}
      <div className="bg-slate-800 rounded-xl p-5 mb-4">
        {/* Y-axis labels and grid */}
        <div className="flex">
          {/* Y-axis */}
          <div className="flex flex-col justify-between h-52 pr-3 text-right">
            {gridLines.reverse().map((val) => (
              <span key={val} className="text-xs text-slate-400">
                {val}
                {unidad}
              </span>
            ))}
          </div>

          {/* Chart area */}
          <div className="flex-1 relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {gridLines.map((val, i) => (
                <div key={i} className="border-t border-slate-700 w-full" />
              ))}
            </div>

            {/* Bars */}
            <div className="relative h-52 flex items-end justify-around gap-2 px-2">
              {data.barras.map((barra) => {
                const valor = valores[barra.id] ?? 0;
                const percentage = (valor / data.valorMaximo) * 100;
                const isHovered = hoveredBar === barra.id;

                return (
                  <div
                    key={barra.id}
                    className="flex-1 flex flex-col items-center max-w-[80px]"
                    onMouseEnter={() => setHoveredBar(barra.id)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Value tooltip */}
                    {data.mostrarValores !== false && (
                      <div
                        className={`mb-1 px-2 py-0.5 rounded text-xs font-bold transition-opacity ${isHovered ? 'opacity-100' : 'opacity-70'}`}
                        style={{ color: barra.color }}
                      >
                        {valor}
                        {unidad}
                      </div>
                    )}

                    {/* Bar */}
                    <div className="w-full h-44 bg-slate-700/50 rounded-t-lg relative overflow-hidden">
                      <div
                        className="absolute bottom-0 w-full rounded-t-lg transition-all duration-300 ease-out"
                        style={{
                          height: `${percentage}%`,
                          backgroundColor: barra.color,
                          boxShadow: isHovered ? `0 0 20px ${barra.color}40` : 'none',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            {data.mostrarEtiquetas !== false && (
              <div className="flex justify-around gap-2 px-2 mt-2">
                {data.barras.map((barra) => (
                  <div key={barra.id} className="flex-1 text-center max-w-[80px]">
                    <span className="text-xs text-slate-300 font-medium">{barra.etiqueta}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Interactive sliders */}
        {data.esInteractivo && interactive && !verified && (
          <div className="mt-6 pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-400 mb-3">Ajusta los valores:</p>
            <div className="space-y-3">
              {data.barras.map((barra) => {
                const valor = valores[barra.id] ?? 0;
                return (
                  <div key={barra.id} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: barra.color }}
                    />
                    <span className="text-sm text-white w-20 shrink-0">{barra.etiqueta}</span>
                    <input
                      type="range"
                      min="0"
                      max={data.valorMaximo}
                      value={valor}
                      onChange={(e) => handleValueChange(barra.id, Number(e.target.value))}
                      className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                      style={{
                        accentColor: barra.color,
                      }}
                    />
                    <span className="text-sm text-slate-300 w-12 text-right">
                      {valor}
                      {unidad}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Feedback */}
      {verified && data.feedback && (
        <div
          className={`p-4 rounded-xl mb-4 text-center border ${isCorrect ? 'bg-green-900/30 border-green-600' : 'bg-red-900/30 border-red-600'}`}
        >
          <p className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? data.feedback.correcto : data.feedback.incorrecto}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {interactive && data.esInteractivo && data.valoresCorrectos && (
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
 * Documentación de props para BarGraph
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'barras',
    type: 'array',
    description: 'Array de barras con id, etiqueta, valor y color',
    required: true,
  },
  {
    name: 'valorMaximo',
    type: 'number',
    description: 'Valor máximo para el eje Y',
    required: true,
  },
  {
    name: 'valoresCorrectos',
    type: 'object',
    description: 'Valores correctos para verificación (opcional)',
    required: false,
  },
  {
    name: 'esInteractivo',
    type: 'boolean',
    description: 'Si el estudiante puede ajustar los valores',
    required: false,
    defaultValue: 'false',
  },
  {
    name: 'mostrarValores',
    type: 'boolean',
    description: 'Mostrar valores numéricos sobre las barras',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'mostrarEtiquetas',
    type: 'boolean',
    description: 'Mostrar etiquetas del eje X',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'unidad',
    type: 'string',
    description: 'Unidad de medida (ej: "%", "kg", "pts")',
    required: false,
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
const exampleData: BarGraphExampleData = {
  instruccion: 'Ajusta las barras para mostrar la población de cada ciudad',
  barras: [
    { id: 'b1', etiqueta: 'Buenos Aires', valor: 40, color: '#3B82F6' },
    { id: 'b2', etiqueta: 'Córdoba', valor: 25, color: '#EF4444' },
    { id: 'b3', etiqueta: 'Rosario', valor: 35, color: '#10B981' },
    { id: 'b4', etiqueta: 'Mendoza', valor: 20, color: '#F59E0B' },
  ],
  valorMaximo: 100,
  valoresCorrectos: {
    b1: 80,
    b2: 45,
    b3: 35,
    b4: 25,
  },
  esInteractivo: true,
  mostrarValores: true,
  mostrarEtiquetas: true,
  unidad: '%',
  feedback: {
    correcto: '¡Correcto! Los valores de población son aproximados.',
    incorrecto: 'Los valores no son correctos. Intenta de nuevo.',
  },
};

/**
 * Definición del preview para el registry
 */
export const BarGraphPreview: PreviewDefinition = {
  component: BarGraphPreviewComponent,
  exampleData,
  propsDocumentation,
};
