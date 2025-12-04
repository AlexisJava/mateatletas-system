'use client';

import React, { ReactElement, useState, useCallback, useRef } from 'react';
import { RotateCcw, Check, X } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para TracePath
 */
interface PathPoint {
  x: number;
  y: number;
}

interface TracePathExampleData {
  instruccion: string;
  pathData: string; // SVG path data
  puntoInicio: PathPoint;
  puntoFin: PathPoint;
  tolerancia?: number; // distancia máxima permitida del path
  colorPath?: string;
  colorTrazo?: string;
  grosorPath?: number;
  grosorTrazo?: number;
  mostrarGuia?: boolean;
  feedback?: {
    correcto: string;
    incorrecto: string;
  };
}

/**
 * Preview interactivo del componente TracePath
 * Permite trazar sobre un path SVG con touch/mouse
 */
function TracePathPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as TracePathExampleData;
  const svgRef = useRef<SVGSVGElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [userPath, setUserPath] = useState<PathPoint[]>([]);
  const [verified, setVerified] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const tolerancia = data.tolerancia ?? 30;
  const colorPath = data.colorPath ?? '#3B82F6';
  const colorTrazo = data.colorTrazo ?? '#10B981';
  const grosorPath = data.grosorPath ?? 8;
  const grosorTrazo = data.grosorTrazo ?? 6;

  const getPointFromEvent = useCallback(
    (e: React.MouseEvent | React.TouchEvent): PathPoint | null => {
      if (!svgRef.current) return null;

      const svg = svgRef.current;
      const rect = svg.getBoundingClientRect();

      let clientX: number, clientY: number;

      if ('touches' in e) {
        const touch = e.touches[0];
        if (!touch) return null;
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = ((clientX - rect.left) / rect.width) * 300;
      const y = ((clientY - rect.top) / rect.height) * 200;

      return { x, y };
    },
    [],
  );

  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!interactive || verified) return;
      const point = getPointFromEvent(e);
      if (!point) return;

      // Check if starting near the start point
      const distToStart = Math.hypot(point.x - data.puntoInicio.x, point.y - data.puntoInicio.y);
      if (distToStart < tolerancia) {
        setIsDrawing(true);
        setUserPath([point]);
      }
    },
    [interactive, verified, getPointFromEvent, data.puntoInicio, tolerancia],
  );

  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || !interactive || verified) return;
      const point = getPointFromEvent(e);
      if (!point) return;

      setUserPath((prev) => [...prev, point]);
    },
    [isDrawing, interactive, verified, getPointFromEvent],
  );

  const handleEnd = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
  }, [isDrawing]);

  const handleVerify = useCallback(() => {
    if (userPath.length < 10) return;

    // Check if path ends near the end point
    const lastPoint = userPath[userPath.length - 1];
    if (!lastPoint) return;
    const distToEnd = Math.hypot(lastPoint.x - data.puntoFin.x, lastPoint.y - data.puntoFin.y);

    // Simple scoring based on end point proximity and path length
    const endScore = Math.max(0, 100 - (distToEnd / tolerancia) * 50);
    const lengthScore = Math.min(100, (userPath.length / 50) * 100);
    const finalScore = Math.round((endScore + lengthScore) / 2);

    setScore(finalScore);
    setVerified(true);
  }, [userPath, data.puntoFin, tolerancia]);

  const handleReset = useCallback(() => {
    setUserPath([]);
    setVerified(false);
    setScore(null);
  }, []);

  const userPathD =
    userPath.length > 1 ? `M ${userPath.map((p) => `${p.x},${p.y}`).join(' L ')}` : '';

  const isCorrect = score !== null && score >= 70;

  return (
    <div className="relative">
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
        <p className="text-sm text-slate-400 mt-1">
          {verified
            ? isCorrect
              ? '¡Buen trazo!'
              : 'Intenta seguir el camino más de cerca'
            : 'Comienza desde el punto verde y sigue el camino hasta el punto rojo'}
        </p>
      </div>

      {/* SVG Canvas */}
      <div className="bg-slate-800 rounded-xl p-4">
        <svg
          ref={svgRef}
          viewBox="0 0 300 200"
          className={`
            w-full h-auto bg-slate-900 rounded-lg
            ${interactive && !verified ? 'cursor-crosshair' : ''}
            touch-none
          `}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        >
          {/* Guide path */}
          {data.mostrarGuia !== false && (
            <path
              d={data.pathData}
              fill="none"
              stroke={colorPath}
              strokeWidth={grosorPath}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="10,5"
              opacity={0.4}
            />
          )}

          {/* Main path to trace */}
          <path
            d={data.pathData}
            fill="none"
            stroke={colorPath}
            strokeWidth={grosorPath}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={verified ? 0.3 : 0.8}
          />

          {/* User's drawn path */}
          {userPath.length > 1 && (
            <path
              d={userPathD}
              fill="none"
              stroke={verified ? (isCorrect ? '#10B981' : '#EF4444') : colorTrazo}
              strokeWidth={grosorTrazo}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Start point */}
          <circle
            cx={data.puntoInicio.x}
            cy={data.puntoInicio.y}
            r={12}
            fill="#10B981"
            stroke="#fff"
            strokeWidth={2}
          />
          <text
            x={data.puntoInicio.x}
            y={data.puntoInicio.y + 4}
            textAnchor="middle"
            fill="#fff"
            fontSize="10"
            fontWeight="bold"
          >
            A
          </text>

          {/* End point */}
          <circle
            cx={data.puntoFin.x}
            cy={data.puntoFin.y}
            r={12}
            fill="#EF4444"
            stroke="#fff"
            strokeWidth={2}
          />
          <text
            x={data.puntoFin.x}
            y={data.puntoFin.y + 4}
            textAnchor="middle"
            fill="#fff"
            fontSize="10"
            fontWeight="bold"
          >
            B
          </text>
        </svg>

        {/* Score display */}
        {verified && score !== null && (
          <div
            className={`
            mt-4 p-3 rounded-lg text-center
            ${isCorrect ? 'bg-green-900/30 border border-green-600' : 'bg-red-900/30 border border-red-600'}
          `}
          >
            <div className="flex items-center justify-center gap-2">
              {isCorrect ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <X className="w-5 h-5 text-red-400" />
              )}
              <span className={`font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                Precisión: {score}%
              </span>
            </div>
            <p className={`text-sm mt-1 ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
              {isCorrect
                ? (data.feedback?.correcto ?? '¡Excelente trazo!')
                : (data.feedback?.incorrecto ?? 'Intenta seguir el camino más de cerca')}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {interactive && (
        <div className="flex justify-center gap-3 mt-4">
          {!verified ? (
            <>
              <button
                type="button"
                onClick={handleReset}
                disabled={userPath.length === 0}
                className="px-4 py-2 rounded-lg font-medium bg-slate-600 hover:bg-slate-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RotateCcw className="inline-block w-4 h-4 mr-2" />
                Borrar
              </button>
              <button
                type="button"
                onClick={handleVerify}
                disabled={userPath.length < 10}
                className="px-6 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                Verificar
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 rounded-lg font-medium bg-slate-600 hover:bg-slate-500 text-white transition-colors"
            >
              <RotateCcw className="inline-block w-4 h-4 mr-2" />
              Reintentar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Documentación de props para TracePath
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'pathData',
    type: 'string',
    description: 'Datos del path SVG a trazar',
    required: true,
  },
  {
    name: 'puntoInicio',
    type: 'object',
    description: 'Coordenadas del punto de inicio { x, y }',
    required: true,
  },
  {
    name: 'puntoFin',
    type: 'object',
    description: 'Coordenadas del punto final { x, y }',
    required: true,
  },
  {
    name: 'tolerancia',
    type: 'number',
    description: 'Distancia máxima permitida del path (en px)',
    required: false,
    defaultValue: '30',
  },
  {
    name: 'colorPath',
    type: 'string',
    description: 'Color del path guía',
    required: false,
    defaultValue: '#3B82F6',
  },
  {
    name: 'colorTrazo',
    type: 'string',
    description: 'Color del trazo del usuario',
    required: false,
    defaultValue: '#10B981',
  },
  {
    name: 'mostrarGuia',
    type: 'boolean',
    description: 'Si se muestra el path guía punteado',
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
 * Datos de ejemplo para el preview - Trazar número 2
 */
const exampleData: TracePathExampleData = {
  instruccion: 'Traza el número 2 siguiendo el camino',
  pathData: 'M 80,60 Q 130,30 150,60 Q 170,90 130,120 L 80,160 L 170,160',
  puntoInicio: { x: 80, y: 60 },
  puntoFin: { x: 170, y: 160 },
  tolerancia: 35,
  colorPath: '#3B82F6',
  colorTrazo: '#10B981',
  grosorPath: 8,
  grosorTrazo: 6,
  mostrarGuia: true,
  feedback: {
    correcto: '¡Muy bien! Has trazado el número correctamente.',
    incorrecto: 'Intenta seguir el camino más de cerca.',
  },
};

/**
 * Definición del preview para el registry
 */
export const TracePathPreview: PreviewDefinition = {
  component: TracePathPreviewComponent,
  exampleData,
  propsDocumentation,
};
