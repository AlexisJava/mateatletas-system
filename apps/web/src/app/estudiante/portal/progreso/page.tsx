'use client';

import { ArrowLeft, CheckCircle, Zap, Flame, Play, Lock, BookOpen, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { CosmicBackground } from '@/components/estudiante/decorative/CosmicBackground';
import { useMiProgreso, useMiAula } from '@/hooks/useEstudiantePortal';
import { SkeletonMiProgreso, ErrorState } from '@/components/estudiante/feedback';

/**
 * Mi Progreso - Portal Estudiante
 *
 * Conectado con backend:
 * - Stats de gamificación (useMiProgreso)
 * - Planificaciones en progreso por sector (useMiAula)
 */

// Mapeo de colores por sector
const SECTOR_COLORS: Record<string, string> = {
  MATEMATICAS: '#3B82F6',
  PROGRAMACION: '#22C55E',
  CIENCIAS: '#F59E0B',
  OLIMPIADAS: '#A855F7',
};

const SECTOR_GRADIENTS: Record<string, { from: string; to: string }> = {
  MATEMATICAS: { from: '#1E3A5F', to: '#0F172A' },
  PROGRAMACION: { from: '#1A3D2E', to: '#0F172A' },
  CIENCIAS: { from: '#3D2E1A', to: '#0F172A' },
  OLIMPIADAS: { from: '#3D1A5F', to: '#0F172A' },
};

function StatCard({
  value,
  label,
  color,
  icon: Icon,
}: {
  value: string;
  label: string;
  color: string;
  icon: React.ComponentType<{ size: number; color: string }>;
}): React.JSX.Element {
  return (
    <div
      className="flex items-center gap-4 flex-1 h-full rounded-2xl p-5"
      style={{
        backgroundColor: 'rgba(15,23,42,0.5)',
        border: '1px solid #334155',
      }}
    >
      <div
        className="flex items-center justify-center rounded-xl"
        style={{ width: 44, height: 44, backgroundColor: color }}
      >
        <Icon size={24} color="#FFFFFF" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: 24,
            fontWeight: 800,
            color: '#FFFFFF',
          }}
        >
          {value}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: 12,
            fontWeight: 500,
            color: '#94A3B8',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

function LessonCard({
  title,
  progress,
  status,
  gradient,
  asignacionId,
}: {
  title: string;
  progress: number;
  status: 'in-progress' | 'completed' | 'locked';
  gradient: { from: string; to: string };
  asignacionId: string;
}): React.JSX.Element {
  const content = (
    <div
      className="relative rounded-xl p-4 transition-transform hover:scale-[1.02]"
      style={{
        width: 280,
        height: 120,
        background: `linear-gradient(180deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
        border: '1px solid #334155',
        cursor: status === 'locked' ? 'not-allowed' : 'pointer',
      }}
    >
      {/* Title */}
      <span
        style={{
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          fontSize: 14,
          fontWeight: 600,
          color: '#FFFFFF',
        }}
      >
        {title}
      </span>

      {/* Progress Bar */}
      <div
        className="absolute"
        style={{
          left: 16,
          bottom: 40,
          width: 'calc(100% - 32px)',
          height: 6,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 3,
        }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${progress}%`,
            backgroundColor: status === 'completed' ? '#22C55E' : '#60A5FA',
          }}
        />
      </div>

      {/* Progress Text */}
      <span
        className="absolute"
        style={{
          left: 16,
          bottom: 16,
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          fontSize: 12,
          fontWeight: 500,
          color: '#94A3B8',
        }}
      >
        {status === 'locked' ? 'Bloqueado' : `${progress}% completado`}
      </span>

      {/* Action Button */}
      <div
        className="absolute flex items-center justify-center rounded-full"
        style={{
          right: 16,
          bottom: 16,
          width: 32,
          height: 32,
          backgroundColor: status === 'locked' ? '#374151' : '#3B82F6',
        }}
      >
        {status === 'locked' ? (
          <Lock size={14} color="#6B7280" />
        ) : (
          <Play size={14} color="#FFFFFF" />
        )}
      </div>
    </div>
  );

  if (status === 'locked') {
    return content;
  }

  return <Link href={`/estudiante/portal/leccion/${asignacionId}`}>{content}</Link>;
}

function EmptyState(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: 80, height: 80, backgroundColor: 'rgba(59,130,246,0.2)' }}
      >
        <BookOpen size={40} color="#60A5FA" />
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          fontSize: 20,
          fontWeight: 700,
          color: '#FFFFFF',
        }}
      >
        No tenés lecciones en progreso
      </h3>
      <p
        style={{
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          fontSize: 14,
          fontWeight: 500,
          color: '#94A3B8',
          textAlign: 'center',
        }}
      >
        Explorá los mundos para comenzar tu aventura de aprendizaje
      </p>
      <Link
        href="/estudiante/portal/mundos"
        className="mt-2 px-6 py-3 rounded-xl transition-transform hover:scale-105"
        style={{ backgroundColor: '#3B82F6' }}
      >
        <span
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: 14,
            fontWeight: 600,
            color: '#FFFFFF',
          }}
        >
          Explorar Mundos
        </span>
      </Link>
    </div>
  );
}

