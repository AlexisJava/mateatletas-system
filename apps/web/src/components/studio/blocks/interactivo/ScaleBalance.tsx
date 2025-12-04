'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import type { ScaleBalanceConfig, ScaleItem } from './types';
import type { StudioBlockProps } from '../types';

interface DraggableItemProps {
  item: ScaleItem;
  testIdPrefix: string;
  isDraggable: boolean;
  onDragStart: (id: string) => void;
  onClick?: () => void;
}

function DraggableItem({
  item,
  testIdPrefix,
  isDraggable,
  onDragStart,
  onClick,
}: DraggableItemProps): ReactElement {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(item.id);
  };

  return (
    <div
      data-testid={`${testIdPrefix}-${item.id}`}
      draggable={isDraggable}
      onDragStart={isDraggable ? handleDragStart : undefined}
      onClick={onClick}
      className={`
        px-3 py-2 rounded-lg text-sm font-medium
        ${item.color ? '' : 'bg-amber-600'}
        text-white shadow-md
        ${isDraggable ? 'cursor-grab hover:bg-amber-500 active:cursor-grabbing' : ''}
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
        transition-all duration-150
      `}
      style={item.color ? { backgroundColor: item.color } : undefined}
    >
      {item.etiqueta}
    </div>
  );
}

interface BalancePanProps {
  side: 'left' | 'right';
  items: ScaleItem[];
  isInteractive: boolean;
  onDrop: (side: 'left' | 'right') => void;
  onRemoveItem: (itemId: string) => void;
  addedItemIds: string[];
}

