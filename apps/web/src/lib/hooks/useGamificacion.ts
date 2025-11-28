/**
 * React Query hooks para Gamificación
 *
 * Migrado de Zustand a React Query para:
 * - Cache automático de logros, puntos y ranking
 * - Invalidación inteligente
 * - Polling opcional para ranking en tiempo real
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  gamificacionApi,
  DashboardData,
  Logro,
  Puntos,
  Ranking,
  Progreso,
  DesbloquearLogroResponse,
} from '@/lib/api/gamificacion.api';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const gamificacionKeys = {
  all: ['gamificacion'] as const,
  dashboard: (estudianteId: string) =>
    [...gamificacionKeys.all, 'dashboard', estudianteId] as const,
  logros: (estudianteId: string) => [...gamificacionKeys.all, 'logros', estudianteId] as const,
  puntos: (estudianteId: string) => [...gamificacionKeys.all, 'puntos', estudianteId] as const,
  ranking: (estudianteId: string) => [...gamificacionKeys.all, 'ranking', estudianteId] as const,
  progreso: (estudianteId: string) => [...gamificacionKeys.all, 'progreso', estudianteId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook para obtener dashboard completo de gamificación
 *
 * @param estudianteId - ID del estudiante
 * @param options - Opciones de React Query
 *
 * @example
 * const { data: dashboard } = useDashboardGamificacion('123');
 */
export function useDashboardGamificacion(estudianteId: string, options?: { enabled?: boolean }) {
  return useQuery<DashboardData, Error>({
    queryKey: gamificacionKeys.dashboard(estudianteId),
    queryFn: () => gamificacionApi.getDashboard(estudianteId),
    staleTime: 1000 * 60 * 2, // 2 minutos
    enabled: options?.enabled ?? !!estudianteId,
  });
}

/**
 * Hook para obtener logros del estudiante
 *
 * @param estudianteId - ID del estudiante
 * @param options - Opciones de React Query
 *
 * @example
 * const { data: logros } = useLogros('123');
 */
export function useLogros(estudianteId: string, options?: { enabled?: boolean }) {
  return useQuery<Logro[], Error>({
    queryKey: gamificacionKeys.logros(estudianteId),
    queryFn: () => gamificacionApi.getLogros(estudianteId),
    staleTime: 1000 * 60 * 5, // 5 minutos - logros cambian poco
    enabled: options?.enabled ?? !!estudianteId,
  });
}

/**
 * Hook para obtener puntos del estudiante
 *
 * @param estudianteId - ID del estudiante
 * @param options - Opciones de React Query
 *
 * @example
 * const { data: puntos } = usePuntos('123');
 */
