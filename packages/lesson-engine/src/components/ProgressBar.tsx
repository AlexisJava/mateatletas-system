/**
 * ProgressBar Component
 *
 * Indicador visual del progreso de la lección.
 * Soporta tres variantes: dots, bar, segments.
 *
 * Accesibilidad:
 * - role="progressbar"
 * - aria-valuenow, aria-valuemin, aria-valuemax
 * - aria-label descriptivo
 */

import { useMemo } from 'react';
import { useLessonContext } from '../context/LessonContext';

export type ProgressBarVariant = 'dots' | 'bar' | 'segments';

export interface ProgressBarProps {
  /** Variante del indicador de progreso */
  variant?: ProgressBarVariant;
  /** Mostrar label de progreso (ej: "3/10" o "30%") */
  showLabel?: boolean;
  /** Formato del label: 'fraction' (3/10) o 'percent' (30%) */
  labelFormat?: 'fraction' | 'percent';
  /** Clase CSS adicional */
  className?: string;
  /** Color del progreso (Tailwind class o CSS color) */
  color?: string;
  /** Color del fondo (Tailwind class o CSS color) */
  bgColor?: string;
  /** Tamaño: 'sm' | 'md' | 'lg' */
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: {
    dot: 'h-1.5 w-1.5',
    dotGap: 'gap-1',
    bar: 'h-1',
    segment: 'h-1.5',
    segmentGap: 'gap-0.5',
    text: 'text-xs',
  },
  md: {
    dot: 'h-2 w-2',
    dotGap: 'gap-1.5',
    bar: 'h-1.5',
    segment: 'h-2',
    segmentGap: 'gap-1',
    text: 'text-sm',
  },
  lg: {
    dot: 'h-3 w-3',
    dotGap: 'gap-2',
    bar: 'h-2',
    segment: 'h-3',
    segmentGap: 'gap-1.5',
    text: 'text-base',
  },
};

export function ProgressBar({
  variant = 'bar',
  showLabel = false,
  labelFormat = 'fraction',
  className = '',
  color = 'bg-cyan-400',
  bgColor = 'bg-white/10',
  size = 'md',
}: ProgressBarProps): React.ReactNode {
  const { state } = useLessonContext();
  const { currentSlideIndex, totalSlides, progressPercent, slidesVisited } = state;

  const sizes = sizeConfig[size];

  const label = useMemo(() => {
    if (labelFormat === 'percent') {
      return `${progressPercent}%`;
    }
    return `${slidesVisited.size}/${totalSlides}`;
  }, [labelFormat, progressPercent, slidesVisited.size, totalSlides]);

  const ariaLabel = `Progreso de la lección: ${slidesVisited.size} de ${totalSlides} slides visitados (${progressPercent}%)`;

  // Dots variant: one dot per slide
  if (variant === 'dots') {
    return (
      <div
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
        className={`flex items-center ${sizes.dotGap} ${className}`}
      >
        {Array.from({ length: totalSlides }, (_, index) => {
          const isVisited = slidesVisited.has(index);
          const isCurrent = index === currentSlideIndex;

          return (
            <span
              key={index}
              className={`
                ${sizes.dot} rounded-full transition-all duration-200
                ${isVisited ? color : bgColor}
                ${isCurrent ? 'ring-2 ring-white/50 ring-offset-1 ring-offset-transparent scale-125' : ''}
              `}
            />
          );
        })}
        {showLabel && <span className={`ml-2 ${sizes.text} text-white/70`}>{label}</span>}
      </div>
    );
  }

  // Segments variant: one segment per slide, with gaps
  if (variant === 'segments') {
    return (
      <div
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
        className={`flex items-center ${className}`}
      >
        <div className={`flex flex-1 ${sizes.segmentGap}`}>
          {Array.from({ length: totalSlides }, (_, index) => {
            const isVisited = slidesVisited.has(index);
            const isCurrent = index === currentSlideIndex;

            return (
              <div
                key={index}
                className={`
                  flex-1 ${sizes.segment} rounded-full transition-all duration-200
                  ${isVisited ? color : bgColor}
                  ${isCurrent ? 'ring-1 ring-white/30' : ''}
                `}
              />
            );
          })}
        </div>
        {showLabel && (
          <span className={`ml-3 ${sizes.text} text-white/70 whitespace-nowrap`}>{label}</span>
        )}
      </div>
    );
  }

  // Bar variant: single continuous bar (default)
  return (
    <div
      role="progressbar"
      aria-valuenow={progressPercent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      className={`flex items-center ${className}`}
    >
      <div className={`relative flex-1 ${sizes.bar} ${bgColor} rounded-full overflow-hidden`}>
        <div
          className={`absolute inset-y-0 left-0 ${color} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${progressPercent}%` }}
        />
        {/* Current position indicator */}
        <div
          className="absolute inset-y-0 w-0.5 bg-white/80 transition-all duration-300"
          style={{ left: `${((currentSlideIndex + 1) / totalSlides) * 100}%` }}
        />
      </div>
      {showLabel && (
        <span className={`ml-3 ${sizes.text} text-white/70 whitespace-nowrap`}>{label}</span>
      )}
    </div>
  );
}

export default ProgressBar;
