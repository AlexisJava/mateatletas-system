/**
 * React Query hooks para Estudiantes
 *
 * Migrado de Zustand a React Query para:
 * - Cache automático de listas paginadas
 * - Optimistic updates en CRUD
 * - Invalidación automática
 * - Paginación eficiente
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estudiantesApi } from '@/lib/api/estudiantes.api';
import type {
  Estudiante,
  CreateEstudianteData,
  UpdateEstudianteData,
  QueryEstudiantesParams,
  Casa,
  EstudiantesResponse,
} from '@/types/estudiante';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const estudiantesKeys = {
  all: ['estudiantes'] as const,
  lists: () => [...estudiantesKeys.all, 'list'] as const,
  list: (params?: QueryEstudiantesParams) => [...estudiantesKeys.lists(), params] as const,
  detail: (id: string) => [...estudiantesKeys.all, 'detail', id] as const,
  casas: () => [...estudiantesKeys.all, 'casas'] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook para obtener estudiantes con filtros y paginación
 *
 * @param params - Parámetros de query (filtros, paginación)
 *
 * @example
 * const { data, isLoading } = useEstudiantes({ page: 1, limit: 10 });
 */
export function useEstudiantes(params?: QueryEstudiantesParams) {
  return useQuery<EstudiantesResponse, Error>({
    queryKey: estudiantesKeys.list(params),
    queryFn: () => estudiantesApi.getAll(params),
    staleTime: 1000 * 60 * 3, // 3 minutos
    placeholderData: (previousData) => previousData, // Mantener datos previos mientras carga
  });
}

/**
 * Hook para obtener un estudiante por ID
 *
 * @param id - ID del estudiante
 * @param options - Opciones de React Query
 *
 * @example
 * const { data: estudiante } = useEstudiante('123');
 */
export function useEstudiante(id: string, options?: { enabled?: boolean }) {
  return useQuery<Estudiante, Error>({
    queryKey: estudiantesKeys.detail(id),
    queryFn: () => estudiantesApi.getById(id),
    staleTime: 1000 * 60 * 5, // 5 minutos - datos de detalle
    enabled: options?.enabled ?? !!id, // Solo fetch si hay ID
  });
}

/**
 * Hook para obtener casas disponibles
 *
 * @example
 * const { data: casas } = useCasas();
 */
export function useCasas() {
  return useQuery<Casa[], Error>({
    queryKey: estudiantesKeys.casas(),
    queryFn: estudiantesApi.getCasas,
    staleTime: 1000 * 60 * 15, // 15 minutos - datos relativamente estáticos
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook para crear un estudiante con optimistic update
 *
 * @example
 * const crear = useCrearEstudiante();
 * crear.mutate({ nombre: 'Juan', edad: 10, ... });
 */
export function useCrearEstudiante() {
  const queryClient = useQueryClient();

  type Context = {
    previousLists?: EstudiantesResponse[];
  };

  return useMutation<Estudiante, Error, CreateEstudianteData, Context>({
    mutationFn: (data) => estudiantesApi.create(data),

    // Optimistic update
    onMutate: async (nuevoEstudiante) => {
      // Cancelar refetches en progreso
      await queryClient.cancelQueries({ queryKey: estudiantesKeys.lists() });

      // Snapshot para rollback
      const previousLists = queryClient
        .getQueriesData<EstudiantesResponse>({
          queryKey: estudiantesKeys.lists(),
        })
        .map(([, data]) => data)
        .filter((data): data is EstudiantesResponse => data !== undefined);

      // Optimistic update: agregar al inicio de todas las listas
      queryClient.setQueriesData<EstudiantesResponse>(
        { queryKey: estudiantesKeys.lists() },
        (old) => {
          if (!old) return old;

          return {
            data: [
              {
                ...nuevoEstudiante,
                id: 'temp-' + Date.now(), // ID temporal
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as Estudiante,
              ...old.data,
            ],
            metadata: {
              ...old.metadata,
              total: (old.metadata?.total ?? 0) + 1,
            },
          };
        },
      );

      return { previousLists };
    },

    // Si falla, revertir
    onError: (_err, _variables, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach((data, index) => {
          const queries = queryClient.getQueriesData<EstudiantesResponse>({
            queryKey: estudiantesKeys.lists(),
          });
          if (queries[index]) {
            queryClient.setQueryData(queries[index][0], data);
          }
        });
      }
    },

    // Después de éxito, refetch para obtener datos reales
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: estudiantesKeys.lists() });
    },
  });
}

/**
 * Hook para actualizar un estudiante con optimistic update
 *
 * @example
 * const actualizar = useActualizarEstudiante();
 * actualizar.mutate({ id: '123', data: { nombre: 'Juan Carlos' } });
 */
