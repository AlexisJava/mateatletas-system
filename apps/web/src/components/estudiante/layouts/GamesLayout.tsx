'use client';

import { ArrowLeft, Gamepad2, Ticket, Coins, Search, SlidersHorizontal } from 'lucide-react';

/**
 * GamesLayout - Layout para la pantalla de juegos (portal_estudiante.pen)
 *
 * Extraído de "10. Pantalla de Juegos" (48eBb):
 *
 * Estructura vertical:
 * - Top Bar (70px): back + logo, tabs, tickets/coins badges
 * - Main Content (flex-1, scrollable): featured games + more games grid
 *
 * Background: #030014
 */

interface GamesLayoutProps {
  /** Active tab ID */
  activeTab?: string;
  /** Tab change handler */
  onTabChange?: (_id: string) => void;
  /** Tickets count */
  tickets?: number;
  /** Coins count */
  coins?: number;
  /** Back button handler */
  onBack?: () => void;
  /** Search handler */
  onSearch?: () => void;
  /** Filter handler */
  onFilter?: () => void;
  /** Main content */
  children: React.ReactNode;
  className?: string;
}

const TABS = [
  { id: 'all', label: 'Todos' },
  { id: 'math', label: 'Matemáticas' },
  { id: 'code', label: 'Programación' },
  { id: 'multi', label: 'Multijugador' },
];

export function GamesLayout({
  activeTab = 'all',
  onTabChange,
  tickets = 12,
  coins = 2450,
  onBack,
  onSearch,
  onFilter,
  children,
  className = '',
}: GamesLayoutProps): React.JSX.Element {
  return (
    <div
      className={`flex flex-col w-full h-screen ${className}`}
      style={{ backgroundColor: '#030014' }}
    >
      {/* Top Bar - 70px */}
      <header
        className="flex items-center justify-between w-full shrink-0"
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
            onClick={onBack}
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
                onClick={() => onTabChange?.(tab.id)}
                className={`flex items-center gap-1.5 rounded-[20px] px-4 py-2 ${
                  isActive ? '' : 'hover:bg-white/5'
                }`}
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(90deg, #A855F7 0%, #7C3AED 100%)',
                      }
                    : undefined
                }
              >
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

        {/* Right: Search + Filter + Badges */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <button
            type="button"
            onClick={onSearch}
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
                fontWeight: 400,
                color: '#6B7280',
              }}
            >
              Buscar juegos...
            </span>
          </button>

          {/* Filter */}
          <button
            type="button"
            onClick={onFilter}
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

          {/* Tickets Badge */}
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
              {tickets}
            </span>
          </div>

          {/* Coins Badge */}
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
              {coins.toLocaleString()}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto" style={{ padding: '24px 32px' }}>
        {children}
      </main>
    </div>
  );
}
