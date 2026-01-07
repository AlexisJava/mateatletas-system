'use client';

import React, { useState } from 'react';
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
import { Track } from 'livekit-client';

interface ControlBarProps {
  onEndClass: () => void;
  variant?: 'teacher' | 'student';
}

export const ControlBar: React.FC<ControlBarProps> = ({ onEndClass, variant = 'teacher' }) => {
  const room = useRoomContext();
  const [handRaised, setHandRaised] = useState(false);

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

  /**
   * Toggle levantar mano - envía un mensaje data a la sala
   */
  const handleRaiseHand = async () => {
    const newState = !handRaised;
    setHandRaised(newState);

    // Enviar mensaje a todos los participantes (especialmente al docente)
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(
        JSON.stringify({
          type: 'hand_raised',
          raised: newState,
          participantName: room.localParticipant.name || room.localParticipant.identity,
          timestamp: Date.now(),
        }),
      );

      await room.localParticipant.publishData(data, {
        reliable: true,
      });
    } catch (error) {
      console.error('Error enviando señal de mano levantada:', error);
    }
  };

  // Para estudiantes: barra simplificada (solo levantar mano y salir)
  if (isStudent) {
    return (
      <div className="flex items-center justify-center gap-3 p-3 bg-slate-900/90 backdrop-blur-md border-t border-slate-800">
        {/* Botón Levantar Mano */}
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
