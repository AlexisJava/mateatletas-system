'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook para tracking de tiempo en lecciones con Page Visibility API
 *
 * Características:
 * - Pausa automáticamente cuando la pestaña está oculta
 * - Resume cuando la pestaña vuelve a ser visible
 * - Reporta tiempo acumulado para sincronizar con backend
 * - Limpia recursos al desmontar
 *
 * @param onTimeUpdate - Callback para reportar tiempo acumulado (en segundos)
 * @param reportIntervalMs - Intervalo de reporte en ms (default: 30000 = 30s)
 *
 * Fuentes:
 * - https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
 * - https://blog.sethcorker.com/harnessing-the-page-visibility-api-with-react/
 */
export function useLessonTimer(
  onTimeUpdate?: (elapsedSeconds: number) => void,
  reportIntervalMs: number = 30000,
) {
  // Tiempo acumulado en segundos (para UI)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  // Si el timer está activo (tab visible)
  const [isActive, setIsActive] = useState(true);

  // Refs para evitar stale closures
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const accumulatedRef = useRef<number>(0);
  const lastReportRef = useRef<number>(0);
  const onTimeUpdateRef = useRef(onTimeUpdate);

  // Mantener referencia actualizada del callback
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  // Función para iniciar el timer
  const startTimer = useCallback(() => {
    if (intervalRef.current) return;

    lastTickRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = Math.floor((now - lastTickRef.current) / 1000);

      if (deltaSeconds > 0) {
        accumulatedRef.current += deltaSeconds;
        lastTickRef.current = now;
        setElapsedSeconds(accumulatedRef.current);

        // Reportar cada reportIntervalMs
        if (accumulatedRef.current - lastReportRef.current >= reportIntervalMs / 1000) {
          const toReport = accumulatedRef.current - lastReportRef.current;
          lastReportRef.current = accumulatedRef.current;
          onTimeUpdateRef.current?.(toReport);
        }
      }
    }, 1000);
  }, [reportIntervalMs]);

  // Función para pausar el timer
  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Función para reportar tiempo final (al salir de la página)
  const reportFinalTime = useCallback(() => {
    const pendingTime = accumulatedRef.current - lastReportRef.current;
    if (pendingTime > 0) {
      onTimeUpdateRef.current?.(pendingTime);
      lastReportRef.current = accumulatedRef.current;
    }
  }, []);

  // Effect principal: Page Visibility API
  useEffect(() => {
    // Detectar si estamos en el cliente
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab oculto: pausar timer y reportar tiempo pendiente
        stopTimer();
        setIsActive(false);

        // Reportar tiempo acumulado pendiente
        const pendingTime = accumulatedRef.current - lastReportRef.current;
        if (pendingTime > 0) {
          onTimeUpdateRef.current?.(pendingTime);
          lastReportRef.current = accumulatedRef.current;
        }
      } else {
        // Tab visible: reanudar timer
        setIsActive(true);
        startTimer();
      }
    };

    // Iniciar timer si la página ya es visible
    if (!document.hidden) {
      startTimer();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopTimer();
      // Reportar tiempo final al desmontar
      reportFinalTime();
    };
  }, [startTimer, stopTimer, reportFinalTime]);

  // Reset del timer (útil al cambiar de lección)
  const reset = useCallback(() => {
    stopTimer();
    accumulatedRef.current = 0;
    lastReportRef.current = 0;
    lastTickRef.current = Date.now();
    setElapsedSeconds(0);
    if (!document.hidden) {
      startTimer();
    }
  }, [startTimer, stopTimer]);

  return {
    /** Tiempo transcurrido en segundos */
    elapsedSeconds,
    /** Si el timer está activo (tab visible) */
    isActive,
    /** Resetear el timer (ej: al cambiar de lección) */
    reset,
    /** Forzar reporte del tiempo pendiente */
    reportFinalTime,
  };
}

/**
 * Formatea segundos a string legible (MM:SS o HH:MM:SS)
 */
export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
