'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { ClassRoom } from '@/components/docente/live/ClassRoom';
import { AulaVivaProvider } from '@/hooks/useAulaViva';

/**
 * Página de Clase en Vivo
 *
 * Recibe los parámetros de LiveKit via query string:
 * - token: JWT token de LiveKit
 * - ws: WebSocket URL del servidor LiveKit
 * - room: Nombre de la sala
 * - title: Título de la clase (opcional)
 */
function ClaseEnVivoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token');
  const wsUrl = searchParams.get('ws');
  const roomName = searchParams.get('room');
  const title = searchParams.get('title') || 'Clase en Vivo';

  // Primero intentar obtener IDs de parámetros explícitos
  // Si no existen, extraer del roomName (formato: clase-grupo-{id} o comision-{id})
  const claseGrupoId =
    searchParams.get('claseGrupoId') ||
    (roomName?.startsWith('clase-grupo-') ? roomName.replace('clase-grupo-', '') : undefined);
  const comisionId =
    searchParams.get('comisionId') ||
    (roomName?.startsWith('comision-') ? roomName.replace('comision-', '') : undefined);

  // Validar parámetros requeridos
  if (!token || !wsUrl || !roomName) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/50 border border-red-500/30 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Parámetros Inválidos</h1>
          <p className="text-slate-400 mb-6">
            Faltan parámetros necesarios para conectar a la clase en vivo. Por favor, inicia la
            clase desde el dashboard.
          </p>
          <button
            onClick={() => router.push('/docente/dashboard')}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} />
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleEndClass = () => {
    router.push('/docente/dashboard');
  };

  return (
    <div className="h-screen bg-slate-950">
      <AulaVivaProvider claseGrupoId={claseGrupoId} comisionId={comisionId}>
        <LiveKitRoom
          token={token}
          serverUrl={wsUrl}
          connect={true}
          video={true}
          audio={true}
          className="h-full"
        >
          <RoomAudioRenderer />
          <ClassRoom
            title={title}
            onEndClass={handleEndClass}
            claseGrupoId={claseGrupoId}
            comisionId={comisionId}
          />
        </LiveKitRoom>
      </AulaVivaProvider>
    </div>
  );
}

export default function ClaseEnVivoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ClaseEnVivoContent />
    </Suspense>
  );
}
