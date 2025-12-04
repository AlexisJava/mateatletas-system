'use client';

import React, { ReactElement, useState, useCallback, useRef } from 'react';
import { RotateCcw, Eraser, Palette, Minus, Plus } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para DrawShape
 */
interface DrawPoint {
  x: number;
  y: number;
}

interface DrawStroke {
  points: DrawPoint[];
  color: string;
  width: number;
}

interface DrawShapeExampleData {
  instruccion: string;
  coloresDisponibles?: string[];
  grosorMinimo?: number;
  grosorMaximo?: number;
  grosorInicial?: number;
  fondoColor?: string;
  mostrarCuadricula?: boolean;
  imagenFondo?: string;
}

/**
 * Preview interactivo del componente DrawShape
 * Canvas de dibujo libre para motricidad fina
 */
function DrawShapePreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as DrawShapeExampleData;
  const canvasRef = useRef<SVGSVGElement>(null);

  const colores = data.coloresDisponibles ?? [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#000000',
  ];
  const grosorMin = data.grosorMinimo ?? 2;
  const grosorMax = data.grosorMaximo ?? 20;
  const grosorInicial = data.grosorInicial ?? 6;

  const [strokes, setStrokes] = useState<DrawStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<DrawPoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colores[0]);
  const [strokeWidth, setStrokeWidth] = useState(grosorInicial);
  const [isEraser, setIsEraser] = useState(false);

  const getPointFromEvent = useCallback(
    (e: React.MouseEvent | React.TouchEvent): DrawPoint | null => {
      if (!canvasRef.current) return null;

      const svg = canvasRef.current;
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
      if (!interactive) return;
      const point = getPointFromEvent(e);
      if (!point) return;

      setIsDrawing(true);
      setCurrentStroke([point]);
    },
    [interactive, getPointFromEvent],
  );

  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || !interactive) return;
      const point = getPointFromEvent(e);
      if (!point) return;

      setCurrentStroke((prev) => [...prev, point]);
    },
    [isDrawing, interactive, getPointFromEvent],
  );

  const handleEnd = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length > 1) {
      const strokeColor = selectedColor ?? colores[0] ?? '#3B82F6';
      const newStroke: DrawStroke = {
        points: currentStroke,
        color: isEraser ? (data.fondoColor ?? '#1E293B') : strokeColor,
        width: isEraser ? strokeWidth * 3 : strokeWidth,
      };
      setStrokes((prev) => [...prev, newStroke]);
    }
    setCurrentStroke([]);
  }, [isDrawing, currentStroke, selectedColor, strokeWidth, isEraser, data.fondoColor]);

  const handleClear = useCallback(() => {
    if (!interactive) return;
    setStrokes([]);
    setCurrentStroke([]);
  }, [interactive]);

  const handleUndo = useCallback(() => {
    if (!interactive) return;
    setStrokes((prev) => prev.slice(0, -1));
  }, [interactive]);

  const handleWidthChange = useCallback(
    (delta: number) => {
      if (!interactive) return;
      setStrokeWidth((prev) => Math.min(grosorMax, Math.max(grosorMin, prev + delta)));
    },
    [interactive, grosorMin, grosorMax],
  );

  const pathFromPoints = (points: DrawPoint[]): string => {
    if (points.length < 2) return '';
    return `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`;
  };

  return (
    <div className="relative">
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
      </div>

      {/* Drawing Canvas */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <svg
          ref={canvasRef}
          viewBox="0 0 300 200"
          className={`
            w-full h-auto
            ${interactive ? (isEraser ? 'cursor-cell' : 'cursor-crosshair') : ''}
            touch-none
          `}
          style={{ backgroundColor: data.fondoColor ?? '#1E293B' }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        >
          {/* Grid */}
          {data.mostrarCuadricula && (
            <g opacity={0.2}>
              {Array.from({ length: 15 }, (_, i) => (
                <line
                  key={`v${i}`}
                  x1={i * 20}
                  y1={0}
                  x2={i * 20}
                  y2={200}
                  stroke="#64748b"
                  strokeWidth={0.5}
                />
              ))}
              {Array.from({ length: 10 }, (_, i) => (
                <line
                  key={`h${i}`}
                  x1={0}
                  y1={i * 20}
                  x2={300}
                  y2={i * 20}
                  stroke="#64748b"
                  strokeWidth={0.5}
                />
              ))}
            </g>
          )}

          {/* Saved strokes */}
          {strokes.map((stroke, index) => (
            <path
              key={index}
              d={pathFromPoints(stroke.points)}
              fill="none"
              stroke={stroke.color}
              strokeWidth={stroke.width}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Current stroke being drawn */}
          {currentStroke.length > 1 && (
            <path
              d={pathFromPoints(currentStroke)}
              fill="none"
              stroke={isEraser ? (data.fondoColor ?? '#1E293B') : (selectedColor ?? '#3B82F6')}
              strokeWidth={isEraser ? strokeWidth * 3 : strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>

        {/* Toolbar */}
        {interactive && (
          <div className="p-3 bg-slate-900 border-t border-slate-700">
            <div className="flex items-center justify-between gap-4">
              {/* Colors */}
              <div className="flex items-center gap-1">
                <Palette className="w-4 h-4 text-slate-500 mr-1" />
                {colores.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setSelectedColor(color);
                      setIsEraser(false);
                    }}
                    className={`
                      w-6 h-6 rounded-full transition-all
                      ${selectedColor === color && !isEraser ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}
                    `}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Stroke width */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleWidthChange(-2)}
                  disabled={strokeWidth <= grosorMin}
                  className="p-1 rounded hover:bg-slate-700 disabled:opacity-50 text-slate-400"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${((strokeWidth - grosorMin) / (grosorMax - grosorMin)) * 100}%`,
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleWidthChange(2)}
                  disabled={strokeWidth >= grosorMax}
                  className="p-1 rounded hover:bg-slate-700 disabled:opacity-50 text-slate-400"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Tools */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsEraser(!isEraser)}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${isEraser ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}
                  `}
                  title="Borrador"
                >
                  <Eraser className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={strokes.length === 0}
                  className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Deshacer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={strokes.length === 0}
                  className="px-3 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-3 flex justify-between text-xs text-slate-500">
        <span>Trazos: {strokes.length}</span>
        <span>Grosor: {strokeWidth}px</span>
        <span>{isEraser ? '🧹 Borrador activo' : `🎨 ${selectedColor}`}</span>
      </div>
    </div>
  );
}

/**
 * Documentación de props para DrawShape
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'coloresDisponibles',
    type: 'array',
    description: 'Array de colores disponibles para dibujar',
    required: false,
  },
  {
    name: 'grosorMinimo',
    type: 'number',
    description: 'Grosor mínimo del trazo en píxeles',
    required: false,
    defaultValue: '2',
  },
  {
    name: 'grosorMaximo',
    type: 'number',
    description: 'Grosor máximo del trazo en píxeles',
    required: false,
    defaultValue: '20',
  },
  {
    name: 'grosorInicial',
    type: 'number',
    description: 'Grosor inicial del trazo',
    required: false,
    defaultValue: '6',
  },
  {
    name: 'fondoColor',
    type: 'string',
    description: 'Color de fondo del canvas',
    required: false,
    defaultValue: '#1E293B',
  },
  {
    name: 'mostrarCuadricula',
    type: 'boolean',
    description: 'Si se muestra una cuadrícula de ayuda',
    required: false,
    defaultValue: 'false',
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: DrawShapeExampleData = {
  instruccion: 'Dibuja libremente en el canvas',
  coloresDisponibles: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
  grosorMinimo: 2,
  grosorMaximo: 20,
  grosorInicial: 6,
  fondoColor: '#1E293B',
  mostrarCuadricula: true,
};

/**
 * Definición del preview para el registry
 */
export const DrawShapePreview: PreviewDefinition = {
  component: DrawShapePreviewComponent,
  exampleData,
  propsDocumentation,
};
