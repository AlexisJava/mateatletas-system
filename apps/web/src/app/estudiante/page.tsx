'use client';

import { useEffect, useState, useRef } from 'react';
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
  LogOut,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import FloatingLines from '@/components/ui/FloatingLines';
import { animate, stagger } from 'animejs';

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
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const handleLogout = async () => {
    await logout();
    router.push('/estudiante-login');
  };

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

  // Animaciones de entrada con anime.js - sin flash
  useEffect(() => {
    if (isLoading || hasAnimated.current) return;
    hasAnimated.current = true;

    // Pequeño delay para asegurar que el DOM esté listo
    requestAnimationFrame(() => {
      // Animar header - slide sutil desde arriba
      animate('.header-animate', {
        translateY: [-15, 0],
        duration: 500,
        ease: 'outQuad',
      });

      // Animar stats pills con rebote sutil
      animate('.stat-pill-animate', {
        scale: [0.95, 1],
        delay: stagger(60, { start: 100 }),
        duration: 400,
        ease: 'outBack',
      });

      // Animar event banner - slide desde abajo
      animate('.event-banner-animate', {
        translateY: [20, 0],
        duration: 500,
        delay: 150,
        ease: 'outQuad',
      });

      // Animar bento cards con stagger - efecto de aparición elegante
      const cards = containerRef.current?.querySelectorAll('.bento-card-animate');
      if (cards) {
        animate(cards, {
          translateY: [30, 0],
          scale: [0.97, 1],
          delay: stagger(80, { start: 200 }),
          duration: 600,
          ease: 'outQuad',
        });
      }
    });
  }, [isLoading]);

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
    <div className="min-h-screen bg-[#030014] text-white flex flex-col relative overflow-hidden">
      {/* Fondo FloatingLines - sin interacción */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingLines
          linesGradient={['#E945F5', '#2F4BC0', '#E945F5']}
          animationSpeed={0.3}
          interactive={false}
          parallax={false}
        />
      </div>

      {/* Header premium integrado - full width */}
      <header className="header-animate w-full px-8 py-4 relative z-10 shrink-0 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between gap-4">
          {/* Logo + Saludo */}
          <div className="flex items-center gap-5">
            {/* Logo Mateatletas */}
            <Link href="/estudiante" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
                <span className="text-lg font-black text-white">M</span>
              </div>
              <span className="font-bold text-white hidden sm:inline">Mateatletas</span>
            </Link>

            {/* Divider */}
            <div className="h-8 w-px bg-white/10 hidden sm:block" />

            {/* Avatar y saludo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-violet-500 flex items-center justify-center text-lg font-black text-white shadow-lg shadow-purple-500/20">
                  {user?.nombre?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#030014]" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-white">¡Hola, {user?.nombre}!</h1>
                <p className="text-slate-400 text-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-violet-400" />
                  Exploremos el universo
                </p>
              </div>
            </div>
          </div>

          {/* Stats Pills + Logout */}
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <StatPill
                icon={<Star className="w-4 h-4" />}
                label="Nivel"
                value={data?.nivel ?? 1}
                gradient="from-amber-400 to-orange-500"
                glowColor="rgba(251, 191, 36, 0.3)"
                className="stat-pill-animate"
              />
              <StatPill
                icon={<Zap className="w-4 h-4" />}
                label="XP"
                value={data?.xp ?? 0}
                gradient="from-violet-400 to-purple-500"
                glowColor="rgba(167, 139, 250, 0.3)"
                className="stat-pill-animate"
              />
              <div className="stat-pill-animate">
                <RachaFlame value={Math.max(data?.racha ?? 1, 1)} />
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="stat-pill-animate p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Contenido centrado verticalmente */}
      <div className="flex-1 flex items-center justify-center px-6 pb-6">
        <div ref={containerRef} className="max-w-6xl w-full space-y-6 relative z-10">
          {/* Event Banner */}
          <EventBanner />

          {/* Bento Grid - Layout fijo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Columna izquierda: Explorar (card grande) */}
            <BentoCard
              href="/estudiante/explorar"
              title="Explorar"
              subtitle="Mapa del Conocimiento"
              icon={<Compass className="w-12 h-12" />}
              accentColor="#a855f7"
              className="h-[560px] bento-card-animate"
              featured
            />

            {/* Columna derecha: 3 cards apiladas */}
            <div className="flex flex-col gap-5">
              {/* Fila superior: Jugar y Mi Viaje */}
              <div className="grid grid-cols-2 gap-5">
                <BentoCard
                  href="/estudiante/jugar"
                  title="Jugar"
                  subtitle="Arcade Zone"
                  icon={<Gamepad2 className="w-8 h-8" />}
                  accentColor="#06b6d4"
                  className="h-[265px] bento-card-animate"
                />
                <BentoCard
                  href="/estudiante/progreso"
                  title="Mi Viaje"
                  subtitle="Tu progreso"
                  icon={<Rocket className="w-8 h-8" />}
                  accentColor="#10b981"
                  className="h-[265px] bento-card-animate"
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
                icon={<GraduationCap className="w-8 h-8" />}
                accentColor="#f59e0b"
                className="h-[265px] bento-card-animate"
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
  glowColor,
  className = '',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  gradient: string;
  glowColor?: string;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${gradient} text-white text-sm font-bold transition-all hover:scale-105 ${className}`}
      style={{
        boxShadow: glowColor
          ? `0 4px 20px -2px ${glowColor}, 0 2px 8px -2px rgba(0,0,0,0.3)`
          : '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      {icon}
      <span className="hidden sm:inline text-white/90 font-medium">{label}</span>
      <span className="font-black">{value}</span>
    </div>
  );
}

function RachaFlame({ value }: { value: number }) {
  return (
    <div
      className="relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold transition-all hover:scale-110 overflow-visible group"
      style={{
        background: 'linear-gradient(135deg, #ff6b00 0%, #ff0000 50%, #ff4500 100%)',
        boxShadow:
          '0 0 20px 4px rgba(255, 100, 0, 0.6), 0 0 40px 8px rgba(255, 50, 0, 0.4), 0 0 60px 12px rgba(255, 0, 0, 0.2), inset 0 0 20px rgba(255, 200, 0, 0.3)',
        animation: 'glow-pulse 1.5s ease-in-out infinite',
      }}
    >
      {/* Llamas de fondo - más grandes y visibles */}
      <div className="absolute -inset-1 overflow-visible">
        {/* Llama izquierda */}
        <div
          className="absolute -top-3 left-2 w-4 h-8 rounded-full blur-[2px]"
          style={{
            background: 'linear-gradient(to top, #ff6600, #ffcc00, transparent)',
            animation: 'flame-dance 0.4s ease-in-out infinite alternate',
          }}
        />
        {/* Llama central grande */}
        <div
          className="absolute -top-5 left-1/2 -translate-x-1/2 w-6 h-10 rounded-full blur-[2px]"
          style={{
            background: 'linear-gradient(to top, #ff4400, #ff8800, #ffdd00, transparent)',
            animation: 'flame-dance 0.3s ease-in-out infinite alternate-reverse',
          }}
        />
        {/* Llama derecha */}
        <div
          className="absolute -top-4 right-2 w-5 h-9 rounded-full blur-[2px]"
          style={{
            background: 'linear-gradient(to top, #ff5500, #ffaa00, transparent)',
            animation: 'flame-dance 0.5s ease-in-out infinite alternate',
          }}
        />
        {/* Chispas */}
        <div
          className="absolute -top-6 left-4 w-2 h-2 rounded-full bg-yellow-300"
          style={{ animation: 'spark 0.8s ease-out infinite' }}
        />
        <div
          className="absolute -top-7 right-6 w-1.5 h-1.5 rounded-full bg-orange-300"
          style={{ animation: 'spark 1s ease-out infinite 0.3s' }}
        />
      </div>

      {/* Glow interior */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: 'radial-gradient(ellipse at bottom, rgba(255,200,0,0.4) 0%, transparent 70%)',
        }}
      />

      {/* Icono de llama animado */}
      <div className="relative z-10">
        <Flame
          className="w-5 h-5 text-yellow-300 drop-shadow-[0_0_8px_rgba(255,200,0,1)]"
          style={{
            animation: 'flame-icon 0.5s ease-in-out infinite',
            filter: 'drop-shadow(0 0 6px #ffcc00) drop-shadow(0 0 12px #ff6600)',
          }}
        />
      </div>

      <span className="hidden sm:inline text-yellow-100 font-semibold relative z-10 drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]">
        Racha
      </span>
      <span
        className="font-black relative z-10 text-lg"
        style={{
          color: '#fffacd',
          textShadow: '0 0 10px #ffcc00, 0 0 20px #ff6600, 0 0 30px #ff0000',
        }}
      >
        {value}d
      </span>

      {/* Animaciones */}
      <style jsx>{`
        @keyframes glow-pulse {
          0%,
          100% {
            box-shadow:
              0 0 20px 4px rgba(255, 100, 0, 0.6),
              0 0 40px 8px rgba(255, 50, 0, 0.4),
              0 0 60px 12px rgba(255, 0, 0, 0.2),
              inset 0 0 20px rgba(255, 200, 0, 0.3);
          }
          50% {
            box-shadow:
              0 0 30px 8px rgba(255, 100, 0, 0.8),
              0 0 60px 16px rgba(255, 50, 0, 0.5),
              0 0 90px 24px rgba(255, 0, 0, 0.3),
              inset 0 0 30px rgba(255, 200, 0, 0.5);
          }
        }
        @keyframes flame-dance {
          0% {
            transform: scaleY(1) scaleX(1) translateY(0);
            opacity: 0.8;
          }
          100% {
            transform: scaleY(1.2) scaleX(0.9) translateY(-3px);
            opacity: 1;
          }
        }
        @keyframes flame-icon {
          0%,
          100% {
            transform: scale(1) rotate(-5deg);
          }
          50% {
            transform: scale(1.1) rotate(5deg);
          }
        }
        @keyframes spark {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-15px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function EventBanner() {
  return (
    <div className="event-banner-animate relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-900/80 via-purple-800/80 to-indigo-900/80 border border-violet-500/30 p-4">
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
  accentColor,
  className = '',
  featured = false,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
  className?: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        group relative overflow-hidden rounded-2xl
        border border-white/10
        p-6
        transition-all duration-300 ease-out
        hover:border-white/20
        hover:scale-[1.02]
        active:scale-[0.98]
        ${className}
      `}
      style={{
        background: `linear-gradient(145deg, ${accentColor}90 0%, ${accentColor}60 30%, ${accentColor}40 60%, ${accentColor}30 100%)`,
        boxShadow: `0 20px 60px -10px ${accentColor}50, 0 8px 24px -6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.2)`,
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Borde superior con color */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}60)` }}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Icon */}
        <div
          className={`
            ${featured ? 'w-14 h-14' : 'w-12 h-12'}
            rounded-xl
            flex items-center justify-center
            mb-auto
          `}
          style={{
            background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)`,
            border: `1px solid ${accentColor}40`,
          }}
        >
          <div style={{ color: accentColor }}>{icon}</div>
        </div>

        {/* Text content */}
        <div className="mt-auto space-y-1">
          <h2
            className={`font-bold tracking-tight ${featured ? 'text-2xl' : 'text-xl'} text-white`}
          >
            {title}
          </h2>
          <p className={`text-white/50 ${featured ? 'text-sm' : 'text-xs'} font-medium`}>
            {subtitle}
          </p>
        </div>

        {/* Arrow - siempre visible */}
        <div
          className="absolute bottom-6 right-6 w-9 h-9 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1"
          style={{ background: `${accentColor}25`, border: `1px solid ${accentColor}40` }}
        >
          <ChevronRight className="w-5 h-5" style={{ color: accentColor }} />
        </div>
      </div>
    </Link>
  );
}
