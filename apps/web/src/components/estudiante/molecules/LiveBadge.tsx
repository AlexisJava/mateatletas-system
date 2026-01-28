'use client';

/**
 * LiveBadge - Indicador "EN VIVO" con dot animado
 *
 * Extraído de "13. Clase en Vivo" Top Bar (portal_estudiante.pen):
 *
 * - cornerRadius: 12
 * - fill: #EF4444 (rojo sólido)
 * - padding: [6, 12]
 * - gap: 6
 * - stroke: #000000, thickness 2
 * - Dot: ellipse 8x8, fill #FFFFFF
 * - Text: "EN VIVO", Inter 11px weight 800, fill #FFFFFF
 */

interface LiveBadgeProps {
  className?: string;
}

export function LiveBadge({ className = '' }: LiveBadgeProps): React.JSX.Element {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 ${className}`}
      style={{
        backgroundColor: '#EF4444',
        border: '2px solid #000000',
      }}
    >
      {/* Live dot - 8x8 white circle with pulse animation */}
      <span
        className="animate-pulse"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          display: 'block',
        }}
      />
      {/* "EN VIVO" text - Inter 11px weight 800 */}
      <span
        className="font-[Inter]"
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: '#FFFFFF',
        }}
      >
        EN VIVO
      </span>
    </div>
  );
}
