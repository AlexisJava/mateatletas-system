/**
 * RaiseHandButton - Botón para levantar la mano en clase en vivo
 *
 * Permite al estudiante señalar que tiene una pregunta.
 * Comunica el estado via LiveKit publishData (broadcast a toda la sala).
 */
'use client';

import { useState, useCallback } from 'react';
import { Hand } from 'lucide-react';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';

// ============================================================================
// TIPOS
// ============================================================================

interface RaiseHandButtonProps {
  /** Variante visual del botón */
  variant?: 'full' | 'compact';
}

// ============================================================================
// COMPONENTE
// ============================================================================

export function RaiseHandButton({ variant = 'full' }: RaiseHandButtonProps) {
  const [isRaised, setIsRaised] = useState(false);
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();

  const handleToggle = useCallback(async () => {
    const newState = !isRaised;
    setIsRaised(newState);

    try {
      // Enviar mensaje a todos los participantes (especialmente al docente)
      // Formato unificado compatible con ControlBar y ParticipantsList
      const encoder = new TextEncoder();
      const data = encoder.encode(
        JSON.stringify({
          type: 'hand_raised',
          raised: newState,
          participantId: localParticipant?.identity || '',
          participantName: localParticipant?.name || room.localParticipant.identity,
          timestamp: Date.now(),
        }),
      );

      await room.localParticipant.publishData(data, { reliable: true });
    } catch (error) {
      console.error('Error enviando señal de mano:', error);
      // Revertir estado si falla
      setIsRaised(!newState);
    }
  }, [isRaised, localParticipant, room]);

  // Variante compact: solo icono
  if (variant === 'compact') {
    return (
      <button
        onClick={handleToggle}
        className={`
          relative p-2 rounded-lg transition-all duration-200
          ${
            isRaised
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
          }
        `}
        aria-label={isRaised ? 'Bajar mano' : 'Levantar mano'}
      >
        <Hand data-testid="hand-icon" className="h-5 w-5" />
        {isRaised && (
          <span
            data-testid="raised-indicator"
            className="absolute -top-1 -right-1 h-3 w-3 bg-white rounded-full animate-pulse"
          />
        )}
      </button>
    );
  }

  // Variante full: botón con texto
  return (
    <button
      onClick={handleToggle}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
        ${
          isRaised
            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
        }
      `}
      aria-label={isRaised ? 'Bajar mano' : 'Levantar mano'}
    >
      <Hand data-testid="hand-icon" className="h-5 w-5" />
      <span>{isRaised ? 'Bajar mano' : 'Levantar mano'}</span>
      {isRaised && (
        <span
          data-testid="raised-indicator"
          className="h-2 w-2 bg-white rounded-full animate-pulse"
        />
      )}
    </button>
  );
}
