'use client';

import { ArrowLeft, Binary, Layers, Globe2, Rocket } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CosmicBackground } from '@/components/estudiante/decorative/CosmicBackground';

/**
 * Mundo Programación - Portal Estudiante
 *
 * Replica exacta de "4. Mundo Programación" de portal_estudiante.pen
 */

interface CategoryTheme {
  gradient: { from: string; to: string };
  borderColor: string;
  shadowColor: string;
  glowColor: string;
  iconGradient: { from: string; to: string };
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  algoritmos: {
    gradient: { from: '#064E3B', to: '#0A1A12' },
    borderColor: '#10B98180',
    shadowColor: '#10B98150',
    glowColor: '#10B98130',
    iconGradient: { from: '#34D399', to: '#10B981' },
  },
  estructuras: {
    gradient: { from: '#164E63', to: '#0A1A1A' },
    borderColor: '#06B6D480',
    shadowColor: '#06B6D450',
    glowColor: '#06B6D430',
    iconGradient: { from: '#22D3EE', to: '#06B6D4' },
  },
  webdev: {
    gradient: { from: '#4C1D5E', to: '#1A0A2E' },
    borderColor: '#A855F780',
    shadowColor: '#A855F750',
    glowColor: '#A855F730',
    iconGradient: { from: '#C084FC', to: '#A855F7' },
  },
  proyectos: {
    gradient: { from: '#5C3D1E', to: '#1A1207' },
    borderColor: '#F59E0B80',
    shadowColor: '#F59E0B50',
    glowColor: '#F59E0B30',
    iconGradient: { from: '#FBBF24', to: '#F59E0B' },
  },
};

const CATEGORIES = [
  {
    id: 'algoritmos',
    icon: Binary,
    title: 'Algoritmos',
    description: 'LÓGICA Y EFICIENCIA',
    theme: CATEGORY_THEMES.algoritmos,
    textColor: '#34D399',
  },
  {
    id: 'estructuras',
    icon: Layers,
    title: 'Estructuras',
    description: 'DATOS ORGANIZADOS',
    theme: CATEGORY_THEMES.estructuras,
    textColor: '#22D3EE',
  },
  {
    id: 'desarrollo-web',
    icon: Globe2,
    title: 'Desarrollo Web',
    description: 'SITIOS Y APLICACIONES',
    theme: CATEGORY_THEMES.webdev,
    textColor: '#C084FC',
  },
  {
    id: 'proyectos',
    icon: Rocket,
    title: 'Proyectos',
    description: 'CREÁ TUS PROPIAS APPS',
    theme: CATEGORY_THEMES.proyectos,
    textColor: '#FBBF24',
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
          fontSize: title.length > 12 ? 28 : 32,
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

export default function MundoProgramacionPage(): React.JSX.Element {
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
        {/* Green glow effects */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 600,
            height: 600,
            left: -200,
            top: -100,
            background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 500,
            height: 500,
            right: -100,
            bottom: 0,
            background: 'radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 70%)',
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
              backgroundColor: '#064E3B',
              boxShadow: '0 0 12px rgba(16,185,129,0.25)',
            }}
          >
            <ArrowLeft size={24} color="#34D399" />
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
                textShadow: '0 0 15px rgba(16,185,129,0.38), 0 0 30px rgba(6,182,212,0.25)',
              }}
            >
              PROGRAMACIÓN
            </h1>
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 6,
                color: '#10B981',
              }}
            >
              CREÁ EL FUTURO CON CÓDIGO
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
            <Link key={category.id} href={`/estudiante/portal/mundos/programacion/${category.id}`}>
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
