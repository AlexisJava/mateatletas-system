'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import type { SortingBinsConfig, SortingElement, SortingCategory } from './types';
import type { StudioBlockProps } from '../types';

interface DraggableElementProps {
  elemento: SortingElement;
  isDraggable: boolean;
  onDragStart: (id: string) => void;
}

function DraggableElement({
  elemento,
  isDraggable,
  onDragStart,
}: DraggableElementProps): ReactElement {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', elemento.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(elemento.id);
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={isDraggable ? handleDragStart : undefined}
      className={`
        px-4 py-2 rounded-lg bg-slate-700 border border-slate-600
        text-white text-sm font-medium
        ${isDraggable ? 'cursor-grab hover:bg-slate-600 active:cursor-grabbing' : 'opacity-50 cursor-not-allowed'}
        transition-colors duration-150
      `}
    >
      {elemento.tipo === 'imagen' ? (
        <img src={elemento.contenido} alt="" className="max-w-[100px] h-auto" />
      ) : (
        elemento.contenido
      )}
    </div>
  );
}

interface CategoryBinProps {
  categoria: SortingCategory;
  elementos: SortingElement[];
  isInteractive: boolean;
  onDrop: (categoriaId: string) => void;
}

function CategoryBin({
  categoria,
  elementos,
  isInteractive,
  onDrop,
}: CategoryBinProps): ReactElement {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    if (!isInteractive) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!isInteractive) return;
    onDrop(categoria.id);
  };

  return (
    <div
      data-testid={`bin-${categoria.id}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        p-4 rounded-lg border-2 min-h-[120px] transition-all duration-200
        ${isDragOver ? 'border-blue-500 bg-blue-900/20' : 'border-slate-600 bg-slate-800/50'}
      `}
      style={{
        borderColor: isDragOver ? undefined : categoria.color,
      }}
    >
      <div
        className="text-sm font-bold mb-3 text-center"
        style={{ color: categoria.color || '#94a3b8' }}
      >
        {categoria.etiqueta}
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {elementos.map((el) => (
          <div key={el.id} className="px-3 py-1 rounded bg-slate-700 text-white text-sm">
            {el.tipo === 'imagen' ? (
              <img src={el.contenido} alt="" className="max-w-[60px] h-auto" />
            ) : (
              el.contenido
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SortingBins({
  id,
  config,
  modo,
  disabled = false,
  onComplete,
  onProgress,
}: StudioBlockProps<SortingBinsConfig>): ReactElement {
  // Map of elemento.id -> categoría.id (null = not placed)
  const [ubicaciones, setUbicaciones] = useState<Record<string, string | null>>(() => {
    const initial: Record<string, string | null> = {};
    config.elementos.forEach((el) => {
      initial[el.id] = null;
    });
    return initial;
  });
  const [arrastrando, setArrastrando] = useState<string | null>(null);
  const [verificado, setVerificado] = useState(false);
  const [intentos, setIntentos] = useState(0);

  const allPlaced = useMemo(() => {
    return Object.values(ubicaciones).every((loc) => loc !== null);
  }, [ubicaciones]);

  const isCorrect = useMemo(() => {
    return config.elementos.every((el) => ubicaciones[el.id] === el.categoriaCorrecta);
  }, [ubicaciones, config.elementos]);

  const maxAttemptsReached =
    config.intentosMaximos !== undefined && intentos >= config.intentosMaximos;

  const isInteractive = modo === 'estudiante' && !disabled && !verificado;

  // Elements not yet placed
  const elementosSinColocar = useMemo(() => {
    return config.elementos.filter((el) => ubicaciones[el.id] === null);
  }, [config.elementos, ubicaciones]);

  // Get elements in a specific category
  const getElementosEnCategoria = useCallback(
    (categoriaId: string) => {
      return config.elementos.filter((el) => ubicaciones[el.id] === categoriaId);
    },
    [config.elementos, ubicaciones],
  );

  const handleDragStart = useCallback((elementoId: string) => {
    setArrastrando(elementoId);
  }, []);

  const handleDrop = useCallback(
    (categoriaId: string) => {
      if (!arrastrando || !isInteractive) return;

      setUbicaciones((prev) => ({
        ...prev,
        [arrastrando]: categoriaId,
      }));
      setArrastrando(null);

      // Calculate progress
      const placedCount = Object.values(ubicaciones).filter((v) => v !== null).length + 1;
      const totalCount = config.elementos.length;
      onProgress?.((placedCount / totalCount) * 100);
    },
    [arrastrando, isInteractive, ubicaciones, config.elementos.length, onProgress],
  );

  const handleVerify = useCallback(() => {
    setVerificado(true);
    setIntentos((prev) => prev + 1);
    onComplete?.({
      completado: true,
      puntuacion: isCorrect ? 100 : 0,
      respuesta: ubicaciones,
      tiempoMs: 0,
      intentos: intentos + 1,
    });
  }, [isCorrect, ubicaciones, onComplete, intentos]);

  const handleRetry = useCallback(() => {
    setVerificado(false);
    setUbicaciones(() => {
      const reset: Record<string, string | null> = {};
      config.elementos.forEach((el) => {
        reset[el.id] = null;
      });
      return reset;
    });
  }, [config.elementos]);

  // Editor mode
  if (modo === 'editor') {
    return (
      <div className="p-4 border-2 border-dashed border-slate-600 rounded-lg">
        <div data-testid="editor-mode-indicator" className="text-sm text-slate-400 mb-2">
          Modo Editor - SortingBins
        </div>
        <h3 className="text-white font-medium">{config.instruccion}</h3>
        <div className="mt-2 text-slate-400 text-sm flex gap-4">
          <span>
            Elementos: <span className="text-white">{config.elementos.length}</span>
          </span>
          <span>
            Categorías: <span className="text-white">{config.categorias.length}</span>
          </span>
        </div>
      </div>
    );
  }

  const showVerifyButton = modo === 'estudiante' && allPlaced && !verificado;
  const showRetryButton = verificado && !isCorrect && !maxAttemptsReached;

  return (
    <div className="relative" data-testid={`sorting-bins-${id}`}>
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{config.instruccion}</h2>
        {config.descripcion && <p className="text-sm text-slate-400 mt-1">{config.descripcion}</p>}
      </div>

      {/* Elements to place */}
      {elementosSinColocar.length > 0 && (
        <div className="mb-6 p-4 bg-slate-800/30 rounded-lg">
          <div className="text-sm text-slate-400 mb-3">Elementos por clasificar:</div>
          <div className="flex flex-wrap gap-2">
            {elementosSinColocar.map((el) => (
              <DraggableElement
                key={el.id}
                elemento={el}
                isDraggable={isInteractive}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        </div>
      )}

      {/* Category bins */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {config.categorias.map((cat) => (
          <CategoryBin
            key={cat.id}
            categoria={cat}
            elementos={getElementosEnCategoria(cat.id)}
            isInteractive={isInteractive}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {/* Feedback */}
      {verificado && config.feedback && (
        <div
          className={`
            p-4 rounded-lg mt-4 text-center
            ${isCorrect ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}
          `}
        >
          <p className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? config.feedback.correcto : config.feedback.incorrecto}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {modo === 'estudiante' && (
        <div className="flex justify-center gap-3 mt-4">
          {showVerifyButton && (
            <button
              type="button"
              onClick={handleVerify}
              className="px-6 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors duration-150"
            >
              Verificar
            </button>
          )}
          {showRetryButton && (
            <button
              type="button"
              onClick={handleRetry}
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
