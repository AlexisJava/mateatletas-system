'use client';

/**
 * useSuscripcionFamiliar - Hook para gestión de suscripción familiar
 *
 * Usa React Query para:
 * - Cachear datos de suscripción por 5 minutos
 * - Mutations optimistas para cambios inmediatos
 * - Invalidación automática después de mutaciones
 *
 * Endpoints conectados:
 * - GET /suscripciones/familiar
 * - POST /suscripciones/familiar
 * - POST /suscripciones/familiar/inscripciones
 * - DELETE /suscripciones/familiar/inscripciones
 * - PATCH /suscripciones/familiar/tier
 * - POST /suscripciones/familiar/cancelar
 * - GET /suscripciones/familiar/simular
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  suscripcionFamiliarApi,
  type SuscripcionFamiliarDetalle,
  type CrearSuscripcionFamiliarRequest,
  type AgregarInscripcionesRequest,
  type BajaInscripcionesRequest,
  type CambiarTierRequest,
  type CancelarSuscripcionRequest,
  type CrearSuscripcionResponse,
  type AgregarInscripcionesResponse,
  type BajaInscripcionesResponse,
  type CambiarTierResponse,
  type CancelarSuscripcionResponse,
  type SimularMontoResponse,
  type TierNombre,
  type EstadoSuscripcionFamiliar,
} from '@/lib/api/suscripcion-familiar.api';

// ============================================================================
// QUERY KEYS
// ============================================================================

/** Query keys para invalidación y cache */
export const SUSCRIPCION_FAMILIAR_KEY = ['suscripcion-familiar'] as const;
export const SIMULAR_MONTO_KEY = ['suscripcion-familiar', 'simular'] as const;

// ============================================================================
// TIPOS
// ============================================================================

export interface UseSuscripcionFamiliarReturn {
  // Estado de la query
  suscripcion: SuscripcionFamiliarDetalle | null;
  isLoading: boolean;
  error: string | null;
  hasSuscripcion: boolean;

  // Métodos de mutación
  crearSuscripcion: (data: CrearSuscripcionFamiliarRequest) => Promise<CrearSuscripcionResponse>;
  agregarInscripciones: (
    data: AgregarInscripcionesRequest,
  ) => Promise<AgregarInscripcionesResponse>;
  bajaInscripciones: (data: BajaInscripcionesRequest) => Promise<BajaInscripcionesResponse>;
  cambiarTier: (data: CambiarTierRequest) => Promise<CambiarTierResponse>;
  cancelarSuscripcion: (data: CancelarSuscripcionRequest) => Promise<CancelarSuscripcionResponse>;

  // Estado de mutaciones
  isCreating: boolean;
  isAddingInscripciones: boolean;
  isRemovingInscripciones: boolean;
  isChangingTier: boolean;
  isCancelling: boolean;

  // Utilidades
  refetch: () => Promise<void>;
}

export interface UseSimularMontoReturn {
  simular: (productoIds: string[]) => Promise<SimularMontoResponse>;
  data: SimularMontoResponse | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Formatea el tier para mostrar al usuario
 */
export function formatTierNombre(tier: TierNombre): string {
  const tierLabels: Record<TierNombre, string> = {
    STEAM_LIBROS: 'STEAM Libros',
    STEAM_ASINCRONICO: 'STEAM Asincrónico',
    STEAM_SINCRONICO: 'STEAM Sincrónico',
  };
  return tierLabels[tier] || tier;
}

/**
 * Formatea el estado de suscripción para mostrar
 */
export function formatEstadoSuscripcion(estado: EstadoSuscripcionFamiliar): string {
  const estadoLabels: Record<EstadoSuscripcionFamiliar, string> = {
    PENDIENTE_PAGO: 'Pendiente de Pago',
    ACTIVA: 'Activa',
    EN_GRACIA: 'En Período de Gracia',
    SUSPENDIDA: 'Suspendida',
    CANCELADA: 'Cancelada',
  };
  return estadoLabels[estado] || estado;
}

/**
 * Retorna el color del badge según el estado
 */
export function getEstadoBadgeColor(
  estado: EstadoSuscripcionFamiliar,
): 'green' | 'yellow' | 'red' | 'gray' {
  const colorMap: Record<EstadoSuscripcionFamiliar, 'green' | 'yellow' | 'red' | 'gray'> = {
    ACTIVA: 'green',
    PENDIENTE_PAGO: 'yellow',
    EN_GRACIA: 'yellow',
    SUSPENDIDA: 'red',
    CANCELADA: 'gray',
  };
  return colorMap[estado] || 'gray';
}

/**
 * Formatea monto en pesos argentinos
 */
export function formatMonto(monto: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto);
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

/**
 * Hook principal para gestionar la suscripción familiar del tutor
 */
export function useSuscripcionFamiliar(): UseSuscripcionFamiliarReturn {
  const queryClient = useQueryClient();

  // Query principal - obtener suscripción
  const {
    data: suscripcion,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: SUSCRIPCION_FAMILIAR_KEY,
    queryFn: () => suscripcionFamiliarApi.getMiSuscripcion(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antes cacheTime)
  });

