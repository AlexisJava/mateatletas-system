'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Rocket,
  Flame,
  Zap,
  Trophy,
  Crown,
  Calendar,
  Sparkles,
  Star,
  AlertCircle,
} from 'lucide-react';
import FloatingLines from '@/components/ui/FloatingLines';
import { animate } from 'animejs';
import {
  estudiantesApi,
  type MiProgreso,
  type LogroReciente,
  type ActividadReciente,
} from '@/lib/api/estudiantes.api';

// Colores por rareza de logro
const RAREZA_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  comun: {
    bg: 'from-slate-500 to-slate-600',
    border: 'border-slate-400/30',
    glow: 'rgba(148,163,184,0.3)',
  },
  raro: {
    bg: 'from-blue-500 to-blue-600',
    border: 'border-blue-400/30',
    glow: 'rgba(59,130,246,0.4)',
  },
  epico: {
    bg: 'from-purple-500 to-purple-600',
    border: 'border-purple-400/30',
    glow: 'rgba(168,85,247,0.4)',
  },
  legendario: {
    bg: 'from-amber-500 to-orange-600',
    border: 'border-amber-400/30',
    glow: 'rgba(251,191,36,0.5)',
  },
};

function formatFechaRelativa(fecha: Date): string {
  const ahora = new Date();
  const diff = ahora.getTime() - fecha.getTime();
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (dias === 0) return 'Hoy';
  if (dias === 1) return 'Ayer';
  if (dias < 7) return `Hace ${dias} días`;
  if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`;
  return `Hace ${Math.floor(dias / 30)} meses`;
}

function getTipoIcon(tipo: string) {
  switch (tipo) {
    case 'LECCION_COMPLETADA':
    case 'CLASE_COMPLETADA':
      return <Sparkles className="w-4 h-4" />;
    case 'TAREA_COMPLETADA':
    case 'TAREA_PERFECTA':
      return <Star className="w-4 h-4" />;
    case 'LOGRO_DESBLOQUEADO':
      return <Trophy className="w-4 h-4" />;
    case 'NIVEL_SUBIDO':
      return <Crown className="w-4 h-4" />;
    case 'RACHA_EXTENDIDA':
      return <Flame className="w-4 h-4" />;
    default:
      return <Zap className="w-4 h-4" />;
  }
}

export default function ProgresoPage() {
  const [data, setData] = useState<MiProgreso | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const progreso = await estudiantesApi.getMiProgreso();
        setData(progreso);
      } catch (err) {
        console.error('Error al cargar progreso:', err);
        setError('No pudimos cargar tu progreso. Intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (hasAnimated.current || isLoading || error) return;
    hasAnimated.current = true;

    requestAnimationFrame(() => {
      // Animar header
      animate('.header-animate', {
        translateY: [-15, 0],
        duration: 500,
        ease: 'outQuad',
      });

      // Animar stats
      animate('.stat-animate', {
        scale: [0.9, 1],
        translateY: [20, 0],
        duration: 500,
        delay: (_el: Element, i: number) => 100 + i * 80,
        ease: 'outBack',
      });

      // Animar cards
      animate('.card-animate', {
        translateY: [30, 0],
        duration: 600,
        delay: (_el: Element, i: number) => 300 + i * 100,
        ease: 'outQuad',
      });
    });
  }, [isLoading, error]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--estudiante-bg)] flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
              boxShadow: '0 8px 32px rgba(16,185,129,0.5)',
            }}
          >
            <Rocket className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-white/70 text-lg font-bold">Cargando tu viaje...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--estudiante-bg)] text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <FloatingLines
            linesGradient={['#10b981', '#059669', '#34d399']}
            animationSpeed={0.35}
            interactive={false}
            parallax={false}
          />
        </div>
        <div className="relative z-10 p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/estudiante"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-20 h-20 rounded-3xl bg-red-500/20 flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Algo salió mal</h1>
              <p className="text-slate-400 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { gamificacion, racha, logros, actividad_reciente } = data;

  return (
    <div className="min-h-screen bg-[var(--estudiante-bg)] text-white relative overflow-hidden">
      {/* Fondo FloatingLines - Verde/Esmeralda para Progreso */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingLines
          linesGradient={['#10b981', '#059669', '#34d399']}
          animationSpeed={0.35}
          interactive={false}
          parallax={false}
        />
      </div>

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link
            href="/estudiante"
            className="header-animate inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>

          {/* Título */}
          <div className="header-animate mb-8">
            <h1 className="text-3xl sm:text-4xl font-black mb-2">Mi Viaje</h1>
            <p className="text-slate-400">Mira todo lo que has logrado</p>
          </div>

          {/* Stats Header */}
          <div
            className="stat-animate rounded-3xl p-6 mb-6"
            style={{
              background:
                'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.08) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(16,185,129,0.2)',
              boxShadow: '0 8px 32px rgba(16,185,129,0.15)',
            }}
          >
            {/* Pills row */}
            <div className="flex flex-wrap gap-3 mb-6">
              <StatPill
                icon={<Flame className="w-4 h-4" />}
                value={`${racha.racha_actual}d`}
                label="Racha"
                colors={['#f43f5e', '#ec4899', '#db2777']}
              />
              <StatPill
                icon={<Zap className="w-4 h-4" />}
                value={gamificacion.xp_total.toLocaleString()}
                label="XP"
                colors={['#a855f7', '#7c3aed', '#6366f1']}
              />
              <StatPill
                icon={<Trophy className="w-4 h-4" />}
                value={logros.desbloqueados}
                label="Logros"
                colors={['var(--color-xp)', '#f59e0b', '#d97706']}
              />
              <StatPill
                icon={<Crown className="w-4 h-4" />}
                value={`Nivel ${gamificacion.nivel}`}
                label=""
                colors={['#10b981', '#059669', '#047857']}
              />
            </div>

            {/* Barra de progreso */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-white/80 font-bold">Nivel {gamificacion.nivel}</span>
                <span className="text-white/50">
                  {gamificacion.xp_progreso} / {gamificacion.xp_necesario} XP para Nivel{' '}
                  {gamificacion.nivel + 1}
                </span>
              </div>
              <div className="h-3 bg-black/40 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${gamificacion.porcentaje_nivel}%`,
                    background: 'linear-gradient(90deg, #10b981, var(--color-correct), #84cc16)',
                    boxShadow: '0 0 20px rgba(16,185,129,0.5)',
                  }}
                />
              </div>
            </div>

            {/* Stats adicionales */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-400">{racha.racha_maxima}d</p>
                <p className="text-sm text-white/50">Racha máxima</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-400">{racha.total_dias_activos}</p>
                <p className="text-sm text-white/50">Días activos</p>
              </div>
            </div>
          </div>

          {/* Grid de cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card Logros */}
            <LogrosCard logros={logros} />

            {/* Card Actividad Reciente */}
            <ActividadCard actividades={actividad_reciente} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STAT PILL
// ============================================================================
function StatPill({
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
      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-bold"
      style={{
        background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`,
        boxShadow: `0 4px 16px ${colors[0]}60, inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.15)`,
      }}
    >
      {icon}
      <span className="font-black">{value}</span>
      {label && <span className="text-white/80 text-xs font-semibold">{label}</span>}
    </div>
  );
}

// ============================================================================
// LOGROS CARD
// ============================================================================
function LogrosCard({ logros }: { logros: MiProgreso['logros'] }) {
  return (
    <div
      className="card-animate rounded-3xl p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(245,158,11,0.06) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(251,191,36,0.2)',
        boxShadow: '0 8px 32px rgba(251,191,36,0.1)',
      }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--color-xp) 0%, #f59e0b 100%)',
            boxShadow: '0 4px 12px rgba(251,191,36,0.4)',
          }}
        >
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Mis Logros</h2>
          <p className="text-white/50 text-sm">
            {logros.desbloqueados} de {logros.totales} desbloqueados
          </p>
        </div>
      </div>

      {logros.recientes.length > 0 ? (
        <div className="grid grid-cols-5 gap-3">
          {logros.recientes.map((logro, i) => (
            <LogroItem key={i} logro={logro} />
          ))}
          {/* Placeholders para logros pendientes */}
          {Array.from({ length: Math.max(0, 5 - logros.recientes.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="aspect-square rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
            >
              <span className="text-2xl opacity-30">?</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-3 opacity-30">?</div>
          <p className="text-white/50 text-sm">Completa actividades para desbloquear logros</p>
        </div>
      )}

      {/* Barra de progreso de logros */}
      <div className="mt-5 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-white/60">Progreso</span>
          <span className="text-amber-400 font-bold">
            {Math.round((logros.desbloqueados / Math.max(logros.totales, 1)) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${(logros.desbloqueados / Math.max(logros.totales, 1)) * 100}%`,
              background: 'linear-gradient(90deg, var(--color-xp), #f59e0b)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function LogroItem({ logro }: { logro: LogroReciente }) {
  const colors = RAREZA_COLORS[logro.rareza] || RAREZA_COLORS.comun;

  return (
    <div
      className={`aspect-square rounded-xl bg-gradient-to-br ${colors.bg} ${colors.border} border flex items-center justify-center relative group cursor-pointer transition-transform hover:scale-105`}
      style={{ boxShadow: `0 4px 16px ${colors.glow}` }}
      title={logro.nombre}
    >
      <span className="text-2xl">{logro.icono}</span>
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-black/90 text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {logro.nombre}
      </div>
    </div>
  );
}

// ============================================================================
// ACTIVIDAD CARD
// ============================================================================
function ActividadCard({ actividades }: { actividades: ActividadReciente[] }) {
  return (
    <div
      className="card-animate rounded-3xl p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(124,58,237,0.06) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(168,85,247,0.2)',
        boxShadow: '0 8px 32px rgba(168,85,247,0.1)',
      }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
            boxShadow: '0 4px 12px rgba(168,85,247,0.4)',
          }}
        >
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Actividad Reciente</h2>
          <p className="text-white/50 text-sm">Últimas {actividades.length} actividades</p>
        </div>
      </div>

      {actividades.length > 0 ? (
        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
          {actividades.map((act, i) => (
            <ActividadItem key={i} actividad={act} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-3 opacity-30">
            <Sparkles className="w-10 h-10 mx-auto" />
          </div>
          <p className="text-white/50 text-sm">Completa lecciones para ver tu actividad</p>
        </div>
      )}
    </div>
  );
}

function ActividadItem({ actividad }: { actividad: ActividadReciente }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
        {getTipoIcon(actividad.tipo)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/90 line-clamp-2">{actividad.mensaje}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-white/40">{formatFechaRelativa(actividad.creado_en)}</span>
          {actividad.xp_ganado > 0 && (
            <span className="text-xs text-emerald-400 font-bold">+{actividad.xp_ganado} XP</span>
          )}
        </div>
      </div>
    </div>
  );
}
