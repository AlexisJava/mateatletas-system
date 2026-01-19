'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { gamificacionApi } from '@/lib/api/gamificacion.api';
import { estudiantesApi, type MiPlan } from '@/lib/api/estudiantes.api';
import Link from 'next/link';
import {
  Compass,
  Gamepad2,
  GraduationCap,
  Rocket,
  Flame,
  ChevronRight,
  Zap,
  LogOut,
  Lock,
  Video,
  Sparkles,
  Play,
  Crown,
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import FloatingLines from '@/components/ui/FloatingLines';
import { RankingCasa } from '@/components/estudiante/RankingCasa';

interface DashboardData {
  nivel: number;
  xp: number;
  xpSiguienteNivel: number;
  racha: number;
  proximaClase: {
    tipo: string;
    fecha_hora_inicio: string;
    docente: { nombre: string; apellido: string };
    link_meet?: string | null;
  } | null;
  plan: MiPlan | null;
}

export default function EstudianteDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = async () => {
    await logout();
    router.push('/estudiante-login');
  };

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;

      try {
        const [recursos, proximaClase, miPlan] = await Promise.all([
          gamificacionApi.obtenerRecursos(user.id).catch(() => null),
          estudiantesApi.getProximaClase().catch(() => null),
          estudiantesApi.getMiPlan().catch(() => null),
        ]);

        setData({
          nivel: recursos?.nivel_actual ?? user.nivel_actual ?? 1,
          xp: recursos?.xp_actual ?? user.puntos_totales ?? 0,
          xpSiguienteNivel: recursos?.xp_siguiente_nivel ?? 100,
          racha: recursos?.racha?.dias_consecutivos ?? 0,
          proximaClase,
          plan: miPlan,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setData({
          nivel: user.nivel_actual ?? 1,
          xp: user.puntos_totales ?? 0,
          xpSiguienteNivel: 100,
          racha: 0,
          proximaClase: null,
          plan: null,
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user?.id, user?.nivel_actual, user?.puntos_totales]);

  const tieneAccesoClases = data?.plan?.acceso_clases_vivo ?? false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #f472b6 0%, #c026d3 50%, #7c3aed 100%)',
              boxShadow: '0 8px 32px rgba(192,38,211,0.5)',
            }}
          >
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-white/70 text-lg font-bold">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070711] text-white flex flex-col relative overflow-hidden">
      {/* FloatingLines Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <FloatingLines
          linesGradient={['#ff6b9d', '#c44cff', '#6b5bff', '#00d4ff']}
          animationSpeed={0.1}
          interactive={false}
          parallax={false}
        />
      </div>

      {/* Gradient orbs sutiles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <header className="w-full px-4 lg:px-8 py-4 relative z-10 shrink-0">
        <div className="max-w-7xl mx-auto">
          <div
            className="flex items-center justify-between gap-4 px-5 py-3 rounded-2xl"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            {/* Logo + Avatar */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="/estudiante" className="flex items-center gap-2.5 group">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #f472b6 0%, #c026d3 50%, #7c3aed 100%)',
                    boxShadow:
                      '0 4px 20px rgba(192,38,211,0.5), inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.2)',
                  }}
                >
                  <span className="text-xl font-black text-white">M</span>
                </div>
              </Link>

              {/* Casa badge - usa variables CSS dinámicas */}
              {user?.casa && (
                <div
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                  style={{
                    background: 'var(--casa-gradient)',
                    boxShadow: `0 2px 10px var(--casa-glow), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.1)`,
                  }}
                >
                  <span className="text-white">{user.casa.nombre}</span>
                </div>
              )}

              {/* Avatar */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-black text-white"
                    style={{
                      background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
                      boxShadow:
                        '0 4px 16px rgba(59,130,246,0.4), inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.2)',
                    }}
                  >
                    {user?.nombre?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  {/* Badge de nivel */}
                  <div
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black text-white"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-xp) 0%, #f59e0b 100%)',
                      boxShadow: '0 2px 8px rgba(251,191,36,0.5)',
                    }}
                  >
                    {data?.nivel ?? 1}
                  </div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-base font-bold text-white flex items-center gap-1.5">
                    ¡Hola, {user?.nombre}!
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </h1>
                  <p className="text-white/50 text-xs font-medium">Exploremos juntos</p>
                </div>
              </div>
            </div>

            {/* Stats Pills - Los colores que te gustan */}
            <div className="flex items-center gap-2">
              <CandyPill
                icon={<Crown className="w-4 h-4" />}
                value={data?.nivel ?? 1}
                label="Nivel"
                colors={['var(--color-xp)', '#f59e0b', '#d97706']}
              />
              <CandyPill
                icon={<Zap className="w-4 h-4" />}
                value={data?.xp ?? 0}
                label="XP"
                colors={['#a855f7', '#7c3aed', '#6366f1']}
              />
              <CandyPill
                icon={<Flame className="w-4 h-4" />}
                value={`${Math.max(data?.racha ?? 1, 1)}d`}
                label="Racha"
                colors={['#f43f5e', '#ec4899', '#db2777']}
              />

              <button
                onClick={handleLogout}
                className="ml-1 p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-white/50 hover:text-rose-400 transition-all"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-6 pt-2">
        <div className="max-w-7xl w-full space-y-4 relative z-10">
          {/* Live Class Banner */}
          {tieneAccesoClases && data?.proximaClase && (
            <LiveBanner
              docente={data.proximaClase.docente}
              linkMeet={data.proximaClase.link_meet}
            />
          )}

          {/* Bento Grid - Simétrico */}
          <div className="space-y-4">
            {/* Fila superior: 3 cards iguales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CandyCard
                href="/estudiante/explorar"
                title="Explorar"
                subtitle="Mapa del Conocimiento"
                icon={<Compass className="w-8 h-8 text-white" />}
                colors={['#f472b6', '#c026d3', '#7c3aed']}
              />
              <CandyCard
                href="/estudiante/jugar"
                title="Jugar"
                subtitle="Arcade Zone"
                icon={<Gamepad2 className="w-8 h-8 text-white" />}
                colors={['#06b6d4', '#14b8a6', '#10b981']}
              />
              <CandyCard
                href="/estudiante/progreso"
                title="Mi Progreso"
                subtitle="Tu viaje épico"
                icon={<Rocket className="w-8 h-8 text-white" />}
                colors={['#10b981', 'var(--color-correct)', '#84cc16']}
                extraContent={
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-white/80 font-bold">Nivel {data?.nivel ?? 1}</span>
                      <span className="text-white/50">
                        {data?.xp ?? 0}/{data?.xpSiguienteNivel ?? 100} XP
                      </span>
                    </div>
                    <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(((data?.xp ?? 0) / (data?.xpSiguienteNivel ?? 100)) * 100, 100)}%`,
                          background:
                            'linear-gradient(90deg, #10b981, var(--color-correct), #84cc16)',
                        }}
                      />
                    </div>
                  </div>
                }
              />
            </div>

            {/* Fila inferior: Ranking + Clases (50/50) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ranking por Casa - Top 3 */}
              {user?.casa && <RankingCasa estudianteId={user.id} />}

              {/* Clases */}
              <ClasesCard
                href="/estudiante/clases"
                proximaClase={data?.proximaClase}
                tieneAcceso={tieneAccesoClases}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CANDY PILL - Los botones de stats que te gustan
// ============================================================================
function CandyPill({
  icon,
  value,
  label,
  colors,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  colors: [string, string, string];
}) {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-bold"
      style={{
        background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`,
        boxShadow: `0 4px 16px ${colors[0]}60, inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.15)`,
      }}
    >
      {icon}
      <span className="font-black">{value}</span>
      <span className="text-white/80 text-xs font-semibold hidden lg:inline">{label}</span>
    </div>
  );
}

// ============================================================================
// LIVE BANNER
// ============================================================================
function LiveBanner({
  docente,
  linkMeet,
}: {
  docente: { nombre: string; apellido: string };
  linkMeet?: string | null;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background:
          'linear-gradient(135deg, var(--color-incorrect) 0%, #f97316 50%, var(--color-xp) 100%)',
        boxShadow:
          '0 8px 32px rgba(239,68,68,0.4), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.15)',
      }}
    >
      <div className="relative flex items-center gap-4">
        {/* Live icon */}
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          <Video className="w-7 h-7 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-black rounded-lg bg-white/20">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              EN VIVO
            </span>
          </div>
          <h3 className="text-xl font-bold text-white">
            Clase con {docente.nombre} {docente.apellido}
          </h3>
          <p className="text-white/80 text-sm font-medium">Tu clase está comenzando ahora</p>
        </div>

        <Link
          href={linkMeet || '/estudiante/clases'}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-orange-600 bg-white hover:bg-white/90 transition-all shrink-0"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
        >
          <Play className="w-5 h-5" />
          Entrar ahora
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// CANDY CARD - Cards con el estilo candy como los pills
// ============================================================================
function CandyCard({
  href,
  title,
  subtitle,
  description,
  icon,
  colors,
  featured = false,
  extraContent,
}: {
  href: string;
  title: string;
  subtitle: string;
  description?: string;
  icon: React.ReactNode;
  colors: [string, string, string];
  featured?: boolean;
  extraContent?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-3xl p-6 transition-transform hover:scale-[1.02] active:scale-[0.98] flex flex-col ${featured ? 'h-full min-h-[500px]' : 'h-[240px]'}`}
      style={{
        background: `linear-gradient(145deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`,
        boxShadow: `0 8px 32px ${colors[0]}50, inset 0 2px 0 rgba(255,255,255,0.25), inset 0 -3px 0 rgba(0,0,0,0.15)`,
      }}
    >
      {/* Shine effect */}
      <div
        className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
          borderRadius: '24px 24px 0 0',
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col h-full">
        {/* Icon */}
        <div
          className={`${featured ? 'w-20 h-20' : 'w-14 h-14'} rounded-2xl bg-white/20 flex items-center justify-center mb-auto`}
          style={{
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.1)',
          }}
        >
          {icon}
        </div>

        {/* Extra content */}
        {extraContent}

        {/* Text */}
        <div className="mt-auto">
          <h2 className={`font-black text-white ${featured ? 'text-3xl' : 'text-2xl'} mb-1`}>
            {title}
          </h2>
          <p className={`text-white/80 font-semibold ${featured ? 'text-lg' : 'text-sm'}`}>
            {subtitle}
          </p>
          {description && featured && <p className="text-white/60 text-sm mt-2">{description}</p>}
        </div>

        {/* Arrow */}
        <div
          className={`absolute ${featured ? 'bottom-6 right-6 w-12 h-12' : 'bottom-5 right-5 w-10 h-10'} rounded-xl bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-1`}
        >
          <ChevronRight className={`${featured ? 'w-6 h-6' : 'w-5 h-5'} text-white`} />
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// CLASES CARD - Con estado bloqueado/desbloqueado
// ============================================================================
function ClasesCard({
  href,
  proximaClase,
  tieneAcceso,
}: {
  href: string;
  proximaClase: DashboardData['proximaClase'] | undefined;
  tieneAcceso: boolean;
}) {
  // CARD BLOQUEADA
  if (!tieneAcceso) {
    return (
      <div
        className="relative overflow-hidden rounded-3xl p-6 h-[310px] flex flex-col"
        style={{
          background: 'linear-gradient(145deg, #64748b 0%, #475569 50%, #334155 100%)',
          boxShadow:
            '0 8px 32px rgba(100,116,139,0.3), inset 0 2px 0 rgba(255,255,255,0.1), inset 0 -3px 0 rgba(0,0,0,0.15)',
          opacity: 0.7,
        }}
      >
        {/* Shine */}
        <div
          className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
            borderRadius: '24px 24px 0 0',
          }}
        />

        <div className="relative flex flex-col h-full">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-auto">
            <Lock className="w-7 h-7 text-white/60" />
          </div>

          <div className="mt-auto">
            <h2 className="text-2xl font-black text-white/60 mb-1">Clases</h2>
            <p className="text-white/40 text-sm font-semibold">Tu aula virtual</p>
          </div>
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-3xl">
          <div
            className="text-center px-6 py-4 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, var(--color-xp) 0%, #f59e0b 50%, #d97706 100%)',
              boxShadow:
                '0 8px 32px rgba(251,191,36,0.4), inset 0 2px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.15)',
            }}
          >
            <Lock className="w-6 h-6 text-white mx-auto mb-2" />
            <p className="text-white/90 text-sm font-bold">Desbloquea con</p>
            <p className="text-white text-lg font-black">STEAM Sincrónico</p>
          </div>
        </div>
      </div>
    );
  }

  // CARD DESBLOQUEADA - Colores amber/naranja
  const subtitle = proximaClase ? `Próxima con ${proximaClase.docente.nombre}` : 'Tu aula virtual';

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-3xl p-6 h-[310px] transition-transform hover:scale-[1.02] active:scale-[0.98] flex flex-col"
      style={{
        background: 'linear-gradient(145deg, var(--color-xp) 0%, #f59e0b 50%, #ea580c 100%)',
        boxShadow:
          '0 8px 32px rgba(251,146,60,0.4), inset 0 2px 0 rgba(255,255,255,0.25), inset 0 -3px 0 rgba(0,0,0,0.15)',
      }}
    >
      {/* Shine effect */}
      <div
        className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
          borderRadius: '24px 24px 0 0',
        }}
      />

      <div className="relative flex flex-col h-full">
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-auto"
          style={{
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <GraduationCap className="w-8 h-8 text-white" />
        </div>

        {/* Badge si hay clase */}
        {proximaClase && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-white/20 mb-3 self-start">
            <Video className="w-3.5 h-3.5" />
            Clase programada
          </div>
        )}

        {/* Text */}
        <div className="mt-auto">
          <h2 className="text-2xl font-black text-white mb-1">Clases</h2>
          <p className="text-white/80 text-sm font-semibold">{subtitle}</p>
        </div>

        {/* Arrow */}
        <div className="absolute bottom-5 right-5 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-1">
          <ChevronRight className="w-5 h-5 text-white" />
        </div>
      </div>
    </Link>
  );
}
