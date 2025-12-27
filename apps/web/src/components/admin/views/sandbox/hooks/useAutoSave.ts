import { useState, useRef, useCallback, useEffect } from 'react';
import { updateNodo, updateContenido } from '@/lib/api/contenidos.api';
import type { UpdateNodoDto, UpdateContenidoDto } from '@/lib/api/contenidos.api';
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
  /** Guardar contenidoJson de un nodo (debounced) */
  saveNodoContent: (nodoId: string, contenidoJson: string) => void;
  /** Guardar título de un nodo (debounced) */
  saveNodoTitle: (nodoId: string, titulo: string) => void;
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
  const nodoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const metaTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingNodoChanges = useRef<Map<string, UpdateNodoDto>>(new Map());
  const pendingMetaChanges = useRef<UpdateContenidoDto | null>(null);

  // Cleanup en unmount
  useEffect(() => {
    return () => {
      if (nodoTimeoutRef.current) clearTimeout(nodoTimeoutRef.current);
      if (metaTimeoutRef.current) clearTimeout(metaTimeoutRef.current);
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, []);

  // Reset saved timeout helper
  const scheduleResetToDraft = useCallback(() => {
    if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    savedTimeoutRef.current = setTimeout(() => {
      setStatus('draft');
    }, savedDisplayMs);
  }, [savedDisplayMs]);

  // ─── Save Nodo Changes ───
  const executeNodoSave = useCallback(async () => {
    if (!contenidoId || pendingNodoChanges.current.size === 0) return;

    setStatus('saving');
    setErrorMessage(null);

    const changes = new Map(pendingNodoChanges.current);
    pendingNodoChanges.current.clear();

    try {
      // Guardar todos los nodos pendientes en paralelo
      await Promise.all(
        Array.from(changes.entries()).map(([nodoId, dto]) => updateNodo(nodoId, dto)),
      );
      setStatus('saved');
      scheduleResetToDraft();
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error al guardar');
      // Restaurar cambios pendientes para reintentar
      changes.forEach((dto, nodoId) => {
        pendingNodoChanges.current.set(nodoId, dto);
      });
    }
  }, [contenidoId, scheduleResetToDraft]);

  const saveNodoContent = useCallback(
    (nodoId: string, contenidoJson: string) => {
      if (!contenidoId) return;

      // Merge con cambios existentes del mismo nodo
      const existing = pendingNodoChanges.current.get(nodoId) || {};
      pendingNodoChanges.current.set(nodoId, { ...existing, contenidoJson });

      // Reset debounce timer
      if (nodoTimeoutRef.current) clearTimeout(nodoTimeoutRef.current);
      nodoTimeoutRef.current = setTimeout(executeNodoSave, debounceMs);
    },
    [contenidoId, debounceMs, executeNodoSave],
  );

  const saveNodoTitle = useCallback(
    (nodoId: string, titulo: string) => {
      if (!contenidoId) return;

      const existing = pendingNodoChanges.current.get(nodoId) || {};
      pendingNodoChanges.current.set(nodoId, { ...existing, titulo });

      if (nodoTimeoutRef.current) clearTimeout(nodoTimeoutRef.current);
      nodoTimeoutRef.current = setTimeout(executeNodoSave, debounceMs);
    },
    [contenidoId, debounceMs, executeNodoSave],
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
      scheduleResetToDraft();
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error al guardar');
      // Restaurar para reintentar
      pendingMetaChanges.current = changes;
    }
  }, [contenidoId, scheduleResetToDraft]);

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
    if (nodoTimeoutRef.current) clearTimeout(nodoTimeoutRef.current);
    if (metaTimeoutRef.current) clearTimeout(metaTimeoutRef.current);

    await Promise.all([executeNodoSave(), executeMetaSave()]);
  }, [executeNodoSave, executeMetaSave]);

  const cancelPending = useCallback(() => {
    if (nodoTimeoutRef.current) clearTimeout(nodoTimeoutRef.current);
    if (metaTimeoutRef.current) clearTimeout(metaTimeoutRef.current);
    pendingNodoChanges.current.clear();
    pendingMetaChanges.current = null;
  }, []);

  return {
    status,
    errorMessage,
    saveNodoContent,
    saveNodoTitle,
    saveContenidoMeta,
    flushPendingChanges,
    cancelPending,
  };
}
