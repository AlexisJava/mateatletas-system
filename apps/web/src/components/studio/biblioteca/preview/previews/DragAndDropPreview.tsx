'use client';

import React, { ReactElement, useState, useCallback } from 'react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para DragAndDrop
 */
interface DragElement {
  id: string;
  contenido: string;
  tipo: 'texto' | 'imagen';
  zonaCorrecta: string;
}

interface DropZone {
  id: string;
  etiqueta: string;
  aceptaMultiples: boolean;
}

interface DragAndDropExampleData {
  instruccion: string;
  elementos: DragElement[];
  zonas: DropZone[];
  feedback: {
    correcto: string;
    incorrecto: string;
  };
}

interface Placement {
  elementId: string;
  zoneId: string;
}

/**
 * Preview interactivo del componente DragAndDrop
 */
function DragAndDropPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as DragAndDropExampleData;

  const [placements, setPlacements] = useState<Placement[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const placedElementIds = new Set(placements.map((p) => p.elementId));

  const getElementsInZone = (zoneId: string): DragElement[] => {
    const elementIds = placements.filter((p) => p.zoneId === zoneId).map((p) => p.elementId);
    return data.elementos.filter((el) => elementIds.includes(el.id));
  };

  const isCorrect = (elementId: string): boolean => {
    const placement = placements.find((p) => p.elementId === elementId);
    const element = data.elementos.find((el) => el.id === elementId);
    return !!placement && !!element && placement.zoneId === element.zonaCorrecta;
  };

  const allCorrect =
    placements.length === data.elementos.length &&
    placements.every((p) => {
      const el = data.elementos.find((e) => e.id === p.elementId);
      return el && el.zonaCorrecta === p.zoneId;
    });

  const handleDragStart = useCallback((elementId: string) => {
    setDraggedId(elementId);
  }, []);

  const handleDrop = useCallback(
    (zoneId: string) => {
      if (!draggedId || !interactive || verified) return;

      const zone = data.zonas.find((z) => z.id === zoneId);
      if (!zone) return;

      const existingInZone = placements.filter((p) => p.zoneId === zoneId);
      if (!zone.aceptaMultiples && existingInZone.length > 0) return;

      setPlacements((prev) => {
        const without = prev.filter((p) => p.elementId !== draggedId);
        return [...without, { elementId: draggedId, zoneId }];
      });
      setDraggedId(null);
      setHoveredZone(null);
    },
    [draggedId, interactive, verified, data.zonas, placements],
  );

  const handleRemove = useCallback(
    (elementId: string) => {
      if (!interactive || verified) return;
      setPlacements((prev) => prev.filter((p) => p.elementId !== elementId));
    },
    [interactive, verified],
  );

  const handleVerify = useCallback(() => {
    setVerified(true);
  }, []);

  const handleReset = useCallback(() => {
    setPlacements([]);
    setVerified(false);
  }, []);

  return (
    <div className="relative">
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
      </div>

      {/* Draggable Elements Area */}
      <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
        <p className="text-slate-400 text-sm mb-3">Arrastra estos elementos:</p>
        <div className="flex flex-wrap gap-3 min-h-[50px]">
          {data.elementos
            .filter((el) => !placedElementIds.has(el.id))
            .map((element) => (
              <div
                key={element.id}
                draggable={interactive && !verified}
                onDragStart={() => handleDragStart(element.id)}
                className={`
                  bg-slate-700 hover:bg-slate-600
                  px-4 py-2 rounded-lg
                  text-white font-medium
                  shadow-md
                  ${interactive && !verified ? 'cursor-grab active:cursor-grabbing' : 'opacity-70'}
                  ${draggedId === element.id ? 'opacity-50' : ''}
                  transition-all duration-150
                  select-none
                `}
              >
                {element.contenido}
              </div>
            ))}
          {data.elementos.filter((el) => !placedElementIds.has(el.id)).length === 0 && (
            <span className="text-slate-500 text-sm italic">Todos los elementos colocados</span>
          )}
        </div>
      </div>

      {/* Drop Zones */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {data.zonas.map((zone) => {
          const elementsInZone = getElementsInZone(zone.id);
          const isOver = hoveredZone === zone.id;

          return (
            <div
              key={zone.id}
              onDragOver={(e) => {
                e.preventDefault();
                setHoveredZone(zone.id);
              }}
              onDragLeave={() => setHoveredZone(null)}
              onDrop={() => handleDrop(zone.id)}
              className={`
                min-h-[100px] p-4 rounded-xl
                border-2 border-dashed
                ${isOver ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 bg-slate-800/50'}
                transition-all duration-200
              `}
            >
              {/* Zone Label */}
              <h4 className="font-semibold text-slate-300 mb-2 text-sm">{zone.etiqueta}</h4>

              {/* Placed Elements */}
              <div className="flex flex-wrap gap-2 min-h-[35px]">
                {elementsInZone.map((element) => {
                  const correct = verified && isCorrect(element.id);
                  const incorrect = verified && !isCorrect(element.id);

                  return (
                    <div
                      key={element.id}
                      className={`
                        px-3 py-1.5 rounded-lg
                        text-white font-medium text-sm
                        flex items-center gap-2
                        ${correct ? 'bg-green-600' : ''}
                        ${incorrect ? 'bg-red-600' : ''}
                        ${!verified ? 'bg-slate-600' : ''}
                        transition-colors duration-200
                      `}
                    >
                      <span>{element.contenido}</span>
                      {!verified && interactive && (
                        <button
                          type="button"
                          onClick={() => handleRemove(element.id)}
                          className="w-5 h-5 rounded-full bg-slate-500 hover:bg-red-500 text-white text-xs flex items-center justify-center transition-colors"
                        >
                          ×
                        </button>
                      )}
                      {correct && <span className="text-sm">✓</span>}
                      {incorrect && <span className="text-sm">✗</span>}
                    </div>
                  );
                })}
                {elementsInZone.length === 0 && (
                  <span className="text-slate-500 text-sm italic">Arrastra elementos aquí</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feedback */}
      {verified && (
        <div
          className={`
            p-4 rounded-lg mb-4 text-center
            ${allCorrect ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}
          `}
        >
          <p className={`font-medium ${allCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {allCorrect ? data.feedback.correcto : data.feedback.incorrecto}
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
              disabled={placements.length === 0}
              className="px-6 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
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
 * Documentación de props para DragAndDrop
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'elementos',
    type: 'array',
    description: 'Lista de elementos arrastrables con id, contenido, tipo y zonaCorrecta',
    required: true,
  },
  {
    name: 'zonas',
    type: 'array',
    description: 'Lista de zonas de destino con id, etiqueta y aceptaMultiples',
    required: true,
  },
  {
    name: 'feedback',
    type: 'object',
    description: 'Mensajes de feedback con propiedades correcto e incorrecto',
    required: true,
  },
  {
    name: 'intentosMaximos',
    type: 'number',
    description: 'Número máximo de intentos permitidos',
    required: false,
  },
  {
    name: 'mostrarRespuestasTras',
    type: 'number',
    description: 'Número de intentos tras los cuales mostrar las respuestas correctas',
    required: false,
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: DragAndDropExampleData = {
  instruccion: 'Arrastra cada número a su categoría correcta',
  elementos: [
    { id: 'e1', contenido: '2', tipo: 'texto', zonaCorrecta: 'pares' },
    { id: 'e2', contenido: '3', tipo: 'texto', zonaCorrecta: 'impares' },
    { id: 'e3', contenido: '4', tipo: 'texto', zonaCorrecta: 'pares' },
    { id: 'e4', contenido: '7', tipo: 'texto', zonaCorrecta: 'impares' },
  ],
  zonas: [
    { id: 'pares', etiqueta: 'Números Pares', aceptaMultiples: true },
    { id: 'impares', etiqueta: 'Números Impares', aceptaMultiples: true },
  ],
  feedback: {
    correcto: '¡Excelente! Todos los números están en su lugar.',
    incorrecto: 'Algunos números no están en la categoría correcta.',
  },
};

/**
 * Definición del preview para el registry
 */
export const DragAndDropPreview: PreviewDefinition = {
  component: DragAndDropPreviewComponent,
  exampleData,
  propsDocumentation,
};
