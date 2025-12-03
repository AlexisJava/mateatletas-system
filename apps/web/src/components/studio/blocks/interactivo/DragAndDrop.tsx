'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useStudioTheme } from '../../theme';
import type { DragAndDropConfig, DragElement, DropZone } from './types';
import type { StudioBlockProps } from '../types';

// ============================================================================
// Types
// ============================================================================

interface ElementPlacement {
  elementId: string;
  zoneId: string;
}

interface DragAndDropState {
  placements: ElementPlacement[];
  draggedElement: string | null;
  verificado: boolean;
  intentos: number;
  mostrarRespuestas: boolean;
}

// ============================================================================
// Draggable Element Component
// ============================================================================

interface DraggableElementProps {
  element: DragElement;
  isDragging: boolean;
  isPlaced: boolean;
  isCorrect: boolean | null;
  disabled: boolean;
  onDragStart: (elementId: string) => void;
  onDragEnd: () => void;
  onTouchStart: (elementId: string, e: React.TouchEvent) => void;
}

const DraggableElement: React.FC<DraggableElementProps> = ({
  element,
  isDragging,
  isPlaced,
  isCorrect,
  disabled,
  onDragStart,
  onDragEnd,
  onTouchStart,
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', element.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(element.id);
  };

  const getStateClasses = () => {
    if (isCorrect === true) return 'ring-2 ring-green-500 bg-green-100';
    if (isCorrect === false) return 'ring-2 ring-red-500 bg-red-100';
    return 'bg-slate-700 hover:bg-slate-600';
  };

  if (isPlaced) return null;

  return (
    <div
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onTouchStart={(e) => onTouchStart(element.id, e)}
      className={`
        px-4 py-2 rounded-lg
        text-white font-medium
        shadow-md
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
        ${isDragging ? 'opacity-60 scale-105' : ''}
        ${getStateClasses()}
        transition-all duration-150
        select-none
      `}
      data-testid={`draggable-${element.id}`}
    >
      {element.tipo === 'texto' ? (
        <span>{element.contenido}</span>
      ) : (
        <img
          src={element.contenido}
          alt=""
          className="max-w-16 max-h-16 object-contain"
          draggable={false}
        />
      )}
    </div>
  );
};

// ============================================================================
// Drop Zone Component
// ============================================================================

interface DroppableZoneProps {
  zone: DropZone;
  placedElements: DragElement[];
  isOver: boolean;
  verificado: boolean;
  correctPlacements: Record<string, boolean>;
  disabled: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, zoneId: string) => void;
  onRemoveElement: (elementId: string) => void;
}

