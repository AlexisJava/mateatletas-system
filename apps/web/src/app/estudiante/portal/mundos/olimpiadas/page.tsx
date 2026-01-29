'use client';

import { ArrowLeft, Hash, Variable, Shapes, Sigma } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CosmicBackground } from '@/components/estudiante/decorative/CosmicBackground';

/**
 * Mundo Olimpiadas - Portal Estudiante
 *
 * Replica exacta de "5. Mundo Olimpiadas" de portal_estudiante.pen
 */

interface CategoryTheme {
  gradient: { from: string; to: string };
  borderColor: string;
  shadowColor: string;
  glowColor: string;
  iconGradient: { from: string; to: string };
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  aritmetica: {
    gradient: { from: '#1E3A5F', to: '#0F172A' },
    borderColor: '#60A5FA80',
    shadowColor: '#60A5FA50',
    glowColor: '#60A5FA30',
    iconGradient: { from: '#60A5FA', to: '#3B82F6' },
  },
  algebra: {
    gradient: { from: '#5C3D1E', to: '#1A1207' },
    borderColor: '#FBBF2480',
    shadowColor: '#F59E0B50',
    glowColor: '#F59E0B30',
    iconGradient: { from: '#FBBF24', to: '#F59E0B' },
  },
  geometria: {
    gradient: { from: '#4A1D5E', to: '#1A0A2E' },
    borderColor: '#C084FC80',
    shadowColor: '#A855F750',
    glowColor: '#A855F730',
    iconGradient: { from: '#C084FC', to: '#A855F7' },
  },
  combinatoria: {
    gradient: { from: '#1E4A4A', to: '#0A1A1A' },
    borderColor: '#2DD4BF80',
    shadowColor: '#14B8A650',
    glowColor: '#14B8A630',
    iconGradient: { from: '#2DD4BF', to: '#14B8A6' },
  },
};

const CATEGORIES = [
  {
    id: 'aritmetica',
    icon: Hash,
    title: 'Aritmética',
    description: 'NÚMEROS Y OPERACIONES',
    theme: CATEGORY_THEMES.aritmetica,
    textColor: '#60A5FA',
  },
  {
    id: 'algebra',
    icon: Variable,
    title: 'Álgebra',
    description: 'ECUACIONES Y VARIABLES',
    theme: CATEGORY_THEMES.algebra,
    textColor: '#FBBF24',
  },
  {
    id: 'geometria',
    icon: Shapes,
    title: 'Geometría',
    description: 'FORMAS Y ESPACIOS',
    theme: CATEGORY_THEMES.geometria,
    textColor: '#C084FC',
  },
  {
    id: 'combinatoria',
    icon: Sigma,
    title: 'Combinatoria',
    description: 'CONTEO Y PROBABILIDAD',
    theme: CATEGORY_THEMES.combinatoria,
    textColor: '#2DD4BF',
  },
];

function CategoryCard({
  icon: Icon,
  title,
  description,
  theme,
  textColor,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  title: string;
  description: string;
  theme: CategoryTheme;
  textColor: string;
}): React.JSX.Element {
  return (
    <div
      className="relative rounded-[32px] overflow-hidden"
      style={{
        width: 280,
        height: 380,
        background: `linear-gradient(180deg, ${theme.gradient.from} 0%, ${theme.gradient.to} 100%)`,
        border: `2px solid ${theme.borderColor}`,
        boxShadow: `0 12px 50px ${theme.shadowColor}, 0 0 40px ${theme.glowColor}`,
      }}
    >
      {/* Icon Container */}
      <div
        className="absolute flex items-center justify-center rounded-[32px]"
        style={{
          width: 110,
          height: 110,
          left: 85,
          top: 35,
          background: `linear-gradient(135deg, ${theme.iconGradient.from} 0%, ${theme.iconGradient.to} 100%)`,
          boxShadow: `0 0 40px ${theme.iconGradient.to}, 0 8px 20px ${theme.iconGradient.from}CC`,
        }}
      >
        <Icon size={48} color="#FFFFFF" />
      </div>

      {/* Title */}
      <span
        className="absolute text-center"
        style={{
          top: 190,
          left: 0,
          width: 280,
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          fontSize: 32,
          fontWeight: 800,
          color: '#FFFFFF',
        }}
      >
        {title}
      </span>

      {/* Description */}
      <span
        className="absolute text-center"
        style={{
          top: 267,
          left: 0,
          width: 280,
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: 2,
          lineHeight: 1.5,
          color: textColor,
        }}
      >
        {description}
      </span>
    </div>
  );
}

export default function MundoOlimpiadasPage(): React.JSX.Element {
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
        {/* Gold glow effects */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 600,
            height: 600,
            left: -200,
            top: -100,
            background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 500,
            height: 500,
            right: -100,
            bottom: 0,
            background: 'radial-gradient(circle, rgba(255,165,0,0.09) 0%, transparent 70%)',
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
              backgroundColor: '#78350F',
              boxShadow: '0 0 12px rgba(255,215,0,0.25)',
            }}
          >
            <ArrowLeft size={24} color="#FFD700" />
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
                textShadow: '0 0 15px rgba(255,215,0,0.38), 0 0 30px rgba(255,165,0,0.25)',
              }}
            >
              OLIMPIADAS
            </h1>
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 6,
                color: '#FFD700',
              }}
            >
              COMPETÍ Y SUPERÁ TUS LÍMITES
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
            <Link key={category.id} href={`/estudiante/portal/mundos/olimpiadas/${category.id}`}>
              <CategoryCard
                icon={category.icon}
                title={category.title}
                description={category.description}
                theme={category.theme}
                textColor={category.textColor}
              />
            </Link>
          ))}
        </main>
      </div>
    </CosmicBackground>
  );
}
