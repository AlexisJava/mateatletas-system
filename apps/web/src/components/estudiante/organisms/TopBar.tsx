'use client';

import { Trophy, Flame, Zap, Coins } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * TopBar - Barra superior del Main Menu (portal_estudiante.pen)
 *
 * Extraído de "1. MAIN MENU" → Top Bar (TwQF7):
 *
 * Container:
 * - width: 1280, height: 70
 * - fill: linear-gradient(180deg, #0A0A1ACC 0%, #0A0A1A00 100%)
 * - padding: [0, 40]
 * - justifyContent: space_between
 * - alignItems: center
 *
 * Left Section (xskRm):
 * - Logo Icon (DuS3J): 44x44, cornerRadius 14
 *   - fill: linear-gradient(145deg, #FDE68A 0%, #FFD700 30%, #F59E0B 70%, #D97706 100%)
 *   - stroke: #FFFFFF30, 1px
 *   - shadow: blur 16 #FFD700CC, blur 32 #F59E0B60
 *   - inner icon: trophy, 24x24, white
 * - Logo Text (RNnov): "MATEATLETAS", Inter 22/900, white, letterSpacing 3, shadow blur 20 #FFD70030
 * - Club Badge (mBKWG): cornerRadius 10, fill #FFD70020, border #FFD70050 1px
 *   - shadow blur 12 #FFD70040
 *   - text: "Club STEAM", Inter 12/700, #FFD700, letterSpacing 1
 *
 * Right Section (1Thf3):
 * - Streak badge: pill, bg #EF444418, border #EF444460, shadow blur 10 #EF444430
 *   - flame icon 16x16, shadow blur 8 #EF4444
 *   - text Inter 14/700 #EF4444
 * - XP badge: pill, bg #A78BFA18, border #A78BFA60, shadow blur 10 #A78BFA30
 *   - zap icon 16x16, shadow blur 8 #A78BFA
 *   - text Inter 14/700 #A78BFA
 * - Coins badge: pill, bg #FFD70018, border #FFD70060, shadow blur 10 #FFD70030
 *   - coins icon 16x16, shadow blur 8 #FFD700
 *   - text Inter 14/700 #FFD700
 * - Avatar (bj4xc): 48x48, cornerRadius 24
 *   - fill: linear-gradient(145deg, #6EE7B7 0%, #34D399 30%, #10B981 70%, #059669 100%)
 *   - stroke: #FFFFFF40 2px
 *   - shadow: blur 14 #34D399CC, blur 28 #10B98160
 *   - text: Inter 16/800 white
 */

interface StatBadge {
  icon: LucideIcon;
  text: string;
  color: string;
}

interface TopBarProps {
  /** Texto del logo (default: "MATEATLETAS") */
  logoText?: string;
  /** Badges de stats (streak, XP, coins) */
  stats?: StatBadge[];
  /** Iniciales del avatar */
  avatarInitials?: string;
  /** Callback al hacer click en el avatar */
  onAvatarClick?: () => void;
  className?: string;
}

const DEFAULT_STATS: StatBadge[] = [
  { icon: Flame, text: '15', color: '#EF4444' },
  { icon: Zap, text: '12,800', color: '#A78BFA' },
  { icon: Coins, text: '2,450', color: '#FFD700' },
];

export function TopBar({
  logoText = 'MATEATLETAS',
  stats = DEFAULT_STATS,
  avatarInitials = 'AM',
  onAvatarClick,
  className = '',
}: TopBarProps): React.JSX.Element {
  return (
    <header
      className={`flex items-center justify-between w-full ${className}`}
      style={{
        height: 70,
        padding: '0 40px',
        background: 'linear-gradient(180deg, rgba(10,10,26,0.8) 0%, rgba(10,10,26,0) 100%)',
      }}
    >
      {/* Left Section - Logo */}
      <div className="flex items-center gap-3">
        {/* Logo Icon - 44x44 gold gradient trophy */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background:
              'linear-gradient(145deg, #FDE68A 0%, #FFD700 30%, #F59E0B 70%, #D97706 100%)',
            border: '1px solid rgba(255,255,255,0.19)',
            boxShadow: '0 0 16px #FFD700CC, 0 0 32px rgba(245,158,11,0.38)',
          }}
        >
          <Trophy size={24} color="#FFFFFF" />
        </div>

        {/* Logo Text */}
        <span
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: 22,
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: 3,
            textShadow: '0 0 20px rgba(255,215,0,0.19)',
          }}
        >
          {logoText}
        </span>

        {/* Club STEAM Badge */}
        <div
          style={{
            borderRadius: 10,
            backgroundColor: 'rgba(255,215,0,0.13)',
            border: '1px solid rgba(255,215,0,0.31)',
            padding: '5px 12px',
            boxShadow: '0 0 12px rgba(255,215,0,0.25)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: 12,
              fontWeight: 700,
              color: '#FFD700',
              letterSpacing: 1,
            }}
          >
            Club STEAM
          </span>
        </div>
      </div>

      {/* Right Section - Stats + Avatar */}
      <div className="flex items-center gap-4">
        {/* Stat Badges */}
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.text}
              className="flex items-center gap-1.5 rounded-[20px] px-3.5 py-1.5"
              style={{
                backgroundColor: `${stat.color}18`,
                border: `1px solid ${stat.color}60`,
                boxShadow: `0 0 10px ${stat.color}30`,
              }}
            >
              <Icon
                size={16}
                style={{
                  color: stat.color,
                  filter: `drop-shadow(0 0 8px ${stat.color})`,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: 14,
                  fontWeight: 700,
                  color: stat.color,
                }}
              >
                {stat.text}
              </span>
            </div>
          );
        })}

        {/* Avatar Circle */}
        <button
          type="button"
          onClick={onAvatarClick}
          className="flex items-center justify-center"
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            background:
              'linear-gradient(145deg, #6EE7B7 0%, #34D399 30%, #10B981 70%, #059669 100%)',
            border: '2px solid rgba(255,255,255,0.25)',
            boxShadow: '0 0 14px rgba(52,211,153,0.8), 0 0 28px rgba(16,185,129,0.38)',
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: 16,
            fontWeight: 800,
            color: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          {avatarInitials}
        </button>
      </div>
    </header>
  );
}
