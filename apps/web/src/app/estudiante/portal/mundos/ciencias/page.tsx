'use client';

import { ArrowLeft, Atom, FlaskRound, Mountain, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CosmicBackground } from '@/components/estudiante/decorative/CosmicBackground';

/**
 * Mundo Ciencias - Portal Estudiante
 *
 * Replica exacta de "3b. Mundo Ciencias" de portal_estudiante.pen
 */

interface CategoryTheme {
  gradient: { from: string; to: string };
  borderColor: string;
  shadowColor: string;
  glowColor: string;
  iconGradient: { from: string; to: string };
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  fisica: {
    gradient: { from: '#1E3A5F', to: '#0F172A' },
    borderColor: '#3B82F680',
    shadowColor: '#3B82F650',
    glowColor: '#3B82F630',
    iconGradient: { from: '#60A5FA', to: '#3B82F6' },
  },
  quimica: {
    gradient: { from: '#1E4A2E', to: '#0A1A12' },
    borderColor: '#10B98180',
    shadowColor: '#10B98150',
    glowColor: '#10B98130',
    iconGradient: { from: '#34D399', to: '#10B981' },
  },
  tierra: {
    gradient: { from: '#3D2E1E', to: '#1A1207' },
    borderColor: '#D9773580',
    shadowColor: '#D9773550',
    glowColor: '#D9773530',
    iconGradient: { from: '#F59E0B', to: '#D97735' },
  },
  espacio: {
    gradient: { from: '#1E1E4A', to: '#0A0A1A' },
    borderColor: '#8B5CF680',
    shadowColor: '#8B5CF650',
    glowColor: '#8B5CF630',
    iconGradient: { from: '#A78BFA', to: '#8B5CF6' },
  },
};

const CATEGORIES = [
  {
    id: 'fisica',
    icon: Atom,
    title: 'Ciencias Físicas',
    description: 'FUERZAS Y MOVIMIENTO',
    theme: CATEGORY_THEMES.fisica,
    textColor: '#60A5FA',
  },
  {
    id: 'quimica',
    icon: FlaskRound,
    title: 'Ciencias Químicas',
    description: 'REACCIONES Y ELEMENTOS',
    theme: CATEGORY_THEMES.quimica,
    textColor: '#34D399',
  },
  {
    id: 'tierra',
    icon: Mountain,
    title: 'Ciencias de la Tierra',
    description: 'GEOLOGÍA Y CLIMA',
    theme: CATEGORY_THEMES.tierra,
    textColor: '#F59E0B',
  },
  {
    id: 'espacio',
    icon: Sparkles,
    title: 'Ciencias del Espacio',
    description: 'ESTRELLAS Y GALAXIAS',
    theme: CATEGORY_THEMES.espacio,
    textColor: '#A78BFA',
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
          fontSize: title.length > 16 ? 24 : 28,
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
          fontWeight: 700,
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

export default function MundoCienciasPage(): React.JSX.Element {
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
        {/* Orange glow effects */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 600,
            height: 600,
            left: -200,
            top: -100,
            background: 'radial-gradient(circle, rgba(251,146,60,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 500,
            height: 500,
            right: -100,
            bottom: 0,
            background: 'radial-gradient(circle, rgba(251,146,60,0.09) 0%, transparent 70%)',
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
              top: 56,
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#7C2D12',
              boxShadow: '0 0 12px rgba(251,146,60,0.25)',
            }}
          >
            <ArrowLeft size={24} color="#FB923C" />
          </button>

          {/* Title Frame */}
          <div
            className="flex flex-col gap-2"
            style={{
              position: 'absolute',
              left: 120,
              top: 32,
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
                textShadow: '0 0 15px rgba(251,146,60,0.38), 0 0 30px rgba(249,115,22,0.25)',
              }}
            >
              CIENCIAS
            </h1>
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 6,
                color: '#FB923C',
              }}
            >
              DESCUBRÍ LOS SECRETOS DEL UNIVERSO
            </span>
          </div>
        </header>

        {/* Categories Grid */}
        <main
          className="flex items-center justify-center"
          style={{
            width: 1184,
            height: 580,
            margin: '0 auto',
            padding: '0 48px',
            gap: 32,
          }}
        >
          {CATEGORIES.map((category) => (
            <Link key={category.id} href={`/estudiante/portal/mundos/ciencias/${category.id}`}>
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
