'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Flame,
  Search,
  SlidersHorizontal,
  Calculator,
  Code,
  Users,
  Brain,
  Zap,
  Star,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Ver Todos los Juegos - Portal Estudiante
 *
 * Replica exacta de "11. Ver Todos los Juegos" de portal_estudiante.pen
 */

const TABS = [
  { id: 'all', label: 'Todos', icon: null },
  { id: 'math', label: 'Matemáticas', icon: Calculator, color: '#10B981' },
  { id: 'code', label: 'Programación', icon: Code, color: '#06B6D4' },
  { id: 'multi', label: 'Multijugador', icon: Users, color: '#F59E0B' },
  { id: 'logic', label: 'Lógica', icon: Brain, color: '#EC4899' },
  { id: 'speed', label: 'Velocidad', icon: Zap, color: '#EF4444' },
];

const GAMES = [
  {
    id: 'g1',
    title: 'Math Runner',
    description: 'Corre y resuelve',
    gradient: { from: '#7C3AED', to: '#4F46E5' },
    rating: '4.9',
    xp: '+25 XP',
    badge: 'HOT',
  },
  {
    id: 'g2',
    title: 'Code Quest',
    description: 'Aventura de código',
    gradient: { from: '#059669', to: '#10B981' },
    rating: '4.8',
    xp: '+30 XP',
    badge: 'NEW',
  },
  {
    id: 'g3',
    title: 'Number Ninja',
    description: 'Velocidad mental',
    gradient: { from: '#DC2626', to: '#EF4444' },
    rating: '4.7',
    xp: '+20 XP',
  },
  {
    id: 'g4',
    title: 'Fraction Fun',
    description: 'Domina fracciones',
    gradient: { from: '#F59E0B', to: '#D97706' },
    rating: '4.6',
    xp: '+15 XP',
  },
  {
    id: 'g5',
    title: 'Geometry Dash',
    description: 'Formas en acción',
    gradient: { from: '#06B6D4', to: '#0891B2' },
    rating: '4.9',
    xp: '+25 XP',
  },
  {
    id: 'g6',
    title: 'Logic Master',
    description: 'Entrena tu mente',
    gradient: { from: '#EC4899', to: '#DB2777' },
    rating: '4.8',
    xp: '+30 XP',
    badge: 'TOP',
  },
  {
    id: 'g7',
    title: 'Algebra Adventure',
    description: 'Variables y más',
    gradient: { from: '#8B5CF6', to: '#7C3AED' },
    rating: '4.5',
    xp: '+20 XP',
  },
  {
    id: 'g8',
    title: 'Pattern Pro',
    description: 'Descubre patrones',
    gradient: { from: '#14B8A6', to: '#0D9488' },
    rating: '4.7',
    xp: '+15 XP',
  },
  {
    id: 'g9',
    title: 'Speed Math',
    description: 'Cálculo veloz',
    gradient: { from: '#6366F1', to: '#4F46E5' },
    rating: '4.8',
    xp: '+25 XP',
  },
  {
    id: 'g10',
    title: 'Nature Numbers',
    description: 'Números naturales',
    gradient: { from: '#84CC16', to: '#65A30D' },
    rating: '4.4',
    xp: '+10 XP',
  },
  {
    id: 'g11',
    title: 'Sequence Solver',
    description: 'Secuencias lógicas',
    gradient: { from: '#F43F5E', to: '#E11D48' },
    rating: '4.6',
    xp: '+20 XP',
  },
  {
    id: 'g12',
    title: 'Data Detective',
    description: 'Análisis de datos',
    gradient: { from: '#0EA5E9', to: '#0284C7' },
    rating: '4.7',
    xp: '+25 XP',
  },
];