  // Mutation: Crear suscripción
  const crearMutation = useMutation({
    mutationFn: suscripcionFamiliarApi.crearSuscripcion,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: SUSCRIPCION_FAMILIAR_KEY });
      if (result.cobradoInmediatamente) {
        toast.success('Suscripción creada y primer pago procesado');
      } else {
        toast.success('Suscripción creada. Completá el pago para activarla.');
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error al crear suscripción');
    },
  });

  // Mutation: Agregar inscripciones
  const agregarMutation = useMutation({
    mutationFn: suscripcionFamiliarApi.agregarInscripciones,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: SUSCRIPCION_FAMILIAR_KEY });
      toast.success(
        `${result.inscripcionesCreadas.length} actividad(es) agregada(s). Nuevo monto: ${formatMonto(result.nuevoMontoMensual)}`,
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error al agregar actividades');
    },
  });

  // Mutation: Dar de baja inscripciones
  const bajaMutation = useMutation({
    mutationFn: suscripcionFamiliarApi.bajaInscripciones,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: SUSCRIPCION_FAMILIAR_KEY });
      toast.success(
        `${result.inscripcionesBaja.length} actividad(es) dada(s) de baja. Nuevo monto: ${formatMonto(result.nuevoMontoMensual)}`,
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error al dar de baja actividades');
    },
  });

  // Mutation: Cambiar tier
  const cambiarTierMutation = useMutation({
    mutationFn: suscripcionFamiliarApi.cambiarTier,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: SUSCRIPCION_FAMILIAR_KEY });
      toast.success(
        `Plan cambiado a ${formatTierNombre(result.nuevoTier)}. Nuevo monto: ${formatMonto(result.nuevoMontoMensual)}`,
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error al cambiar plan');
    },
  });

  // Mutation: Cancelar suscripción
  const cancelarMutation = useMutation({
    mutationFn: suscripcionFamiliarApi.cancelarSuscripcion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUSCRIPCION_FAMILIAR_KEY });
      toast.success('Suscripción cancelada. Lamentamos verte partir.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error al cancelar suscripción');
    },
  });

  return {
    // Estado de query
    suscripcion: suscripcion ?? null,
    isLoading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    hasSuscripcion: suscripcion !== null && suscripcion !== undefined,

    // Métodos de mutación (wrappers)
    crearSuscripcion: async (data: CrearSuscripcionFamiliarRequest) => {
      return crearMutation.mutateAsync(data);
    },
    agregarInscripciones: async (data: AgregarInscripcionesRequest) => {
      return agregarMutation.mutateAsync(data);
    },
    bajaInscripciones: async (data: BajaInscripcionesRequest) => {
      return bajaMutation.mutateAsync(data);
    },
    cambiarTier: async (data: CambiarTierRequest) => {
      return cambiarTierMutation.mutateAsync(data);
    },
    cancelarSuscripcion: async (data: CancelarSuscripcionRequest) => {
      return cancelarMutation.mutateAsync(data);
    },

    // Estados de mutaciones
    isCreating: crearMutation.isPending,
    isAddingInscripciones: agregarMutation.isPending,
    isRemovingInscripciones: bajaMutation.isPending,
    isChangingTier: cambiarTierMutation.isPending,
    isCancelling: cancelarMutation.isPending,

    // Utilidades
    refetch: async () => {
      await refetch();
    },
  };
}

// ============================================================================
// HOOK PARA SIMULACIÓN
// ============================================================================

/**
 * Hook para simular monto mensual antes de crear/modificar suscripción
 */
export function useSimularMonto(): UseSimularMontoReturn {
  const mutation = useMutation({
    mutationFn: suscripcionFamiliarApi.simularMonto,
  });

  return {
    simular: async (productoIds: string[]) => {
      return mutation.mutateAsync(productoIds);
    },
    data: mutation.data ?? null,
    isLoading: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  };
}

// Re-exportar tipos del API para conveniencia
export type {
  SuscripcionFamiliarDetalle,
  InscripcionActividadDetalle,
  CrearSuscripcionFamiliarRequest,
  AgregarInscripcionesRequest,
  BajaInscripcionesRequest,
  CambiarTierRequest,
  CancelarSuscripcionRequest,
  CrearSuscripcionResponse,
  SimularMontoResponse,
  TierNombre,
  EstadoSuscripcionFamiliar,
  EstadoInscripcionActividad,
} from '@/lib/api/suscripcion-familiar.api';

export default useSuscripcionFamiliar;
