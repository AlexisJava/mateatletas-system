/**
 * React Query hooks para Clases y Reservas
 *
 * Migrado de Zustand a React Query para:
 * - Cache automático de clases y reservas
 * - Optimistic updates en reservas y cancelaciones
 * - Sincronización automática entre queries
 * - Mejor performance
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ClaseConRelaciones,
  InscripcionClase,
  RutaCurricular,
  FiltroClases,
  CrearReservaDto,
} from '@/types/clases.types';
import * as clasesApi from '@/lib/api/clases.api';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const clasesKeys = {
  all: ['clases'] as const,
  lists: () => [...clasesKeys.all, 'list'] as const,
  list: (filtros?: FiltroClases) => [...clasesKeys.lists(), filtros] as const,
  reservas: () => [...clasesKeys.all, 'reservas'] as const,
  rutas: () => [...clasesKeys.all, 'rutas'] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook para obtener clases con filtros opcionales
 *
 * @param filtros - Filtros para aplicar (opcional)
 * @param options - Opciones de React Query
 *
 * @example
 * const { data: clases, isLoading } = useClases({ soloDisponibles: true });
 */
export function useClases(
  filtros?: FiltroClases,
  options?: { enabled?: boolean }
) {
  return useQuery<ClaseConRelaciones[], Error>({
    queryKey: clasesKeys.list(filtros),
    queryFn: () => clasesApi.getClases(filtros),
    staleTime: 1000 * 60 * 2, // 2 minutos - clases cambian con frecuencia
    ...options,
  });
}

/**
 * Hook para obtener las reservas del usuario actual
 *
 * @example
 * const { data: misReservas, isLoading } = useMisReservas();
 */
