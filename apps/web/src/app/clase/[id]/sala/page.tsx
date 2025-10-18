'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import apiClient from '@/lib/axios';
import { LoadingSpinner } from '@/components/effects';
import { ModalResumenClase } from '@/components/estudiantes/ModalResumenClase';
import { JitsiParticipant } from '@/types/jitsi.types';
import { ArrowLeft, Users, Video, Mic, Clock } from 'lucide-react';

/**
 * T025 - Integración Videollamada con Auto-Join (Jitsi Meet)
 *
 * Features:
 * - Integración completa de Jitsi Meet
 * - Auto-join al entrar a la sala
 * - Configuración personalizada por rol (estudiante/docente)
 * - Registro automático de asistencia
 */

interface ClaseData {
  id: string;
  ruta_curricular: {
    nombre: string;
    color: string;
  };
  docente: {
    nombre: string;
    apellido: string;
  };
  fecha_hora_inicio: string;
  duracion_minutos: number;
}

export default function SalaClasePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [clase, setClase] = useState<ClaseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);
  const [showResumen, setShowResumen] = useState(false);
  const [resumenData, setResumenData] = useState<Record<string, unknown>>(null);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<Record<string, unknown> | null>(null);

  const claseId = params.id as string;

  useEffect(() => {
    const fetchClase = async () => {
      try {
        const response = await apiClient.get(`/clases/${claseId}`);
        setClase(response.data);
      } catch (error: unknown) {
        // Error loading class
      } finally {
        setIsLoading(false);
      }
    };

    if (claseId) {
      fetchClase();
    }
  }, [claseId]);

  useEffect(() => {
    // Load Jitsi Meet External API
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => setIsJitsiLoaded(true);
      document.body.appendChild(script);
    } else {
      setIsJitsiLoaded(true);
    }

    return () => {
      // Cleanup Jitsi instance
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (isJitsiLoaded && clase && jitsiContainerRef.current && user) {
      // Initialize Jitsi Meet
      const domain = 'meet.jit.si';
      const roomName = `MateAtletas_Clase_${claseId}`;

      const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: `${user.nombre} ${user.apellido || ''}`.trim(),
          email: user.email,
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          prejoinPageEnabled: false, // Auto-join sin pantalla previa
          disableDeepLinking: true,
          toolbarButtons: [
            'microphone',
            'camera',
            'desktop',
            'fullscreen',
            'fodeviceselection',
            'hangup',
            'chat',
            'raisehand',
            'participants-pane',
            'tileview'
          ],
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          BRAND_WATERMARK_LINK: '',
          DEFAULT_BACKGROUND: '#1a1a2e',
          DISABLE_VIDEO_BACKGROUND: false,
          TOOLBAR_ALWAYS_VISIBLE: false,
          DEFAULT_REMOTE_DISPLAY_NAME: 'Participante',
          DEFAULT_LOCAL_DISPLAY_NAME: 'Tú',
          LANG_DETECTION: false,
          CONNECTION_INDICATOR_DISABLED: false,
          VIDEO_QUALITY_LABEL_DISABLED: false,
        },
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);
      jitsiApiRef.current = api;

      // Event listeners
      api.addEventListener('videoConferenceJoined', () => {
        // Registrar asistencia automáticamente
        registrarAsistencia();
      });

      api.addEventListener('participantJoined', (...args: unknown[]) => {
        const participant = args[0] as JitsiParticipant;
        // Participant joined
      });

      api.addEventListener('videoConferenceLeft', async () => {

        // Si es estudiante, mostrar resumen post-clase
        if (user.role === 'estudiante') {
          try {
            // Obtener resumen de la clase (TODO: endpoint real)
            const resumen = {
              claseNombre: clase.ruta_curricular.nombre,
              duracion_minutos: clase.duracion_minutos,
              puntosGanados: Math.floor(Math.random() * 100) + 50, // Mock
              insigniasDesbloqueadas: [
                {
                  id: '1',
                  nombre: 'Participación Activa',
                  icono: '🎤',
                  descripcion: 'Participaste activamente en la clase'
                }
              ],
              estadisticas: {
                participacion: Math.floor(Math.random() * 40) + 60,
                preguntasRespondidas: Math.floor(Math.random() * 8) + 2,
                preguntasCorrectas: Math.floor(Math.random() * 6) + 2,
                tiempoActivo: clase.duracion_minutos - Math.floor(Math.random() * 10)
              },
              mensajeDocente: '¡Excelente participación hoy! Sigue así.',
              siguienteNivel: {
                nivelActual: 3,
                puntosParaSiguiente: 150
              }
            };

            setResumenData(resumen);
            setShowResumen(true);
          } catch (error: unknown) {
            // Redirigir directamente si hay error
            router.push('/estudiante/dashboard');
          }
        } else if (user.role === 'docente') {
          router.push('/docente/dashboard');
        }
      });
    }
  }, [isJitsiLoaded, clase, user, claseId]);

  const registrarAsistencia = async () => {
    try {
      await apiClient.post('/asistencia', {
        claseId: claseId,
        presente: true,
      });
    } catch (error: unknown) {
      // Error registering attendance
    }
  };

  const handleSalir = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('hangup');
    }
    if (user?.role === 'estudiante') {
      router.push('/estudiante/dashboard');
    } else if (user?.role === 'docente') {
      router.push('/docente/dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <LoadingSpinner size="lg" text="Cargando sala de clase..." />
      </div>
    );
  }

  if (!clase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Clase no encontrada</h1>
          <button
            onClick={() => router.push('/estudiante/dashboard')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-slate-800 to-slate-900 border-b-2 border-purple-500/30 px-4 py-3 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleSalir}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold hidden md:inline">Salir de la clase</span>
            </button>

            <div className="h-8 w-px bg-purple-500/30" />

            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: clase.ruta_curricular.color }}
              />
              <div>
                <h1 className="text-white font-bold text-lg">
                  {clase.ruta_curricular.nombre}
                </h1>
                <p className="text-gray-400 text-sm">
                  Prof. {clase.docente.nombre} {clase.docente.apellido}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-gray-300">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-semibold hidden md:inline">
                {clase.duracion_minutos} min
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-green-400" />
              <span className="text-sm font-semibold hidden md:inline text-green-400">
                EN VIVO
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Jitsi Container */}
      <div className="flex-1 relative overflow-hidden">
        {!isJitsiLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <LoadingSpinner size="lg" text="Conectando a la sala..." />
          </div>
        )}
        <div
          ref={jitsiContainerRef}
          className="w-full h-full"
          style={{
            minHeight: '100%',
            background: '#1a1a2e'
          }}
        />
      </div>

      {/* Footer Hint (opcional, solo móvil) */}
      <div className="md:hidden flex-shrink-0 bg-slate-900/90 border-t-2 border-purple-500/30 px-4 py-2">
        <div className="flex items-center justify-around text-gray-400 text-xs">
          <div className="flex items-center gap-1">
            <Mic className="w-4 h-4" />
            <span>Micrófono</span>
          </div>
          <div className="flex items-center gap-1">
            <Video className="w-4 h-4" />
            <span>Cámara</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>Participantes</span>
          </div>
        </div>
      </div>

      {/* Modal Resumen Post-Clase */}
      {showResumen && resumenData && (
        <ModalResumenClase
          resumen={resumenData}
          onClose={() => {
            setShowResumen(false);
            router.push('/estudiante/dashboard');
          }}
        />
      )}
    </div>
  );
}

// Types are imported from @/types/jitsi.types
