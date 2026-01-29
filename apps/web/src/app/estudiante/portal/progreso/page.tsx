'use client';

import { ArrowLeft, Loader2, CheckCircle, Zap, Flame, Play, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { CosmicBackground } from '@/components/estudiante/decorative/CosmicBackground';

/**
 * Mi Progreso - Portal Estudiante
 *
 * Replica exacta de "6. Mi Progreso" de portal_estudiante.pen
 */

const STATS = [
  { id: 'progress', value: '12', label: 'En progreso', color: '#3B82F6', icon: Loader2 },
  { id: 'completed', value: '47', label: 'Completadas', color: '#22C55E', icon: CheckCircle },
  { id: 'xp', value: '2,450', label: 'XP ganados', color: '#F59E0B', icon: Zap },
  { id: 'streak', value: '7 días', label: 'Racha actual', color: '#EF4444', icon: Flame },
];

const SECTIONS = [
  {
    id: 'aritmetica',
    title: 'ARITMÉTICA',
    color: '#3B82F6',
    count: '4 lecciones',
    gradient: { from: '#1E3A5F', to: '#0F172A' },
    lessons: [
      { id: 1, title: 'Suma de fracciones', progress: 85, status: 'in-progress' },
      { id: 2, title: 'Resta con negativos', progress: 60, status: 'in-progress' },
      { id: 3, title: 'Multiplicación básica', progress: 30, status: 'in-progress' },
      { id: 4, title: 'División con decimales', progress: 0, status: 'locked' },
    ],
  },
  {
    id: 'geometria',
    title: 'GEOMETRÍA',
    color: '#A855F7',
    count: '3 lecciones',
    gradient: { from: '#3D1A5F', to: '#0F172A' },
    lessons: [
      { id: 5, title: 'Perímetro y área', progress: 100, status: 'completed' },
      { id: 6, title: 'Ángulos básicos', progress: 45, status: 'in-progress' },
      { id: 7, title: 'Figuras 3D', progress: 0, status: 'locked' },
    ],
  },
];

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
}: {
  title: string;
  progress: number;
  status: 'in-progress' | 'completed' | 'locked';
  gradient: { from: string; to: string };
}): React.JSX.Element {
  return (
    <div
      className="relative rounded-xl p-4"
      style={{
        width: 280,
        height: 120,
        background: `linear-gradient(180deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
        border: '1px solid #334155',
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
          className="h-full rounded-full"
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
}

export default function MiProgresoPage(): React.JSX.Element {
  const router = useRouter();

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
          {STATS.map((stat) => (
            <StatCard
              key={stat.id}
              value={stat.value}
              label={stat.label}
              color={stat.color}
              icon={stat.icon}
            />
          ))}
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
          {SECTIONS.map((section) => (
            <div key={section.id} className="flex flex-col gap-3">
              {/* Section Header */}
              <div className="flex items-center justify-between h-[30px]">
                <span
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontSize: 16,
                    fontWeight: 800,
                    color: section.color,
                  }}
                >
                  {section.title}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#64748B',
                  }}
                >
                  {section.count}
                </span>
              </div>

              {/* Lessons Grid */}
              <div className="flex gap-4">
                {section.lessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    title={lesson.title}
                    progress={lesson.progress}
                    status={lesson.status as 'in-progress' | 'completed' | 'locked'}
                    gradient={section.gradient}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </CosmicBackground>
  );
}
