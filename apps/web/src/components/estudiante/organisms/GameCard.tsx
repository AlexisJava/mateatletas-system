'use client';

import type { LucideIcon } from 'lucide-react';
import { Play, Lock, Zap, Flame } from 'lucide-react';
import { ProgressBar } from '../molecules/ProgressBar';

/**
 * GameCard - Card de mini-juego (portal_estudiante.pen)
 *
 * Extraído de "10. Pantalla de Juegos" → moreGamesGrid (keqgU, w1pWm, etc.):
 *
 * Card container:
 * - width: fill_container, height: fill_container
 * - cornerRadius: 16
 * - fill: #0F172A
 * - stroke: #1E293B 1px
 * - padding: 16
 * - layout: vertical, gap: 12
 *
 * Icon container:
 * - 48x48, cornerRadius: 12
 * - fill: linear-gradient(135deg, themed 2-stop)
 * - inner icon: 24x24 white
 *
 * Title: Nunito 15px/700 white
 * Description: Nunito 12px/normal #9CA3AF
 *
 * Footer (justify-between):
 * - Left: Progress bar OR badge (NEW, HOT) OR lock state
 * - Right: Play button 32x32, cornerRadius 16, fill #A855F7 (or #374151 if locked)
 */

type GameStatus = 'available' | 'new' | 'hot' | 'locked' | 'progress';

interface GameCardProps {
  /** Game icon */
  icon: LucideIcon;
  /** Game title */
  title: string;
  /** Game description */
  description: string;
  /** Icon gradient (2 stops) */
  iconGradient: string;
  /** Game status */
  status?: GameStatus;
  /** Progress percentage (only for status='progress') */
  progress?: number;
  /** Click handler */
  onClick?: () => void;
  className?: string;
}

export function GameCard({
  icon: Icon,
  title,
  description,
  iconGradient,
  status = 'available',
  progress = 0,
  onClick,
  className = '',
}: GameCardProps): React.JSX.Element {
  const isLocked = status === 'locked';

  return (
    <button
      type="button"
      onClick={isLocked ? undefined : onClick}
      className={`flex flex-col gap-3 w-full h-full text-left ${className}`}
      style={{
        borderRadius: 16,
        backgroundColor: '#0F172A',
        border: '1px solid #1E293B',
        padding: 16,
        cursor: isLocked ? 'not-allowed' : 'pointer',
        opacity: isLocked ? 0.6 : 1,
      }}
    >
      {/* Icon container */}
      <div
        className="flex items-center justify-center"
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: `linear-gradient(135deg, ${iconGradient})`,
        }}
      >
        <Icon size={24} color="#FFFFFF" />
      </div>

      {/* Title */}
      <span
        style={{
          fontFamily: 'var(--font-nunito), Nunito, sans-serif',
          fontSize: 15,
          fontWeight: 700,
          color: '#FFFFFF',
        }}
      >
        {title}
      </span>

      {/* Description */}
      <span
        style={{
          fontFamily: 'var(--font-nunito), Nunito, sans-serif',
          fontSize: 12,
          fontWeight: 400,
          color: '#9CA3AF',
        }}
      >
        {description}
      </span>

      {/* Footer */}
      <div className="flex items-center justify-between w-full mt-auto">
        {/* Left side - status indicator */}
        {status === 'progress' && (
          <div className="flex items-center gap-1 flex-1 mr-3">
            <Zap size={12} color="#A855F7" />
            <ProgressBar
              percent={progress}
              height={4}
              gradient="linear-gradient(90deg, #A855F7 0%, #7C3AED 100%)"
              glowColor="#A855F780"
              className="flex-1"
            />
          </div>
        )}
        {status === 'new' && (
          <div
            className="flex items-center gap-1"
            style={{
              borderRadius: 8,
              backgroundColor: 'rgba(239,68,68,0.13)',
              padding: '4px 8px',
            }}
          >
            <Flame size={10} color="#EF4444" />
            <span
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 10,
                fontWeight: 700,
                color: '#EF4444',
              }}
            >
              NUEVO
            </span>
          </div>
        )}
        {status === 'hot' && (
          <div
            className="flex items-center gap-1"
            style={{
              borderRadius: 8,
              backgroundColor: 'rgba(245,158,11,0.13)',
              padding: '4px 8px',
            }}
          >
            <Flame size={10} color="#F59E0B" />
            <span
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 10,
                fontWeight: 700,
                color: '#F59E0B',
              }}
            >
              HOT
            </span>
          </div>
        )}
        {status === 'locked' && (
          <div className="flex items-center gap-1">
            <Lock size={12} color="#6B7280" />
            <span
              style={{
                fontFamily: 'var(--font-nunito), Nunito, sans-serif',
                fontSize: 10,
                fontWeight: 600,
                color: '#6B7280',
              }}
            >
              Bloqueado
            </span>
          </div>
        )}
        {status === 'available' && <div />}

        {/* Play button */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: isLocked ? '#374151' : '#A855F7',
          }}
        >
          {isLocked ? (
            <Lock size={14} color="#9CA3AF" />
          ) : (
            <Play size={14} color="#FFFFFF" fill="#FFFFFF" />
          )}
        </div>
      </div>
    </button>
  );
}