export function usePuntos(
  estudianteId: string,
  options?: { enabled?: boolean; refetchInterval?: number | false },
) {
  return useQuery<Puntos, Error>({
    queryKey: gamificacionKeys.puntos(estudianteId),
    queryFn: () => gamificacionApi.getPuntos(estudianteId),
    staleTime: 1000 * 60 * 2, // 2 minutos
    enabled: options?.enabled ?? !!estudianteId,
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook para obtener ranking
 *
 * @param estudianteId - ID del estudiante
 * @param options - Opciones de React Query (incluye polling opcional)
 *
 * @example
 * // Con polling cada 30s para ranking en tiempo real
 * const { data: ranking } = useRanking('123', { refetchInterval: 30000 });
 */
export function useRanking(
  estudianteId: string,
  options?: { enabled?: boolean; refetchInterval?: number | false },
) {
  return useQuery<Ranking, Error>({
    queryKey: gamificacionKeys.ranking(estudianteId),
    queryFn: () => gamificacionApi.getRanking(estudianteId),
    staleTime: 1000 * 60, // 1 minuto - ranking puede cambiar frecuentemente
    enabled: options?.enabled ?? !!estudianteId,
    refetchInterval: options?.refetchInterval, // Permite polling opcional
  });
}

/**
 * Hook para obtener progreso del estudiante
 *
 * @param estudianteId - ID del estudiante
 * @param options - Opciones de React Query
 *
 * @example
 * const { data: progreso } = useProgreso('123');
 */
export function useProgreso(estudianteId: string, options?: { enabled?: boolean }) {
  return useQuery<Progreso[], Error>({
    queryKey: gamificacionKeys.progreso(estudianteId),
    queryFn: () => gamificacionApi.getProgreso(estudianteId),
    staleTime: 1000 * 60 * 3, // 3 minutos
    enabled: options?.enabled ?? !!estudianteId,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook para desbloquear un logro
 *
 * Invalida automáticamente dashboard, logros y puntos
 *
 * @example
 * const desbloquear = useDesbloquearLogro('estudiante-123');
 * desbloquear.mutate('logro-id');
 */
export function useDesbloquearLogro(estudianteId: string) {
  const queryClient = useQueryClient();

  return useMutation<DesbloquearLogroResponse, Error, string>({
    mutationFn: (logroId: string) => gamificacionApi.desbloquearLogro(logroId),

    onSuccess: (logroDesbloqueado) => {
      // Invalidar queries relacionadas para refetch
      queryClient.invalidateQueries({
        queryKey: gamificacionKeys.dashboard(estudianteId),
      });
      queryClient.invalidateQueries({
        queryKey: gamificacionKeys.logros(estudianteId),
      });
      queryClient.invalidateQueries({
        queryKey: gamificacionKeys.puntos(estudianteId),
      });
      queryClient.invalidateQueries({
        queryKey: gamificacionKeys.ranking(estudianteId),
      });

      // Optimistic update en logros
      queryClient.setQueryData<Logro[]>(
        gamificacionKeys.logros(estudianteId),
        (old) =>
          old?.map((logro) =>
            logro.id === logroDesbloqueado.logro ? { ...logro, desbloqueado: true } : logro,
          ) ?? [],
      );
    },
  });
}

// ============================================================================
// COMBINED HOOKS
// ============================================================================

/**
 * Hook combinado para dashboard de gamificación completo
 *
 * @param estudianteId - ID del estudiante
 * @param options - Opciones (incluye polling para ranking)
 *
 * @example
 * const {
 *   dashboard,
 *   logros,
 *   puntos,
 *   ranking,
 *   progreso,
 *   isLoading,
 *   desbloquear
 * } = useGamificacionCompleto('123', { pollingRanking: true });
 */
export function useGamificacionCompleto(
  estudianteId: string,
  options?: {
    enabled?: boolean;
    pollingRanking?: boolean; // Si true, polling cada 30s en ranking
  },
) {
  const {
    data: dashboard,
    isLoading: isLoadingDashboard,
    error: errorDashboard,
  } = useDashboardGamificacion(estudianteId, { enabled: options?.enabled });

  const { data: logros = [], isLoading: isLoadingLogros } = useLogros(estudianteId, {
    enabled: options?.enabled,
  });

  const { data: puntos, isLoading: isLoadingPuntos } = usePuntos(estudianteId, {
    enabled: options?.enabled,
  });

  const { data: ranking, isLoading: isLoadingRanking } = useRanking(estudianteId, {
    enabled: options?.enabled,
    refetchInterval: options?.pollingRanking ? 30000 : false,
  });

  const { data: progreso = [], isLoading: isLoadingProgreso } = useProgreso(estudianteId, {
    enabled: options?.enabled,
  });

  const desbloquear = useDesbloquearLogro(estudianteId);

  return {
    dashboard,
    logros,
    puntos,
    ranking,
    progreso,
    isLoading:
      isLoadingDashboard ||
      isLoadingLogros ||
      isLoadingPuntos ||
      isLoadingRanking ||
      isLoadingProgreso,
    error: errorDashboard?.message ?? null,
    desbloquear: (logroId: string) => desbloquear.mutate(logroId),
    isDesbloqueando: desbloquear.isPending,
    logroDesbloqueado: desbloquear.data ?? null,
  };
}
