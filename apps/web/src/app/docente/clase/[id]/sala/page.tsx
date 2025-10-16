'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import apiClient from '@/lib/axios';
import { LoadingSpinner } from '@/components/effects';
import { ModalAsignarInsignia } from '@/components/docente/ModalAsignarInsignia';
import {
  ArrowLeft,
  Users,
  Clock,
  Video,
  Award,
  UserCheck,
  UserX,
  Target,
  Wifi
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * T041 - Integración Videollamadas + Tracking Conectados (Vista Docente)
 *
 * Features:
 * - Integración completa de Jitsi Meet para docentes
 * - Panel lateral con lista de estudiantes conectados
 * - Tracking en tiempo real de participantes
 * - Botón flotante para asignar insignias rápidamente
 * - Estadísticas en vivo de la clase
 */

interface ClaseData {
  id: string;
  rutaCurricular: {
    nombre: string;
    color: string;
  };
  grupo: {
    nombre: string;
    estudiantes: EstudianteClase[];
  };
  fecha_hora_inicio: string;
  duracion_minutos: number;
}

interface EstudianteClase {
  id: string;
  nombre: string;
  apellido: string;
  avatar_url: string;
  equipo: {
    nombre: string;
    color: string;
  };
}

interface ParticipanteConectado {
  id: string;
  displayName: string;
  estudianteId?: string;
}

export default function SalaClaseDocentePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [clase, setClase] = useState<ClaseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);
  const [participantesConectados, setParticipantesConectados] = useState<ParticipanteConectado[]>([]);
  const [showInsigniaModal, setShowInsigniaModal] = useState(false);
  const [showPanel, setShowPanel] = useState(true);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const inicioClaseRef = useRef<number>(Date.now());

  const claseId = params.id as string;

  useEffect(() => {
    const fetchClase = async () => {
      try {
        // TODO: Reemplazar con endpoint real
        const mockClase: ClaseData = {
          id: claseId,
          rutaCurricular: {
            nombre: 'Álgebra Básica',
            color: '#8B5CF6'
          },
          grupo: {
            nombre: 'Grupo Alfa',
            estudiantes: [
              {
                id: '1',
                nombre: 'Ana',
                apellido: 'García',
                avatar_url: 'avataaars',
                equipo: { nombre: 'Equipo Rojo', color: '#EF4444' }
              },
              {
                id: '2',
                nombre: 'Carlos',
                apellido: 'López',
                avatar_url: 'bottts',
                equipo: { nombre: 'Equipo Azul', color: '#3B82F6' }
              },
              {
                id: '3',
                nombre: 'María',
                apellido: 'Rodríguez',
                avatar_url: 'personas',
                equipo: { nombre: 'Equipo Verde', color: '#10B981' }
              }
            ]
          },
          fecha_hora_inicio: new Date().toISOString(),
          duracion_minutos: 60
        };
        setClase(mockClase);
      } catch (error) {
        console.error('Error cargando clase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (claseId) {
      fetchClase();
    }
  }, [claseId]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTiempoTranscurrido(Math.floor((Date.now() - inicioClaseRef.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (isJitsiLoaded && clase && jitsiContainerRef.current && user) {
      const domain = 'meet.jit.si';
      const roomName = `MateAtletas_Clase_${claseId}`;

      const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: `Prof. ${user.nombre}`,
          email: user.email,
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          moderator: true, // Docente es moderador
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
            'tileview',
            'videoquality',
            'filmstrip',
            'stats'
          ],
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          DEFAULT_BACKGROUND: '#1a1a2e',
          TOOLBAR_ALWAYS_VISIBLE: false,
          DEFAULT_REMOTE_DISPLAY_NAME: 'Estudiante',
          DEFAULT_LOCAL_DISPLAY_NAME: 'Tú (Profesor/a)',
        },
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);
      jitsiApiRef.current = api;

      // Event listeners
      api.addEventListener('videoConferenceJoined', () => {
        console.log('Docente unido a la videollamada');
      });

      api.addEventListener('participantJoined', (participant: any) => {
        console.log('Participante unido:', participant);
        setParticipantesConectados((prev) => [
          ...prev,
          {
            id: participant.id,
            displayName: participant.displayName,
          },
        ]);
      });

      api.addEventListener('participantLeft', (participant: any) => {
        console.log('Participante salió:', participant);
        setParticipantesConectados((prev) =>
          prev.filter((p) => p.id !== participant.id)
        );
      });

      api.addEventListener('videoConferenceLeft', () => {
        console.log('Docente salió de la videollamada');
        router.push('/docente/dashboard');
      });
    }
  }, [isJitsiLoaded, clase, user, claseId]);

  const handleSalir = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('hangup');
    }
    router.push('/docente/dashboard');
  };

  const formatTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const estudiantesConectados = clase
    ? clase.grupo.estudiantes.filter((est) =>
        participantesConectados.some((p) =>
          p.displayName.includes(est.nombre)
        )
      )
    : [];

  const estudiantesAusentes = clase
    ? clase.grupo.estudiantes.filter(
        (est) =>
          !participantesConectados.some((p) =>
            p.displayName.includes(est.nombre)
          )
      )
    : [];

  const tasaAsistencia = clase
    ? ((estudiantesConectados.length / clase.grupo.estudiantes.length) * 100).toFixed(0)
    : 0;

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
            onClick={() => router.push('/docente/dashboard')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Panel Lateral de Estudiantes */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-80 bg-slate-900/95 border-r-2 border-purple-500/30 flex flex-col overflow-hidden"
          >
            {/* Header del Panel */}
            <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-black text-white">Control de Clase</h3>
                <button
                  onClick={() => setShowPanel(false)}
                  className="p-2 rounded-lg bg-black/20 hover:bg-black/40 transition-all"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Estadísticas Rápidas */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                  <div className="text-2xl font-black text-white">
                    {estudiantesConectados.length}/{clase.grupo.estudiantes.length}
                  </div>
                  <div className="text-xs text-white/80 font-semibold">Conectados</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                  <div className="text-2xl font-black text-white">{tasaAsistencia}%</div>
                  <div className="text-xs text-white/80 font-semibold">Asistencia</div>
                </div>
              </div>
            </div>

            {/* Lista de Estudiantes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Conectados */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="w-4 h-4 text-green-400" />
                  <h4 className="text-sm font-bold text-green-400">
                    Conectados ({estudiantesConectados.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {estudiantesConectados.map((estudiante) => (
                    <div
                      key={estudiante.id}
                      className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-3 border border-green-500/30 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-500">
                        <img
                          src={`https://api.dicebear.com/7.x/${estudiante.avatar_url}/svg?seed=${estudiante.id}`}
                          alt={estudiante.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">
                          {estudiante.nombre} {estudiante.apellido}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: estudiante.equipo.color }}
                          />
                          <div className="text-xs text-gray-400 truncate">
                            {estudiante.equipo.nombre}
                          </div>
                        </div>
                      </div>
                      <UserCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Ausentes */}
              {estudiantesAusentes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <UserX className="w-4 h-4 text-gray-500" />
                    <h4 className="text-sm font-bold text-gray-500">
                      Ausentes ({estudiantesAusentes.length})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {estudiantesAusentes.map((estudiante) => (
                      <div
                        key={estudiante.id}
                        className="bg-slate-800/50 rounded-xl p-3 border border-slate-700 flex items-center gap-3 opacity-50"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-600">
                          <img
                            src={`https://api.dicebear.com/7.x/${estudiante.avatar_url}/svg?seed=${estudiante.id}`}
                            alt={estudiante.nombre}
                            className="w-full h-full object-cover grayscale"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-400 truncate">
                            {estudiante.nombre} {estudiante.apellido}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            No conectado
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Botón Asignar Insignias */}
            <div className="flex-shrink-0 p-4 border-t-2 border-purple-500/30">
              <button
                onClick={() => setShowInsigniaModal(true)}
                disabled={estudiantesConectados.length === 0}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Award className="w-5 h-5" />
                <span>Asignar Insignia</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Área Principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-slate-800 to-slate-900 border-b-2 border-purple-500/30 px-4 py-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!showPanel && (
                <button
                  onClick={() => setShowPanel(true)}
                  className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-all"
                >
                  <Users className="w-5 h-5 text-purple-400" />
                </button>
              )}

              <button
                onClick={handleSalir}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-semibold hidden md:inline">Finalizar clase</span>
              </button>

              <div className="h-8 w-px bg-purple-500/30" />

              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: clase.rutaCurricular.color }}
                />
                <div>
                  <h1 className="text-white font-bold text-lg">
                    {clase.rutaCurricular.nombre} - {clase.grupo.nombre}
                  </h1>
                  <p className="text-gray-400 text-sm">
                    Vista Docente
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-gray-300">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-semibold hidden md:inline">
                  {formatTiempo(tiempoTranscurrido)}
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
              background: '#1a1a2e',
            }}
          />
        </div>
      </div>

      {/* Modal Asignar Insignia */}
      {showInsigniaModal && (
        <ModalAsignarInsignia
          estudiantes={estudiantesConectados}
          claseId={claseId}
          onClose={() => setShowInsigniaModal(false)}
          onInsigniaAsignada={() => {
            console.log('Insignia asignada exitosamente');
          }}
        />
      )}
    </div>
  );
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}