function GameCard({
  title,
  description,
  gradient,
  rating,
  xp,
  badge,
}: {
  title: string;
  description: string;
  gradient: { from: string; to: string };
  rating: string;
  xp: string;
  badge?: string;
}): React.JSX.Element {
  return (
    <div
      className="flex flex-col justify-between flex-1 h-full rounded-2xl p-4"
      style={{
        background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
      }}
    >
      {/* Top Row */}
      <div className="flex items-start justify-between">
        {/* Placeholder Icon */}
        <div
          className="rounded-xl"
          style={{
            width: 40,
            height: 40,
            backgroundColor: 'rgba(255,255,255,0.2)',
          }}
        />
        {badge && (
          <div className="rounded-full px-2 py-0.5" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <span
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 10,
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              {badge}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Content */}
      <div className="flex flex-col gap-1">
        <span
          style={{
            fontFamily: 'var(--font-nunito), Nunito, sans-serif',
            fontSize: 16,
            fontWeight: 800,
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
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          {description}
        </span>

        {/* Stats Row */}
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1">
            <Star size={12} color="#FBBF24" fill="#FBBF24" />
            <span
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 11,
                fontWeight: 600,
                color: '#FFFFFF',
              }}
            >
              {rating}
            </span>
          </div>
          <div
            className="rounded-full px-2 py-0.5"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <span
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 10,
                fontWeight: 600,
                color: '#FFFFFF',
              }}
            >
              {xp}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TodosJuegosPage(): React.JSX.Element {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');

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
        {/* Left: Back + Title */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center justify-center rounded-[10px] px-3.5 py-2.5"
            style={{ backgroundColor: '#1E1E3A' }}
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </button>

          <div className="flex items-center gap-3">
            <Flame size={24} color="#EF4444" />
            <span
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 22,
                fontWeight: 800,
                color: '#FFFFFF',
              }}
            >
              Todos los Juegos
            </span>
            <div
              className="rounded-xl px-2.5 py-1"
              style={{ backgroundColor: 'rgba(168,85,247,0.13)' }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#A855F7',
                }}
              >
                {GAMES.length}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Search + Filter */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2.5 rounded-[20px] px-4"
            style={{
              height: 40,
              width: 240,
              backgroundColor: '#1E1E3A',
            }}
          >
            <Search size={18} color="#6B7280" />
            <span
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 14,
                color: '#6B7280',
              }}
            >
              Buscar juegos...
            </span>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-[10px] px-4 py-2.5"
            style={{ backgroundColor: '#1E1E3A' }}
          >
            <SlidersHorizontal size={18} color="#FFFFFF" />
            <span
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 14,
                fontWeight: 600,
                color: '#FFFFFF',
              }}
            >
              Filtros
            </span>
          </button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div
        className="flex items-center gap-3 shrink-0"
        style={{
          height: 50,
          padding: '0 32px',
          backgroundColor: 'rgba(10,10,26,0.5)',
        }}
      >
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 rounded-[20px] px-4 py-2"
              style={
                isActive
                  ? { background: 'linear-gradient(90deg, #A855F7 0%, #7C3AED 100%)' }
                  : { backgroundColor: '#1E1E3A' }
              }
            >
              {tab.icon && <tab.icon size={14} color={isActive ? '#FFFFFF' : tab.color} />}
              <span
                style={{
                  fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 600,
                  color: '#FFFFFF',
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Games Grid */}
      <main className="flex flex-col flex-1 gap-5 overflow-y-auto" style={{ padding: '24px 32px' }}>
        {/* Row 1 */}
        <div className="flex gap-5" style={{ height: 160 }}>
          {GAMES.slice(0, 4).map((game) => (
            <GameCard key={game.id} {...game} />
          ))}
        </div>

        {/* Row 2 */}
        <div className="flex gap-5" style={{ height: 160 }}>
          {GAMES.slice(4, 8).map((game) => (
            <GameCard key={game.id} {...game} />
          ))}
        </div>

        {/* Row 3 */}
        <div className="flex gap-5" style={{ height: 160 }}>
          {GAMES.slice(8, 12).map((game) => (
            <GameCard key={game.id} {...game} />
          ))}
        </div>
      </main>
    </div>
  );
}