export default function MiProgresoPage(): React.JSX.Element {
  const router = useRouter();
  const {
    data: progreso,
    isLoading: isLoadingProgreso,
    error: errorProgreso,
    refetch: refetchProgreso,
  } = useMiProgreso();
  const {
    data: aula,
    isLoading: isLoadingAula,
    error: errorAula,
    refetch: refetchAula,
  } = useMiAula();

  // Calcular estadísticas
  const stats = useMemo(() => {
    const enProgreso = aula?.resumen.totalClasesActivas ?? 0;
    const completadas = aula?.resumen.totalClasesCompletadas ?? 0;
    const xp = progreso?.gamificacion.xpTotal ?? 0;
    const racha = progreso?.racha.rachaActual ?? 0;

    return {
      enProgreso: enProgreso.toString(),
      completadas: completadas.toString(),
      xp: xp.toLocaleString('es-AR'),
      racha: `${racha} ${racha === 1 ? 'día' : 'días'}`,
    };
  }, [aula, progreso]);

  // Agrupar planificaciones por sector con progreso > 0
  const sectoresConProgreso = useMemo(() => {
    if (!aula?.sectores) return [];

    return aula.sectores
      .map((sector) => ({
        ...sector,
        planificaciones: sector.planificaciones.filter(
          (p) => p.progreso.porcentaje > 0 || p.progreso.clasesActivas > 0,
        ),
      }))
      .filter((sector) => sector.planificaciones.length > 0);
  }, [aula]);

  const isLoading = isLoadingProgreso || isLoadingAula;
  const error = errorProgreso || errorAula;

  // Loading state con skeleton
  if (isLoading) {
    return (
      <CosmicBackground
        showNebulas
        showStars
        showParticles={false}
        showOrbs={false}
        className="min-h-screen"
      >
        <div className="relative w-full min-h-screen" style={{ backgroundColor: '#030014' }}>
          <SkeletonMiProgreso />
        </div>
      </CosmicBackground>
    );
  }

  // Error state
  if (error) {
    return (
      <CosmicBackground
        showNebulas
        showStars
        showParticles={false}
        showOrbs={false}
        className="min-h-screen"
      >
        <div
          className="relative w-full min-h-screen flex items-center justify-center"
          style={{ backgroundColor: '#030014' }}
        >
          <ErrorState
            title="No pudimos cargar tu progreso"
            message="Hubo un problema al conectar con el servidor. Por favor, intentá de nuevo."
            onRetry={() => {
              refetchProgreso();
              refetchAula();
            }}
          />
        </div>
      </CosmicBackground>
    );
  }

  return (
    <CosmicBackground
      showNebulas
      showStars
      showParticles={false}
      showOrbs={false}
      className="min-h-screen"
    >
      <div className="relative w-full min-h-screen" style={{ backgroundColor: '#030014' }}>
        {/* Blue glow effect */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 600,
            height: 600,
            left: -200,
            top: -100,
            background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
          }}
        />
        {/* Purple glow effect */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 500,
            height: 500,
            right: -100,
            top: 400,
            background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Header */}
        <header
          className="flex items-center justify-between"
          style={{ height: 140, padding: '40px 48px 20px' }}
        >
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center justify-center"
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#1E293B',
              }}
            >
              <ArrowLeft size={20} color="#FFFFFF" />
            </button>

            <div className="flex flex-col gap-1">
              <h1
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: 42,
                  fontWeight: 900,
                  color: '#FFFFFF',
                }}
              >
                MI PROGRESO
              </h1>
              <span
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: 2,
                  color: '#60A5FA',
                }}
              >
                TODAS TUS LECCIONES EN CURSO
              </span>
            </div>
          </div>
        </header>

        {/* Stats Row */}
        <div
          className="flex gap-6"
          style={{
            width: 1184,
            height: 80,
            margin: '0 auto',
            padding: '0 48px',
          }}
        >
          <StatCard value={stats.enProgreso} label="En progreso" color="#3B82F6" icon={Loader2} />
          <StatCard
            value={stats.completadas}
            label="Completadas"
            color="#22C55E"
            icon={CheckCircle}
          />
          <StatCard value={stats.xp} label="XP ganados" color="#F59E0B" icon={Zap} />
          <StatCard value={stats.racha} label="Racha actual" color="#EF4444" icon={Flame} />
        </div>

        {/* Content Area */}
        <div
          className="flex flex-col gap-6 overflow-y-auto"
          style={{
            width: 1184,
            height: 540,
            margin: '20px auto 0',
            padding: '0 48px',
          }}
        >
          {sectoresConProgreso.length === 0 ? (
            <EmptyState />
          ) : (
            sectoresConProgreso.map((sector) => {
              const sectorKey = sector.nombre.toUpperCase().replace(/\s+/g, '_');
              const sectorColor = SECTOR_COLORS[sectorKey] ?? '#3B82F6';
              const sectorGradient = SECTOR_GRADIENTS[sectorKey] ?? {
                from: '#1E3A5F',
                to: '#0F172A',
              };

              return (
                <div key={sector.id} className="flex flex-col gap-3">
                  {/* Section Header */}
                  <div className="flex items-center justify-between h-[30px]">
                    <span
                      style={{
                        fontFamily: 'var(--font-inter), Inter, sans-serif',
                        fontSize: 16,
                        fontWeight: 800,
                        color: sectorColor,
                      }}
                    >
                      {sector.nombre.toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-inter), Inter, sans-serif',
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#64748B',
                      }}
                    >
                      {sector.planificaciones.length}{' '}
                      {sector.planificaciones.length === 1 ? 'planificación' : 'planificaciones'}
                    </span>
                  </div>

                  {/* Lessons Grid */}
                  <div className="flex gap-4 flex-wrap">
                    {sector.planificaciones.map((plan) => {
                      const status =
                        plan.progreso.porcentaje >= 100
                          ? 'completed'
                          : plan.progreso.porcentaje > 0
                            ? 'in-progress'
                            : 'locked';

                      return (
                        <LessonCard
                          key={plan.asignacionId}
                          title={plan.planificacion.titulo}
                          progress={plan.progreso.porcentaje}
                          status={status}
                          gradient={sectorGradient}
                          asignacionId={plan.asignacionId}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </CosmicBackground>
  );
}
