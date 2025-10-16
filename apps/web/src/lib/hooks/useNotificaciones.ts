/**
 * React Query hooks para Notificaciones
 *
 * Estos hooks reemplazan el Zustand store anterior con React Query para:
 * - Cache automático con invalidación inteligente
 * - Background refetching
 * - Optimistic updates
 * - Menor boilerplate
 * - Mejor performance
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotificaciones,
  getNotificacionesCount,
  marcarNotificacionComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion,
  type Notificacion,
} from '@/lib/api/notificaciones.api';

// Query keys para invalidación y cache
export const notificacionesKeys = {
  all: ['notificaciones'] as const,
  lists: () => [...notificacionesKeys.all, 'list'] as const,
  list: (soloNoLeidas?: boolean) =>
    [...notificacionesKeys.lists(), { soloNoLeidas }] as const,
  count: () => [...notificacionesKeys.all, 'count'] as const,
};

/**
 * Hook para obtener notificaciones con React Query
 *
 * @param soloNoLeidas - Si true, solo retorna notificaciones no leídas
 * @param options - Opciones de React Query (ej: refetchInterval para polling)
 *
 * @example
 * const { data: notificaciones, isLoading, error } = useNotificaciones();
 * const { data: noLeidas } = useNotificaciones(true, { refetchInterval: 30000 });
 */
export function useNotificaciones(
  soloNoLeidas?: boolean,
  options?: { refetchInterval?: number | false }
) {
  return useQuery<Notificacion[], Error>({
    queryKey: notificacionesKeys.list(soloNoLeidas),
    queryFn: () => getNotificaciones(soloNoLeidas),
    staleTime: 1000 * 60, // 1 minuto - más fresco que el default para notificaciones
    ...options,
  });
}

/**
 * Hook para obtener el count de notificaciones no leídas
 *
 * @param options - Opciones de React Query (ej: refetchInterval para polling)
 *
 * @example
 * const { data: count } = useNotificacionesCount({ refetchInterval: 30000 });
 */
export function useNotificacionesCount(
  options?: { refetchInterval?: number | false }
) {
  return useQuery<number, Error>({
    queryKey: notificacionesKeys.count(),
    queryFn: getNotificacionesCount,
    staleTime: 1000 * 60, // 1 minuto
    ...options,
  });
}

/**
 * Hook para marcar una notificación como leída
 *
 * Incluye optimistic update para UX instantáneo
 *
 * @example
 * const marcarLeida = useMarcarNotificacionLeida();
 * marcarLeida.mutate(notificacionId);
 */
export function useMarcarNotificacionLeida() {
  const queryClient = useQueryClient();

  type Context = {
    previousNotificaciones?: Notificacion[];
    previousCount?: number;
  };

  return useMutation<Notificacion, Error, string, Context>({
    mutationFn: (id: string) => marcarNotificacionComoLeida(id),

    // Optimistic update
    onMutate: async (id) => {
      // Cancelar refetches en progreso
      await queryClient.cancelQueries({ queryKey: notificacionesKeys.all });

      // Snapshot del estado previo
      const previousNotificaciones = queryClient.getQueryData<Notificacion[]>(
        notificacionesKeys.list()
      );
      const previousCount = queryClient.getQueryData<number>(
        notificacionesKeys.count()
      );

      // Optimistic update de la lista
      queryClient.setQueryData<Notificacion[]>(
        notificacionesKeys.list(),
        (old) => old?.map((n) => (n.id === id ? { ...n, leida: true } : n)) ?? []
      );

      // Optimistic update del count
      queryClient.setQueryData<number>(
        notificacionesKeys.count(),
        (old) => Math.max(0, (old ?? 1) - 1)
      );

      return { previousNotificaciones, previousCount };
    },

    // Si falla, revertir
    onError: (_err, _id, context) => {
      if (context?.previousNotificaciones) {
        queryClient.setQueryData(
          notificacionesKeys.list(),
          context.previousNotificaciones
        );
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(
          notificacionesKeys.count(),
          context.previousCount
        );
      }
    },

    // Siempre refetch después de error o éxito
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificacionesKeys.all });
    },
  });
}

/**
 * Hook para marcar todas las notificaciones como leídas
 *
 * @example
 * const marcarTodas = useMarcarTodasLeidas();
 * marcarTodas.mutate();
 */
