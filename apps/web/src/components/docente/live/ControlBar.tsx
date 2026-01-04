'use client';

import React from 'react';
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, MonitorOff } from 'lucide-react';
import { useTrackToggle } from '@livekit/components-react';
import { Track } from 'livekit-client';

interface ControlBarProps {
  onEndClass: () => void;
  variant?: 'teacher' | 'student';
}

export const ControlBar: React.FC<ControlBarProps> = ({ onEndClass, variant = 'teacher' }) => {
  const { toggle: toggleMic, enabled: isMicEnabled } = useTrackToggle({
    source: Track.Source.Microphone,
  });

  const { toggle: toggleCamera, enabled: isCameraEnabled } = useTrackToggle({
    source: Track.Source.Camera,
  });

  const { toggle: toggleScreenShare, enabled: isScreenShareEnabled } = useTrackToggle({
    source: Track.Source.ScreenShare,
  });

  return (
    <div
      className={`flex items-center gap-2 md:gap-4 p-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-2xl ${
        variant === 'teacher' ? 'absolute bottom-6 left-1/2 -translate-x-1/2 z-40' : ''
      }`}
    >
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

      {variant === 'teacher' && (
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
      )}

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
