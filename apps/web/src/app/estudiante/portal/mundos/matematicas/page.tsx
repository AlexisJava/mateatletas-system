'use client';

import { ArrowLeft, Hash, Shapes, Variable, Combine } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CosmicBackground } from '@/components/estudiante/decorative/CosmicBackground';
import { CategoryCard, CATEGORY_THEMES } from '@/components/estudiante/organisms';

/**
 * Mundo Matemáticas - Portal Estudiante
 *
 * Replica exacta de "3. Mundo Matemáticas" de portal_estudiante.pen
 */

const CATEGORIES = [
  {
    id: 'aritmetica',
    icon: Hash,
    title: 'Aritmética',
    description: 'EL LENGUAJE DEL UNIVERSO',
    theme: CATEGORY_THEMES.arithmetic,
  },
  {
    id: 'geometria',
    icon: Shapes,
    title: 'Geometría',
    description: 'DONDE TODO COBRA FORMA',
    theme: CATEGORY_THEMES.geometry,
  },
  {
    id: 'algebra',
    icon: Variable,
    title: 'Álgebra',
    description: 'RESOLVÉ LO IMPOSIBLE',
    theme: CATEGORY_THEMES.algebra,
  },
  {
    id: 'combinatoria',
    icon: Combine,
    title: 'Combinatoria',
    description: 'INFINITAS POSIBILIDADES',
    theme: CATEGORY_THEMES.combinatorics,
  },
];

export default function MundoMatematicasPage(): React.JSX.Element {
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
        {/* Purple glow effects */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 600,
            height: 600,
            left: -200,
            top: -100,
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 500,
            height: 500,
            right: -100,
            bottom: 0,
            background: 'radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)',
          }}
        />

        {/* Header */}
        <header className="relative" style={{ height: 160, padding: '0 48px' }}>
          {/* Back Button */}
          <button
            type="button"
            onClick={() => router.back()}
            className="absolute flex items-center justify-center"
            style={{
              left: 48,
              top: 58,
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#1E1B4B',
              boxShadow: '0 0 12px rgba(139,92,246,0.25)',
            }}
          >
            <ArrowLeft size={24} color="#C4B5FD" />
          </button>

          {/* Title Frame */}
          <div
            className="flex flex-col gap-1"
            style={{
              position: 'absolute',
              left: 120,
              top: 20,
              width: 800,
            }}
          >
            <h1
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: 72,
                fontWeight: 900,
                letterSpacing: 12,
                color: 'rgba(255,255,255,0.8)',
                textShadow: '0 0 15px rgba(192,132,252,0.38), 0 0 30px rgba(139,92,246,0.25)',
              }}
            >
              MATEMÁTICAS
            </h1>
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 6,
                color: '#A78BFA',
              }}
            >
              EL LENGUAJE DEL UNIVERSO
            </span>
          </div>
        </header>

        {/* Categories Grid */}
        <main
          className="flex items-center justify-center"
          style={{
            width: 1184,
            height: 600,
            margin: '0 auto',
            padding: '0 48px',
            gap: 32,
          }}
        >
          {CATEGORIES.map((category) => (
            <Link key={category.id} href={`/estudiante/portal/mundos/matematicas/${category.id}`}>
              <CategoryCard
                icon={category.icon}
                title={category.title}
                description={category.description}
                theme={category.theme}
              />
            </Link>
          ))}
        </main>
      </div>
    </CosmicBackground>
  );
}
