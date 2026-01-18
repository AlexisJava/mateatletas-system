import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  suscripcionFamiliarAdminApi,
  type SuscripcionFamiliarDetalle,
  type EstadoSuscripcionFamiliar,
} from '@/lib/api/suscripcion-familiar.api';

/** Query key para invalidación */
export const SUSCRIPCIONES_KEY = ['admin', 'suscripciones-familiares'] as const;

/** Filtros de estado para la vista */
export type EstadoFilter = EstadoSuscripcionFamiliar | 'all';

/** Estadísticas de suscripciones */
export interface SuscripcionesStats {
  total: number;
  authorized: number;
  pending: number;
  paused: number;
  cancelled: number;
  ingresoMensualEstimado: number;
}

interface UseSuscripcionesFamiliaresReturn {
  // Estado de carga
  isLoading: boolean;
  error: string | null;

  // Filtros
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  estadoFilter: EstadoFilter;
  setEstadoFilter: (filter: EstadoFilter) => void;

  // Paginación
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  total: number;

  // Datos
  suscripciones: SuscripcionFamiliarDetalle[];
  filteredSuscripciones: SuscripcionFamiliarDetalle[];
  stats: SuscripcionesStats;

  // Selección
  selectedSuscripcion: SuscripcionFamiliarDetalle | null;
  setSelectedSuscripcion: (s: SuscripcionFamiliarDetalle | null) => void;

  // Acciones
  refetch: () => Promise<void>;
}

/**
 * Hook para gestionar suscripciones familiares desde admin
 */
export function useSuscripcionesFamiliares(): UseSuscripcionesFamiliaresReturn {
  // Estado local
  const [searchQuery, setSearchQuery] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>('all');
  const [page, setPage] = useState(1);
  const [selectedSuscripcion, setSelectedSuscripcion] = useState<SuscripcionFamiliarDetalle | null>(
    null,
  );

  const limit = 20;

  // Query para obtener suscripciones
  const {
    data,
    isLoading,
    error: queryError,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: [...SUSCRIPCIONES_KEY, { page, estadoFilter }],
    queryFn: async () => {
      const response = await suscripcionFamiliarAdminApi.listarTodas({
        estado: estadoFilter === 'all' ? undefined : estadoFilter,
        page,
        limit,
      });
      return response;
    },
    staleTime: 30_000, // 30 segundos
  });

  // Extraer datos de la respuesta
  const suscripciones = data?.data ?? [];
  const total = data?.metadata?.total ?? 0;
  const totalPages = data?.metadata?.totalPages ?? 1;

  // Filtrar por búsqueda (client-side)
  const filteredSuscripciones = useMemo(() => {
    if (!searchQuery.trim()) return suscripciones;

    const query = searchQuery.toLowerCase();
    return suscripciones.filter((s) => {
      const tutorMatch = s.tutorNombre.toLowerCase().includes(query);
      const estudianteMatch = s.inscripciones.some((i) =>
        i.estudianteNombre.toLowerCase().includes(query),
      );
      const productoMatch = s.inscripciones.some((i) =>
        i.productoNombre.toLowerCase().includes(query),
      );
      return tutorMatch || estudianteMatch || productoMatch;
    });
  }, [suscripciones, searchQuery]);

  // Calcular estadísticas
  const stats = useMemo<SuscripcionesStats>(() => {
    // Contamos sobre los datos de la página actual
    // En un sistema real, estas métricas vendrían del backend
    const authorized = suscripciones.filter((s) => s.estado === 'AUTHORIZED').length;
    const pending = suscripciones.filter((s) => s.estado === 'PENDING').length;
    const paused = suscripciones.filter((s) => s.estado === 'PAUSED').length;
    const cancelled = suscripciones.filter((s) => s.estado === 'CANCELLED').length;

    const ingresoMensualEstimado = suscripciones
      .filter((s) => s.estado === 'AUTHORIZED')
      .reduce((acc, s) => acc + s.montoMensual, 0);

    return {
      total,
      authorized,
      pending,
      paused,
      cancelled,
      ingresoMensualEstimado,
    };
  }, [suscripciones, total]);

  // Error formateado
  const error = queryError ? 'Error al cargar suscripciones' : null;

  // Refetch wrapper
  const refetch = useCallback(async () => {
    await queryRefetch();
  }, [queryRefetch]);

  return {
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    estadoFilter,
    setEstadoFilter,
    page,
    setPage,
    totalPages,
    total,
    suscripciones,
    filteredSuscripciones,
    stats,
    selectedSuscripcion,
    setSelectedSuscripcion,
    refetch,
  };
}
