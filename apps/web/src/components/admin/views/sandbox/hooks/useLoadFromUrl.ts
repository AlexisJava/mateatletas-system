/**
 * useLoadFromUrl - Load contenido from URL query param
 * Reads ?id=xxx and loads the contenido on mount
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useSandboxApi } from './useSandboxApi';

export function useLoadFromUrl() {
  const searchParams = useSearchParams();
  const { loadContenido } = useSandboxApi();
  const loadedRef = useRef<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('id');

    // Only load if id exists and hasn't been loaded yet
    if (id && id !== loadedRef.current) {
      loadedRef.current = id;
      loadContenido(id);
    }
  }, [searchParams, loadContenido]);
}
