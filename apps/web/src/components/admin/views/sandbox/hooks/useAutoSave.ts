import { useState, useRef, useCallback, useEffect } from 'react';
import { updateSlide, updateContenido } from '@/lib/api/contenidos.api';
import type { UpdateSlideDto, UpdateContenidoDto } from '@/lib/api/contenidos.api';
import type { SaveStatus } from '../types';

// Re-export for convenience
export type { SaveStatus } from '../types';

interface UseAutoSaveOptions {
  /** Delay en ms antes de guardar (default: 2000) */
  debounceMs?: number;
  /** Tiempo en ms que muestra "saved" antes de volver a "draft" (default: 3000) */
  savedDisplayMs?: number;
}

interface UseAutoSaveReturn {
  /** Estado actual del guardado */
  status: SaveStatus;
  /** Mensaje de error si status === 'error' */
  errorMessage: string | null;
  /** Guardar contenido de un slide (debounced) */
  saveSlideContent: (slideId: string, contenidoJson: string) => void;
  /** Guardar título de un slide (debounced) */
  saveSlideTitle: (slideId: string, titulo: string) => void;
  /** Guardar metadata del contenido (debounced) */
  saveContenidoMeta: (updates: UpdateContenidoDto) => void;
  /** Forzar guardado inmediato de cambios pendientes */
  flushPendingChanges: () => Promise<void>;
  /** Cancelar guardado pendiente */
  cancelPending: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function useAutoSave(
  contenidoId: string | null,
  options: UseAutoSaveOptions = {},
): UseAutoSaveReturn {
  const { debounceMs = 2000, savedDisplayMs = 3000 } = options;

  const [status, setStatus] = useState<SaveStatus>('draft');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs para debounce y pending changes
  const slideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const metaTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSlideChanges = useRef<Map<string, UpdateSlideDto>>(new Map());
  const pendingMetaChanges = useRef<UpdateContenidoDto | null>(null);

  // Cleanup en unmount
  useEffect(() => {
    return () => {
      if (slideTimeoutRef.current) clearTimeout(slideTimeoutRef.current);
      if (metaTimeoutRef.current) clearTimeout(metaTimeoutRef.current);
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, []);

  // Reset saved timeout helper
  const scheduleResetToSraft = useCallback(() => {
    if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    savedTimeoutRef.current = setTimeout(() => {
      setStatus('draft');
    }, savedDisplayMs);
  }, [savedDisplayMs]);

  // ─── Save Slide Changes ───
  const executeSlideSave = useCallback(async () => {
    if (!contenidoId || pendingSlideChanges.current.size === 0) return;

    setStatus('saving');
    setErrorMessage(null);

    const changes = new Map(pendingSlideChanges.current);
    pendingSlideChanges.current.clear();

    try {
      // Guardar todos los slides pendientes en paralelo
      await Promise.all(
        Array.from(changes.entries()).map(([slideId, dto]) =>
          updateSlide(contenidoId, slideId, dto),
        ),
      );
      setStatus('saved');
      scheduleResetToSraft();
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error al guardar');
      // Restaurar cambios pendientes para reintentar
      changes.forEach((dto, slideId) => {
        pendingSlideChanges.current.set(slideId, dto);
      });
    }
  }, [contenidoId, scheduleResetToSraft]);

  const saveSlideContent = useCallback(
    (slideId: string, contenidoJson: string) => {
      if (!contenidoId) return;

      // Merge con cambios existentes del mismo slide
      const existing = pendingSlideChanges.current.get(slideId) || {};
      pendingSlideChanges.current.set(slideId, { ...existing, contenidoJson });

      // Reset debounce timer
      if (slideTimeoutRef.current) clearTimeout(slideTimeoutRef.current);
      slideTimeoutRef.current = setTimeout(executeSlideSave, debounceMs);
    },
    [contenidoId, debounceMs, executeSlideSave],
  );

  const saveSlideTitle = useCallback(
    (slideId: string, titulo: string) => {
      if (!contenidoId) return;

      const existing = pendingSlideChanges.current.get(slideId) || {};
      pendingSlideChanges.current.set(slideId, { ...existing, titulo });

      if (slideTimeoutRef.current) clearTimeout(slideTimeoutRef.current);
      slideTimeoutRef.current = setTimeout(executeSlideSave, debounceMs);
    },
    [contenidoId, debounceMs, executeSlideSave],
  );

  // ─── Save Contenido Metadata ───
  const executeMetaSave = useCallback(async () => {
    if (!contenidoId || !pendingMetaChanges.current) return;

    setStatus('saving');
    setErrorMessage(null);

    const changes = pendingMetaChanges.current;
    pendingMetaChanges.current = null;

    try {
      await updateContenido(contenidoId, changes);
      setStatus('saved');
      scheduleResetToSraft();
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error al guardar');
      // Restaurar para reintentar
      pendingMetaChanges.current = changes;
    }
  }, [contenidoId, scheduleResetToSraft]);

  const saveContenidoMeta = useCallback(
    (updates: UpdateContenidoDto) => {
      if (!contenidoId) return;

      // Merge con cambios pendientes
      pendingMetaChanges.current = { ...pendingMetaChanges.current, ...updates };

      if (metaTimeoutRef.current) clearTimeout(metaTimeoutRef.current);
      metaTimeoutRef.current = setTimeout(executeMetaSave, debounceMs);
    },
    [contenidoId, debounceMs, executeMetaSave],
  );

  // ─── Flush & Cancel ───
  const flushPendingChanges = useCallback(async () => {
    if (slideTimeoutRef.current) clearTimeout(slideTimeoutRef.current);
    if (metaTimeoutRef.current) clearTimeout(metaTimeoutRef.current);

    await Promise.all([executeSlideSave(), executeMetaSave()]);
  }, [executeSlideSave, executeMetaSave]);

  const cancelPending = useCallback(() => {
    if (slideTimeoutRef.current) clearTimeout(slideTimeoutRef.current);
    if (metaTimeoutRef.current) clearTimeout(metaTimeoutRef.current);
    pendingSlideChanges.current.clear();
    pendingMetaChanges.current = null;
  }, []);

  return {
    status,
    errorMessage,
    saveSlideContent,
    saveSlideTitle,
    saveContenidoMeta,
    flushPendingChanges,
    cancelPending,
  };
}