export function useMisReservas() {
  return useQuery<InscripcionClase[], Error>({
    queryKey: clasesKeys.reservas(),
    queryFn: clasesApi.getMisReservas,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para obtener rutas curriculares
 *
 * Las rutas curriculares no cambian frecuentemente, cache largo
 *
 * @example
 * const { data: rutas } = useRutasCurriculares();
 */
export function useRutasCurriculares() {
  return useQuery<RutaCurricular[], Error>({
    queryKey: clasesKeys.rutas(),
    queryFn: clasesApi.getRutasCurriculares,
    staleTime: 1000 * 60 * 30, // 30 minutos - datos estáticos
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook para reservar una clase con optimistic update
 *
 * @example
 * const reservar = useReservarClase();
 * reservar.mutate({ claseId: '123', data: { estudianteId: 'abc' } });
 */
export function useReservarClase() {
  const queryClient = useQueryClient();

  type Variables = {
    claseId: string;
    data: CrearReservaDto;
  };

  type Context = {
    previousClases?: ClaseConRelaciones[];
    previousReservas?: InscripcionClase[];
  };

  return useMutation<InscripcionClase, Error, Variables, Context>({
    mutationFn: ({ claseId, data }) => clasesApi.reservarClase(claseId, data),

    // Optimistic update
    onMutate: async ({ claseId }) => {
      // Cancelar refetches
      await queryClient.cancelQueries({ queryKey: clasesKeys.all });

      // Snapshot para rollback
      const previousClases = queryClient.getQueryData<ClaseConRelaciones[]>(
        clasesKeys.lists()
      );
      const previousReservas = queryClient.getQueryData<InscripcionClase[]>(
        clasesKeys.reservas()
      );

      // Optimistic update: incrementar cupos ocupados
      queryClient.setQueriesData<ClaseConRelaciones[]>(
        { queryKey: clasesKeys.lists() },
        (old) =>
          old?.map((clase) =>
            clase.id === claseId
              ? {
                  ...clase,
                  cupos_ocupados:
                    (clase.cupos_ocupados ?? clase._count?.inscripciones ?? 0) + 1,
                  _count: clase._count
                    ? {
                        ...clase._count,
                        inscripciones:
                          (clase._count.inscripciones ?? 0) + 1,
                      }
                    : clase._count,
                }
              : clase
          ) ?? []
      );

      return { previousClases, previousReservas };
    },

    // Si falla, revertir
    onError: (_err, _variables, context) => {
      if (context?.previousClases) {
        queryClient.setQueriesData(
          { queryKey: clasesKeys.lists() },
          context.previousClases
        );
      }
      if (context?.previousReservas) {
        queryClient.setQueryData(
          clasesKeys.reservas(),
          context.previousReservas
        );
      }
    },

    // Siempre refetch después de error o éxito
    onSuccess: (nuevaReserva) => {
      // Agregar nueva reserva al cache optimísticamente
      queryClient.setQueryData<InscripcionClase[]>(
        clasesKeys.reservas(),
        (old) => [...(old ?? []), nuevaReserva]
      );
    },

    onSettled: () => {
      // Invalidar para refetch con datos reales del servidor
      queryClient.invalidateQueries({ queryKey: clasesKeys.all });
    },
  });
}

/**
 * Hook para cancelar una reserva con optimistic update
 *
 * @example
 * const cancelar = useCancelarReserva();
 * cancelar.mutate('inscripcion-id');
 */
export function useCancelarReserva() {
  const queryClient = useQueryClient();

  type Context = {
    previousClases?: ClaseConRelaciones[];
    previousReservas?: InscripcionClase[];
  };

  return useMutation<void, Error, string, Context>({
    mutationFn: (inscripcionId: string) =>
      clasesApi.cancelarReserva(inscripcionId),

    // Optimistic update
    onMutate: async (inscripcionId) => {
      await queryClient.cancelQueries({ queryKey: clasesKeys.all });

      const previousReservas = queryClient.getQueryData<InscripcionClase[]>(
        clasesKeys.reservas()
      );
      const previousClases = queryClient.getQueryData<ClaseConRelaciones[]>(
        clasesKeys.lists()
      );

      // Encontrar la reserva cancelada para saber qué clase liberar
      const reservaCancelada = previousReservas?.find(
        (r) => r.id === inscripcionId
      );

      // Optimistic update: remover reserva
      queryClient.setQueryData<InscripcionClase[]>(
        clasesKeys.reservas(),
        (old) => old?.filter((r) => r.id !== inscripcionId) ?? []
      );

      // Optimistic update: reducir cupos ocupados
      if (reservaCancelada) {
        queryClient.setQueriesData<ClaseConRelaciones[]>(
          { queryKey: clasesKeys.lists() },
          (old) =>
            old?.map((clase) =>
              clase.id === reservaCancelada.clase_id
                ? {
                    ...clase,
                    cupos_ocupados: Math.max(
                      (clase.cupos_ocupados ?? clase._count?.inscripciones ?? 0) - 1,
                      0,
                    ),
                    _count: clase._count
                      ? {
                          ...clase._count,
                          inscripciones: Math.max(
                            (clase._count.inscripciones ?? 0) - 1,
                            0,
                          ),
                        }
                      : clase._count,
                  }
                : clase
            ) ?? []
        );
      }

      return { previousClases, previousReservas };
    },

    onError: (_err, _inscripcionId, context) => {
      if (context?.previousClases) {
        queryClient.setQueriesData(
          { queryKey: clasesKeys.lists() },
          context.previousClases
        );
      }
      if (context?.previousReservas) {
        queryClient.setQueryData(
          clasesKeys.reservas(),
          context.previousReservas
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: clasesKeys.all });
    },
  });
}

// ============================================================================
// COMBINED HOOKS
// ============================================================================

/**
 * Hook combinado para componentes de clases
 *
 * Incluye clases, reservas y rutas en un solo hook
 *
 * @param filtros - Filtros para clases
 *
 * @example
 * const {
 *   clases,
 *   misReservas,
 *   rutas,
 *   isLoading,
 *   reservar,
 *   cancelar
 * } = useClasesCompleto({ soloDisponibles: true });
 */
export function useClasesCompleto(filtros?: FiltroClases) {
  const {
    data: clases = [],
    isLoading: isLoadingClases,
    error: errorClases,
  } = useClases(filtros);

  const {
    data: misReservas = [],
    isLoading: isLoadingReservas,
  } = useMisReservas();

  const { data: rutas = [] } = useRutasCurriculares();

  const reservar = useReservarClase();
  const cancelar = useCancelarReserva();

  return {
    clases,
    misReservas,
    rutas,
    isLoading: isLoadingClases || isLoadingReservas,
    error: errorClases?.message ?? null,
    reservar: (claseId: string, data: CrearReservaDto) =>
      reservar.mutate({ claseId, data }),
    cancelar: (inscripcionId: string) => cancelar.mutate(inscripcionId),
    isReservando: reservar.isPending,
    isCancelando: cancelar.isPending,
  };
}
