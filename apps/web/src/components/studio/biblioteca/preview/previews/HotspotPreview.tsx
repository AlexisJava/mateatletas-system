'use client';

import React, { ReactElement, useState, useCallback } from 'react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para Hotspot
 */
interface HotspotZona {
  id: string;
  x: number;
  y: number;
  ancho: number;
  alto: number;
  etiqueta: string;
  descripcion?: string;
}

interface HotspotExampleData {
  instruccion: string;
  imagenUrl: string;
  zonas: HotspotZona[];
  mostrarEtiquetas?: boolean;
  feedback?: {
    correcto: string;
    incorrecto: string;
  };
}

/**
 * Preview interactivo del componente Hotspot
 */
function HotspotPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as HotspotExampleData;

  const [zonasEncontradas, setZonasEncontradas] = useState<Set<string>>(new Set());
  const [ultimoClick, setUltimoClick] = useState<{
    x: number;
    y: number;
    correcto: boolean;
  } | null>(null);
  const [mostrarTodas, setMostrarTodas] = useState(data.mostrarEtiquetas ?? false);

  const todasEncontradas = zonasEncontradas.size === data.zonas.length;

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive || todasEncontradas) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Check if click is inside any zona
      const zonaClickeada = data.zonas.find((zona) => {
        return (
          x >= zona.x &&
          x <= zona.x + zona.ancho &&
          y >= zona.y &&
          y <= zona.y + zona.alto &&
          !zonasEncontradas.has(zona.id)
        );
      });

      if (zonaClickeada) {
        setZonasEncontradas((prev) => new Set([...prev, zonaClickeada.id]));
        setUltimoClick({ x, y, correcto: true });
      } else {
        setUltimoClick({ x, y, correcto: false });
      }

      // Clear click indicator after animation
      setTimeout(() => setUltimoClick(null), 800);
    },
    [interactive, todasEncontradas, data.zonas, zonasEncontradas],
  );

  const handleReset = useCallback(() => {
    setZonasEncontradas(new Set());
    setUltimoClick(null);
  }, []);

  const handleToggleLabels = useCallback(() => {
    setMostrarTodas((prev) => !prev);
  }, []);

  return (
    <div className="relative">
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
        <p className="text-sm text-slate-400 mt-1">
          Encontradas: {zonasEncontradas.size} / {data.zonas.length}
        </p>
      </div>

      {/* Image container with hotspots */}
      <div
        className="relative rounded-lg overflow-hidden cursor-crosshair bg-slate-800"
        onClick={handleImageClick}
      >
        {/* Placeholder image (gradient background simulating an image) */}
        <div
          className="w-full h-64 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 flex items-center justify-center"
          style={{
            backgroundImage: `url(${data.imagenUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <span className="text-slate-500 text-sm">Imagen: {data.imagenUrl}</span>
        </div>

        {/* Zonas */}
        {data.zonas.map((zona) => {
          const encontrada = zonasEncontradas.has(zona.id);
          const mostrar = mostrarTodas || encontrada;

          return (
            <div
              key={zona.id}
              className={`
                absolute border-2 rounded transition-all duration-300
                ${encontrada ? 'border-green-500 bg-green-500/20' : mostrar ? 'border-blue-500 bg-blue-500/10' : 'border-transparent'}
              `}
              style={{
                left: `${zona.x}%`,
                top: `${zona.y}%`,
                width: `${zona.ancho}%`,
                height: `${zona.alto}%`,
              }}
            >
              {mostrar && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span
                    className={`
                    px-2 py-0.5 rounded text-xs font-medium
                    ${encontrada ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}
                  `}
                  >
                    {zona.etiqueta}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Click indicator */}
        {ultimoClick && (
          <div
            className={`
              absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2
              rounded-full animate-ping
              ${ultimoClick.correcto ? 'bg-green-500' : 'bg-red-500'}
            `}
            style={{ left: `${ultimoClick.x}%`, top: `${ultimoClick.y}%` }}
          />
        )}
      </div>

      {/* Feedback */}
      {todasEncontradas && data.feedback && (
        <div className="p-4 rounded-lg mt-4 text-center bg-green-900/30 border border-green-700">
          <p className="font-medium text-green-400">{data.feedback.correcto}</p>
        </div>
      )}

      {/* Controls */}
      {interactive && (
        <div className="flex justify-center gap-3 mt-4">
          <button
            type="button"
            onClick={handleToggleLabels}
            className="px-4 py-2 rounded-lg font-medium bg-slate-700 hover:bg-slate-600 text-white transition-colors duration-150"
          >
            {mostrarTodas ? 'Ocultar etiquetas' : 'Mostrar etiquetas'}
          </button>
          {zonasEncontradas.size > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-lg font-medium bg-slate-600 hover:bg-slate-500 text-white transition-colors duration-150"
            >
              Reiniciar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Documentación de props para Hotspot
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'imagenUrl',
    type: 'string',
    description: 'URL de la imagen donde se definen los hotspots',
    required: true,
  },
  {
    name: 'zonas',
    type: 'array',
    description: 'Array de zonas interactivas con id, x, y, ancho, alto, etiqueta',
    required: true,
  },
  {
    name: 'mostrarEtiquetas',
    type: 'boolean',
    description: 'Si mostrar las etiquetas desde el inicio',
    required: false,
    defaultValue: 'false',
  },
  {
    name: 'feedback',
    type: 'object',
    description: 'Mensajes de feedback al completar',
    required: false,
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: HotspotExampleData = {
  instruccion: 'Identifica las partes de la célula',
  imagenUrl: '/images/celula.png',
  zonas: [
    {
      id: 'z1',
      x: 40,
      y: 35,
      ancho: 20,
      alto: 20,
      etiqueta: 'Núcleo',
      descripcion: 'Centro de control',
    },
    {
      id: 'z2',
      x: 15,
      y: 50,
      ancho: 15,
      alto: 15,
      etiqueta: 'Mitocondria',
      descripcion: 'Energía celular',
    },
    {
      id: 'z3',
      x: 65,
      y: 60,
      ancho: 18,
      alto: 12,
      etiqueta: 'Ribosoma',
      descripcion: 'Síntesis proteica',
    },
  ],
  mostrarEtiquetas: false,
  feedback: {
    correcto: '¡Excelente! Has identificado todas las partes correctamente.',
    incorrecto: 'Sigue buscando las partes de la célula.',
  },
};

/**
 * Definición del preview para el registry
 */
export const HotspotPreview: PreviewDefinition = {
  component: HotspotPreviewComponent,
  exampleData,
  propsDocumentation,
};