function BalancePan({
  side,
  items,
  isInteractive,
  onDrop,
  onRemoveItem,
  addedItemIds,
}: BalancePanProps): ReactElement {
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
    onDrop(side);
  };

  const testId = side === 'left' ? 'balance-left-pan' : 'balance-right-pan';
  const itemPrefix = side === 'left' ? 'left-item' : 'right-item';

  return (
    <div
      data-testid={testId}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-32 h-24 rounded-lg border-2 flex flex-wrap items-center justify-center gap-1 p-2
        transition-all duration-200
        ${isDragOver ? 'border-blue-500 bg-blue-900/20' : 'border-slate-500 bg-slate-800'}
      `}
    >
      {items.map((item) => (
        <DraggableItem
          key={item.id}
          item={item}
          testIdPrefix={itemPrefix}
          isDraggable={false}
          onDragStart={() => {}}
          onClick={
            addedItemIds.includes(item.id) && isInteractive
              ? () => onRemoveItem(item.id)
              : undefined
          }
        />
      ))}
    </div>
  );
}

export function ScaleBalance({
  id,
  config,
  modo,
  disabled = false,
  onComplete,
  onProgress,
}: StudioBlockProps<ScaleBalanceConfig>): ReactElement {
  // State for items on each side (initial + added)
  const [itemsIzquierdo, setItemsIzquierdo] = useState<ScaleItem[]>(config.ladoIzquierdo.items);
  const [itemsDerecho, setItemsDerecho] = useState<ScaleItem[]>(config.ladoDerecho.items);
  const [itemsDisponibles, setItemsDisponibles] = useState<ScaleItem[]>(config.itemsDisponibles);
  const [addedLeftIds, setAddedLeftIds] = useState<string[]>([]);
  const [addedRightIds, setAddedRightIds] = useState<string[]>([]);
  const [arrastrando, setArrastrando] = useState<string | null>(null);
  const [verificado, setVerificado] = useState(false);
  const [intentos, setIntentos] = useState(0);

  // Calculate total weights
  const pesoIzquierdo = useMemo(() => {
    return itemsIzquierdo.reduce((sum, item) => sum + item.peso, 0);
  }, [itemsIzquierdo]);

  const pesoDerecho = useMemo(() => {
    return itemsDerecho.reduce((sum, item) => sum + item.peso, 0);
  }, [itemsDerecho]);

  const isBalanced = pesoIzquierdo === pesoDerecho;

  const maxAttemptsReached =
    config.intentosMaximos !== undefined && intentos >= config.intentosMaximos;

  const isInteractive = modo === 'estudiante' && !disabled && !verificado;

  // Determine tilt direction
  const tiltClass = useMemo(() => {
    if (isBalanced) return 'balanced';
    return pesoIzquierdo > pesoDerecho ? 'tilt-left' : 'tilt-right';
  }, [isBalanced, pesoIzquierdo, pesoDerecho]);

  const handleDragStart = useCallback((itemId: string) => {
    setArrastrando(itemId);
  }, []);

  const handleDrop = useCallback(
    (side: 'left' | 'right') => {
      if (!arrastrando || !isInteractive) return;

      const item = itemsDisponibles.find((i) => i.id === arrastrando);
      if (!item) return;

      // Remove from available
      setItemsDisponibles((prev) => prev.filter((i) => i.id !== arrastrando));

      // Add to appropriate side
      if (side === 'left') {
        setItemsIzquierdo((prev) => [...prev, item]);
        setAddedLeftIds((prev) => [...prev, item.id]);
      } else {
        setItemsDerecho((prev) => [...prev, item]);
        setAddedRightIds((prev) => [...prev, item.id]);
      }

      setArrastrando(null);
      onProgress?.(50);
    },
    [arrastrando, isInteractive, itemsDisponibles, onProgress],
  );

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      if (!isInteractive) return;

      // Check left side
      const leftItem = itemsIzquierdo.find((i) => i.id === itemId);
      if (leftItem && addedLeftIds.includes(itemId)) {
        setItemsIzquierdo((prev) => prev.filter((i) => i.id !== itemId));
        setAddedLeftIds((prev) => prev.filter((id) => id !== itemId));
        setItemsDisponibles((prev) => [...prev, leftItem]);
        return;
      }

      // Check right side
      const rightItem = itemsDerecho.find((i) => i.id === itemId);
      if (rightItem && addedRightIds.includes(itemId)) {
        setItemsDerecho((prev) => prev.filter((i) => i.id !== itemId));
        setAddedRightIds((prev) => prev.filter((id) => id !== itemId));
        setItemsDisponibles((prev) => [...prev, rightItem]);
      }
    },
    [isInteractive, itemsIzquierdo, itemsDerecho, addedLeftIds, addedRightIds],
  );

  const handleVerify = useCallback(() => {
    setVerificado(true);
    setIntentos((prev) => prev + 1);
    onComplete?.({
      completado: true,
      puntuacion: isBalanced ? 100 : 0,
      respuesta: {
        izquierdo: itemsIzquierdo.map((i) => i.id),
        derecho: itemsDerecho.map((i) => i.id),
      },
      tiempoMs: 0,
      intentos: intentos + 1,
    });
  }, [isBalanced, itemsIzquierdo, itemsDerecho, onComplete, intentos]);

  const handleRetry = useCallback(() => {
    setVerificado(false);
    // Reset to initial state
    setItemsIzquierdo(config.ladoIzquierdo.items);
    setItemsDerecho(config.ladoDerecho.items);
    setItemsDisponibles(config.itemsDisponibles);
    setAddedLeftIds([]);
    setAddedRightIds([]);
  }, [config]);

  // Editor mode
  if (modo === 'editor') {
    return (
      <div className="p-4 border-2 border-dashed border-slate-600 rounded-lg">
        <div data-testid="editor-mode-indicator" className="text-sm text-slate-400 mb-2">
          Modo Editor - ScaleBalance
        </div>
        <h3 className="text-white font-medium">{config.instruccion}</h3>
        <div className="mt-2 text-slate-400 text-sm">
          <span>Izquierdo: {config.ladoIzquierdo.items.length} items</span>
          <span className="mx-2">|</span>
          <span>Derecho: {config.ladoDerecho.items.length} items</span>
          <span className="mx-2">|</span>
          <span>Disponibles: {config.itemsDisponibles.length}</span>
        </div>
      </div>
    );
  }

  const showVerifyButton = modo === 'estudiante' && !verificado;
  const showRetryButton = verificado && !isBalanced && !maxAttemptsReached;

  return (
    <div className="relative" data-testid={`scale-balance-${id}`}>
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{config.instruccion}</h2>
        {config.descripcion && <p className="text-sm text-slate-400 mt-1">{config.descripcion}</p>}
      </div>

      {/* Balance Scale Visual */}
      <div className="flex flex-col items-center mb-6">
        {/* Beam and fulcrum */}
        <div className="relative w-80 h-40">
          {/* Fulcrum (triangle base) */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-r-[20px] border-b-[30px] border-l-transparent border-r-transparent border-b-slate-500" />

          {/* Beam */}
          <div
            data-testid="balance-beam"
            className={`
              absolute top-8 left-0 right-0 h-2 bg-slate-500 rounded-full
              transition-transform duration-500 origin-center
              ${tiltClass}
            `}
            style={{
              transform:
                tiltClass === 'tilt-left'
                  ? 'rotate(8deg)'
                  : tiltClass === 'tilt-right'
                    ? 'rotate(-8deg)'
                    : 'rotate(0deg)',
            }}
          >
            {/* Left pan connection */}
            <div className="absolute left-4 top-full w-0.5 h-12 bg-slate-500" />
            {/* Right pan connection */}
            <div className="absolute right-4 top-full w-0.5 h-12 bg-slate-500" />
          </div>

          {/* Pans positioned relative to beam */}
          <div
            className="absolute left-0 top-24 flex flex-col items-center"
            style={{
              transform:
                tiltClass === 'tilt-left'
                  ? 'translateY(8px)'
                  : tiltClass === 'tilt-right'
                    ? 'translateY(-8px)'
                    : 'translateY(0)',
              transition: 'transform 0.5s',
            }}
          >
            <BalancePan
              side="left"
              items={itemsIzquierdo}
              isInteractive={isInteractive}
              onDrop={handleDrop}
              onRemoveItem={handleRemoveItem}
              addedItemIds={addedLeftIds}
            />
            {config.mostrarPesos && (
              <div data-testid="weight-left" className="mt-2 text-white font-bold">
                {pesoIzquierdo}
              </div>
            )}
          </div>

          <div
            className="absolute right-0 top-24 flex flex-col items-center"
            style={{
              transform:
                tiltClass === 'tilt-left'
                  ? 'translateY(-8px)'
                  : tiltClass === 'tilt-right'
                    ? 'translateY(8px)'
                    : 'translateY(0)',
              transition: 'transform 0.5s',
            }}
          >
            <BalancePan
              side="right"
              items={itemsDerecho}
              isInteractive={isInteractive}
              onDrop={handleDrop}
              onRemoveItem={handleRemoveItem}
              addedItemIds={addedRightIds}
            />
            {config.mostrarPesos && (
              <div data-testid="weight-right" className="mt-2 text-white font-bold">
                {pesoDerecho}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available items */}
      {itemsDisponibles.length > 0 && (
        <div className="mb-6 p-4 bg-slate-800/30 rounded-lg">
          <div className="text-sm text-slate-400 mb-3">Items disponibles:</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {itemsDisponibles.map((item) => (
              <DraggableItem
                key={item.id}
                item={item}
                testIdPrefix="available-item"
                isDraggable={isInteractive}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        </div>
      )}

      {/* Feedback */}
      {verificado && config.feedback && (
        <div
          className={`
            p-4 rounded-lg mt-4 text-center
            ${isBalanced ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}
          `}
        >
          <p className={`font-medium ${isBalanced ? 'text-green-400' : 'text-red-400'}`}>
            {isBalanced ? config.feedback.correcto : config.feedback.incorrecto}
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
