/**
 * useProgressSync Hook
 *
 * Sincroniza el progreso de la lección con el backend cada 10 segundos.
 * También sincroniza al cambiar de pestaña (visibility change) y al desmontar.
 *
 * @example
 * ```tsx
 * // En el componente que consume la lección
 * useProgressSync({
 *   contenidoId: 'abc123',
 *   nodoId: 'node456',
 *   onSync: async (data) => {
 *     await updateProgresoEstudiante(data.contenidoId, {
 *       nodoActualId: data.nodoId,
 *       tiempoAdicionalSegundos: data.deltaTimeSeconds,
 *       completado: data.completed,
 *     });
 *   },
 * });
 * ```
 */

import { useEffect, useRef, useCallback } from 'react';
import { useLessonContext } from '../context/LessonContext';

const SYNC_INTERVAL_MS = 10_000; // 10 seconds

export interface ProgressSyncData {
  /** ID del contenido */
  contenidoId: string;
  /** ID del nodo actual */
  nodoId: string | null;
  /** Índice del slide actual */
  slideIndex: number;
  /** Cantidad de slides visitados */
  slidesVisitedCount: number;
  /** Total de slides */
  totalSlides: number;
  /** Porcentaje de progreso (0-100) */
  progressPercent: number;
  /** Tiempo adicional desde el último sync (en segundos) */
  deltaTimeSeconds: number;
  /** Tiempo total en la lección (en segundos) */
  totalTimeSeconds: number;
  /** Si la lección está completa */
  completed: boolean;
}

export interface UseProgressSyncOptions {
  /** ID del contenido educativo */
  contenidoId: string;
  /** ID del nodo actual (puede cambiar durante la sesión) */
  nodoId: string | null;
  /** Callback para sincronizar con el backend */
  onSync: (data: ProgressSyncData) => Promise<void>;
  /** Porcentaje mínimo para considerar completado (default: 100) */
  completionThreshold?: number;
  /** Intervalo de sincronización en ms (default: 10000) */
  syncIntervalMs?: number;
  /** Desactivar sincronización automática (útil para preview) */
  disabled?: boolean;
}

export function useProgressSync({
  contenidoId,
  nodoId,
  onSync,
  completionThreshold = 100,
  syncIntervalMs = SYNC_INTERVAL_MS,
  disabled = false,
}: UseProgressSyncOptions): void {
  const { state } = useLessonContext();

  // Track last synced time to calculate delta
  const lastSyncedTimeRef = useRef<number>(0);
  const isSyncingRef = useRef<boolean>(false);

  // Create sync function
  const performSync = useCallback(async () => {
    if (disabled || isSyncingRef.current) return;

    isSyncingRef.current = true;

    try {
      const currentTime = state.timeSpentSeconds;
      const deltaTime = currentTime - lastSyncedTimeRef.current;

      // Only sync if there's actual time elapsed
      if (deltaTime <= 0 && lastSyncedTimeRef.current > 0) {
        isSyncingRef.current = false;
        return;
      }

      const isCompleted = state.progressPercent >= completionThreshold;

      const syncData: ProgressSyncData = {
        contenidoId,
        nodoId,
        slideIndex: state.currentSlideIndex,
        slidesVisitedCount: state.slidesVisited.size,
        totalSlides: state.totalSlides,
        progressPercent: state.progressPercent,
        deltaTimeSeconds: deltaTime,
        totalTimeSeconds: currentTime,
        completed: isCompleted,
      };

      await onSync(syncData);
      lastSyncedTimeRef.current = currentTime;
    } catch (error) {
      // Silent fail - don't interrupt user experience
      console.error('[useProgressSync] Sync failed:', error);
    } finally {
      isSyncingRef.current = false;
    }
  }, [
    contenidoId,
    nodoId,
    state.timeSpentSeconds,
    state.currentSlideIndex,
    state.slidesVisited.size,
    state.totalSlides,
    state.progressPercent,
    completionThreshold,
    disabled,
    onSync,
  ]);

  // Interval sync
  useEffect(() => {
    if (disabled) return;

    const intervalId = setInterval(() => {
      void performSync();
    }, syncIntervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [performSync, syncIntervalMs, disabled]);

  // Visibility change sync (when user leaves/returns to tab)
  useEffect(() => {
    if (disabled) return;

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'hidden') {
        // User is leaving - sync immediately
        void performSync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [performSync, disabled]);

  // Sync on unmount
  useEffect(() => {
    if (disabled) return;

    return () => {
      // Fire and forget on unmount
      void performSync();
    };
  }, [disabled]); // Only depend on disabled, not performSync to avoid re-running

  // Sync on nodo change
  useEffect(() => {
    if (disabled || !nodoId) return;

    // When nodo changes, sync the progress
    void performSync();
  }, [nodoId, disabled]); // Intentionally not including performSync
}

export default useProgressSync;
