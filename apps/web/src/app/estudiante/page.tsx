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
    <div className="min-h-screen bg-[#0a0a1a] text-white p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">
                ¡Hola, {user?.nombre}! <span className="inline-block animate-bounce">👋</span>
              </h1>
              <p className="text-slate-400 mt-1">Exploremos el universo juntos</p>
            </div>
          </div>

          {/* Stats Pills */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
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
              value={`${data?.racha ?? 0} días`}
              gradient="from-rose-500 to-red-600"
            />
          </div>
        </header>

        {/* Event Banner */}
        <EventBanner />

        {/* Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Explorar - Grande */}
          <BentoCard
            href="/estudiante/explorar"
            title="Explorar"
            subtitle="Mapa del Conocimiento"
            icon={<Compass className="w-8 h-8 sm:w-10 sm:h-10" />}
            gradient="from-violet-600 via-purple-600 to-indigo-700"
            className="col-span-2 row-span-2 min-h-[280px] sm:min-h-[320px]"
            featured
          />

          {/* Jugar */}
          <BentoCard
            href="/estudiante/jugar"
            title="Jugar"
            subtitle="Arcade Zone"
            icon={<Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8" />}
            gradient="from-cyan-500 via-blue-500 to-blue-600"
            className="min-h-[140px] sm:min-h-[152px]"
          />

          {/* Mi Viaje */}
          <BentoCard
            href="/estudiante/progreso"
            title="Mi Viaje"
            subtitle="Tu progreso"
            icon={<Rocket className="w-6 h-6 sm:w-8 sm:h-8" />}
            gradient="from-emerald-500 via-green-500 to-teal-600"
            className="min-h-[140px] sm:min-h-[152px]"
          />

          {/* Clases - Más ancha */}
          <BentoCard
            href="/estudiante/clases"
            title="Clases"
            subtitle={
              data?.proximaClase
                ? `Próxima con ${data.proximaClase.docente.nombre}`
                : 'Tu aula virtual'
            }
            icon={<GraduationCap className="w-6 h-6 sm:w-8 sm:h-8" />}
            gradient="from-amber-500 via-orange-500 to-red-500"
            className="col-span-2 min-h-[140px] sm:min-h-[152px]"
          />
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
      className={`inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r ${gradient} text-white text-sm font-semibold shadow-lg`}
    >
      {icon}
      <span className="hidden sm:inline text-white/80">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

function EventBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-900/80 via-purple-800/80 to-indigo-900/80 border border-violet-500/30 p-4 sm:p-6">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div>
            <span className="inline-block px-2 py-0.5 text-xs font-bold bg-violet-500/30 text-violet-200 rounded-full mb-1">
              NUEVA EXHIBICIÓN
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white">Aventura Matemática</h3>
            <p className="text-sm text-violet-200/80 hidden sm:block">
              Descubre los secretos de los números
            </p>
          </div>
        </div>

        <Link
          href="/estudiante/explorar"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-violet-900 font-bold rounded-xl hover:bg-violet-100 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
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
        group relative overflow-hidden rounded-2xl sm:rounded-3xl
        bg-gradient-to-br ${gradient}
        p-4 sm:p-6
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
          ${featured ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-10 h-10 sm:w-12 sm:h-12'}
          rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm
          flex items-center justify-center
          group-hover:scale-110 transition-transform duration-300
          shadow-lg
        `}
        >
          {icon}
        </div>

        <div className={featured ? 'mt-auto pt-6' : 'mt-auto pt-3'}>
          <h2 className={`font-black ${featured ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'}`}>
            {title}
          </h2>
          <p className={`text-white/70 ${featured ? 'text-base' : 'text-sm'} mt-1`}>{subtitle}</p>
        </div>

        {/* Arrow indicator */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
