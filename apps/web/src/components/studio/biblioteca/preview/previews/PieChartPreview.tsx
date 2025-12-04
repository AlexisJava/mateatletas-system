'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para PieChart
 */
interface PieChartDato {
  id: string;
  etiqueta: string;
  valor: number;
  color: string;
}

interface PieChartExampleData {
  instruccion: string;
  datos: PieChartDato[];
  valoresCorrectos?: Record<string, number>;
  esInteractivo?: boolean;
  mostrarPorcentajes?: boolean;
  mostrarLeyenda?: boolean;
  feedback?: {
    correcto: string;
    incorrecto: string;
  };
}

/**
 * Genera el path SVG para un segmento de pie
 */
function generatePieSlice(
  startAngle: number,
  endAngle: number,
  radius: number,
  cx: number,
  cy: number,
): string {
  const startRad = (startAngle - 90) * (Math.PI / 180);
  const endRad = (endAngle - 90) * (Math.PI / 180);

  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

/**
 * Preview interactivo del componente PieChart
 */
function PieChartPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as PieChartExampleData;

  const [valores, setValores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    data.datos.forEach((d) => {
      initial[d.id] = d.valor;
    });
    return initial;
  });
  const [verified, setVerified] = useState(false);
  const [selectedSlice, setSelectedSlice] = useState<string | null>(null);

  const total = useMemo(() => {
    return Object.values(valores).reduce((sum, v) => sum + v, 0);
  }, [valores]);

  const isCorrect = useMemo(() => {
    if (!data.valoresCorrectos) return true;
    return Object.entries(data.valoresCorrectos).every(([id, correctVal]) => {
      const currentVal = valores[id] ?? 0;
      return Math.abs(currentVal - correctVal) <= 2; // Tolerancia de 2%
    });
  }, [valores, data.valoresCorrectos]);

  const handleValueChange = useCallback(
    (id: string, newValue: number) => {
      if (!interactive || verified || !data.esInteractivo) return;
      setValores((prev) => ({
        ...prev,
        [id]: Math.max(0, Math.min(100, newValue)),
      }));
    },
    [interactive, verified, data.esInteractivo],
  );

  const handleVerify = useCallback(() => {
    setVerified(true);
  }, []);

  const handleReset = useCallback(() => {
    setVerified(false);
    const initial: Record<string, number> = {};
    data.datos.forEach((d) => {
      initial[d.id] = d.valor;
    });
    setValores(initial);
  }, [data.datos]);

  // Calculate pie slices
  const slices = useMemo(() => {
    let currentAngle = 0;
    return data.datos.map((d) => {
      const valor = valores[d.id] ?? 0;
      const percentage = total > 0 ? (valor / total) * 100 : 0;
      const angle = (percentage / 100) * 360;
      const slice = {
        ...d,
        valor,
        percentage,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
      };
      currentAngle += angle;
      return slice;
    });
  }, [data.datos, valores, total]);

  const cx = 100;
  const cy = 100;
  const radius = 80;

  return (
    <div className="relative">
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Pie Chart SVG */}
        <div className="flex-1 flex justify-center">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {slices.map((slice) => (
              <path
                key={slice.id}
                d={generatePieSlice(slice.startAngle, slice.endAngle, radius, cx, cy)}
                fill={slice.color}
                stroke="#1e293b"
                strokeWidth="2"
                className={`transition-opacity duration-200 ${selectedSlice && selectedSlice !== slice.id ? 'opacity-50' : ''}`}
                onMouseEnter={() => setSelectedSlice(slice.id)}
                onMouseLeave={() => setSelectedSlice(null)}
              />
            ))}
            {/* Center circle for donut effect */}
            <circle cx={cx} cy={cy} r={30} fill="#0f172a" />
            {/* Total in center */}
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-white text-sm font-bold"
            >
              {total}%
            </text>
          </svg>
        </div>

        {/* Legend and controls */}
        <div className="flex-1 space-y-3">
          {slices.map((slice) => (
            <div
              key={slice.id}
              className={`
                p-2 rounded-lg transition-colors
                ${selectedSlice === slice.id ? 'bg-slate-700' : 'bg-slate-800'}
              `}
              onMouseEnter={() => setSelectedSlice(slice.id)}
              onMouseLeave={() => setSelectedSlice(null)}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }} />
                <span className="text-white text-sm font-medium">{slice.etiqueta}</span>
                {data.mostrarPorcentajes && (
                  <span className="text-slate-400 text-xs ml-auto">
                    {slice.percentage.toFixed(1)}%
                  </span>
                )}
              </div>
              {data.esInteractivo && interactive && !verified && (
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={slice.valor}
                  onChange={(e) => handleValueChange(slice.id, Number(e.target.value))}
                  className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {verified && data.feedback && (
        <div
          className={`
            p-4 rounded-lg mt-4 text-center
            ${isCorrect ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}
          `}
        >
          <p className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? data.feedback.correcto : data.feedback.incorrecto}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {interactive && data.esInteractivo && data.valoresCorrectos && (
        <div className="flex justify-center gap-3 mt-4">
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
 * Documentación de props para PieChart
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'datos',
    type: 'array',
    description: 'Array de datos con id, etiqueta, valor y color',
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
    name: 'mostrarPorcentajes',
    type: 'boolean',
    description: 'Mostrar porcentajes en la leyenda',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'mostrarLeyenda',
    type: 'boolean',
    description: 'Mostrar la leyenda lateral',
    required: false,
    defaultValue: 'true',
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
const exampleData: PieChartExampleData = {
  instruccion: 'Ajusta el gráfico para mostrar la composición del aire',
  datos: [
    { id: 'd1', etiqueta: 'Nitrógeno', valor: 50, color: '#3B82F6' },
    { id: 'd2', etiqueta: 'Oxígeno', valor: 30, color: '#EF4444' },
    { id: 'd3', etiqueta: 'Otros', valor: 20, color: '#10B981' },
  ],
  valoresCorrectos: {
    d1: 78,
    d2: 21,
    d3: 1,
  },
  esInteractivo: true,
  mostrarPorcentajes: true,
  mostrarLeyenda: true,
  feedback: {
    correcto: '¡Correcto! Esa es la composición del aire.',
    incorrecto: 'Los porcentajes no son correctos. El nitrógeno es ~78%, oxígeno ~21%.',
  },
};

/**
 * Definición del preview para el registry
 */
export const PieChartPreview: PreviewDefinition = {
  component: PieChartPreviewComponent,
  exampleData,
  propsDocumentation,
};
