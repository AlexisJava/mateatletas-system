/**
 * Hook: useProgress
 *
 * Hook headless para manejar progreso numérico.
 * Útil para barras de progreso, steps, etc.
 */

import { useState, useCallback, useMemo } from 'react';

export interface UseProgressOptions {
  /** Total de pasos/items */
  total: number;
  /** Valor inicial */
  initial?: number;
  /** Callback cuando llega al 100% */
  onComplete?: () => void;
}

export interface UseProgressReturn {
  /** Valor actual */
  current: number;
  /** Total */
  total: number;
  /** Porcentaje (0-100) */
  percentage: number;
  /** Si llegó al 100% */
  isComplete: boolean;
  /** Incrementar (default: 1) */
  increment: (amount?: number) => void;
  /** Decrementar (default: 1) */
  decrement: (amount?: number) => void;
  /** Establecer valor específico */
  set: (value: number) => void;
  /** Reiniciar a valor inicial */
  reset: () => void;
}

export function useProgress(options: UseProgressOptions): UseProgressReturn {
  const { total, initial = 0, onComplete } = options;
  const [current, setCurrent] = useState(initial);

  const percentage = useMemo(() => {
    if (total <= 0) return 0;
    return Math.min(100, Math.max(0, (current / total) * 100));
  }, [current, total]);

  const isComplete = percentage >= 100;

  const increment = useCallback(
    (amount = 1) => {
      setCurrent((prev) => {
        const next = Math.min(total, prev + amount);
        if (next >= total && prev < total) {
          onComplete?.();
        }
        return next;
      });
    },
    [total, onComplete],
  );

  const decrement = useCallback((amount = 1) => {
    setCurrent((prev) => Math.max(0, prev - amount));
  }, []);

  const set = useCallback(
    (value: number) => {
      const clamped = Math.min(total, Math.max(0, value));
      setCurrent((prev) => {
        if (clamped >= total && prev < total) {
          onComplete?.();
        }
        return clamped;
      });
    },
    [total, onComplete],
  );

  const reset = useCallback(() => {
    setCurrent(initial);
  }, [initial]);

  return {
    current,
    total,
    percentage,
    isComplete,
    increment,
    decrement,
    set,
    reset,
  } as const;
}
