/**
 * Utilidades para adaptación por nivel del estudiante
 */

import type { AdaptacionNivel } from '../types/planificacion-loader.types';

/**
 * Determina la dificultad recomendada según el nivel del estudiante
 *
 * Niveles:
 * - 1-3: BASICO (6-7 años)
 * - 4-7: INTERMEDIO (8-9 años)
 * - 8-10: AVANZADO (10-12 años)
 */
export function adaptarPorNivel(nivelEstudiante: number): AdaptacionNivel {
  if (nivelEstudiante < 1 || nivelEstudiante > 10) {
    // Fallback a BASICO si nivel inválido
    return {
      nivelActual: 1,
      dificultadRecomendada: 'BASICO',
      descripcionNivel: 'Nivel inicial (6-7 años)',
    };
  }

  if (nivelEstudiante >= 1 && nivelEstudiante <= 3) {
    return {
      nivelActual: nivelEstudiante,
      dificultadRecomendada: 'BASICO',
      descripcionNivel: 'Nivel básico (6-7 años)',
    };
  }

  if (nivelEstudiante >= 4 && nivelEstudiante <= 7) {
    return {
      nivelActual: nivelEstudiante,
      dificultadRecomendada: 'INTERMEDIO',
      descripcionNivel: 'Nivel intermedio (8-9 años)',
    };
  }

  // nivelEstudiante >= 8 && nivelEstudiante <= 10
  return {
    nivelActual: nivelEstudiante,
    dificultadRecomendada: 'AVANZADO',
    descripcionNivel: 'Nivel avanzado (10-12 años)',
  };
}

/**
 * Obtiene el path de la planificación según el nivel
 * Ejemplo: nivel 2 → '/planificaciones/2025-11-nivel-1'
 */
export function obtenerPathPorNivel(nivelEstudiante: number): string {
  const adaptacion = adaptarPorNivel(nivelEstudiante);

  switch (adaptacion.dificultadRecomendada) {
    case 'BASICO':
      return '2025-11-nivel-1';
    case 'INTERMEDIO':
      return '2025-11-nivel-2';
    case 'AVANZADO':
      return '2025-11-nivel-3';
    default:
      return '2025-11-nivel-1'; // Fallback
  }
}

/**
 * Formatea el nivel para mostrar en UI
 */
export function formatearNivel(nivel: number): string {
  if (nivel < 1) return 'Nivel 1';
  if (nivel > 10) return 'Nivel 10';
  return `Nivel ${nivel}`;
}
