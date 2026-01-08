'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRemoteParticipants, useRoomContext } from '@livekit/components-react';
import { RoomEvent, Participant, Track } from 'livekit-client';
import { Users, Hand, Mic, MicOff, X } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { livekitApi } from '@/lib/api/livekit.api';

// ============================================================================
// TIPOS
// ============================================================================

interface ParticipantsListProps {
  /** ID del ClaseGrupo (si aplica) */
  claseGrupoId?: string;
  /** ID de la Comisión (si aplica) */
  comisionId?: string;
  /** Callback cuando se cierra el panel */
  onClose?: () => void;
}

interface ParticipantWithHandRaised {
  identity: string;
  name: string;
  handRaised: boolean;
  handRaisedAt: number | null;
  canPublish: boolean;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export function ParticipantsList({ claseGrupoId, comisionId, onClose }: ParticipantsListProps) {
  const room = useRoomContext();
  const remoteParticipants = useRemoteParticipants();
  const [participantsWithHand, setParticipantsWithHand] = useState<
    Map<string, ParticipantWithHandRaised>
  >(new Map());
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Inicializar lista de participantes
  useEffect(() => {
    const updateParticipants = () => {
      const newMap = new Map<string, ParticipantWithHandRaised>();

      remoteParticipants.forEach((p) => {
        const existing = participantsWithHand.get(p.identity);
        // Verificar si puede publicar (tiene palabra)
        const audioTracks = p.getTrackPublications().filter((t) => t.kind === Track.Kind.Audio);
        const canPublish = audioTracks.length > 0 || p.permissions?.canPublish === true;

        newMap.set(p.identity, {
          identity: p.identity,
          name: p.name || p.identity,
          handRaised: existing?.handRaised ?? false,
          handRaisedAt: existing?.handRaisedAt ?? null,
          canPublish,
        });
      });

      setParticipantsWithHand(newMap);
    };

    updateParticipants();

    room.on(RoomEvent.ParticipantConnected, updateParticipants);
    room.on(RoomEvent.ParticipantDisconnected, updateParticipants);
    room.on(RoomEvent.TrackPublished, updateParticipants);
    room.on(RoomEvent.TrackUnpublished, updateParticipants);
    room.on(RoomEvent.ParticipantPermissionsChanged, updateParticipants);

    return () => {
      room.off(RoomEvent.ParticipantConnected, updateParticipants);
      room.off(RoomEvent.ParticipantDisconnected, updateParticipants);
      room.off(RoomEvent.TrackPublished, updateParticipants);
      room.off(RoomEvent.TrackUnpublished, updateParticipants);
      room.off(RoomEvent.ParticipantPermissionsChanged, updateParticipants);
    };
  }, [room, remoteParticipants]);

  // Escuchar mensajes de mano levantada
  const handleDataReceived = useCallback(
    (payload: Uint8Array, participant: Participant | undefined) => {
      try {
        const decoder = new TextDecoder();
        const message = JSON.parse(decoder.decode(payload));

        // Manejar ambos formatos de mensaje (ControlBar y RaiseHandButton)
        if (message.type === 'hand_raised' || message.type === 'hand_lowered') {
          const identity = participant?.identity || message.participantId;
          const isRaised =
            message.type === 'hand_raised' ||
            (message.type === 'hand_raised' && message.raised === true);

          setParticipantsWithHand((prev) => {
            const newMap = new Map(prev);
            const existing = newMap.get(identity);

            if (existing) {
              newMap.set(identity, {
                ...existing,
                handRaised: message.raised ?? isRaised,
                handRaisedAt: isRaised ? Date.now() : null,
              });
            }

            return newMap;
          });
        }
      } catch {
        // Ignorar mensajes no JSON
      }
    },
    [],
  );

  useEffect(() => {
    room.on(RoomEvent.DataReceived, handleDataReceived);
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, handleDataReceived]);

  // Dar palabra a un estudiante
  const handleDarPalabra = async (estudianteId: string, nombre: string) => {
    setLoadingAction(estudianteId);
    try {
      const result = await livekitApi.darPalabra({
        claseGrupoId,
        comisionId,
        estudianteId,
      });

      if (result.exito) {
        toast.success(`${nombre} puede hablar ahora`);
        // Actualizar estado local
        setParticipantsWithHand((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(estudianteId);
          if (existing) {
            newMap.set(estudianteId, {
              ...existing,
              canPublish: true,
              handRaised: false,
              handRaisedAt: null,
            });
          }
          return newMap;
        });
      } else {
        toast.error(result.mensaje);
      }
    } catch {
      toast.error('Error al dar palabra');
    } finally {
      setLoadingAction(null);
    }
  };

  // Quitar palabra a un estudiante
  const handleQuitarPalabra = async (estudianteId: string, nombre: string) => {
    setLoadingAction(estudianteId);
    try {
      const result = await livekitApi.quitarPalabra({
        claseGrupoId,
        comisionId,
        estudianteId,
      });

      if (result.exito) {
        toast.success(`Se quitó la palabra a ${nombre}`);
        // Actualizar estado local
        setParticipantsWithHand((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(estudianteId);
          if (existing) {
            newMap.set(estudianteId, { ...existing, canPublish: false });
          }
          return newMap;
        });
      } else {
        toast.error(result.mensaje);
      }
    } catch {
      toast.error('Error al quitar palabra');
    } finally {
      setLoadingAction(null);
    }
  };

  // Ordenar: primero los que tienen mano levantada, luego por nombre
  const sortedParticipants = Array.from(participantsWithHand.values()).sort((a, b) => {
    if (a.handRaised && !b.handRaised) return -1;
    if (!a.handRaised && b.handRaised) return 1;
    if (a.handRaised && b.handRaised) {
      return (a.handRaisedAt ?? 0) - (b.handRaisedAt ?? 0);
    }
    return a.name.localeCompare(b.name);
  });

  const handsRaisedCount = sortedParticipants.filter((p) => p.handRaised).length;

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-slate-400" />
          <span className="font-semibold text-white">
            Participantes ({sortedParticipants.length})
          </span>
          {handsRaisedCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold">
              <Hand size={12} />
              {handsRaisedCount}
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sortedParticipants.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <Users size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay estudiantes conectados</p>
          </div>
        ) : (
          sortedParticipants.map((participant) => (
            <div
              key={participant.identity}
              className={`
                flex items-center justify-between p-3 rounded-lg transition-all
                ${
                  participant.handRaised
                    ? 'bg-amber-500/10 border border-amber-500/30'
                    : 'bg-slate-800/50 hover:bg-slate-800'
                }
              `}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar */}
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${
                      participant.canPublish
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-700 text-slate-300'
                    }
                  `}
                >
                  {participant.name[0]?.toUpperCase() || '?'}
                </div>

                {/* Nombre */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{participant.name}</p>
                  {participant.canPublish && (
                    <p className="text-xs text-emerald-400">Puede hablar</p>
                  )}
                </div>

                {/* Indicador mano levantada */}
                {participant.handRaised && (
                  <Hand size={16} className="text-amber-400 animate-bounce flex-shrink-0" />
                )}
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {participant.canPublish ? (
                  <button
                    onClick={() => handleQuitarPalabra(participant.identity, participant.name)}
                    disabled={loadingAction === participant.identity}
                    className={`
                      p-2 rounded-lg transition-all
                      ${
                        loadingAction === participant.identity
                          ? 'bg-slate-700 text-slate-500 cursor-wait'
                          : 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white'
                      }
                    `}
                    title="Quitar palabra"
                  >
                    <MicOff size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleDarPalabra(participant.identity, participant.name)}
                    disabled={loadingAction === participant.identity}
                    className={`
                      p-2 rounded-lg transition-all
                      ${
                        loadingAction === participant.identity
                          ? 'bg-slate-700 text-slate-500 cursor-wait'
                          : participant.handRaised
                            ? 'bg-amber-500 text-white hover:bg-amber-600 animate-pulse'
                            : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                      }
                    `}
                    title="Dar palabra"
                  >
                    <Mic size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
