'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  listarGruposPedagogicos,
  actualizarGrupoPedagogico,
  migrarGruposLegacy,
} from '@/lib/api/admin.api';
import type {
  GrupoPedagogico,
  FiltrosGrupoPedagogico,
  CasaTipo,
  MundoTipo,
  GruposStats,
} from '../types/grupos.types';

/** Query key para invalidación */
export const GRUPOS_PEDAGOGICOS_KEY = ['admin', 'grupos-pedagogicos'] as const;

interface UseGruposPedagogicosReturn {
  isLoading: boolean;
  error: string | null;
  grupos: GrupoPedagogico[];
  filtros: FiltrosGrupoPedagogico;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosGrupoPedagogico>>;
  clearFiltros: () => void;
  stats: GruposStats;
  selectedGrupo: GrupoPedagogico | null;
  setSelectedGrupo: (grupo: GrupoPedagogico | null) => void;
  handleActualizarGrupo: (
    grupoId: string,
    casaTipo: CasaTipo | null,
    mundoTipo: MundoTipo | null,
  ) => Promise<void>;
  handleMigrarLegacy: () => Promise<void>;
  isMigrating: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook para gestionar grupos pedagógicos con Casa/Mundo
 * Sistema Casa/Mundo 2026 - FASE 2 Frontend
 *
 * Usa React Query para:
 * - Cachear datos
 * - Navegación instantánea entre pestañas
 * - Invalidación automática al actualizar
 */
export function useGruposPedagogicos(): UseGruposPedagogicosReturn {
  const queryClient = useQueryClient();

  // Estado local para UI
  const [filtros, setFiltros] = useState<FiltrosGrupoPedagogico>({});
  const [selectedGrupo, setSelectedGrupo] = useState<GrupoPedagogico | null>(null);

  // Query principal - incluye filtros en la key para refetch automático
  const {
    data: grupos = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...GRUPOS_PEDAGOGICOS_KEY, filtros],
    queryFn: () => listarGruposPedagogicos(filtros),
  });

  // Mutation para actualizar grupo
  const updateMutation = useMutation({
    mutationFn: async ({
      grupoId,
      casaTipo,
      mundoTipo,
    }: {
      grupoId: string;
      casaTipo: CasaTipo | null;
      mundoTipo: MundoTipo | null;
    }) => {
      await actualizarGrupoPedagogico(grupoId, {
        casa_tipo: casaTipo ?? undefined,
        mundo_tipo: mundoTipo ?? undefined,
      });
      return { grupoId, casaTipo, mundoTipo };
    },
    onSuccess: ({ grupoId, casaTipo, mundoTipo }) => {
      // Actualizar cache optimistamente
      queryClient.setQueryData<GrupoPedagogico[]>(
        [...GRUPOS_PEDAGOGICOS_KEY, filtros],
        (old) =>
          old?.map((g) =>
            g.id === grupoId ? { ...g, casa_tipo: casaTipo, mundo_tipo: mundoTipo } : g,
          ) ?? [],
      );

      // Actualizar grupo seleccionado si es el mismo
      if (selectedGrupo?.id === grupoId) {
        setSelectedGrupo((prev) =>
          prev ? { ...prev, casa_tipo: casaTipo, mundo_tipo: mundoTipo } : null,
        );
      }

      toast.success('Grupo actualizado');
    },
  });

  // Mutation para migrar legacy
  const migrateMutation = useMutation({
    mutationFn: migrarGruposLegacy,
    onSuccess: (result) => {
      toast.success(result.mensaje);
      // Invalidar cache para refetch
      queryClient.invalidateQueries({ queryKey: GRUPOS_PEDAGOGICOS_KEY });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Error al migrar grupos';
      toast.error(message);
    },
  });

  // Calcular stats desde los datos locales
  const stats = useMemo<GruposStats>(() => {
    const porCasa: Record<CasaTipo | 'SIN_ASIGNAR', number> = {
      QUANTUM: 0,
      VERTEX: 0,
      PULSAR: 0,
      SIN_ASIGNAR: 0,
    };
    const porMundo: Record<MundoTipo | 'SIN_ASIGNAR', number> = {
      MATEMATICA: 0,
      PROGRAMACION: 0,
      CIENCIAS: 0,
      SIN_ASIGNAR: 0,
    };
    let conClases = 0;
    let conComisiones = 0;

    grupos.forEach((g) => {
      if (g.casa_tipo) {
        porCasa[g.casa_tipo]++;
      } else {
        porCasa.SIN_ASIGNAR++;
      }

      if (g.mundo_tipo) {
        porMundo[g.mundo_tipo]++;
      } else {
        porMundo.SIN_ASIGNAR++;
      }

      if (g._count?.claseGrupos && g._count.claseGrupos > 0) {
        conClases++;
      }
      if (g._count?.comisionesProducto && g._count.comisionesProducto > 0) {
        conComisiones++;
      }
    });

    return {
      totalGrupos: grupos.length,
      porCasa,
      porMundo,
      conClases,
      conComisiones,
    };
  }, [grupos]);

  // Limpiar filtros
  const clearFiltros = useCallback(() => {
    setFiltros({});
  }, []);

  // Actualizar grupo
  const handleActualizarGrupo = useCallback(
    async (grupoId: string, casaTipo: CasaTipo | null, mundoTipo: MundoTipo | null) => {
      try {
        await updateMutation.mutateAsync({ grupoId, casaTipo, mundoTipo });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al actualizar grupo';
        toast.error(message);
        throw err;
      }
    },
    [updateMutation],
  );

  // Migrar grupos legacy
  const handleMigrarLegacy = useCallback(async () => {
    await migrateMutation.mutateAsync();
  }, [migrateMutation]);

  return {
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Error al cargar grupos') : null,
    grupos,
    filtros,
    setFiltros,
    clearFiltros,
    stats,
    selectedGrupo,
    setSelectedGrupo,
    handleActualizarGrupo,
    handleMigrarLegacy,
    isMigrating: migrateMutation.isPending,
    refetch: async () => {
      await refetch();
    },
  };
}
