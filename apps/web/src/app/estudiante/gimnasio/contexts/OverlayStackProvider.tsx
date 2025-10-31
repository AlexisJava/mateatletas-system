/**
 * Overlay Stack Provider - Sistema de navegación apilada
 * Arquitectura tipo iOS/Android con push/pop navigation
 */

'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { OverlayConfig, OverlayStackContextType } from '../types/overlay.types';

const OverlayStackContext = createContext<OverlayStackContextType | undefined>(undefined);

export interface OverlayStackProviderProps {
  children: ReactNode;
}

export function OverlayStackProvider({ children }: OverlayStackProviderProps) {
  const [stack, setStack] = useState<OverlayConfig[]>([]);

  /**
   * Push - Agregar overlay al stack (animación desde derecha)
   */
  const push = useCallback((config: OverlayConfig) => {
    setStack((prev) => [...prev, config]);
    // Prevenir scroll del body cuando hay overlays
    document.body.style.overflow = 'hidden';
  }, []);

  /**
   * Pop - Remover overlay del top (animación hacia derecha)
   */
  const pop = useCallback(() => {
    setStack((prev) => {
      if (prev.length === 0) return prev;
      const newStack = prev.slice(0, -1);

      // Restaurar scroll si no quedan overlays
      if (newStack.length === 0) {
        document.body.style.overflow = 'auto';
      }

      return newStack;
    });
  }, []);

  /**
   * Replace - Reemplazar overlay top sin animación de back
   */
  const replace = useCallback((config: OverlayConfig) => {
    setStack((prev) => {
      if (prev.length === 0) return [config];
      return [...prev.slice(0, -1), config];
    });
  }, []);

  /**
   * Clear - Limpiar todo el stack (volver a HubView)
   */
  const clear = useCallback(() => {
    setStack([]);
    document.body.style.overflow = 'auto';
  }, []);

  /**
   * Computed values
   */
  const canGoBack = stack.length > 0;
  const currentOverlay: OverlayConfig | null =
    stack.length > 0 ? stack[stack.length - 1]! : null;
  const depth = stack.length;

  /**
   * Atajo de teclado ESC para pop
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canGoBack) {
        pop();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [canGoBack, pop]);

  /**
   * Cleanup: Restaurar overflow al desmontar
   */
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const value: OverlayStackContextType = {
    stack,
    push,
    pop,
    replace,
    clear,
    canGoBack,
    currentOverlay,
    depth,
  };

  return <OverlayStackContext.Provider value={value}>{children}</OverlayStackContext.Provider>;
}

/**
 * Hook para acceder al Overlay Stack
 */
export function useOverlayStack(): OverlayStackContextType {
  const context = useContext(OverlayStackContext);
  if (!context) {
    throw new Error('useOverlayStack must be used within OverlayStackProvider');
  }
  return context;
}

/**
 * Hook de retrocompatibilidad con sistema antiguo
 * Permite migración gradual de componentes
 */
export function useOverlay() {
  const { push, pop, currentOverlay } = useOverlayStack();

  return {
    activeOverlay: currentOverlay?.type || null,
    openOverlay: (type: OverlayConfig['type']) => {
      push({ type });
    },
    closeOverlay: pop,
  };
}
