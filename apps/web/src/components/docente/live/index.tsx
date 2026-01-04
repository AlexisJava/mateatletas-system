'use client';

import React, { useState, useCallback } from 'react';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';

import { livekitApi } from '@/lib/api/livekit.api';
import { useAulaVivaChat } from '@/hooks/useAulaVivaChat';
import { PreClassView } from './PreClassView';
import { ClassRoom } from './ClassRoom';
import type { RoomState, LiveClassConfig } from './types';

interface LiveClassPageProps {
  config: LiveClassConfig;
}

/**
 * Componente interno que maneja el chat
 * Separado para poder usar hooks sin condicionales
 */
interface ClassRoomWithChatProps {
  config: LiveClassConfig;
  onEndClass: () => void;
}

const ClassRoomWithChat: React.FC<ClassRoomWithChatProps> = ({ config, onEndClass }) => {
  const {
    mensajes,
    connectionState,
    error,
    chatHabilitado,
    enviarMensaje,
    toggleChat,
    reconectar,
  } = useAulaVivaChat({
    claseGrupoId: config.claseGrupoId,
    comisionId: config.comisionId,
  });

  const handleSendMessage = useCallback(
    async (contenido: string) => {
      const result = await enviarMensaje(contenido);
      return { exito: result.exito, error: result.error };
    },
    [enviarMensaje],
  );

  const handleToggleChat = useCallback(
    async (habilitado: boolean) => {
      return toggleChat(habilitado);
    },
    [toggleChat],
  );

  return (
    <ClassRoom
      title={config.title}
      onEndClass={onEndClass}
      chat={{
        mensajes,
        connectionState,
        error,
        chatHabilitado,
        onSendMessage: handleSendMessage,
        onToggleChat: handleToggleChat,
        onReconnect: reconectar,
      }}
    />
  );
};

export const LiveClassPage: React.FC<LiveClassPageProps> = ({ config }) => {
  const [roomState, setRoomState] = useState<RoomState>('preClass');
  const [token, setToken] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartClass = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await livekitApi.getTokenDocente({
        comisionId: config.comisionId,
        claseGrupoId: config.claseGrupoId,
      });

      setToken(response.token);
      setWsUrl(response.wsUrl);
      setRoomState('connecting');
    } catch (err) {
      console.error('Error getting LiveKit token:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo conectar. Verifica que LiveKit esté configurado.',
      );
      setRoomState('error');
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  const handleEndClass = useCallback(() => {
    setRoomState('ended');
    setToken(null);
    setWsUrl(null);
  }, []);

  const handleRoomConnected = useCallback(() => {
    setRoomState('connected');
  }, []);

  const handleRoomDisconnected = useCallback(() => {
    if (roomState !== 'ended') {
      setRoomState('preClass');
    }
  }, [roomState]);

  // Pre-class view
  if (roomState === 'preClass' || roomState === 'error') {
    return (
      <PreClassView
        config={config}
        onStart={handleStartClass}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  // Ended view
  if (roomState === 'ended') {
    return (
      <div className="flex flex-col h-full bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <span className="text-4xl">&#x2713;</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Clase Finalizada</h2>
          <p className="text-slate-400 mb-6">La transmisión ha terminado correctamente.</p>
          <button
            onClick={() => setRoomState('preClass')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
          >
            Iniciar Nueva Clase
          </button>
        </div>
      </div>
    );
  }

  // Connecting / Connected - LiveKit Room
  if (!token || !wsUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={wsUrl}
      connect={true}
      video={true}
      audio={true}
      onConnected={handleRoomConnected}
      onDisconnected={handleRoomDisconnected}
      className="h-full"
    >
      <RoomAudioRenderer />
      <ClassRoomWithChat config={config} onEndClass={handleEndClass} />
    </LiveKitRoom>
  );
};

// Re-export types
export type { LiveClassConfig, RoomState } from './types';
