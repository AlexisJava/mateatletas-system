'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  VideoTrack,
  useLocalParticipant,
  useTracks,
  useRoomContext,
  useRemoteParticipants,
} from '@livekit/components-react';
import { Track, RoomEvent } from 'livekit-client';
import { Users, Clock, Wifi, MessageSquare, X } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { ControlBar } from './ControlBar';
import { ChatPanel } from './ChatPanel';
import { ParticipantsList } from './ParticipantsList';
import type { MensajeChat, ChatConnectionState } from './types';

interface ClassRoomProps {
  title: string;
  onEndClass: () => void;
  /**
   * Modo de la sala:
   * - 'teacher': El usuario es docente, muestra tracks locales y puede transmitir
   * - 'student': El usuario es estudiante, ve los tracks del docente (remoto)
   */
  mode?: 'teacher' | 'student';
  /** ID del ClaseGrupo (para control de palabra) */
  claseGrupoId?: string;
  /** ID de la Comisión (para control de palabra) */
  comisionId?: string;
  /** Props del chat */
  chat?: {
    mensajes: MensajeChat[];
    connectionState: ChatConnectionState;
    error: string | null;
    chatHabilitado: boolean;
    onSendMessage: (contenido: string) => Promise<{ exito: boolean; error?: string }>;
    onToggleChat?: (habilitado: boolean) => Promise<{ exito: boolean; error?: string }>;
    onReconnect: () => void;
    currentUserId?: string;
  };
}

export const ClassRoom: React.FC<ClassRoomProps> = ({
  title,
  onEndClass,
  mode = 'teacher',
  claseGrupoId,
  comisionId,
  chat,
}) => {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [participantCount, setParticipantCount] = React.useState(1);
  const [isChatOpen, setIsChatOpen] = useState(chat !== undefined);

  const isStudent = mode === 'student';

  // Timer
  React.useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Participant count
  React.useEffect(() => {
    const updateCount = () => {
      setParticipantCount(room.remoteParticipants.size + 1);
    };

    updateCount();
    room.on(RoomEvent.ParticipantConnected, updateCount);
    room.on(RoomEvent.ParticipantDisconnected, updateCount);

    return () => {
      room.off(RoomEvent.ParticipantConnected, updateCount);
      room.off(RoomEvent.ParticipantDisconnected, updateCount);
    };
  }, [room]);

  // Listener para notificaciones de mano levantada (solo docente)
  const handleDataReceived = useCallback(
    (payload: Uint8Array, participant: { identity: string; name?: string } | undefined) => {
      if (isStudent) return; // Solo el docente recibe notificaciones

      try {
        const decoder = new TextDecoder();
        const message = JSON.parse(decoder.decode(payload));

        if (message.type === 'hand_raised' && message.raised === true) {
          const studentName = message.participantName || participant?.name || 'Un estudiante';
          toast(`✋ ${studentName} levantó la mano`, {
            duration: 5000,
            icon: '🙋',
            style: {
              background: '#1e293b',
              color: 'var(--color-xp)',
              border: '1px solid #f59e0b',
            },
          });
        }
      } catch {
        // Ignorar mensajes que no sean JSON válido
      }
    },
    [isStudent],
  );

  useEffect(() => {
    if (isStudent) return;

    room.on(RoomEvent.DataReceived, handleDataReceived);
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, isStudent, handleDataReceived]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get tracks - for students, we subscribe to remote tracks; for teachers, we show local tracks
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], {
    onlySubscribed: isStudent, // Students only see subscribed (remote) tracks
  });

  // For students: find the teacher's tracks (first remote participant with video)
  // For teachers: find their own local tracks
  const targetIdentity = isStudent
    ? remoteParticipants[0]?.identity // First remote participant (the teacher)
    : localParticipant?.identity;

  const screenShareTrack = tracks.find(
    (t) => t.source === Track.Source.ScreenShare && t.participant.identity === targetIdentity,
  );

  const cameraTrack = tracks.find(
    (t) => t.source === Track.Source.Camera && t.participant.identity === targetIdentity,
  );

  // Get teacher name for student view
  const teacherName = isStudent ? remoteParticipants[0]?.name : localParticipant?.name;

  return (
    <div className="flex flex-col h-full bg-slate-950 relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900/80 border-b border-slate-800 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-red-400 uppercase">En Vivo</span>
          </div>
          <h1 className="text-lg font-bold text-white hidden md:block">{title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock size={16} />
            <span className="text-sm font-mono">{formatTime(elapsedTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Users size={16} />
            <span className="text-sm font-bold">{participantCount}</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <Wifi size={16} />
          </div>
          {/* Chat toggle button */}
          {chat && (
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                isChatOpen
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {isChatOpen ? <X size={16} /> : <MessageSquare size={16} />}
              <span className="text-sm font-medium hidden sm:inline">
                {isChatOpen ? 'Cerrar' : 'Chat'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Participants Sidebar - SIEMPRE visible para docente, a la IZQUIERDA */}
        {!isStudent && (
          <div className="w-72 lg:w-80 flex-shrink-0 border-r border-slate-800">
            <ParticipantsList claseGrupoId={claseGrupoId} comisionId={comisionId} />
          </div>
        )}

        {/* Video Area - CENTRO */}
        <div className="flex-1 relative flex items-center justify-center p-4 bg-slate-950">
          {/* Screen Share (main view when active) */}
          {screenShareTrack ? (
            <div className="w-full h-full max-w-6xl aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
              <VideoTrack trackRef={screenShareTrack} className="w-full h-full object-contain" />
            </div>
          ) : cameraTrack ? (
            <div className="w-full h-full max-w-4xl aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
              <VideoTrack trackRef={cameraTrack} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full h-full max-w-4xl aspect-video bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {teacherName?.[0]?.toUpperCase() || (isStudent ? 'P' : 'D')}
                  </span>
                </div>
                <p className="text-slate-400">
                  {isStudent ? 'Esperando al profesor...' : 'Cámara apagada'}
                </p>
              </div>
            </div>
          )}

          {/* Picture-in-Picture camera when screen sharing */}
          {screenShareTrack && cameraTrack && (
            <div className="absolute bottom-20 right-8 w-48 aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-xl border border-slate-700">
              <VideoTrack trackRef={cameraTrack} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Chat Sidebar - DERECHA */}
        {chat && isChatOpen && (
          <div className="w-80 lg:w-96 flex-shrink-0 border-l border-slate-800">
            <ChatPanel
              mensajes={chat.mensajes}
              connectionState={chat.connectionState}
              error={chat.error}
              chatHabilitado={chat.chatHabilitado}
              isDocente={!isStudent}
              onSendMessage={chat.onSendMessage}
              onToggleChat={isStudent ? undefined : chat.onToggleChat}
              onReconnect={chat.onReconnect}
              currentUserId={chat.currentUserId}
            />
          </div>
        )}
      </div>

      {/* Control Bar */}
      <ControlBar onEndClass={onEndClass} variant={isStudent ? 'student' : 'teacher'} />
    </div>
  );
};
