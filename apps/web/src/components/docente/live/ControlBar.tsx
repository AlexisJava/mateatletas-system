'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  PhoneOff,
  MonitorOff,
  Hand,
  LogOut,
} from 'lucide-react';
import { useTrackToggle, useRoomContext } from '@livekit/components-react';
import { Track, RoomEvent } from 'livekit-client';
import { useAulaVivaManos } from '@/hooks/useAulaViva';

interface ControlBarProps {
  onEndClass: () => void;
  variant?: 'teacher' | 'student';
  /** ID del usuario actual (para verificar si tiene mano levantada) */
  currentUserId?: string;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  onEndClass,
  variant = 'teacher',
  currentUserId,
}) => {
  const room = useRoomContext();
  const [canPublish, setCanPublish] = useState(false);
  const prevCanPublishRef = React.useRef(false);

  // WebSocket hooks para manos (via aula-viva)
  const { manosLevantadas, levantarMano, bajarMano } = useAulaVivaManos();

  // Verificar si el usuario actual tiene la mano levantada
  const handRaised = currentUserId
    ? manosLevantadas.some((m) => m.odooId === currentUserId)
    : false;

  // LiveKit hooks para audio/video
  const { toggle: toggleMic, enabled: isMicEnabled } = useTrackToggle({
    source: Track.Source.Microphone,
  });

  const { toggle: toggleCamera, enabled: isCameraEnabled } = useTrackToggle({
    source: Track.Source.Camera,
  });

  const { toggle: toggleScreenShare, enabled: isScreenShareEnabled } = useTrackToggle({
    source: Track.Source.ScreenShare,
  });

  const isStudent = variant === 'student';

  // Auto-activar micrófono cuando recibe permiso (de false a true)
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (isStudent && canPublish && !prevCanPublishRef.current && !isMicEnabled) {
      timer = setTimeout(() => {
        toggleMic();
      }, 300);
    }

    prevCanPublishRef.current = canPublish;

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [canPublish, isStudent, isMicEnabled, toggleMic]);

  // Callback estable para actualizar permisos
  const updatePermissions = useCallback(() => {
    if (!room.localParticipant?.identity) {
      return;
    }

    const permissions = room.localParticipant.permissions;
    const newCanPublish = permissions?.canPublish ?? false;

    setCanPublish(newCanPublish);

    // Si perdimos permiso de publicar y teníamos mano levantada, bajarla
    if (!newCanPublish && handRaised) {
      bajarMano();
    }
  }, [room, handRaised, bajarMano]);

  // Escuchar cambios de permisos (cuando el docente da/quita palabra)
  useEffect(() => {
    if (!isStudent) return;

    const initialCheck = setTimeout(updatePermissions, 500);

    room.on(RoomEvent.ParticipantPermissionsChanged, updatePermissions);
    room.on(RoomEvent.LocalTrackPublished, updatePermissions);
    room.on(RoomEvent.ConnectionStateChanged, updatePermissions);

    return () => {
      clearTimeout(initialCheck);
      room.off(RoomEvent.ParticipantPermissionsChanged, updatePermissions);
      room.off(RoomEvent.LocalTrackPublished, updatePermissions);
      room.off(RoomEvent.ConnectionStateChanged, updatePermissions);
    };
  }, [room, isStudent, updatePermissions]);

  /**
   * Toggle levantar mano - envía via WebSocket a aula-viva
   */
  const handleRaiseHand = async () => {
    if (handRaised) {
      await bajarMano();
    } else {
      await levantarMano();
    }
  };

  // Para estudiantes: barra con levantar mano + controles de mic cuando tiene permiso
  if (isStudent) {
    return (
      <div className="flex items-center justify-center gap-3 p-3 bg-slate-900/90 backdrop-blur-md border-t border-slate-800">
        {/* Indicador de "Tienes la palabra" cuando puede publicar */}
        {canPublish && (
          <>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-bold text-emerald-400">Tienes la palabra</span>
            </div>

            {/* Control de micrófono cuando tiene permiso */}
            <button
              onClick={() => toggleMic()}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${
                isMicEnabled
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-red-500/20 border border-red-500 text-red-400'
              }`}
              title={isMicEnabled ? 'Silenciar micrófono' : 'Activar micrófono'}
            >
              {isMicEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              <span className="hidden sm:inline">
                {isMicEnabled ? 'Micrófono activo' : 'Micrófono silenciado'}
              </span>
            </button>

            <div className="w-[1px] h-8 bg-slate-700 mx-2" />
          </>
        )}

        {/* Botón Levantar Mano (solo cuando NO tiene palabra) */}
        {!canPublish && (
          <>
            <button
              onClick={handleRaiseHand}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${
                handRaised
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 animate-pulse'
                  : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-amber-500/20 hover:border-amber-500 hover:text-amber-400'
              }`}
              title={handRaised ? 'Bajar la mano' : 'Levantar la mano'}
            >
              <Hand size={20} className={handRaised ? 'animate-bounce' : ''} />
              <span className="hidden sm:inline">
                {handRaised ? '¡Mano levantada!' : 'Levantar mano'}
              </span>
            </button>

            <div className="w-[1px] h-8 bg-slate-700 mx-2" />
          </>
        )}

        {/* Botón Salir */}
        <button
          onClick={onEndClass}
          className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-xl font-bold transition-all border border-slate-700 hover:border-red-500"
        >
          <LogOut size={20} />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    );
  }

  // Para docentes: barra completa con controles de medios
  return (
    <div className="flex items-center gap-2 md:gap-4 p-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-2xl absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
      <button
        onClick={() => toggleMic()}
        className={`p-3 md:p-4 rounded-xl border transition-all ${
          isMicEnabled
            ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
            : 'bg-red-500/20 border-red-500 text-red-400'
        }`}
        title={isMicEnabled ? 'Silenciar micrófono' : 'Activar micrófono'}
      >
        {isMicEnabled ? <Mic size={20} /> : <MicOff size={20} />}
      </button>

      <button
        onClick={() => toggleCamera()}
        className={`p-3 md:p-4 rounded-xl border transition-all ${
          isCameraEnabled
            ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
            : 'bg-red-500/20 border-red-500 text-red-400'
        }`}
        title={isCameraEnabled ? 'Apagar cámara' : 'Encender cámara'}
      >
        {isCameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
      </button>

      <button
        onClick={() => toggleScreenShare()}
        className={`p-3 md:p-4 rounded-xl border transition-all ${
          isScreenShareEnabled
            ? 'bg-indigo-600 border-indigo-500 text-white'
            : 'bg-slate-800 border-slate-700 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500'
        }`}
        title={isScreenShareEnabled ? 'Dejar de compartir pantalla' : 'Compartir pantalla'}
      >
        {isScreenShareEnabled ? <MonitorOff size={20} /> : <MonitorUp size={20} />}
      </button>

      <div className="w-[1px] h-8 bg-slate-700 mx-1" />

      <button
        onClick={onEndClass}
        className="px-6 py-3 md:py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-600/20"
      >
        <PhoneOff size={20} />
        <span className="hidden md:inline">Finalizar</span>
      </button>
    </div>
  );
};
