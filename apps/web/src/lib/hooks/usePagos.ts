/**
 * React Query hooks para Pagos y Membresías
 *
 * Migrado de Zustand a React Query para:
 * - Cache automático de membresía e inscripciones
 * - Invalidación tras pagos exitosos
 * - Mejor manejo de estados de pago
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Membresia,
  InscripcionCurso,
  PreferenciaPago,
} from '@/types/pago.types';
import * as pagosApi from '@/lib/api/pagos.api';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const pagosKeys = {
  all: ['pagos'] as const,
  membresia: () => [...pagosKeys.all, 'membresia'] as const,
  inscripciones: () => [...pagosKeys.all, 'inscripciones'] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook para obtener membresía actual
 *
 * @example
 * const { data: membresia } = useMembresiaActual();
 */
export function useMembresiaActual() {
  return useQuery<Membresia | null, Error>({
    queryKey: pagosKeys.membresia(),
    queryFn: pagosApi.getMembresiaActual,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1, // Solo reintentar 1 vez (pagos son críticos)
  });
}

/**
 * Hook para obtener inscripciones a cursos
 *
 * @example
 * const { data: inscripciones } = useInscripciones();
 */
export function useInscripciones() {
  return useQuery<InscripcionCurso[], Error>({
    queryKey: pagosKeys.inscripciones(),
    queryFn: pagosApi.getInscripciones,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook para crear preferencia de suscripción (MercadoPago)
 *
 * @example
 * const crearPreferencia = useCrearPreferenciaSuscripcion();
 * const url = await crearPreferencia.mutateAsync('producto-id');
 */
export function useCrearPreferenciaSuscripcion() {
  return useMutation<PreferenciaPago, Error, string>({
    mutationFn: (productoId: string) =>
      pagosApi.crearPreferenciaSuscripcion(productoId),
  });
}

/**
 * Hook para crear preferencia de curso (MercadoPago)
 *
 * @example
 * const crearPreferencia = useCrearPreferenciaCurso();
 * const url = await crearPreferencia.mutateAsync({ productoId: '...', estudianteId: '...' });
 */
export function useCrearPreferenciaCurso() {
  type Variables = {
    productoId: string;
    estudianteId: string;
  };

  return useMutation<PreferenciaPago, Error, Variables>({
    mutationFn: ({ productoId, estudianteId }) =>
      pagosApi.crearPreferenciaCurso(productoId, estudianteId),
  });
}

/**
 * Hook para activar membresía manualmente (modo desarrollo/testing)
 *
 * @example
 * const activar = useActivarMembresiaManual();
 * activar.mutate('membresia-id');
 */
export function useActivarMembresiaManual() {
  const queryClient = useQueryClient();

  return useMutation<Membresia, Error, string>({
    mutationFn: (membresiaId: string) =>
      pagosApi.activarMembresiaManual(membresiaId),

    onSuccess: () => {
      // Refetch membresía actual
      queryClient.invalidateQueries({ queryKey: pagosKeys.membresia() });
    },
  });
}

// ============================================================================
// COMBINED HOOKS
// ============================================================================

/**
 * Hook combinado para componentes de pagos
 *
 * @example
 * const {
 *   membresia,
 *   inscripciones,
 *   isLoading,
 *   crearPreferenciaSuscripcion,
 *   crearPreferenciaCurso
 * } = usePagosCompleto();
 */
export function usePagosCompleto() {
  const {
    data: membresia,
    isLoading: isLoadingMembresia,
    error: errorMembresia,
  } = useMembresiaActual();

  const {
    data: inscripciones = [],
    isLoading: isLoadingInscripciones,
  } = useInscripciones();

  const preferenciaSuscripcion = useCrearPreferenciaSuscripcion();
  const preferenciaCurso = useCrearPreferenciaCurso();
  const activarManual = useActivarMembresiaManual();

  return {
    membresia,
    inscripciones,
    isLoading: isLoadingMembresia || isLoadingInscripciones,
    error: errorMembresia?.message ?? null,
    crearPreferenciaSuscripcion: async (productoId: string) => {
      const preferencia = await preferenciaSuscripcion.mutateAsync(productoId);
      return preferencia.init_point;
    },
    crearPreferenciaCurso: async (
      productoId: string,
      estudianteId: string
    ) => {
      const preferencia = await preferenciaCurso.mutateAsync({
        productoId,
        estudianteId,
      });
      return preferencia.init_point;
    },
    activarManual: (membresiaId: string) => activarManual.mutate(membresiaId),
    isCreatingPreferencia:
      preferenciaSuscripcion.isPending || preferenciaCurso.isPending,
    isActivating: activarManual.isPending,
  };
}
