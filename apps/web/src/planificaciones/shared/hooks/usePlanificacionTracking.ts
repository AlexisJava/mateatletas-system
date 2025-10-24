/**
 * usePlanificacionTracking - Hook para tracking automático de planificaciones
 */

'use client';

import { useCallback } from 'react';
// TODO: Integrar con el API cuando esté listo
// import { planificacionesApi } from '@/lib/api/planificaciones.api';

interface ProgresoData {
  puntos_obtenidos?: number;
  tiempo_total_minutos?: number;
  completado?: boolean;
  estado_juego?: Record<string, any>;
}

export function usePlanificacionTracking(codigoPlanificacion: string) {
  const registrarInicio = useCallback(() => {
    // TODO: Llamar al API para registrar inicio
    console.log(`[Tracking] Inicio de planificación: ${codigoPlanificacion}`);

    // Por ahora guardamos en localStorage
    const key = `planificacion_${codigoPlanificacion}_inicio`;
    localStorage.setItem(key, new Date().toISOString());
  }, [codigoPlanificacion]);

  const registrarProgreso = useCallback((data: ProgresoData) => {
    // TODO: Llamar al API para actualizar progreso
    console.log(`[Tracking] Progreso actualizado:`, data);

    // Por ahora guardamos en localStorage
    const key = `planificacion_${codigoPlanificacion}_progreso`;
    const progresoActual = JSON.parse(localStorage.getItem(key) || '{}');
    localStorage.setItem(key, JSON.stringify({ ...progresoActual, ...data }));
  }, [codigoPlanificacion]);

  const guardarEstado = useCallback((estadoJuego?: Record<string, any>) => {
    // TODO: Llamar al API para guardar estado
    console.log(`[Tracking] Estado guardado automáticamente`);

    if (estadoJuego) {
      const key = `planificacion_${codigoPlanificacion}_estado`;
      localStorage.setItem(key, JSON.stringify(estadoJuego));
    }
  }, [codigoPlanificacion]);

  const cargarEstado = useCallback((): Record<string, any> | null => {
    // TODO: Llamar al API para cargar estado
    const key = `planificacion_${codigoPlanificacion}_estado`;
    const estadoGuardado = localStorage.getItem(key);

    if (estadoGuardado) {
      try {
        return JSON.parse(estadoGuardado);
      } catch (error) {
        console.error('[Tracking] Error al cargar estado:', error);
        return null;
      }
    }

    return null;
  }, [codigoPlanificacion]);

  const registrarCompletado = useCallback((puntosFinales: number) => {
    // TODO: Llamar al API para marcar como completado
    console.log(`[Tracking] Planificación completada con ${puntosFinales} puntos`);

    registrarProgreso({
      completado: true,
      puntos_obtenidos: puntosFinales,
    });
  }, [registrarProgreso]);

  return {
    registrarInicio,
    registrarProgreso,
    guardarEstado,
    cargarEstado,
    registrarCompletado,
  };
}
