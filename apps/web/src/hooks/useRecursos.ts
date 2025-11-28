import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificacionApi } from '@/lib/api/gamificacion.api';
import type { RecursosEstudiante, TransaccionRecurso, RachaEstudiante } from '@/types/gamificacion';

/**
 * Hook para obtener recursos del estudiante (XP, Monedas, Nivel)
 * Se actualiza cada 30 segundos automáticamente
 */
export function useRecursos(estudianteId: string) {
  return useQuery<RecursosEstudiante & { racha: RachaEstudiante }>({
    queryKey: ['recursos', estudianteId],
    queryFn: () => gamificacionApi.obtenerRecursos(estudianteId),
    refetchInterval: 30000, // Actualizar cada 30s
    staleTime: 20000, // Considerar datos frescos por 20s
    enabled: !!estudianteId,
  });
}

/**
 * Hook para obtener historial de transacciones
 */
export function useHistorialRecursos(estudianteId: string) {
  return useQuery<TransaccionRecurso[]>({
    queryKey: ['historial-recursos', estudianteId],
    queryFn: () => gamificacionApi.obtenerHistorialRecursos(estudianteId),
    enabled: !!estudianteId,
  });
}

/**
 * Hook para obtener racha del estudiante
 */
export function useRacha(estudianteId: string) {
  return useQuery<RachaEstudiante>({
    queryKey: ['racha', estudianteId],
    queryFn: () => gamificacionApi.obtenerRacha(estudianteId),
    refetchInterval: 60000, // Actualizar cada minuto
    enabled: !!estudianteId,
  });
}

/**
 * Hook para registrar actividad del día (actualiza racha)
 * Invalida automáticamente queries de recursos y racha
 */
export function useRegistrarActividad(estudianteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => gamificacionApi.registrarActividad(estudianteId),
    onSuccess: () => {
      // Invalidar recursos y racha para refetch automático
      queryClient.invalidateQueries({ queryKey: ['recursos', estudianteId] });
      queryClient.invalidateQueries({ queryKey: ['racha', estudianteId] });
    },
  });
}