export function useMarcarTodasLeidas() {
  const queryClient = useQueryClient();

  type Context = {
    previousNotificaciones?: Notificacion[];
    previousCount?: number;
  };

  return useMutation<{ message: string; count: number }, Error, void, Context>({
    mutationFn: marcarTodasComoLeidas,

    // Optimistic update
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificacionesKeys.all });

      const previousNotificaciones = queryClient.getQueryData<Notificacion[]>(
        notificacionesKeys.list()
      );
      const previousCount = queryClient.getQueryData<number>(
        notificacionesKeys.count()
      );

      // Marcar todas como leídas
      queryClient.setQueryData<Notificacion[]>(
        notificacionesKeys.list(),
        (old) => old?.map((n) => ({ ...n, leida: true })) ?? []
      );

      // Count = 0
      queryClient.setQueryData<number>(notificacionesKeys.count(), 0);

      return { previousNotificaciones, previousCount };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousNotificaciones) {
        queryClient.setQueryData(
          notificacionesKeys.list(),
          context.previousNotificaciones
        );
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(
          notificacionesKeys.count(),
          context.previousCount
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificacionesKeys.all });
    },
  });
}

/**
 * Hook para eliminar una notificación
 *
 * @example
 * const eliminar = useEliminarNotificacion();
 * eliminar.mutate(notificacionId);
 */
export function useEliminarNotificacion() {
  const queryClient = useQueryClient();

  type Context = {
    previousNotificaciones?: Notificacion[];
    previousCount?: number;
  };

  return useMutation<{ message: string }, Error, string, Context>({
    mutationFn: (id: string) => eliminarNotificacion(id),

    // Optimistic update
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificacionesKeys.all });

      const previousNotificaciones = queryClient.getQueryData<Notificacion[]>(
        notificacionesKeys.list()
      );
      const previousCount = queryClient.getQueryData<number>(
        notificacionesKeys.count()
      );

      // Buscar si la notificación eliminada estaba no leída
      const notificacionEliminada = previousNotificaciones?.find((n) => n.id === id);
      const eraNoLeida = notificacionEliminada && !notificacionEliminada.leida;

      // Eliminar de la lista
      queryClient.setQueryData<Notificacion[]>(
        notificacionesKeys.list(),
        (old) => old?.filter((n) => n.id !== id) ?? []
      );

      // Decrementar count si era no leída
      if (eraNoLeida) {
        queryClient.setQueryData<number>(
          notificacionesKeys.count(),
          (old) => Math.max(0, (old ?? 1) - 1)
        );
      }

      return { previousNotificaciones, previousCount };
    },

    onError: (_err, _id, context) => {
      if (context?.previousNotificaciones) {
        queryClient.setQueryData(
          notificacionesKeys.list(),
          context.previousNotificaciones
        );
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(
          notificacionesKeys.count(),
          context.previousCount
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificacionesKeys.all });
    },
  });
}

/**
 * Hook combinado para usar en NotificationCenter
 *
 * Incluye polling automático cada 30 segundos
 *
 * @example
 * const {
 *   notificaciones,
 *   count,
 *   isLoading,
 *   marcarLeida,
 *   marcarTodas,
 *   eliminar
 * } = useNotificationCenter();
 */
export function useNotificationCenter() {
  const {
    data: notificaciones = [],
    isLoading: isLoadingNotificaciones,
    error: errorNotificaciones,
  } = useNotificaciones(false, { refetchInterval: 30000 }); // Polling cada 30s

  const {
    data: count = 0,
    isLoading: isLoadingCount,
  } = useNotificacionesCount({ refetchInterval: 30000 });

  const marcarLeida = useMarcarNotificacionLeida();
  const marcarTodas = useMarcarTodasLeidas();
  const eliminar = useEliminarNotificacion();

  return {
    notificaciones,
    count,
    isLoading: isLoadingNotificaciones || isLoadingCount,
    error: errorNotificaciones?.message ?? null,
    marcarLeida: (id: string) => marcarLeida.mutate(id),
    marcarTodas: () => marcarTodas.mutate(),
    eliminar: (id: string) => eliminar.mutate(id),
    isMarking: marcarLeida.isPending || marcarTodas.isPending,
    isDeleting: eliminar.isPending,
  };
}
