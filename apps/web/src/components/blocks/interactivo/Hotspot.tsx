'use client';

import React, { ReactElement, useState, useCallback, useMemo } from 'react';
import type { HotspotConfig, HotspotZona } from './types';
import type { StudioBlockProps } from '../types';

interface ZoneProps {
  zona: HotspotZona;
  isSelected: boolean;
  isHovered: boolean;
  isInteractive: boolean;
  showLabel: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function HotspotZone({
  zona,
  isSelected,
  isHovered,
  isInteractive,
  showLabel,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: ZoneProps): ReactElement {
  const isCircle = zona.forma === 'circulo';

  const baseClasses = `
    absolute border-2 transition-all duration-200
    ${isCircle ? 'rounded-full' : 'rounded'}
    ${isSelected ? 'selected border-blue-500 bg-blue-500/30' : 'border-transparent hover:border-blue-400/50'}
    ${isInteractive ? 'cursor-pointer' : 'cursor-default'}
  `;

  return (
    <div
      data-testid={`zona-${zona.id}`}
      className={baseClasses}
      style={{
        left: `${zona.x}%`,
        top: `${zona.y}%`,
        width: `${zona.ancho}%`,
        height: `${zona.alto}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={isInteractive ? onClick : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="button"
      tabIndex={isInteractive ? 0 : -1}
      aria-label={zona.label}
      onKeyDown={(e) => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Tooltip */}
      {(isHovered || showLabel) && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10">
          <div className="bg-slate-800 text-white px-3 py-2 rounded shadow-lg whitespace-nowrap">
            <p className="font-medium text-sm">{zona.label}</p>
            {zona.descripcion && <p className="text-xs text-slate-300 mt-1">{zona.descripcion}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export function Hotspot({
  id,
  config,
  modo,
  disabled = false,
  onComplete,
  onProgress,
}: StudioBlockProps<HotspotConfig>): ReactElement {
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState<string[]>([]);
  const [zonaHover, setZonaHover] = useState<string | null>(null);
  const [verificado, setVerificado] = useState(false);
  const [intentos, setIntentos] = useState(0);

  const hasCorrectZones =
    config.zonasCorrectasIds !== undefined && config.zonasCorrectasIds.length > 0;

  const isCorrect = useMemo(() => {
    if (!hasCorrectZones || zonasSeleccionadas.length === 0) return false;
    const correctIds = config.zonasCorrectasIds!;
    if (zonasSeleccionadas.length !== correctIds.length) return false;
    return zonasSeleccionadas.every((id) => correctIds.includes(id));
  }, [zonasSeleccionadas, config.zonasCorrectasIds, hasCorrectZones]);

  const maxAttemptsReached =
    config.intentosMaximos !== undefined && intentos >= config.intentosMaximos;

  const isInteractive = modo === 'estudiante' && !disabled && !verificado;

  const handleZoneClick = useCallback(
    (zonaId: string) => {
      if (!isInteractive) return;

      setZonasSeleccionadas((prev) => {
        if (config.seleccionMultiple) {
          // Toggle selection in multi-select mode
          if (prev.includes(zonaId)) {
            return prev.filter((id) => id !== zonaId);
          }
          return [...prev, zonaId];
        } else {
          // Single selection mode
          if (prev.includes(zonaId)) {
            return [];
          }
          return [zonaId];
        }
      });

      if (hasCorrectZones) {
        onProgress?.(50);
      }
    },
    [isInteractive, config.seleccionMultiple, hasCorrectZones, onProgress],
  );

  const handleVerify = useCallback(() => {
    if (zonasSeleccionadas.length === 0) return;

    setVerificado(true);
    setIntentos((prev) => prev + 1);
    onComplete?.({
      completado: true,
      puntuacion: isCorrect ? 100 : 0,
      respuesta: zonasSeleccionadas,
      tiempoMs: 0,
      intentos: intentos + 1,
    });
  }, [zonasSeleccionadas, isCorrect, onComplete, intentos]);

  const handleRetry = useCallback(() => {
    setVerificado(false);
    setZonasSeleccionadas([]);
  }, []);

  // Editor mode
  if (modo === 'editor') {
    return (
      <div className="p-4 border-2 border-dashed border-slate-600 rounded-lg">
        <div data-testid="editor-mode-indicator" className="text-sm text-slate-400 mb-2">
          Modo Editor - Hotspot
        </div>
        <h3 className="text-white font-medium">{config.instruccion}</h3>
        <div className="mt-4 relative aspect-video bg-slate-800 rounded-lg overflow-hidden">
          <img
            src={config.imagenUrl}
            alt={config.imagenAlt}
            className="w-full h-full object-contain"
          />
          {config.zonas.map((zona) => (
            <HotspotZone
              key={zona.id}
              zona={zona}
              isSelected={false}
              isHovered={false}
              isInteractive={false}
              showLabel={true}
              onClick={() => {}}
              onMouseEnter={() => {}}
              onMouseLeave={() => {}}
            />
          ))}
        </div>
        <div className="mt-2 text-slate-400 text-sm">
          Zonas: {config.zonas.length}
          {hasCorrectZones && ` | Correctas: ${config.zonasCorrectasIds!.join(', ')}`}
        </div>
      </div>
    );
  }

  const showVerifyButton =
    modo === 'estudiante' && hasCorrectZones && !verificado && zonasSeleccionadas.length > 0;
  const showRetryButton = verificado && !isCorrect && !maxAttemptsReached;

  return (
    <div className="relative" data-testid={`hotspot-${id}`}>
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{config.instruccion}</h2>
        {config.descripcion && <p className="text-sm text-slate-400 mt-1">{config.descripcion}</p>}
      </div>

      {/* Question for interactive mode */}
      {config.pregunta && (
        <div className="mb-4 p-3 bg-slate-800 rounded-lg">
          <p className="text-white">{config.pregunta}</p>
        </div>
      )}

      {/* Image with hotspots */}
      <div
        className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden"
        role="region"
        aria-label="Imagen interactiva con zonas"
      >
        <img
          src={config.imagenUrl}
          alt={config.imagenAlt}
          className="w-full h-full object-contain"
        />
        {config.zonas.map((zona) => (
          <HotspotZone
            key={zona.id}
            zona={zona}
            isSelected={zonasSeleccionadas.includes(zona.id)}
            isHovered={zonaHover === zona.id}
            isInteractive={isInteractive}
            showLabel={modo === 'preview'}
            onClick={() => handleZoneClick(zona.id)}
            onMouseEnter={() => setZonaHover(zona.id)}
            onMouseLeave={() => setZonaHover(null)}
          />
        ))}
      </div>

      {/* Accessibility announcement */}
      <div role="status" aria-live="polite" className="sr-only">
        {zonasSeleccionadas.length > 0 &&
          `Seleccionadas: ${zonasSeleccionadas.map((id) => config.zonas.find((z) => z.id === id)?.label).join(', ')}`}
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
      {modo === 'estudiante' && hasCorrectZones && (
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
