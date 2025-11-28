/**
 * Hook para manejar el progreso de una planificación
 * Maneja automáticamente:
 * - Cargar progreso del estudiante
 * - Guardar estado
 * - Tracking de tiempo
 * - Avanzar semanas
 * - Completar semanas
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  PlanificacionConfig,
  ProgresoEstudiante,
  UsePlanificacionProgressReturn,
  JsonValue,
} from './types';

interface ProgresoApiResponse {
  semana_actual?: number;
  ultima_actividad?: string;
  estado_guardado?: JsonValue;
  tiempo_total_minutos?: number;
  puntos_totales?: number;
  semanas_activas?: number[];
}

export function usePlanificacionProgress(
  config: PlanificacionConfig,
): UsePlanificacionProgressReturn {
  const [progreso, setProgreso] = useState<ProgresoEstudiante | null>(null);
  const [semanasActivas, setSemanasActivas] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // CARGAR PROGRESO INICIAL
  // ============================================================================
  useEffect(() => {
    async function cargarProgreso() {
      try {
        setIsLoading(true);
        setError(null);

        // Llamar API para obtener progreso
        const response = await fetch(`/api/planificaciones/${config.codigo}/progreso`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Error al cargar progreso');
        }

        const data = (await response.json()) as ProgresoApiResponse;

        const ultimaActividadIso = data.ultima_actividad ?? new Date().toISOString();

        setProgreso({
          semanaActual: data.semana_actual || 1,
          ultimaActividad: new Date(ultimaActividadIso),
          estadoGuardado: data.estado_guardado ?? null,
          tiempoTotalMinutos: data.tiempo_total_minutos || 0,
          puntosTotales: data.puntos_totales || 0,
        });

        setSemanasActivas(data.semanas_activas || []);
      } catch (err) {
        console.error('Error cargando progreso:', err);
        setError('No se pudo cargar el progreso');

        // Progreso por defecto en caso de error
        setProgreso({
          semanaActual: 1,
          ultimaActividad: new Date(),
          estadoGuardado: null,
          tiempoTotalMinutos: 0,
          puntosTotales: 0,
        });
        setSemanasActivas([1]);
      } finally {
        setIsLoading(false);
      }
    }

    cargarProgreso();
  }, [config.codigo]);

  // ============================================================================
  // GUARDAR ESTADO
  // ============================================================================
  const guardarEstado = useCallback(
    async (estado: JsonValue) => {
      try {
        const response = await fetch(`/api/planificaciones/${config.codigo}/progreso`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            estado_guardado: estado,
          }),
        });

        if (!response.ok) {
          throw new Error('Error al guardar estado');
        }

        // Actualizar estado local
        setProgreso((prev) =>
          prev
            ? {
                ...prev,
                estadoGuardado: estado,
                ultimaActividad: new Date(),
              }
            : null,
        );
      } catch (err) {
        console.error('Error guardando estado:', err);
        throw err;
      }
    },
    [config.codigo],
  );

  // ============================================================================
  // AVANZAR SEMANA
  // ============================================================================
  const avanzarSemana = useCallback(async () => {
    if (!progreso) return;

    const nuevaSemana = progreso.semanaActual + 1;

    // Validar que no exceda el total
    if (nuevaSemana > config.semanas) {
      console.warn('Ya estás en la última semana');
      return;
    }

    try {
      const response = await fetch(`/api/planificaciones/${config.codigo}/progreso/avanzar`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al avanzar semana');
      }

      // Actualizar estado local
      setProgreso((prev) =>
        prev
          ? {
              ...prev,
              semanaActual: nuevaSemana,
              ultimaActividad: new Date(),
            }
          : null,
      );
    } catch (err) {
      console.error('Error avanzando semana:', err);
      throw err;
    }
  }, [config.codigo, config.semanas, progreso]);

  // ============================================================================
  // COMPLETAR SEMANA
  // ============================================================================
  const completarSemana = useCallback(
    async (puntos: number) => {
      if (!progreso) return;

      try {
        const response = await fetch(
          `/api/planificaciones/${config.codigo}/progreso/completar-semana`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              semana: progreso.semanaActual,
              puntos,
            }),
          },
        );

        if (!response.ok) {
          throw new Error('Error al completar semana');
        }

        // Actualizar puntos localmente
        setProgreso((prev) =>
          prev
            ? {
                ...prev,
                puntosTotales: prev.puntosTotales + puntos,
                ultimaActividad: new Date(),
              }
            : null,
        );

        // Auto-avanzar a siguiente semana
        if (progreso.semanaActual < config.semanas) {
          await avanzarSemana();
        }
      } catch (err) {
        console.error('Error completando semana:', err);
        throw err;
      }
    },
    [config.codigo, config.semanas, progreso, avanzarSemana],
  );

  // ============================================================================
  // REGISTRAR TIEMPO
  // ============================================================================
  const registrarTiempo = useCallback(
    async (minutos: number) => {
      try {
        const response = await fetch(`/api/planificaciones/${config.codigo}/progreso/tiempo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            minutos,
          }),
        });

        if (!response.ok) {
          throw new Error('Error al registrar tiempo');
        }

        // Actualizar tiempo local
        setProgreso((prev) =>
          prev
            ? {
                ...prev,
                tiempoTotalMinutos: prev.tiempoTotalMinutos + minutos,
              }
            : null,
        );
      } catch (err) {
        console.error('Error registrando tiempo:', err);
        // No lanzar error, el tracking de tiempo es secundario
      }
    },
    [config.codigo],
  );

  // ============================================================================
  // HELPER: PUEDE ACCEDER A SEMANA
  // ============================================================================
  const puedeAcceder = useCallback(
    (semana: number): boolean => {
      return semanasActivas.includes(semana);
    },
    [semanasActivas],
  );

  // ============================================================================
  // RETURN
  // ============================================================================
  return {
    progreso,
    semanasInfo: {
      semanasActivas,
      semanaActual: progreso?.semanaActual || 1,
      puedeAcceder,
    },
    isLoading,
    error,
    guardarEstado,
    avanzarSemana,
    completarSemana,
    registrarTiempo,
  };
}
