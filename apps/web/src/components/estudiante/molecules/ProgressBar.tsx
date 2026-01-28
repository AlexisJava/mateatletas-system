'use client';

/**
 * ProgressBar - Barra de progreso con gradiente y glow
 *
 * Extraído de "1. MAIN MENU" → Continuar Card (portal_estudiante.pen):
 *
 * Container (progressBar):
 * - cornerRadius: 3
 * - fill: #FFFFFF15 (blanco 8% opacidad)
 * - height: 6
 * - width: fill_container
 *
 * Fill (progressFill):
 * - cornerRadius: 3
 * - fill: linear-gradient(90deg, #34D399 0%, #10B981 100%)
 * - height: 6
 * - width: dinámico según porcentaje
 * - shadow: blur 8px #34D39980
 *
 * Label (progressText):
 * - "65% completado"
 * - font: Inter 11px weight 600
 * - fill: #6EE7B7
 * - gap: 6 debajo de la barra
 */

interface ProgressBarProps {
  /** Porcentaje de progreso (0-100) */
  percent: number;
  /** Texto de label (e.g., "65% completado"). Si no se pasa, no muestra label. */
  label?: string;
  /** Gradiente CSS de la barra de llenado */
  gradient?: string;
  /** Color del glow de la barra */
  glowColor?: string;
  /** Color del label */
  labelColor?: string;
  /** Altura de la barra en px (default: 6) */
  height?: number;
  className?: string;
}

export function ProgressBar({
  percent,
  label,
  gradient = 'linear-gradient(90deg, #34D399 0%, #10B981 100%)',
  glowColor = '#34D39980',
  labelColor = '#6EE7B7',
  height = 6,
  className = '',
}: ProgressBarProps): React.JSX.Element {
  const clampedPercent = Math.max(0, Math.min(100, percent));

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {/* Track - #FFFFFF15, cornerRadius 3 */}
      <div
        className="w-full overflow-hidden"
        style={{
          height,
          borderRadius: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Fill - gradient with glow */}
        <div
          style={{
            width: `${clampedPercent}%`,
            height: '100%',
            borderRadius: 3,
            background: gradient,
            boxShadow: `0 0 8px ${glowColor}`,
            transition: 'width 0.5s ease-out',
          }}
        />
      </div>

      {/* Label text - Inter 11px weight 600 */}
      {label && (
        <span
          className="font-[Inter]"
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: labelColor,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
