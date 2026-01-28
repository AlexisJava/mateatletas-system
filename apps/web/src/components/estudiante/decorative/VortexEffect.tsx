'use client';

/**
 * VortexEffect - Anillos concéntricos con gradient stroke (portal_estudiante.pen)
 *
 * Extraído de "2. Selección de Mundos" → Vortex Container (bykf1):
 *
 * Estructura:
 * - 3 anillos ellípticos concéntricos
 * - Cada anillo: transparent fill, gradient stroke 2-3px
 * - Outer shadow glow
 * - 4-5 partículas pequeñas alrededor
 * - Center glow ellipse
 *
 * Outer Ring (190x115):
 * - stroke: gradient 5-stop (00 → full → light → full → 00)
 * - thickness: 3px, blur: 20
 *
 * Mid Ring (152x92):
 * - stroke: gradient 4-stop
 * - thickness: 2px, blur: 16
 *
 * Inner Ring (114x69):
 * - stroke: gradient 3-stop
 * - thickness: 2px, blur: 12
 *
 * Center Glow (76x61):
 * - radial-gradient
 */

interface VortexEffectProps {
  /** Primary color for the vortex */
  color: string;
  /** Light color variant (default: derived) */
  lightColor?: string;
  /** Container width (default: 190) */
  width?: number;
  /** Container height (default: 150) */
  height?: number;
  /** Show particles around vortex */
  showParticles?: boolean;
  className?: string;
}

export function VortexEffect({
  color,
  lightColor,
  width = 190,
  height = 150,
  showParticles = true,
  className = '',
}: VortexEffectProps): React.JSX.Element {
  // Scale factors based on original 190x150
  const scaleX = width / 190;
  const scaleY = height / 150;

  // Derive light color if not provided (add 40% brightness)
  const light = lightColor ?? color;

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* SVG for elliptical rings with gradient strokes */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 190 150"
        className="absolute inset-0"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Outer ring gradient */}
          <linearGradient id="outerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="30%" stopColor={color} stopOpacity="1" />
            <stop offset="50%" stopColor={light} stopOpacity="1" />
            <stop offset="70%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>

          {/* Mid ring gradient */}
          <linearGradient id="midGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="40%" stopColor={color} stopOpacity="1" />
            <stop offset="60%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>

          {/* Inner ring gradient */}
          <linearGradient id="innerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={light} stopOpacity="0" />
            <stop offset="50%" stopColor={light} stopOpacity="1" />
            <stop offset="100%" stopColor={light} stopOpacity="0" />
          </linearGradient>

          {/* Glow filters */}
          <filter id="outerGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
          </filter>
          <filter id="midGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>
          <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
        </defs>

        {/* Outer Ring - 190x115 at (0, 18) */}
        <ellipse
          cx="95"
          cy="75"
          rx="95"
          ry="57"
          fill="none"
          stroke="url(#outerGrad)"
          strokeWidth="3"
          filter="url(#outerGlow)"
          opacity="0.8"
        />

        {/* Mid Ring - 152x92 at (19, 30) → center (95, 76) */}
        <ellipse
          cx="95"
          cy="76"
          rx="76"
          ry="46"
          fill="none"
          stroke="url(#midGrad)"
          strokeWidth="2"
          filter="url(#midGlow)"
          opacity="0.7"
        />

        {/* Inner Ring - 114x69 at (38, 42) → center (95, 76) */}
        <ellipse
          cx="95"
          cy="76"
          rx="57"
          ry="35"
          fill="none"
          stroke="url(#innerGrad)"
          strokeWidth="2"
          filter="url(#innerGlow)"
          opacity="0.6"
        />
      </svg>

      {/* Center Glow - radial gradient ellipse */}
      <div
        className="absolute"
        style={{
          width: 76 * scaleX,
          height: 61 * scaleY,
          left: 57 * scaleX,
          top: 46 * scaleY,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}30 0%, ${color}10 50%, ${color}00 100%)`,
        }}
      />

      {/* Particles around vortex */}
      {showParticles && (
        <>
          <div
            className="absolute rounded-full"
            style={{
              width: 6 * scaleX,
              height: 6 * scaleY,
              left: 20 * scaleX,
              top: 10 * scaleY,
              backgroundColor: light,
              boxShadow: `0 0 8px ${light}`,
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 4 * scaleX,
              height: 4 * scaleY,
              left: width - 10,
              top: 30 * scaleY,
              backgroundColor: color,
              boxShadow: `0 0 6px ${color}`,
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 5 * scaleX,
              height: 5 * scaleY,
              left: 5 * scaleX,
              top: 120 * scaleY,
              backgroundColor: light,
              boxShadow: `0 0 8px ${light}`,
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 3 * scaleX,
              height: 3 * scaleY,
              left: width - 5,
              top: 140 * scaleY,
              backgroundColor: color,
              boxShadow: `0 0 5px ${color}`,
            }}
          />
        </>
      )}
    </div>
  );
}
