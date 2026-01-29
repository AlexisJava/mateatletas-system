'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Gamepad2,
  Ticket,
  Coins,
  Sparkles,
  ChevronRight,
  Grid3X3,
  Users,
  Star,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useMiProgreso } from '@/hooks/useEstudiantePortal';

/**
 * Pantalla de Juegos (Arcade) - Portal Estudiante
 *
 * Conectado con backend:
 * - XP total (useMiProgreso)
 *
 * TODO Backend:
 * - Endpoint de tickets del estudiante
 * - Endpoint de juegos disponibles (actualmente hardcodeados del game-engine)
 */

const TABS = [
  { id: 'all', label: 'Todos', icon: Sparkles },
  { id: 'math', label: 'Matemáticas' },
  { id: 'code', label: 'Programación' },
  { id: 'multi', label: 'Multijugador' },
];

const FEATURED_GAMES = [
  {
    id: 'math-runner',
    title: 'Math Runner',
    description: 'Corre y resuelve',
    gradient: { from: '#7C3AED', to: '#4F46E5' },
    shadowColor: '#7C3AED40',
    badge: { text: 'POPULAR', color: '#FBBF24' },
    stats: { rating: '4.9', players: '2.4k' },
  },
  {
    id: 'code-quest',
    title: 'Code Quest',
    description: 'Aventura de código',
    gradient: { from: '#059669', to: '#10B981' },
    shadowColor: '#10B98140',
    badge: { text: 'NUEVO', color: '#EF4444' },
    stats: { rating: '4.8', players: '1.2k' },
  },
  {
    id: 'number-ninja',
    title: 'Number Ninja',
    description: 'Velocidad mental',
    gradient: { from: '#DC2626', to: '#EF4444' },
    shadowColor: '#EF444440',
    stats: { rating: '4.7', players: '3.1k' },
  },
];

const MORE_GAMES = [
  { id: 'fraction-frenzy', title: 'Fraction Frenzy', category: 'Matemáticas', xp: '+15 XP' },
  { id: 'shape-shifter', title: 'Shape Shifter', category: 'Geometría', xp: '+20 XP' },
  { id: 'logic-labyrinth', title: 'Logic Labyrinth', category: 'Lógica', xp: '+25 XP' },
  { id: 'speed-calc', title: 'Speed Calc', category: 'Velocidad', xp: '+10 XP' },
  { id: 'pattern-master', title: 'Pattern Master', category: 'Patrones', xp: '+30 XP' },
];

