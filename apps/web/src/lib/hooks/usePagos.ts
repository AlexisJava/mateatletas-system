/**
 * React Query hooks para Pagos y Membresías
 * NOTA: Sistema de membresías legacy - el nuevo sistema usa Suscripciones PreApproval
 *
 * Migrado de Zustand a React Query para:
 * - Cache automático de membresía
 * - Invalidación tras pagos exitosos
 * - Mejor manejo de estados de pago
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Membresia, PreferenciaPago } from '@/types/pago.types';
import * as pagosApi from '@/lib/api/pagos.api';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const pagosKeys = {
  all: ['pagos'] as const,
  membresia: () => [...pagosKeys.all, 'membresia'] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook para obtener membresía actual
 * NOTA: Sistema legacy - el nuevo sistema usa Suscripciones PreApproval
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
    mutationFn: (productoId: string) => pagosApi.crearPreferenciaSuscripcion(productoId),
  });
}

/**
 * Hook para activar membresía manualmente (modo desarrollo/testing)
 * NOTA: Sistema legacy - el nuevo sistema usa Suscripciones PreApproval
 *
 * @example
 * const activar = useActivarMembresiaManual();
 * activar.mutate('membresia-id');
 */
export function useActivarMembresiaManual() {
  const queryClient = useQueryClient();

  return useMutation<Membresia, Error, string>({
    mutationFn: (membresiaId: string) => pagosApi.activarMembresiaManual(membresiaId),

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
 * NOTA: Sistema legacy - el nuevo sistema usa Suscripciones PreApproval
 *
 * @example
 * const {
 *   membresia,
 *   isLoading,
 *   crearPreferenciaSuscripcion
 * } = usePagosCompleto();
 */
export function usePagosCompleto() {
  const {
    data: membresia,
    isLoading: isLoadingMembresia,
    error: errorMembresia,
  } = useMembresiaActual();

  const preferenciaSuscripcion = useCrearPreferenciaSuscripcion();
  const activarManual = useActivarMembresiaManual();

  return {
    membresia,
    isLoading: isLoadingMembresia,
    error: errorMembresia?.message ?? null,
    crearPreferenciaSuscripcion: async (productoId: string) => {
      const preferencia = await preferenciaSuscripcion.mutateAsync(productoId);
      return preferencia.init_point;
    },
    activarManual: (membresiaId: string) => activarManual.mutate(membresiaId),
    isCreatingPreferencia: preferenciaSuscripcion.isPending,
    isActivating: activarManual.isPending,
  };
}
