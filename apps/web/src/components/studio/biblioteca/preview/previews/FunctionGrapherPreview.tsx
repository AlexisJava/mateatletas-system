'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para FunctionGrapher
 */
interface FunctionDef {
  id: string;
  expresion: string;
  color: string;
  visible: boolean;
  nombre?: string;
}

interface FunctionGrapherExampleData {
  instruccion: string;
  funciones: FunctionDef[];
  rangoX: [number, number];
  rangoY: [number, number];
  mostrarEjes?: boolean;
  mostrarCuadricula?: boolean;
  permitirZoom?: boolean;
  permitirPan?: boolean;
  mostrarPuntos?: boolean;
}

/**
 * Evalúa una expresión matemática simple
 */
function evaluateExpression(expr: string, x: number): number | null {
  try {
    // Sanitize and prepare expression
    const sanitized = expr
      .replace(/\^/g, '**')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/abs/g, 'Math.abs')
      .replace(/log/g, 'Math.log')
      .replace(/exp/g, 'Math.exp')
      .replace(/pi/g, 'Math.PI')
      .replace(/e(?![a-z])/g, 'Math.E');

    // eslint-disable-next-line no-new-func
    const fn = new Function('x', `return ${sanitized}`);
    const result = fn(x);

    if (typeof result !== 'number' || !isFinite(result)) return null;
    return result;
  } catch {
    return null;
  }
}

/**
 * Preview interactivo del componente FunctionGrapher
 * Graficador de funciones matemáticas
 */
function FunctionGrapherPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as FunctionGrapherExampleData;

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [funciones, setFunciones] = useState(data.funciones);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; fn: string } | null>(
    null,
  );

  const width = 300;
  const height = 200;

  const rangoX: [number, number] = [
    data.rangoX[0] / zoom + offset.x,
    data.rangoX[1] / zoom + offset.x,
  ];
  const rangoY: [number, number] = [
    data.rangoY[0] / zoom + offset.y,
    data.rangoY[1] / zoom + offset.y,
  ];

  const scaleX = (x: number) => ((x - rangoX[0]) / (rangoX[1] - rangoX[0])) * width;
  const scaleY = (y: number) => height - ((y - rangoY[0]) / (rangoY[1] - rangoY[0])) * height;

  const xToValue = (px: number) => (px / width) * (rangoX[1] - rangoX[0]) + rangoX[0];

  // Generate points for each function
  const paths = useMemo(() => {
    return funciones
      .filter((f) => f.visible)
      .map((fn) => {
        const points: { x: number; y: number }[] = [];
        const step = (rangoX[1] - rangoX[0]) / 150;

        for (let x = rangoX[0]; x <= rangoX[1]; x += step) {
          const y = evaluateExpression(fn.expresion, x);
          if (y !== null && y >= rangoY[0] && y <= rangoY[1]) {
            points.push({ x: scaleX(x), y: scaleY(y) });
          }
        }

        if (points.length < 2) return null;

        const pathD = `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`;
        return { id: fn.id, path: pathD, color: fn.color, nombre: fn.nombre };
      })
      .filter(Boolean);
  }, [funciones, rangoX, rangoY]);

  const handleZoomIn = useCallback(() => {
    if (!interactive || !data.permitirZoom) return;
    setZoom((prev) => Math.min(4, prev * 1.5));
  }, [interactive, data.permitirZoom]);

  const handleZoomOut = useCallback(() => {
    if (!interactive || !data.permitirZoom) return;
    setZoom((prev) => Math.max(0.25, prev / 1.5));
  }, [interactive, data.permitirZoom]);

  const handleReset = useCallback(() => {
    if (!interactive) return;
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [interactive]);

  const toggleFunction = useCallback(
    (id: string) => {
      if (!interactive) return;
      setFunciones((prev) => prev.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f)));
    },
    [interactive],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!data.mostrarPuntos) return;

      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * width;
      const x = xToValue(px);

      // Find y value for first visible function
      const visibleFn = funciones.find((f) => f.visible);
      if (!visibleFn) {
        setHoveredPoint(null);
        return;
      }

      const y = evaluateExpression(visibleFn.expresion, x);
      if (y !== null) {
        setHoveredPoint({ x, y, fn: visibleFn.nombre ?? visibleFn.expresion });
      } else {
        setHoveredPoint(null);
      }
    },
    [funciones, data.mostrarPuntos],
  );

  // Grid lines
  const gridLinesX = useMemo(() => {
    const lines: number[] = [];
    const step = (rangoX[1] - rangoX[0]) / 10;
    for (let x = Math.ceil(rangoX[0] / step) * step; x <= rangoX[1]; x += step) {
      lines.push(x);
    }
    return lines;
  }, [rangoX]);

  const gridLinesY = useMemo(() => {
    const lines: number[] = [];
    const step = (rangoY[1] - rangoY[0]) / 8;
    for (let y = Math.ceil(rangoY[0] / step) * step; y <= rangoY[1]; y += step) {
      lines.push(y);
    }
    return lines;
  }, [rangoY]);

  return (
    <div className="relative">
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
      </div>

      {/* Graph Container */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto bg-slate-900"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Grid */}
          {data.mostrarCuadricula !== false && (
            <g opacity={0.2}>
              {gridLinesX.map((x) => (
                <line
                  key={`gx${x}`}
                  x1={scaleX(x)}
                  y1={0}
                  x2={scaleX(x)}
                  y2={height}
                  stroke="#64748b"
                  strokeWidth={0.5}
                />
              ))}
              {gridLinesY.map((y) => (
                <line
                  key={`gy${y}`}
                  x1={0}
                  y1={scaleY(y)}
                  x2={width}
                  y2={scaleY(y)}
                  stroke="#64748b"
                  strokeWidth={0.5}
                />
              ))}
            </g>
          )}

          {/* Axes */}
          {data.mostrarEjes !== false && (
            <g>
              {/* X axis */}
              {rangoY[0] <= 0 && rangoY[1] >= 0 && (
                <line
                  x1={0}
                  y1={scaleY(0)}
                  x2={width}
                  y2={scaleY(0)}
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                />
              )}
              {/* Y axis */}
              {rangoX[0] <= 0 && rangoX[1] >= 0 && (
                <line
                  x1={scaleX(0)}
                  y1={0}
                  x2={scaleX(0)}
                  y2={height}
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                />
              )}
            </g>
          )}

          {/* Axis labels */}
          <g fontSize="8" fill="#64748b">
            <text x={width - 10} y={scaleY(0) - 5}>
              x
            </text>
            <text x={scaleX(0) + 5} y={15}>
              y
            </text>
          </g>

          {/* Function paths */}
          {paths.map(
            (p) =>
              p && (
                <path
                  key={p.id}
                  d={p.path}
                  fill="none"
                  stroke={p.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              ),
          )}

          {/* Hover point */}
          {hoveredPoint && data.mostrarPuntos && (
            <g>
              <circle
                cx={scaleX(hoveredPoint.x)}
                cy={scaleY(hoveredPoint.y)}
                r={5}
                fill="#fff"
                stroke="#3B82F6"
                strokeWidth={2}
              />
              <rect
                x={scaleX(hoveredPoint.x) + 10}
                y={scaleY(hoveredPoint.y) - 25}
                width={80}
                height={22}
                rx={4}
                fill="#1e293b"
                stroke="#334155"
              />
              <text
                x={scaleX(hoveredPoint.x) + 15}
                y={scaleY(hoveredPoint.y) - 10}
                fill="#fff"
                fontSize="9"
              >
                ({hoveredPoint.x.toFixed(1)}, {hoveredPoint.y.toFixed(1)})
              </text>
            </g>
          )}
        </svg>

        {/* Function Legend */}
        <div className="p-3 bg-slate-800 border-t border-slate-700">
          <div className="flex flex-wrap gap-2">
            {funciones.map((fn) => (
              <button
                key={fn.id}
                type="button"
                onClick={() => toggleFunction(fn.id)}
                disabled={!interactive}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono
                  ${fn.visible ? 'bg-slate-700' : 'bg-slate-800 opacity-50'}
                  disabled:cursor-default transition-all
                `}
              >
                <div
                  className={`w-3 h-3 rounded-full ${fn.visible ? '' : 'opacity-30'}`}
                  style={{ backgroundColor: fn.color }}
                />
                <span className="text-white">{fn.nombre ?? `f(x) = ${fn.expresion}`}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        {interactive && (data.permitirZoom !== false || data.permitirPan) && (
          <div className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 border-t border-slate-700">
            {data.permitirZoom !== false && (
              <>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                  title="Alejar"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-400 w-16 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                  title="Acercar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors ml-2"
              title="Restablecer vista"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Documentación de props para FunctionGrapher
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'funciones',
    type: 'array',
    description: 'Lista de funciones con id, expresion, color, visible y nombre',
    required: true,
  },
  {
    name: 'rangoX',
    type: 'array',
    description: 'Rango del eje X [min, max]',
    required: true,
  },
  {
    name: 'rangoY',
    type: 'array',
    description: 'Rango del eje Y [min, max]',
    required: true,
  },
  {
    name: 'mostrarEjes',
    type: 'boolean',
    description: 'Si se muestran los ejes X e Y',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'mostrarCuadricula',
    type: 'boolean',
    description: 'Si se muestra la cuadrícula',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'permitirZoom',
    type: 'boolean',
    description: 'Si se permite hacer zoom',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'mostrarPuntos',
    type: 'boolean',
    description: 'Si se muestran los puntos al pasar el mouse',
    required: false,
    defaultValue: 'true',
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: FunctionGrapherExampleData = {
  instruccion: 'Observa las gráficas de las funciones',
  funciones: [
    { id: 'f1', expresion: 'x^2', color: '#3B82F6', visible: true, nombre: 'Parábola' },
    { id: 'f2', expresion: 'sin(x)', color: '#10B981', visible: true, nombre: 'Seno' },
    { id: 'f3', expresion: '0.5*x + 1', color: '#F59E0B', visible: true, nombre: 'Lineal' },
  ],
  rangoX: [-5, 5],
  rangoY: [-3, 5],
  mostrarEjes: true,
  mostrarCuadricula: true,
  permitirZoom: true,
  permitirPan: false,
  mostrarPuntos: true,
};

/**
 * Definición del preview para el registry
 */
export const FunctionGrapherPreview: PreviewDefinition = {
  component: FunctionGrapherPreviewComponent,
  exampleData,
  propsDocumentation,
};
