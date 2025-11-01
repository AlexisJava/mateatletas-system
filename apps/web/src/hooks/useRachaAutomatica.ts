import { useEffect, useRef, useState } from 'react';
import { gamificacionApi } from '@/lib/api/gamificacion.api';
import type { RachaEstudiante } from '@/types/gamificacion';

/**
 * Hook para registrar automáticamente la actividad del día y mantener la racha
 * Solo registra UNA VEZ por sesión cuando el estudiante entra al Gimnasio
 */
export function useRachaAutomatica(estudianteId: string | undefined) {
  const [racha, setRacha] = useState<RachaEstudiante | null>(null);
  const [loading, setLoading] = useState(true);
  const hasRegisteredRef = useRef(false);

  useEffect(() => {
    // Solo ejecutar si tenemos estudianteId y no hemos registrado aún
    if (!estudianteId || hasRegisteredRef.current) return;

    const registrarActividad = async () => {
      try {
        setLoading(true);
        console.log('🔥 [useRachaAutomatica] Registrando actividad del día...');

        // Registrar actividad (actualiza racha automáticamente)
        const rachaActualizada = await gamificacionApi.registrarActividad(estudianteId);

        console.log('✅ [useRachaAutomatica] Actividad registrada:', rachaActualizada);
        setRacha(rachaActualizada);

        // Marcar como registrado para evitar llamadas duplicadas
        hasRegisteredRef.current = true;
      } catch (error) {
        console.error('❌ [useRachaAutomatica] Error al registrar actividad:', error);

        // Si falla el registro, al menos obtener la racha actual
        try {
          const rachaActual = await gamificacionApi.obtenerRacha(estudianteId);
          setRacha(rachaActual);
        } catch (err) {
          console.error('❌ [useRachaAutomatica] Error al obtener racha:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    registrarActividad();
  }, [estudianteId]);

  return { racha, loading };
}