export function useActualizarEstudiante() {
  const queryClient = useQueryClient();

  type Variables = {
    id: string;
    data: UpdateEstudianteData;
  };

  type Context = {
    previousLists?: EstudiantesResponse[];
    previousDetail?: Estudiante;
  };

  return useMutation<Estudiante, Error, Variables, Context>({
    mutationFn: ({ id, data }) => estudiantesApi.update(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: estudiantesKeys.all });

      // Snapshot
      const previousLists = queryClient
        .getQueriesData<EstudiantesResponse>({
          queryKey: estudiantesKeys.lists(),
        })
        .map(([, listData]) => listData)
        .filter((listData): listData is EstudiantesResponse => listData !== undefined);

      const previousDetail = queryClient.getQueryData<Estudiante>(estudiantesKeys.detail(id));

      // Optimistic update en listas
      queryClient.setQueriesData<EstudiantesResponse>(
        { queryKey: estudiantesKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((e) => (e.id === id ? { ...e, ...data } : e)),
          };
        },
      );

      // Optimistic update en detalle
      if (previousDetail) {
        queryClient.setQueryData<Estudiante>(estudiantesKeys.detail(id), (old) =>
          old ? { ...old, ...data } : old,
        );
      }

      return { previousLists, previousDetail };
    },

    onError: (_err, { id }, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach((data, index) => {
          const queries = queryClient.getQueriesData<EstudiantesResponse>({
            queryKey: estudiantesKeys.lists(),
          });
          if (queries[index]) {
            queryClient.setQueryData(queries[index][0], data);
          }
        });
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(estudiantesKeys.detail(id), context.previousDetail);
      }
    },

    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: estudiantesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: estudiantesKeys.detail(id) });
    },
  });
}

/**
 * Hook para eliminar un estudiante con optimistic update
 *
 * @example
 * const eliminar = useEliminarEstudiante();
 * eliminar.mutate('estudiante-id');
 */
export function useEliminarEstudiante() {
  const queryClient = useQueryClient();

  type Context = {
    previousLists?: EstudiantesResponse[];
  };

  return useMutation<{ message: string }, Error, string, Context>({
    mutationFn: (id) => estudiantesApi.delete(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: estudiantesKeys.all });

      const previousLists = queryClient
        .getQueriesData<EstudiantesResponse>({
          queryKey: estudiantesKeys.lists(),
        })
        .map(([, data]) => data)
        .filter((data): data is EstudiantesResponse => data !== undefined);

      // Optimistic update: remover de listas
      queryClient.setQueriesData<EstudiantesResponse>(
        { queryKey: estudiantesKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((e) => e.id !== id),
            metadata: {
              ...old.metadata,
              total: Math.max(0, (old.metadata?.total ?? 1) - 1),
            },
          };
        },
      );

      // Remover query de detalle
      queryClient.removeQueries({ queryKey: estudiantesKeys.detail(id) });

      return { previousLists };
    },

    onError: (_err, _id, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach((data, index) => {
          const queries = queryClient.getQueriesData<EstudiantesResponse>({
            queryKey: estudiantesKeys.lists(),
          });
          if (queries[index]) {
            queryClient.setQueryData(queries[index][0], data);
          }
        });
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: estudiantesKeys.lists() });
    },
  });
}

// ============================================================================
// COMBINED HOOKS
// ============================================================================

/**
 * Hook combinado para componentes de estudiantes
 *
 * @param params - Parámetros de query
 *
 * @example
 * const {
 *   estudiantes,
 *   casas,
 *   isLoading,
 *   crear,
 *   actualizar,
 *   eliminar
 * } = useEstudiantesCompleto({ page: 1 });
 */
export function useEstudiantesCompleto(params?: QueryEstudiantesParams) {
  const { data: response, isLoading, error } = useEstudiantes(params);

  const { data: casas = [] } = useCasas();

  const crear = useCrearEstudiante();
  const actualizar = useActualizarEstudiante();
  const eliminar = useEliminarEstudiante();

  return {
    estudiantes: response?.data ?? [],
    total: response?.metadata?.total ?? 0,
    page: response?.metadata?.page ?? 1,
    limit: response?.metadata?.limit ?? 10,
    casas,
    isLoading,
    error: error?.message ?? null,
    crear: (data: CreateEstudianteData) => crear.mutateAsync(data),
    actualizar: (id: string, data: UpdateEstudianteData) => actualizar.mutateAsync({ id, data }),
    eliminar: (id: string) => eliminar.mutateAsync(id),
    isCreating: crear.isPending,
    isUpdating: actualizar.isPending,
    isDeleting: eliminar.isPending,
  };
}
