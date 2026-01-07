'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Clock, MapPin, Video, Rocket, Loader2, AlertTriangle, Radio } from 'lucide-react';
import type { ClaseEstudiante } from '@/lib/api/estudiantes.api';
import { livekitApi } from '@/lib/api/livekit.api';
import type { EstadoClase } from '@mateatletas/contracts';

interface ProximaClaseHeroProps {
  clase: ClaseEstudiante | null;
}

const esHoy = (fechaStr: string): boolean => {
  const fecha = new Date(fechaStr);
  const hoy = new Date();
  return fecha.toDateString() === hoy.toDateString();
};

export function ProximaClaseHero({ clase }: ProximaClaseHeroProps) {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorAcceso, setErrorAcceso] = useState<string | null>(null);
  const [estadoClase, setEstadoClase] = useState<EstadoClase>(clase?.estado_clase || 'Programada');

  // Sincronizar estado cuando cambia la clase
  useEffect(() => {
    if (clase?.estado_clase) {
      setEstadoClase(clase.estado_clase);
    }
  }, [clase?.estado_clase]);

  // Polling para detectar cuando la clase pasa a EnVivo
  // Siempre activo si el estado es Programada (el docente puede iniciar cuando quiera)
  useEffect(() => {
    if (!clase) {
      console.log('[LiveKit Polling] No hay clase');
      return;
    }
    console.log(
      '[LiveKit Polling] Clase:',
      clase.id,
      'tipo:',
      clase.tipo,
      'estadoLocal:',
      estadoClase,
      'estadoClase:',
      clase.estado_clase,
    );

    if (estadoClase !== 'Programada') {
      console.log(
        '[LiveKit Polling] Clase no está Programada, no hacemos polling. Estado:',
        estadoClase,
      );
      return;
    }

    const checkEstado = async () => {
      try {
        console.log('[LiveKit Polling] Consultando estado para', clase.tipo, clase.id);
        // Usar endpoint correcto según tipo de clase
        const estado =
          clase.tipo === 'comision'
            ? await livekitApi.obtenerEstadoComision(clase.id)
            : await livekitApi.obtenerEstadoClase(clase.id);

        console.log('[LiveKit Polling] Respuesta:', estado);

        if (estado.estado_clase !== estadoClase) {
          console.log('[LiveKit Polling] ¡Estado cambió!', estadoClase, '->', estado.estado_clase);
          setEstadoClase(estado.estado_clase);
        }
      } catch (e) {
        console.error('[LiveKit Polling] Error:', e);
      }
    };

    // Polling cada 30 segundos
    const interval = setInterval(checkEstado, 30000);

    // Check inicial
    console.log('[LiveKit Polling] Iniciando check inicial...');
    checkEstado();

    return () => clearInterval(interval);
  }, [clase, estadoClase]);

  /**
   * Conectar a la clase en vivo via LiveKit
   */
  const handleEntrarClase = useCallback(async () => {
    if (!clase) return;

    // Validar que la clase esté en vivo
    if (estadoClase !== 'EnVivo') {
      setErrorAcceso('La clase aún no ha comenzado. Esperá a que el docente la inicie.');
      return;
    }

    setIsConnecting(true);
    setErrorAcceso(null);

    try {
      // Obtener token de LiveKit para estudiante
      // Usamos claseGrupoId o comisionId según el tipo
      const tokenData = await livekitApi.getTokenEstudiante(
        clase.tipo === 'comision' ? { comisionId: clase.id } : { claseGrupoId: clase.id },
      );

      // Navegar a la página de clase en vivo con los parámetros
      const params = new URLSearchParams({
        token: tokenData.token,
        wsUrl: tokenData.wsUrl,
        roomName: tokenData.roomName,
        nombreClase: clase.nombre,
        // Pasar IDs para el chat WebSocket
        ...(clase.tipo === 'comision' ? { comisionId: clase.id } : { claseGrupoId: clase.id }),
      });

      router.push(`/estudiante/clase-en-vivo?${params.toString()}`);
    } catch (error) {
      console.error('Error al conectar a clase:', error);
      if (error instanceof Error) {
        // Mensajes específicos según el error
        if (error.message.includes('inscri')) {
          setErrorAcceso('No estás inscrito en esta clase.');
        } else if (error.message.includes('permiso') || error.message.includes('plan')) {
          setErrorAcceso('Tu plan no incluye acceso a clases en vivo.');
        } else {
          setErrorAcceso(error.message);
        }
      } else {
        setErrorAcceso('Error al conectar. Verificá tu conexión e intentá de nuevo.');
      }
    } finally {
      setIsConnecting(false);
    }
  }, [clase, estadoClase, router]);

  if (!clase) {
    return (
      <div className="h-[300px] lg:h-[55%] relative rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-500/10" />
        <div className="absolute inset-[1px] rounded-2xl bg-[#0c0c1d]" />
        <div className="relative text-center p-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              boxShadow: '0 8px 32px rgba(168,85,247,0.4)',
            }}
          >
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">¡Tu aula te espera!</h2>
          <p className="text-white/50 max-w-md">
            Aún no estás inscrito en clases en vivo. Contacta a tu tutor para comenzar.
          </p>
        </div>
      </div>
    );
  }

  const claseEsHoy = esHoy(clase.fecha_proxima);
  const hora = clase.hora_inicio.slice(0, 5);
  const esEnVivo = estadoClase === 'EnVivo';
  const esFinalizada = estadoClase === 'Finalizada';
  const esComision = clase.tipo === 'comision';

  // Configuración del botón según estado
  const getBotonConfig = () => {
    if (isConnecting) {
      return {
        texto: 'Conectando...',
        disabled: true,
        gradiente: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        showPulse: false,
      };
    }

    if (esEnVivo) {
      return {
        texto: '🔴 UNIRSE EN VIVO',
        disabled: false,
        gradiente: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        showPulse: true,
      };
    }

    if (esFinalizada) {
      return {
        texto: 'Clase finalizada',
        disabled: true,
        gradiente: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
        showPulse: false,
      };
    }

    // Programada o comisión
    return {
      texto: claseEsHoy ? 'Esperando al docente...' : 'Clase programada',
      disabled: true,
      gradiente: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
      showPulse: false,
    };
  };

  const botonConfig = getBotonConfig();

  return (
    <div className="h-[300px] lg:h-[55%] relative group rounded-2xl overflow-hidden border border-white/10 shadow-2xl shrink-0">
      {/* Background image placeholder */}
      <div className="absolute inset-0">
        <div
          className="w-full h-full"
          style={{
            background: `linear-gradient(135deg,
              ${clase.sector?.color || '#f97316'}40 0%,
              #0c0c1d 50%,
              ${clase.sector?.color || '#f97316'}20 100%)`,
          }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070711] via-[#070711]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070711]/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
        {/* Top row */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 flex-wrap">
            {/* EN VIVO badge - Solo si está en vivo */}
            {esEnVivo && (
              <span
                className="flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase animate-pulse"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  boxShadow: '0 4px 16px rgba(239,68,68,0.5)',
                }}
              >
                <Radio className="w-3 h-3" />
                EN VIVO
              </span>
            )}
            {/* HOY badge */}
            {claseEsHoy && !esEnVivo && (
              <span
                className="flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase"
                style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                HOY
              </span>
            )}
            <span
              className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg text-white/80"
              style={{
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <MapPin className="w-3 h-3" /> {esComision ? 'Taller' : 'Canal Principal'}
            </span>
          </div>

          {/* Teacher badge */}
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-full cursor-pointer hover:border-amber-500/50 transition"
            style={{
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
              }}
            >
              {clase.docente.nombre.charAt(0)}
            </div>
            <div className="hidden sm:block">
              <p className="text-[9px] text-white/50 uppercase font-bold">Docente</p>
              <p className="text-xs font-bold text-white leading-none">
                {clase.docente.nombre} {clase.docente.apellido}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom content */}
        <div className="max-w-xl">
          {/* Sector badge */}
          {clase.sector && (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg mb-3"
              style={{
                background: `${clase.sector.color}20`,
                border: `1px solid ${clase.sector.color}40`,
              }}
            >
              <span className="text-sm">{clase.sector.icono}</span>
              <span className="text-xs font-bold" style={{ color: clase.sector.color }}>
                {clase.sector.nombre}
              </span>
            </div>
          )}

          <h4
            className="font-bold text-sm uppercase tracking-widest mb-2"
            style={{
              background: esEnVivo
                ? 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)'
                : 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {esEnVivo ? '¡Clase en Vivo!' : 'Próxima Clase'}
          </h4>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight mb-4 drop-shadow-2xl">
            {clase.nombre}
          </h1>

          {/* Info row */}
          <div className="flex items-center gap-4 mb-6 text-white/70 text-sm">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              {clase.dia_nombre} • {hora}
            </span>
            <span className="flex items-center gap-1.5">
              <Video className="w-4 h-4 text-violet-400" />
              {clase.duracion_minutos} min
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleEntrarClase}
              disabled={botonConfig.disabled}
              className="group relative flex-1 sm:flex-none disabled:cursor-not-allowed"
            >
              {/* Glow effect para EN VIVO */}
              {botonConfig.showPulse && (
                <div
                  className="absolute inset-0 rounded-xl blur-md opacity-60 animate-pulse"
                  style={{ background: botonConfig.gradiente }}
                />
              )}
              <div
                className={`relative flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider text-white transition transform ${
                  !botonConfig.disabled ? 'hover:-translate-y-0.5' : 'opacity-60'
                }`}
                style={{
                  background: botonConfig.gradiente,
                  boxShadow: botonConfig.showPulse
                    ? '0 8px 32px rgba(239,68,68,0.5)'
                    : '0 4px 16px rgba(0,0,0,0.3)',
                }}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {botonConfig.texto}
                  </>
                ) : (
                  <>
                    {esEnVivo && <Play className="w-5 h-5" fill="white" />}
                    {botonConfig.texto}
                  </>
                )}
              </div>
            </button>

            {/* Error de acceso */}
            {errorAcceso && (
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                style={{
                  background: 'rgba(239,68,68,0.2)',
                  border: '1px solid rgba(239,68,68,0.4)',
                }}
              >
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-red-300">{errorAcceso}</span>
              </div>
            )}

            {/* Estado indicator */}
            {!esEnVivo && !esFinalizada && claseEsHoy && (
              <div
                className="px-6 py-4 rounded-xl flex flex-col items-center justify-center leading-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <span className="text-[9px] text-white/50 font-bold uppercase mb-1">Estado</span>
                <span className="text-sm font-black font-mono tracking-wider text-amber-400">
                  {esComision ? 'Ver horario' : 'Esperando...'}
                </span>
              </div>
            )}

            {!claseEsHoy && (
              <div
                className="px-6 py-4 rounded-xl flex flex-col items-center justify-center leading-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <span className="text-[9px] text-white/50 font-bold uppercase mb-1">Próxima</span>
                <span className="text-sm font-black font-mono tracking-wider text-white">
                  {clase.dia_nombre}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shine effect */}
      <div
        className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}
