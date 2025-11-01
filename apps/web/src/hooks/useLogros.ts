import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificacionApi } from '@/lib/api/gamificacion.api';
import type { Logro, LogroEstudiante, ProgresoLogros } from '@/types/gamificacion';
import { mapLogrosToEstudiante } from '@/lib/utils/gamificacion.utils';

/**
 * Hook para obtener todos los logros disponibles del sistema
 */
export function useTodosLogros() {
  return useQuery<Logro[]>({
    queryKey: ['logros-todos'],
    queryFn: () => gamificacionApi.obtenerTodosLogrosV2(),
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos (no cambian frecuentemente)
  });
}

/**
 * Hook para obtener logros del estudiante
 */
export function useMisLogros(estudianteId: string) {
  return useQuery<LogroEstudiante[]>({
    queryKey: ['mis-logros', estudianteId],
    queryFn: async () => {
      const logros = await gamificacionApi.obtenerMisLogrosV2(estudianteId);
      return mapLogrosToEstudiante(estudianteId, logros);
    },
    enabled: !!estudianteId,
  });
}

/**
 * Hook para obtener logros no vistos (para notificaciones)
 */
export function useLogrosNoVistos(estudianteId: string) {
  return useQuery<LogroEstudiante[]>({
    queryKey: ['logros-no-vistos', estudianteId],
    queryFn: async () => {
      const logros = await gamificacionApi.obtenerLogrosNoVistos(estudianteId);
      return mapLogrosToEstudiante(estudianteId, logros);
    },
    refetchInterval: 10000, // Actualizar cada 10s para notificaciones
    enabled: !!estudianteId,
  });
}

/**
 * Hook para marcar logro como visto
 * Invalida automáticamente queries de logros no vistos
 */
export function useMarcarLogroVisto(estudianteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logroId: string) =>
      gamificacionApi.marcarLogroVisto(estudianteId, logroId),
    onSuccess: () => {
      // Invalidar logros no vistos para refetch
      queryClient.invalidateQueries({ queryKey: ['logros-no-vistos', estudianteId] });
      queryClient.invalidateQueries({ queryKey: ['mis-logros', estudianteId] });
    },
  });
}

/**
 * Hook para obtener progreso de logros V2
 * Retorna estadísticas completas: total, desbloqueados, porcentaje, por categoría
 */
export function useProgresoLogros(estudianteId: string) {
  return useQuery<ProgresoLogros>({
    queryKey: ['progreso-logros', estudianteId],
    queryFn: () => gamificacionApi.obtenerProgresoV2(estudianteId),
    enabled: !!estudianteId,
  });
}

/**
 * Hook para obtener logros recientes del estudiante
 * Ordena por fecha de desbloqueo descendente
 */
export function useLogrosRecientes(estudianteId: string, limit: number = 10) {
  return useQuery<LogroEstudiante[]>({
    queryKey: ['logros-recientes', estudianteId, limit],
    queryFn: async () => {
      const logros = await gamificacionApi.obtenerMisLogrosV2(estudianteId);
      const logrosNormalizados = mapLogrosToEstudiante(estudianteId, logros);
      // Ordenar por fecha de desbloqueo (más recientes primero)
      return logrosNormalizados
        .sort((a, b) => b.fecha_desbloqueo.getTime() - a.fecha_desbloqueo.getTime())
        .slice(0, limit);
    },
    enabled: !!estudianteId,
  });
}
