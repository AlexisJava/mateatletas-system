'use client';

import { useEffect } from 'react';
import type { CasaTipo } from '@/store/auth.store';

/**
 * Hook para aplicar el tema de casa del estudiante
 *
 * Aplica el atributo data-casa al elemento <html> para activar
 * las variables CSS correspondientes a la casa del estudiante.
 *
 * @param casaTipo - Tipo de casa (QUANTUM, VERTEX, PULSAR) o null/undefined
 *
 * @example
 * ```tsx
 * function EstudianteLayout() {
 *   const { user } = useAuthStore();
 *   useCasaTheme(user?.casa?.tipo);
 *   // ...
 * }
 * ```
 */
export function useCasaTheme(casaTipo: CasaTipo | null | undefined): void {
  useEffect(() => {
    const root = document.documentElement;

    if (casaTipo) {
      // Aplicar el tema de la casa
      root.setAttribute('data-casa', casaTipo);
    } else {
      // Si no hay casa, usar default (PULSAR)
      root.setAttribute('data-casa', 'PULSAR');
    }

    // Cleanup: remover el atributo al desmontar
    return () => {
      root.removeAttribute('data-casa');
    };
  }, [casaTipo]);
}

/**
 * Obtiene los colores de una casa específica
 * Útil para casos donde se necesitan los colores sin usar CSS variables
 */
export const CASA_COLORS = {
  QUANTUM: {
    primary: '#00d4ff',
    secondary: '#06b6d4',
    accent: '#0891b2',
    dark: '#155e75',
    gradient: 'linear-gradient(135deg, #00d4ff 0%, #06b6d4 50%, #0891b2 100%)',
    glow: 'rgba(0, 212, 255, 0.4)',
    name: 'Casa Quantum',
  },
  VERTEX: {
    primary: '#ff00ff',
    secondary: '#c026d3',
    accent: '#a21caf',
    dark: '#701a75',
    gradient: 'linear-gradient(135deg, #ff00ff 0%, #c026d3 50%, #a21caf 100%)',
    glow: 'rgba(255, 0, 255, 0.4)',
    name: 'Casa Vertex',
  },
  PULSAR: {
    primary: '#ffaa00',
    secondary: '#f59e0b',
    accent: '#d97706',
    dark: '#92400e',
    gradient: 'linear-gradient(135deg, #ffaa00 0%, #f59e0b 50%, #d97706 100%)',
    glow: 'rgba(255, 170, 0, 0.4)',
    name: 'Casa Pulsar',
  },
} as const;

/**
 * Obtiene los colores de una casa de forma segura
 */
export function getCasaColors(casaTipo: CasaTipo | null | undefined) {
  return CASA_COLORS[casaTipo ?? 'PULSAR'];
}
