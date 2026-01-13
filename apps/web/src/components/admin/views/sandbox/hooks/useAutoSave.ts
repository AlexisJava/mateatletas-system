/**
 * useAutoSave - Debounced auto-save for nodo JSON content
 * Status is managed by saveNodoJson (dispatches SET_SAVE_STATUS)
 */

'use client';

import { useEffect, useRef } from 'react';

interface UseAutoSaveParams {
  nodoId: string | null;
  json: string | null;
  onSave: (nodoId: string, json: string) => Promise<void>;
  debounceMs?: number;
}

export function useAutoSave({ nodoId, json, onSave, debounceMs = 1500 }: UseAutoSaveParams): void {
  const previousJsonRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!nodoId || json === null) return;
    if (json === previousJsonRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      await onSave(nodoId, json);
      previousJsonRef.current = json;
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [nodoId, json, onSave, debounceMs]);
}
