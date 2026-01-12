/**
 * Hook: useEntrance
 *
 * Hook para obtener props de animación de entrada para Framer Motion.
 * Retorna initial, animate y transition listos para usar.
 */

import { useMemo } from 'react';
import { entrances, durations, type EntrancePreset } from '../tokens/motion';

export type EntranceType = EntrancePreset | 'none';

export interface UseEntranceOptions {
  /** Tipo de animación de entrada */
  type?: EntranceType;
  /** Delay antes de animar (segundos) */
  delay?: number;
  /** Duración de la animación (segundos) */
  duration?: number;
}

export interface UseEntranceReturn {
  /** Props inicial para Framer Motion */
  initial: Record<string, unknown>;
  /** Props de animación para Framer Motion */
  animate: Record<string, unknown>;
  /** Props de transición para Framer Motion */
  transition: Record<string, unknown>;
}

export function useEntrance(options: UseEntranceOptions = {}): UseEntranceReturn {
  const { type = 'fade', delay = 0, duration } = options;

  return useMemo(() => {
    // Si es 'none', no animar
    if (type === 'none') {
      return {
        initial: {},
        animate: {},
        transition: {},
      };
    }

    const entrance = entrances[type] ?? entrances.fade;

    const baseTransition = {
      delay,
      duration: duration ?? durations.normal,
    };

    // Merge con transition personalizada del preset si existe
    const presetTransition = 'transition' in entrance ? entrance.transition : {};

    return {
      initial: entrance.initial,
      animate: entrance.animate,
      transition: {
        ...baseTransition,
        ...presetTransition,
      },
    };
  }, [type, delay, duration]);
}
