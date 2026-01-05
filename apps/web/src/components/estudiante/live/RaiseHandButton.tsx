/**
 * RaiseHandButton - Botón para levantar la mano en clase en vivo
 *
 * Permite al estudiante señalar que tiene una pregunta.
 * Comunica el estado via LiveKit data channel.
 */
'use client';

import { useState, useCallback } from 'react';
import { Hand } from 'lucide-react';
import { useDataChannel, useLocalParticipant } from '@livekit/components-react';

// ============================================================================
// TIPOS
// ============================================================================

interface RaiseHandButtonProps {
  /** Variante visual del botón */
  variant?: 'full' | 'compact';
}

interface HandEvent {
  type: 'hand_raised' | 'hand_lowered';
  participantId: string;
  participantName?: string;
  timestamp: number;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export function RaiseHandButton({ variant = 'full' }: RaiseHandButtonProps) {
  const [isRaised, setIsRaised] = useState(false);
  const { localParticipant } = useLocalParticipant();

  // Data channel para comunicar eventos de mano
  const { send } = useDataChannel('hand-signals');

  const handleToggle = useCallback(() => {
    const newState = !isRaised;
    setIsRaised(newState);

    // Preparar evento
    const event: HandEvent = {
      type: newState ? 'hand_raised' : 'hand_lowered',
      participantId: localParticipant?.identity || '',
      participantName: localParticipant?.name || undefined,
      timestamp: Date.now(),
    };

    // Enviar via data channel (a todos los participantes)
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(event));
    send(data, { reliable: true });
  }, [isRaised, localParticipant, send]);

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
