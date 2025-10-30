import { useState, useEffect, useCallback } from 'react';
import { useLogrosNoVistos, useMarcarLogroVisto } from './useLogros';
import type { LogroEstudiante, NotificacionLogro } from '@/types/gamificacion';

/**
 * Hook para gestionar notificaciones de logros desbloqueados
 *
 * Flujo:
 * 1. Detecta logros no vistos desde el backend
 * 2. Los muestra uno por uno en la UI
 * 3. Los marca como vistos cuando el usuario los cierra
 *
 * @param estudianteId - ID del estudiante
 * @returns {
 *   notificacionActual: Logro a mostrar actualmente (null si no hay)
 *   cerrarNotificacion: Función para marcar como visto y pasar al siguiente
 *   hayMasNotificaciones: Boolean indicando si hay más en cola
 * }
 */
export function useNotificacionesLogros(estudianteId: string) {
  const { data: logrosNoVistos = [], isLoading } = useLogrosNoVistos(estudianteId);
  const marcarVisto = useMarcarLogroVisto(estudianteId);

  const [indiceActual, setIndiceActual] = useState(0);
  const [cola, setCola] = useState<LogroEstudiante[]>([]);

  // Actualizar cola cuando lleguen nuevos logros
  useEffect(() => {
    if (!isLoading && logrosNoVistos.length > 0) {
      setCola(logrosNoVistos);
      setIndiceActual(0);
    }
  }, [logrosNoVistos, isLoading]);

  const notificacionActual: NotificacionLogro | null = cola[indiceActual]
    ? {
        logro: cola[indiceActual].logro,
        recompensas: {
          monedas: cola[indiceActual].logro.monedas_recompensa,
          xp: cola[indiceActual].logro.xp_recompensa,
        },
        // Aquí podrías calcular si subió de nivel basado en el XP
        // pero requeriría conocer el nivel anterior
      }
    : null;

  const cerrarNotificacion = useCallback(() => {
    const logroActual = cola[indiceActual];
    if (!logroActual) return;

    // Marcar como visto en el backend
    marcarVisto.mutate(logroActual.logro_id, {
      onSuccess: () => {
        // Avanzar al siguiente logro en la cola
        if (indiceActual < cola.length - 1) {
          setIndiceActual((prev) => prev + 1);
        } else {
          // No hay más logros, resetear
          setCola([]);
          setIndiceActual(0);
        }
      },
    });
  }, [cola, indiceActual, marcarVisto]);

  const hayMasNotificaciones = indiceActual < cola.length - 1;

  return {
    notificacionActual,
    cerrarNotificacion,
    hayMasNotificaciones,
    isLoading: isLoading || marcarVisto.isPending,
  };
}
