/**
 * useLoadFromUrl - Load content from URL query params
 * Reads ?type=xxx&id=xxx and loads the appropriate content
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useSandboxApi } from './useSandboxApi';
import { useSandboxState } from '../context/SandboxContext';
import type { ContentType } from '../types/sandbox.types';

export function useLoadFromUrl() {
  const searchParams = useSearchParams();
  const state = useSandboxState();
  const { loadContenido, loadPlanificacion } = useSandboxApi();
  // Use type:id as cache key to handle navigation between different content types
  const loadedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('id');
    const type = (searchParams.get('type') as ContentType) || 'microleccion';

    // Skip if no ID
    if (!id) return;

    const currentKey = `${type}:${id}`;

    // Skip if already loaded this exact combination
    if (currentKey === loadedKeyRef.current) return;

    // Skip if content is already in state (loaded directly after creation)
    const currentContentId =
      type === 'planificacion' ? state.planificacion?.id : state.contenido?.id;
    if (currentContentId === id && state.contentType === type) {
      loadedKeyRef.current = currentKey;
      return;
    }

    // Load from API
    loadedKeyRef.current = currentKey;
    if (type === 'planificacion') {
      loadPlanificacion(id);
    } else {
      loadContenido(id);
    }
  }, [
    searchParams,
    loadContenido,
    loadPlanificacion,
    state.contenido?.id,
    state.planificacion?.id,
    state.contentType,
  ]);
}
