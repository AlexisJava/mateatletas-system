'use client';

import {
  ArrowLeft,
  Calculator,
  Code,
  FlaskConical,
  Crown,
  Star,
  BookOpen,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { CosmicBackground } from '@/components/estudiante/decorative/CosmicBackground';
import { WorldPortalCard, WORLD_PORTAL_THEMES } from '@/components/estudiante/organisms';
import { VortexEffect } from '@/components/estudiante/decorative/VortexEffect';
import { useMiAula } from '@/hooks/useEstudiantePortal';

/**
 * Selección de Mundos - Portal Estudiante
 *
 * Conectado con backend:
 * - Progreso por sector (useMiAula)
 * - Lecciones completadas por mundo
 */

// Mapeo de sector backend a mundo frontend
const SECTOR_TO_MUNDO: Record<string, string> = {
  MATEMATICAS: 'matematicas',
  PROGRAMACION: 'programacion',
  CIENCIAS: 'ciencias',
  OLIMPIADAS: 'olimpiadas',
};

interface WorldConfig {
  id: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  title: string;
  theme: (typeof WORLD_PORTAL_THEMES)[keyof typeof WORLD_PORTAL_THEMES];
  vortexColor: string;
  vortexLightColor: string;
  badge?: {
    text: string;
    gradient: string;
    glowColor: string;
  };
  defaultStats: {
    rating: string;
    lessons: string;
  };
}

const WORLDS: WorldConfig[] = [
  {
    id: 'matematicas',
    icon: Calculator,
    title: 'MATEMÁTICAS',
    theme: WORLD_PORTAL_THEMES.math,
    vortexColor: '#A78BFA',
    vortexLightColor: '#C4B5FD',
    badge: {
      text: 'POPULAR',
      gradient: '#FBBF24 0%, #F59E0B 100%',
      glowColor: 'rgba(251,191,36,0.5)',
    },
    defaultStats: { rating: '4.9', lessons: '120' },
  },
  {
    id: 'programacion',
    icon: Code,
    title: 'PROGRAMACIÓN',
    theme: WORLD_PORTAL_THEMES.code,
    vortexColor: '#34D399',
    vortexLightColor: '#6EE7B7',
    defaultStats: { rating: '4.8', lessons: '85' },
  },
  {
    id: 'ciencias',
    icon: FlaskConical,
    title: 'CIENCIAS',
    theme: WORLD_PORTAL_THEMES.science,
    vortexColor: '#FB923C',
    vortexLightColor: '#FDBA74',
    badge: {
      text: 'NUEVO',
      gradient: '#EF4444 0%, #DC2626 100%',
      glowColor: 'rgba(239,68,68,0.5)',
    },
    defaultStats: { rating: '4.7', lessons: '64' },
  },
  {
    id: 'olimpiadas',
    icon: Crown,
    title: 'OLIMPIADAS',
    theme: WORLD_PORTAL_THEMES.olympics,
    vortexColor: '#FFD700',
    vortexLightColor: '#FFE55C',
    badge: {
      text: 'ELITE',
      gradient: '#FFD700 0%, #FFA500 100%',
      glowColor: 'rgba(255,215,0,0.5)',
    },
    defaultStats: { rating: '5.0', lessons: '42' },
  },
];

// Colores por mundo para los stats
const WORLD_COLORS: Record<string, string> = {
  matematicas: '#A78BFA',
  programacion: '#34D399',
  ciencias: '#FB923C',
  olimpiadas: '#FFD700',
};

export default function MundosPage(): React.JSX.Element {
  const router = useRouter();
  const { data: aula } = useMiAula();

  // Calcular progreso por mundo
  const progresoByMundo = useMemo(() => {
    if (!aula?.sectores) return {};

    const progreso: Record<string, { completadas: number; total: number }> = {};

    for (const sector of aula.sectores) {
      const mundoId = SECTOR_TO_MUNDO[sector.nombre.toUpperCase().replace(/\s+/g, '_')];
      if (mundoId) {
        const completadas = sector.planificaciones.reduce(
          (sum, p) => sum + p.progreso.clasesCompletadas,
          0,
        );
        const total = sector.planificaciones.reduce((sum, p) => sum + p.progreso.clasesActivas, 0);
        progreso[mundoId] = { completadas, total: completadas + total };
      }
    }

    return progreso;
  }, [aula]);

  return (
    <CosmicBackground
      showNebulas
      showStars
      showParticles={false}
      showOrbs={false}
      className="min-h-screen"
    >
      <div className="flex flex-col w-full min-h-screen">
        {/* Epic Header */}
        <header className="flex flex-col gap-1.5 w-full" style={{ padding: '20px 40px 12px' }}>
          {/* Back Row */}
          <div className="flex items-center w-full">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center justify-center"
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(180deg, #374151 0%, #1F2937 100%)',
                border: '2px solid #4B5563',
                boxShadow: '0 0 8px rgba(0,0,0,0.38)',
              }}
            >
              <ArrowLeft size={18} color="#9CA3AF" />
            </button>
          </div>

          {/* Title Group */}
          <div className="flex flex-col items-center gap-1">
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 3,
                color: '#6B7280',
              }}
            >
              ELIGE TU DESTINO
            </span>

            <h1
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: 48,
                fontWeight: 900,
                letterSpacing: 2,
                color: '#FFFFFF',
                textShadow: '0 0 40px rgba(167,139,250,0.4)',
              }}
            >
              SELECCIÓN DE MUNDOS
            </h1>

            <p
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: 13,
                fontWeight: 500,
                color: '#9CA3AF',
              }}
            >
              Cada mundo es una aventura única. ¿Cuál explorarás hoy?
            </p>
          </div>
        </header>

        {/* Worlds Container */}
        <main
          className="flex items-center justify-center flex-1"
          style={{ padding: '12px 60px 24px', gap: 32 }}
        >
          {WORLDS.map((world) => {
            const progreso = progresoByMundo[world.id];
            const worldColor = WORLD_COLORS[world.id];

            // Stats dinámicos: si hay progreso, mostrar completadas; sino, stats default
            const stats = progreso?.completadas
              ? [
                  { icon: Trophy, text: progreso.completadas.toString(), color: '#22C55E' },
                  { icon: BookOpen, text: world.defaultStats.lessons, color: worldColor },
                ]
              : [
                  { icon: Star, text: world.defaultStats.rating, color: '#FBBF24' },
                  { icon: BookOpen, text: world.defaultStats.lessons, color: worldColor },
                ];

            return (
              <div key={world.id} className="relative">
                {/* Vortex Effect behind the card */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: 15,
                    top: 55,
                    opacity: 0.8,
                  }}
                >
                  <VortexEffect
                    color={world.vortexColor}
                    lightColor={world.vortexLightColor}
                    width={190}
                    height={150}
                  />
                </div>

                <Link href={`/estudiante/portal/mundos/${world.id}`}>
                  <WorldPortalCard
                    icon={world.icon}
                    title={world.title}
                    theme={world.theme}
                    badge={world.badge}
                    stats={stats}
                  />
                </Link>
              </div>
            );
          })}
        </main>
      </div>
    </CosmicBackground>
  );
}
