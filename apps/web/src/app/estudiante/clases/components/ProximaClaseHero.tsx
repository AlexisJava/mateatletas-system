'use client';

import { useState, useCallback } from 'react';
import {
  Play,
  Clock,
  MapPin,
  ExternalLink,
  Video,
  Rocket,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import type { ClaseEstudiante } from '@/lib/api/estudiantes.api';
import { estudiantesApi } from '@/lib/api/estudiantes.api';

interface ProximaClaseHeroProps {
  clase: ClaseEstudiante | null;
}

const esHoy = (fechaStr: string): boolean => {
  const fecha = new Date(fechaStr);
  const hoy = new Date();
  return fecha.toDateString() === hoy.toDateString();
};

export function ProximaClaseHero({ clase }: ProximaClaseHeroProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [errorAcceso, setErrorAcceso] = useState<string | null>(null);

  /**
   * Validar acceso antes de entrar a la clase
   * Llama a puedeEntrarClase() y solo navega si tiene permiso
   */
  const handleEntrarClase = useCallback(async () => {
    if (!clase?.link_meet) return;

    setIsValidating(true);
    setErrorAcceso(null);

    try {
      // Determinar si es clase grupal o comisión
      const claseGrupoId = clase.tipo !== 'comision' ? clase.id : undefined;
      const comisionId = clase.tipo === 'comision' ? clase.comision_id : undefined;

      const resultado = await estudiantesApi.puedeEntrarClase(claseGrupoId, comisionId);

      if (resultado.puedeEntrar) {
        // Puede entrar → abrir link
        window.open(clase.link_meet, '_blank', 'noopener,noreferrer');
      } else {
        // No puede entrar → mostrar mensaje
        setErrorAcceso(resultado.mensaje);
      }
    } catch (error) {
      console.error('Error al validar acceso a clase:', error);
      setErrorAcceso('Error al verificar acceso. Intentá de nuevo.');
    } finally {
      setIsValidating(false);
    }
  }, [clase]);

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
            {/* Live badge */}
            {claseEsHoy && (
              <span
                className="flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                  boxShadow: '0 4px 16px rgba(239,68,68,0.4)',
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
              <MapPin className="w-3 h-3" /> Canal Principal
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
              background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Próxima Clase
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
            {clase.link_meet ? (
              <button
                onClick={handleEntrarClase}
                disabled={isValidating}
                className="group relative flex-1 sm:flex-none disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div
                  className="absolute inset-0 rounded-xl blur-sm opacity-50 group-hover:opacity-70 transition"
                  style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ef4444 100%)',
                  }}
                />
                <div
                  className="relative flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider text-white transition transform hover:-translate-y-0.5 disabled:hover:translate-y-0"
                  style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ef4444 100%)',
                    boxShadow: '0 8px 32px rgba(251,146,60,0.4)',
                  }}
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" fill="white" />
                      Acceder a Clase
                      <ExternalLink className="w-4 h-4" />
                    </>
                  )}
                </div>
              </button>
            ) : (
              <div
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-white/50"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <Video className="w-5 h-5" />
                Link pronto disponible
              </div>
            )}

            {/* Error de acceso */}
            {errorAcceso && (
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                style={{
                  background: 'rgba(239,68,68,0.2)',
                  border: '1px solid rgba(239,68,68,0.4)',
                }}
              >
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-red-300">{errorAcceso}</span>
              </div>
            )}

            {/* Countdown */}
            <div
              className="px-6 py-4 rounded-xl flex flex-col items-center justify-center leading-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <span className="text-[9px] text-white/50 font-bold uppercase mb-1">Inicia en</span>
              <span className="text-sm font-black font-mono tracking-wider text-white">
                {claseEsHoy ? '00:15:30' : clase.dia_nombre}
              </span>
            </div>
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
