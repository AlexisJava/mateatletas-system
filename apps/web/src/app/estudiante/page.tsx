'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { gamificacionApi } from '@/lib/api/gamificacion.api';
import { estudiantesApi } from '@/lib/api/estudiantes.api';
import Link from 'next/link';
import {
  Compass,
  Gamepad2,
  GraduationCap,
  Rocket,
  Flame,
  Star,
  Sparkles,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface DashboardData {
  nivel: number;
  xp: number;
  xpSiguienteNivel: number;
  racha: number;
  proximaClase: {
    tipo: string;
    fecha_hora_inicio: string;
    docente: { nombre: string; apellido: string };
  } | null;
}

export default function EstudianteDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;

      try {
        const [recursos, proximaClase] = await Promise.all([
          gamificacionApi.obtenerRecursos(user.id).catch(() => null),
          estudiantesApi.getProximaClase().catch(() => null),
        ]);

        setData({
          nivel: recursos?.nivel_actual ?? user.nivel_actual ?? 1,
          xp: recursos?.xp_actual ?? user.puntos_totales ?? 0,
          xpSiguienteNivel: recursos?.xp_siguiente_nivel ?? 100,
          racha: recursos?.racha?.dias_consecutivos ?? 0,
          proximaClase,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Usar datos del usuario como fallback
        setData({
          nivel: user.nivel_actual ?? 1,
          xp: user.puntos_totales ?? 0,
          xpSiguienteNivel: 100,
          racha: 0,
          proximaClase: null,
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user?.id, user?.nivel_actual, user?.puntos_totales]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Preparando tu aventura...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0a0a1a] text-white flex flex-col relative overflow-hidden">
      {/* Fondo de estrellas animado */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="stars-layer stars-small" />
        <div className="stars-layer stars-medium" />
        <div className="stars-layer stars-large" />
        {/* Gradiente sutil */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-transparent to-indigo-950/20" />
      </div>

      <style jsx>{`
        .stars-layer {
          position: absolute;
          inset: 0;
          background-repeat: repeat;
          animation: twinkle 8s ease-in-out infinite;
        }
        .stars-small {
          background-image:
            radial-gradient(1px 1px at 20px 30px, white, transparent),
            radial-gradient(1px 1px at 40px 70px, rgba(255, 255, 255, 0.8), transparent),
            radial-gradient(1px 1px at 50px 160px, rgba(255, 255, 255, 0.6), transparent),
            radial-gradient(1px 1px at 90px 40px, white, transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(255, 255, 255, 0.7), transparent),
            radial-gradient(1px 1px at 160px 120px, white, transparent),
            radial-gradient(1px 1px at 200px 50px, rgba(255, 255, 255, 0.5), transparent),
            radial-gradient(1px 1px at 220px 140px, rgba(255, 255, 255, 0.8), transparent),
            radial-gradient(1px 1px at 260px 90px, white, transparent),
            radial-gradient(1px 1px at 300px 170px, rgba(255, 255, 255, 0.6), transparent);
          background-size: 320px 200px;
          opacity: 0.4;
        }
        .stars-medium {
          background-image:
            radial-gradient(1.5px 1.5px at 100px 50px, white, transparent),
            radial-gradient(1.5px 1.5px at 200px 150px, rgba(255, 255, 255, 0.9), transparent),
            radial-gradient(1.5px 1.5px at 300px 100px, white, transparent),
            radial-gradient(1.5px 1.5px at 50px 180px, rgba(255, 255, 255, 0.7), transparent),
            radial-gradient(1.5px 1.5px at 350px 30px, white, transparent);
          background-size: 400px 220px;
          opacity: 0.3;
          animation-delay: 2s;
          animation-duration: 10s;
        }
        .stars-large {
          background-image:
            radial-gradient(2px 2px at 150px 80px, rgba(167, 139, 250, 0.8), transparent),
            radial-gradient(2px 2px at 350px 200px, rgba(139, 92, 246, 0.7), transparent),
            radial-gradient(2px 2px at 250px 50px, rgba(196, 181, 253, 0.6), transparent);
          background-size: 500px 280px;
          opacity: 0.5;
          animation-delay: 4s;
          animation-duration: 12s;
        }
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>

      {/* Header fijo arriba */}
      <header className="max-w-5xl w-full mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3 relative z-10 shrink-0">
        <div>
          <h1 className="text-2xl font-black">
            ¡Hola, {user?.nombre}! <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Exploremos el universo juntos</p>
        </div>

        {/* Stats Pills */}
        <div className="flex gap-2">
          <StatPill
            icon={<Star className="w-4 h-4" />}
            label="Nivel"
            value={data?.nivel ?? 1}
            gradient="from-amber-500 to-orange-600"
          />
          <StatPill
            icon={<Zap className="w-4 h-4" />}
            label="XP"
            value={data?.xp ?? 0}
            gradient="from-violet-500 to-purple-600"
          />
          <StatPill
            icon={<Flame className="w-4 h-4" />}
            label="Racha"
            value={`${data?.racha ?? 0}d`}
            gradient="from-rose-500 to-red-600"
          />
        </div>
      </header>

      {/* Contenido centrado verticalmente */}
      <div className="flex-1 flex items-center justify-center px-4 pb-6">
        <div className="max-w-5xl w-full space-y-6 relative z-10">
          {/* Event Banner */}
          <EventBanner />

          {/* Bento Grid - Layout fijo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Columna izquierda: Explorar (card grande) */}
            <BentoCard
              href="/estudiante/explorar"
              title="Explorar"
              subtitle="Mapa del Conocimiento"
              icon={<Compass className="w-10 h-10" />}
              gradient="from-violet-600 via-purple-600 to-indigo-700"
              className="h-[400px]"
              featured
            />

            {/* Columna derecha: 3 cards apiladas */}
            <div className="flex flex-col gap-4">
              {/* Fila superior: Jugar y Mi Viaje */}
              <div className="grid grid-cols-2 gap-4">
                <BentoCard
                  href="/estudiante/jugar"
                  title="Jugar"
                  subtitle="Arcade Zone"
                  icon={<Gamepad2 className="w-7 h-7" />}
                  gradient="from-cyan-500 via-blue-500 to-blue-600"
                  className="h-[190px]"
                />
                <BentoCard
                  href="/estudiante/progreso"
                  title="Mi Viaje"
                  subtitle="Tu progreso"
                  icon={<Rocket className="w-7 h-7" />}
                  gradient="from-emerald-500 via-green-500 to-teal-600"
                  className="h-[190px]"
                />
              </div>

              {/* Fila inferior: Clases (ancho completo) */}
              <BentoCard
                href="/estudiante/clases"
                title="Clases"
                subtitle={
                  data?.proximaClase
                    ? `Próxima con ${data.proximaClase.docente.nombre}`
                    : 'Tu aula virtual'
                }
                icon={<GraduationCap className="w-7 h-7" />}
                gradient="from-amber-500 via-orange-500 to-red-500"
                className="h-[190px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  gradient: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${gradient} text-white text-sm font-semibold shadow-lg`}
    >
      {icon}
      <span className="hidden sm:inline text-white/80">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

function EventBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-900/80 via-purple-800/80 to-indigo-900/80 border border-violet-500/30 p-4">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl" />

      <div className="relative flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shrink-0">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="inline-block px-2 py-0.5 text-xs font-bold bg-violet-500/30 text-violet-200 rounded-full mb-1">
            NUEVA EXHIBICIÓN
          </span>
          <h3 className="text-lg font-bold text-white">Aventura Matemática</h3>
          <p className="text-sm text-violet-200/80 hidden sm:block">
            Descubre los secretos de los números
          </p>
        </div>

        <Link
          href="/estudiante/explorar"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-violet-900 font-bold rounded-xl hover:bg-violet-100 transition-all shadow-lg hover:scale-105 active:scale-95 shrink-0"
        >
          Ver ahora
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function BentoCard({
  href,
  title,
  subtitle,
  icon,
  gradient,
  className = '',
  featured = false,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  className?: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        group relative overflow-hidden rounded-2xl
        bg-gradient-to-br ${gradient}
        p-5
        transition-all duration-300
        hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-500/20
        active:scale-[0.98]
        ${className}
      `}
    >
      {/* Glow effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300`}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between">
        <div
          className={`
          ${featured ? 'w-16 h-16' : 'w-12 h-12'}
          rounded-xl bg-white/20 backdrop-blur-sm
          flex items-center justify-center
          group-hover:scale-110 transition-transform duration-300
          shadow-lg
        `}
        >
          {icon}
        </div>

        <div className="mt-auto">
          <h2 className={`font-black ${featured ? 'text-2xl' : 'text-xl'}`}>{title}</h2>
          <p className={`text-white/70 ${featured ? 'text-base' : 'text-sm'} mt-1`}>{subtitle}</p>
        </div>

        {/* Arrow indicator */}
        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