function FeaturedGameCard({
  title,
  description,
  gradient,
  shadowColor,
  badge,
  stats,
}: {
  title: string;
  description: string;
  gradient: { from: string; to: string };
  shadowColor: string;
  badge?: { text: string; color: string };
  stats: { rating: string; players: string };
}): React.JSX.Element {
  return (
    <div
      className="flex flex-col justify-between flex-1 rounded-[20px] p-5"
      style={{
        height: 200,
        background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
        boxShadow: `0 8px 24px ${shadowColor}`,
      }}
    >
      {/* Top Row */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span
            style={{
              fontFamily: 'var(--font-nunito), Nunito, sans-serif',
              fontSize: 20,
              fontWeight: 800,
              color: '#FFFFFF',
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-nunito), Nunito, sans-serif',
              fontSize: 13,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            {description}
          </span>
        </div>
        {badge && (
          <div className="rounded-full px-2.5 py-1" style={{ backgroundColor: badge.color }}>
            <span
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 10,
                fontWeight: 800,
                color: '#000000',
              }}
            >
              {badge.text}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Row - Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Star size={14} color="#FBBF24" fill="#FBBF24" />
          <span
            style={{
              fontFamily: 'var(--font-nunito), Nunito, sans-serif',
              fontSize: 13,
              fontWeight: 700,
              color: '#FFFFFF',
            }}
          >
            {stats.rating}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={14} color="rgba(255,255,255,0.7)" />
          <span
            style={{
              fontFamily: 'var(--font-nunito), Nunito, sans-serif',
              fontSize: 13,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            {stats.players}
          </span>
        </div>
      </div>
    </div>
  );
}

function MiniGameCard({
  title,
  category,
  xp,
}: {
  title: string;
  category: string;
  xp: string;
}): React.JSX.Element {
  return (
    <div
      className="flex flex-col justify-between flex-1 h-full rounded-2xl p-4"
      style={{
        backgroundColor: '#0F172A',
        border: '1px solid #1E293B',
      }}
    >
      {/* Placeholder Icon */}
      <div
        className="rounded-xl"
        style={{
          width: 48,
          height: 48,
          backgroundColor: '#1E293B',
        }}
      />

      {/* Info */}
      <div className="flex flex-col gap-1">
        <span
          style={{
            fontFamily: 'var(--font-nunito), Nunito, sans-serif',
            fontSize: 14,
            fontWeight: 700,
            color: '#FFFFFF',
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-nunito), Nunito, sans-serif',
            fontSize: 12,
            fontWeight: 500,
            color: '#6B7280',
          }}
        >
          {category}
        </span>
      </div>

      {/* XP Badge */}
      <div
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 self-start"
        style={{ backgroundColor: 'rgba(245,158,11,0.15)' }}
      >
        <Zap size={12} color="#F59E0B" />
        <span
          style={{
            fontFamily: 'var(--font-nunito), Nunito, sans-serif',
            fontSize: 11,
            fontWeight: 600,
            color: '#F59E0B',
          }}
        >
          {xp}
        </span>
      </div>
    </div>
  );
}

export default function JuegosPage(): React.JSX.Element {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const { data: progreso } = useMiProgreso();

  // XP del estudiante
  const xpTotal = progreso?.gamificacion.xpTotal ?? 0;

  return (
    <div className="flex flex-col w-full h-screen" style={{ backgroundColor: '#030014' }}>
      {/* Top Bar */}
      <header
        className="flex items-center justify-between shrink-0"
        style={{
          height: 70,
          padding: '0 32px',
          backgroundColor: '#0A0A1A',
        }}
      >
        {/* Left: Back + Logo */}
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center justify-center rounded-[10px] px-3.5 py-2.5"
            style={{ backgroundColor: '#1E1E3A' }}
          >
            <ArrowLeft size={20} color="#9CA3AF" />
          </button>

          <div className="flex items-center gap-2.5">
            <Gamepad2 size={28} color="#A855F7" />
            <span
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 24,
                fontWeight: 800,
                color: '#FFFFFF',
              }}
            >
              Arcade
            </span>
          </div>
        </div>

        {/* Center: Tabs */}
        <div className="flex items-center gap-6">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-[20px] px-4 py-2 ${
                  isActive ? '' : 'hover:bg-white/5'
                }`}
                style={
                  isActive
                    ? { background: 'linear-gradient(90deg, #A855F7 0%, #7C3AED 100%)' }
                    : undefined
                }
              >
                {tab.icon && <tab.icon size={14} color="#FFFFFF" />}
                <span
                  style={{
                    fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                    fontSize: isActive ? 13 : 14,
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? '#FFFFFF' : '#9CA3AF',
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Badges */}
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-2 rounded-[20px] px-3.5 py-2"
            style={{ backgroundColor: 'rgba(245,158,11,0.13)' }}
          >
            <Ticket size={16} color="#F59E0B" />
            <span
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                color: '#F59E0B',
              }}
            >
              {/* TODO: Endpoint de tickets */}∞
            </span>
          </div>

          <div
            className="flex items-center gap-2 rounded-[20px] px-3.5 py-2"
            style={{ backgroundColor: 'rgba(16,185,129,0.13)' }}
          >
            <Coins size={16} color="#10B981" />
            <span
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                color: '#10B981',
              }}
            >
              {xpTotal.toLocaleString('es-AR')}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col flex-1 gap-6 overflow-y-auto" style={{ padding: '24px 32px' }}>
        {/* Featured Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles size={20} color="#A855F7" />
              <span
                style={{
                  fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                  fontSize: 18,
                  fontWeight: 800,
                  color: '#FFFFFF',
                }}
              >
                Destacados
              </span>
            </div>
            <Link
              href="/estudiante/portal/juegos/todos"
              className="flex items-center gap-1 hover:opacity-80"
            >
              <span
                style={{
                  fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#A855F7',
                }}
              >
                Ver todos
              </span>
              <ChevronRight size={16} color="#A855F7" />
            </Link>
          </div>

          <div className="flex gap-5">
            {FEATURED_GAMES.map((game) => (
              <FeaturedGameCard key={game.id} {...game} />
            ))}
          </div>
        </section>

        {/* More Games Section */}
        <section className="flex flex-col flex-1 gap-4">
          <div className="flex items-center gap-2.5">
            <Grid3X3 size={20} color="#06B6D4" />
            <span
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 18,
                fontWeight: 800,
                color: '#FFFFFF',
              }}
            >
              Más Juegos
            </span>
          </div>

          <div className="flex flex-1 gap-4">
            {MORE_GAMES.map((game) => (
              <MiniGameCard key={game.id} {...game} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
