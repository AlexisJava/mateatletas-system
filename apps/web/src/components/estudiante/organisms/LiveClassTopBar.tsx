'use client';

import { Breadcrumb } from '../molecules/Breadcrumb';
import { LiveBadge } from '../molecules/LiveBadge';
import { TimerBadge } from '../molecules/TimerBadge';
import { XPBadge } from '../molecules/XPBadge';

/**
 * LiveClassTopBar - Top Bar de Clase en Vivo (portal_estudiante.pen)
 *
 * Extraído de "13. Clase en Vivo" → Top Bar (N9ntv):
 *
 * Container:
 * - height: 52, width: fill_container
 * - fill: linear-gradient(180deg, #1E1B4B 0%, #030014 100%)
 * - padding: [0, 16]
 * - justifyContent: space_between
 * - alignItems: center
 *
 * Left (9tybV):
 * - Breadcrumb: Home → Matemáticas → Clase en Vivo
 * - LiveBadge: EN VIVO, red, pulsing dot
 * - Class title: "Fracciones Básicas" Inter 16/700 white
 * - Teacher: "Prof. Carolina" Inter 12/500 #9CA3AF
 *
 * Right (kgEya):
 * - TimerBadge: "23:45", blue
 * - XPBadge: "+120", amber gradient
 */

interface BreadcrumbItem {
  label: string;
  href?: string;
  isIcon?: boolean;
}

interface LiveClassTopBarProps {
  breadcrumbs: BreadcrumbItem[];
  classTitle: string;
  teacherName: string;
  timer: string;
  xpText: string;
  className?: string;
}

export function LiveClassTopBar({
  breadcrumbs,
  classTitle,
  teacherName,
  timer,
  xpText,
  className = '',
}: LiveClassTopBarProps): React.JSX.Element {
  return (
    <header
      className={`flex items-center justify-between w-full ${className}`}
      style={{
        height: 52,
        padding: '0 16px',
        background: 'linear-gradient(180deg, #1E1B4B 0%, #030014 100%)',
      }}
    >
      {/* Left Info */}
      <div className="flex items-center gap-3">
        <Breadcrumb items={breadcrumbs} />
        <LiveBadge />

        {/* Class Title + Teacher */}
        <div className="flex flex-col">
          <span
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: 16,
              fontWeight: 700,
              color: '#FFFFFF',
            }}
          >
            {classTitle}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: 12,
              fontWeight: 500,
              color: '#9CA3AF',
            }}
          >
            {teacherName}
          </span>
        </div>
      </div>

      {/* Right Info */}
      <div className="flex items-center gap-4">
        <TimerBadge time={timer} />
        <XPBadge text={xpText} />
      </div>
    </header>
  );
}
