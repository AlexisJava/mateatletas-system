'use client';

import { ArrowLeft, Calculator, Code, FlaskConical, Crown, Star, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CosmicBackground } from '@/components/estudiante/decorative/CosmicBackground';
import { WorldPortalCard, WORLD_PORTAL_THEMES } from '@/components/estudiante/organisms';
import { VortexEffect } from '@/components/estudiante/decorative/VortexEffect';

/**
 * Selección de Mundos - Portal Estudiante
 *
 * Replica exacta de "2. Selección de Mundos" de portal_estudiante.pen
 */

const WORLDS = [
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
    stats: [
      { icon: Star, text: '4.9', color: '#FBBF24' },
      { icon: BookOpen, text: '120', color: '#A78BFA' },
    ],
  },
  {
    id: 'programacion',
    icon: Code,
    title: 'PROGRAMACIÓN',
    theme: WORLD_PORTAL_THEMES.code,
    vortexColor: '#34D399',
    vortexLightColor: '#6EE7B7',
    stats: [
      { icon: Star, text: '4.8', color: '#FBBF24' },
      { icon: BookOpen, text: '85', color: '#34D399' },
    ],
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
    stats: [
      { icon: Star, text: '4.7', color: '#FBBF24' },
      { icon: BookOpen, text: '64', color: '#FB923C' },
    ],
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
    stats: [
      { icon: Star, text: '5.0', color: '#FBBF24' },
      { icon: BookOpen, text: '42', color: '#FFD700' },
    ],
  },
];

export default function MundosPage(): React.JSX.Element {
  const router = useRouter();

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
          {WORLDS.map((world) => (
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
                  stats={world.stats}
                />
              </Link>
            </div>
          ))}
        </main>
      </div>
    </CosmicBackground>
  );
}
