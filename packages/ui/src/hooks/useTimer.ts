/**
 * Hook: useTimer
 *
 * Hook headless para manejar temporizadores.
 * Soporta countdown y countup.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseTimerOptions {
  /** Segundos iniciales */
  initialSeconds?: number;
  /** Iniciar automáticamente */
  autoStart?: boolean;
  /** Callback cuando llega a 0 (solo countdown) */
  onComplete?: () => void;
  /** true = cuenta regresiva, false = cuenta normal */
  countDown?: boolean;
}

export interface UseTimerReturn {
  /** Segundos actuales */
  seconds: number;
  /** Si está corriendo */
  isRunning: boolean;
  /** Si terminó (solo countdown) */
  isComplete: boolean;
  /** Iniciar el timer */
  start: () => void;
  /** Pausar el timer */
  pause: () => void;
  /** Reiniciar el timer */
  reset: () => void;
  /** Tiempo formateado "MM:SS" */
  formatted: string;
}

function formatTime(s: number): string {
  const mins = Math.floor(Math.abs(s) / 60);
  const secs = Math.abs(s) % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function useTimer(options: UseTimerOptions = {}): UseTimerReturn {
  const { initialSeconds = 0, autoStart = false, onComplete, countDown = false } = options;

  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Mantener referencia actualizada del callback
  onCompleteRef.current = onComplete;

  const isComplete = countDown && seconds <= 0;

  // Limpiar intervalo
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Efecto principal del timer
  useEffect(() => {
    if (!isRunning) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        const next = countDown ? prev - 1 : prev + 1;

        // Countdown llegó a 0
        if (countDown && next <= 0) {
          setIsRunning(false);
          onCompleteRef.current?.();
          return 0;
        }

        return next;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, countDown, clearTimer]);

  const start = useCallback(() => {
    if (countDown && seconds <= 0) return; // No iniciar si ya terminó
    setIsRunning(true);
  }, [countDown, seconds]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setSeconds(initialSeconds);
    setIsRunning(false);
  }, [initialSeconds, clearTimer]);

  return {
    seconds,
    isRunning,
    isComplete,
    start,
    pause,
    reset,
    formatted: formatTime(seconds),
  } as const;
}