const DroppableZone: React.FC<DroppableZoneProps> = ({
  zone,
  placedElements,
  isOver,
  verificado,
  correctPlacements,
  disabled,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveElement,
}) => {
  return (
    <div
      role="region"
      aria-label={zone.etiqueta}
      data-testid={`dropzone-${zone.id}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, zone.id)}
      className={`
        min-h-28 p-4 rounded-xl
        border-2 border-dashed
        ${isOver ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 bg-slate-800/50'}
        transition-all duration-200
      `}
    >
      {/* Zone Label */}
      <h3 className="font-semibold text-slate-300 mb-3">{zone.etiqueta}</h3>

      {/* Placed elements */}
      <div className="flex flex-wrap gap-2 min-h-10">
        {placedElements.map((element) => {
          const isElementCorrect = correctPlacements[element.id];
          return (
            <div
              key={element.id}
              className={`
                px-3 py-1.5 rounded-lg
                text-white font-medium text-sm
                flex items-center gap-2
                ${verificado && isElementCorrect ? 'bg-green-600' : ''}
                ${verificado && !isElementCorrect ? 'bg-red-600' : ''}
                ${!verificado ? 'bg-slate-600' : ''}
                transition-colors duration-200
              `}
            >
              <span>
                {element.tipo === 'texto' ? (
                  element.contenido
                ) : (
                  <img src={element.contenido} alt="" className="max-w-8 max-h-8" />
                )}
              </span>
              {!disabled && !verificado && (
                <button
                  onClick={() => onRemoveElement(element.id)}
                  className="w-5 h-5 rounded-full bg-slate-500 hover:bg-red-500 text-white text-xs flex items-center justify-center transition-colors"
                  aria-label={`Quitar ${element.contenido}`}
                >
                  ×
                </button>
              )}
              {verificado && isElementCorrect && <span className="text-sm">✓</span>}
              {verificado && !isElementCorrect && <span className="text-sm">✗</span>}
            </div>
          );
        })}
        {placedElements.length === 0 && (
          <span className="text-slate-500 text-sm italic">Arrastra elementos aquí</span>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Correct Answers Display
// ============================================================================

interface CorrectAnswersDisplayProps {
  config: DragAndDropConfig;
}

const CorrectAnswersDisplay: React.FC<CorrectAnswersDisplayProps> = ({ config }) => {
  const answersByZone = useMemo(() => {
    const map: Record<string, DragElement[]> = {};
    config.zonas.forEach((zone) => {
      map[zone.id] = config.elementos.filter((el) => el.zonaCorrecta === zone.id);
    });
    return map;
  }, [config]);

  return (
    <div
      data-testid="correct-answers"
      className="bg-slate-800 p-4 rounded-xl mt-4 border border-slate-700"
    >
      <h4 className="font-semibold text-slate-300 mb-3">Respuestas correctas:</h4>
      <div className="space-y-2">
        {config.zonas.map((zone) => (
          <div key={zone.id} className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400">{zone.etiqueta}:</span>
            <div className="flex gap-2 flex-wrap">
              {(answersByZone[zone.id] ?? []).map((el) => (
                <span key={el.id} className="bg-slate-700 text-white px-2 py-1 rounded text-sm">
                  {el.contenido}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const DragAndDrop: React.FC<StudioBlockProps<DragAndDropConfig>> = ({
  config,
  modo,
  disabled = false,
  onComplete,
  onProgress,
}) => {
  const { classes } = useStudioTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<DragAndDropState>({
    placements: [],
    draggedElement: null,
    verificado: false,
    intentos: 0,
    mostrarRespuestas: false,
  });

  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');

  // Touch drag state
  const [touchDragElement, setTouchDragElement] = useState<string | null>(null);
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);

  // ============================================================================
  // Computed values
  // ============================================================================

  const placedElementIds = useMemo(
    () => new Set(state.placements.map((p) => p.elementId)),
    [state.placements],
  );

  const getElementsInZone = useCallback(
    (zoneId: string): DragElement[] => {
      const elementIds = state.placements
        .filter((p) => p.zoneId === zoneId)
        .map((p) => p.elementId);
      return config.elementos.filter((el) => elementIds.includes(el.id));
    },
    [state.placements, config.elementos],
  );

  const correctPlacements = useMemo(() => {
    const result: Record<string, boolean> = {};
    state.placements.forEach((placement) => {
      const element = config.elementos.find((el) => el.id === placement.elementId);
      if (element) {
        result[placement.elementId] = element.zonaCorrecta === placement.zoneId;
      }
    });
    return result;
  }, [state.placements, config.elementos]);

  const allCorrect = useMemo(() => {
    if (state.placements.length !== config.elementos.length) return false;
    return Object.values(correctPlacements).every((isCorrect) => isCorrect);
  }, [state.placements, config.elementos, correctPlacements]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleDragStart = useCallback((elementId: string) => {
    setState((prev) => ({ ...prev, draggedElement: elementId }));
  }, []);

  const handleDragEnd = useCallback(() => {
    setState((prev) => ({ ...prev, draggedElement: null }));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragLeave = useCallback(() => {
    setHoveredZone(null);
  }, []);

  const placeElement = useCallback(
    (elementId: string, zoneId: string) => {
      const zone = config.zonas.find((z) => z.id === zoneId);
      if (!zone) return;

      // Check if zone accepts multiple or already has an element
      const existingInZone = state.placements.filter((p) => p.zoneId === zoneId);
      if (!zone.aceptaMultiples && existingInZone.length > 0) {
        setAnnouncement('Esta zona solo acepta un elemento');
        return;
      }

      // Remove from previous placement if exists
      const newPlacements = state.placements.filter((p) => p.elementId !== elementId);
      newPlacements.push({ elementId, zoneId });

      setState((prev) => ({
        ...prev,
        placements: newPlacements,
        draggedElement: null,
      }));

      setHoveredZone(null);

      const element = config.elementos.find((el) => el.id === elementId);
      setAnnouncement(`${element?.contenido ?? 'Elemento'} colocado en ${zone.etiqueta}`);

      // Calculate progress as percentage of elements placed
      const progressPercent = Math.round((newPlacements.length / config.elementos.length) * 100);
      onProgress?.(progressPercent);
    },
    [config, state.placements, onProgress],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, zoneId: string) => {
      e.preventDefault();
      const elementId = e.dataTransfer.getData('text/plain');

      if (!elementId) return;

      placeElement(elementId, zoneId);
    },
    [placeElement],
  );

  // Touch handlers for mobile
  const handleTouchStart = useCallback((elementId: string, e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setTouchDragElement(elementId);
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
  }, []);

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchDragElement) return;
      e.preventDefault();
      const touch = e.touches[0];
      setTouchPosition({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchDragElement || !containerRef.current) return;

      const touch = e.changedTouches[0];
      const dropZones = containerRef.current.querySelectorAll('[data-testid^="dropzone-"]');

      dropZones.forEach((zone) => {
        const rect = zone.getBoundingClientRect();
        if (
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        ) {
          const zoneId = zone.getAttribute('data-testid')?.replace('dropzone-', '');
          if (zoneId) {
            placeElement(touchDragElement, zoneId);
          }
        }
      });

      setTouchDragElement(null);
      setTouchPosition(null);
    };

    if (touchDragElement) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchDragElement, placeElement]);

  const handleRemoveElement = useCallback(
    (elementId: string) => {
      const newPlacements = state.placements.filter((p) => p.elementId !== elementId);
      setState((prev) => ({
        ...prev,
        placements: newPlacements,
      }));

      const element = config.elementos.find((el) => el.id === elementId);
      setAnnouncement(`${element?.contenido ?? 'Elemento'} removido`);

      const progressPercent = Math.round((newPlacements.length / config.elementos.length) * 100);
      onProgress?.(progressPercent);
    },
    [config.elementos, onProgress, state.placements],
  );

  const handleVerificar = useCallback(() => {
    const newIntentos = state.intentos + 1;
    const shouldShowAnswers =
      config.mostrarRespuestasTras !== undefined && newIntentos >= config.mostrarRespuestasTras;

    setState((prev) => ({
      ...prev,
      verificado: true,
      intentos: newIntentos,
      mostrarRespuestas: shouldShowAnswers,
    }));

    if (allCorrect) {
      setAnnouncement(config.feedback.correcto);
      onComplete?.({
        completado: true,
        puntuacion: 100,
        respuesta: state.placements,
        intentos: newIntentos,
        tiempoMs: 0,
      });
    } else {
      setAnnouncement(config.feedback.incorrecto);
      if (shouldShowAnswers) {
        onComplete?.({
          completado: false,
          puntuacion: 0,
          respuesta: state.placements,
          intentos: newIntentos,
          tiempoMs: 0,
        });
      }
    }
  }, [state, config, allCorrect, onComplete]);

  const handleReintentar = useCallback(() => {
    setState((prev) => ({
      ...prev,
      verificado: false,
    }));
    setAnnouncement('Intenta de nuevo');
  }, []);

  // ============================================================================
  // Render helpers
  // ============================================================================

  const isInteractive = modo === 'estudiante' && !disabled;
  const canRetry = config.intentosMaximos === undefined || state.intentos < config.intentosMaximos;

  // ============================================================================
  // Render: Preview Mode
  // ============================================================================

  if (modo === 'preview') {
    return (
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <p className="text-slate-300 font-medium mb-3">{config.instruccion}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {config.elementos.map((element) => (
            <div
              key={element.id}
              className="bg-slate-700 text-white px-3 py-1.5 rounded-lg text-sm"
            >
              {element.tipo === 'texto' ? (
                element.contenido
              ) : (
                <img src={element.contenido} alt="" className="max-w-12 max-h-12" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {config.zonas.map((zone) => (
            <div
              key={zone.id}
              className="border-2 border-dashed border-slate-600 bg-slate-800/50 min-h-20 p-3 rounded-lg"
            >
              <h3 className="font-medium text-slate-400 text-sm">{zone.etiqueta}</h3>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render: Editor Mode
  // ============================================================================

  if (modo === 'editor') {
    return (
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div data-testid="editor-mode-indicator" className="mb-3">
          <h3 className="font-semibold text-slate-300 mb-1">Drag and Drop - Modo Editor</h3>
          <p className="text-slate-400 text-sm">{config.instruccion}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-700/50 p-3 rounded-lg">
            <span className="text-slate-400">Elementos:</span>
            <span className="text-slate-200 ml-2">{config.elementos.length}</span>
          </div>
          <div className="bg-slate-700/50 p-3 rounded-lg">
            <span className="text-slate-400">Zonas:</span>
            <span className="text-slate-200 ml-2">{config.zonas.length}</span>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render: Estudiante Mode
  // ============================================================================

  return (
    <div ref={containerRef} className="bg-slate-800 p-5 rounded-xl border border-slate-700">
      {/* Touch drag ghost */}
      {touchDragElement && touchPosition && (
        <div
          className="fixed pointer-events-none z-50 opacity-80"
          style={{
            left: touchPosition.x - 30,
            top: touchPosition.y - 20,
          }}
        >
          {(() => {
            const element = config.elementos.find((el) => el.id === touchDragElement);
            if (!element) return null;
            return (
              <div className="bg-slate-600 text-white px-3 py-1.5 rounded-lg shadow-xl">
                {element.contenido}
              </div>
            );
          })()}
        </div>
      )}

      {/* Accessibility announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {/* Instruction Header */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-200 mb-1">{config.instruccion}</h2>
        {config.intentosMaximos && (
          <p className="text-slate-400 text-sm">
            Intento {state.intentos} de {config.intentosMaximos}
          </p>
        )}
      </div>

      {/* Draggable elements */}
      <div className="bg-slate-900/50 rounded-lg p-4 mb-5" aria-label="Elementos para arrastrar">
        <p className="text-slate-400 text-sm mb-3">Arrastra estos elementos:</p>
        <div className="flex flex-wrap gap-3">
          {config.elementos.map((element) => (
            <DraggableElement
              key={element.id}
              element={element}
              isDragging={state.draggedElement === element.id || touchDragElement === element.id}
              isPlaced={placedElementIds.has(element.id)}
              isCorrect={state.verificado ? (correctPlacements[element.id] ?? null) : null}
              disabled={!isInteractive || state.verificado}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onTouchStart={handleTouchStart}
            />
          ))}
          {config.elementos.every((el) => placedElementIds.has(el.id)) && (
            <p className="text-slate-500 text-sm italic py-2">Todos los elementos colocados</p>
          )}
        </div>
      </div>

      {/* Drop zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {config.zonas.map((zone) => (
          <DroppableZone
            key={zone.id}
            zone={zone}
            placedElements={getElementsInZone(zone.id)}
            isOver={hoveredZone === zone.id}
            verificado={state.verificado}
            correctPlacements={correctPlacements}
            disabled={!isInteractive || state.verificado}
            onDragOver={(e) => {
              handleDragOver(e);
              setHoveredZone(zone.id);
            }}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onRemoveElement={handleRemoveElement}
          />
        ))}
      </div>

      {/* Feedback */}
      {state.verificado && (
        <div
          className={`
            p-4 rounded-lg mb-4 text-center
            ${allCorrect ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}
          `}
        >
          <p className={`font-medium ${allCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {allCorrect ? config.feedback.correcto : config.feedback.incorrecto}
          </p>
        </div>
      )}

      {/* Show correct answers after max attempts */}
      {state.mostrarRespuestas && <CorrectAnswersDisplay config={config} />}

      {/* Action Buttons */}
      <div className="flex justify-center gap-3">
        {!state.verificado ? (
          <button
            onClick={handleVerificar}
            disabled={!isInteractive || state.placements.length === 0}
            className={`
              px-6 py-2 rounded-lg font-medium
              bg-blue-600 hover:bg-blue-500
              text-white
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-150
            `}
          >
            Verificar
          </button>
        ) : (
          canRetry &&
          !allCorrect &&
          !state.mostrarRespuestas && (
            <button
              onClick={handleReintentar}
              disabled={!isInteractive}
              className={`
                px-6 py-2 rounded-lg font-medium
                bg-slate-600 hover:bg-slate-500
                text-white
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-150
              `}
            >
              Reintentar
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default DragAndDrop;
