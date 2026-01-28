'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useCallback } from 'react';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { ClassRoom } from '@/components/docente/live/ClassRoom';
import { AulaVivaProvider, useAulaVivaChat } from '@/hooks/useAulaViva';

/**
 * Contenido interno que usa los hooks de AulaViva
 * Debe estar dentro del AulaVivaProvider
 */
function ClaseEnVivoInner({
  token,
  wsUrl,
  nombreClase,
  claseGrupoId,
  comisionId,
  onLeave,
}: {
  token: string;
  wsUrl: string;
  nombreClase: string;
  claseGrupoId?: string;
  comisionId?: string;
  onLeave: () => void;
}) {
  // Hook de chat WebSocket (ahora del sistema unificado)
  const {
    mensajes,
    connectionState,
    error: chatError,
    chatHabilitado,
    enviarMensaje,
  } = useAulaVivaChat();

  // Handler para enviar mensajes
  const handleSendMessage = useCallback(
    async (contenido: string) => {
      const result = await enviarMensaje(contenido);
      return { exito: result.exito, error: result.error };
    },
    [enviarMensaje],
  );

  // Placeholder reconectar (el provider maneja reconexión automática)
  const handleReconnect = useCallback(() => {
    // El AulaVivaProvider maneja reconexión automática
    window.location.reload();
  }, []);

  return (
    <LiveKitRoom
      token={token}
      serverUrl={wsUrl}
      connect={true}
      video={false} // Estudiante no transmite video
      audio={false} // Estudiante no transmite audio inicialmente
      className="h-full"
    >
      <RoomAudioRenderer />
      <ClassRoom
        title={nombreClase}
        onEndClass={onLeave}
        mode="student"
        claseGrupoId={claseGrupoId}
        comisionId={comisionId}
        chat={{
          mensajes,
          connectionState,
          error: chatError,
          chatHabilitado,
          onSendMessage: handleSendMessage,
          onReconnect: handleReconnect,
        }}
      />
    </LiveKitRoom>
  );
}

/**
 * Página de Clase en Vivo - Portal Estudiante
 *
 * El estudiante se conecta como viewer (solo ve/escucha, no transmite).
 *
 * Recibe los parámetros de LiveKit via query string:
 * - token: JWT token de LiveKit (con canPublish: false)
 * - wsUrl: WebSocket URL del servidor LiveKit
 * - roomName: Nombre de la sala
 * - nombreClase: Título de la clase (opcional)
 * - claseGrupoId: ID de la clase grupal (para chat)
 * - comisionId: ID de la comisión (para chat)
 */
function ClaseEnVivoEstudianteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token');
  const wsUrl = searchParams.get('wsUrl');
  const roomName = searchParams.get('roomName');
  const nombreClase = searchParams.get('nombreClase') || 'Clase en Vivo';
  const claseGrupoId = searchParams.get('claseGrupoId') || undefined;
  const comisionId = searchParams.get('comisionId') || undefined;

  // Validar parámetros requeridos
  if (!token || !wsUrl || !roomName) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/50 border border-red-500/30 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Error de Conexión</h1>
          <p className="text-slate-400 mb-6">
            No se pudo conectar a la clase en vivo. Faltan parámetros de conexión. Intenta unirte
            nuevamente desde la sección de clases.
          </p>
          <button
            onClick={() => router.push('/estudiante/clases')}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} />
            Volver a Clases
          </button>
        </div>
      </div>
    );
  }

  const handleLeaveClass = () => {
    router.push('/estudiante/clases');
  };

  return (
    <div className="h-screen bg-slate-950">
      <AulaVivaProvider claseGrupoId={claseGrupoId} comisionId={comisionId}>
        <ClaseEnVivoInner
          token={token}
          wsUrl={wsUrl}
          nombreClase={nombreClase}
          claseGrupoId={claseGrupoId}
          comisionId={comisionId}
          onLeave={handleLeaveClass}
        />
      </AulaVivaProvider>
    </div>
  );
}

export default function ClaseEnVivoEstudiantePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Conectando a la clase...</p>
          </div>
        </div>
      }
    >
      <ClaseEnVivoEstudianteContent />
    </Suspense>
  );
}
