'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  listarGruposPedagogicos,
  obtenerGrupoPedagogico,
  actualizarGrupoPedagogico,
  obtenerEstadisticasGrupos,
  migrarGruposLegacy,
} from '@/lib/api/admin.api';
import type {
  GrupoPedagogico,
  FiltrosGrupoPedagogico,
  CasaTipo,
  MundoTipo,
  GruposStats,
} from '../types/grupos.types';

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
 */
export function useGruposPedagogicos(): UseGruposPedagogicosReturn {
  const [grupos, setGrupos] = useState<GrupoPedagogico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosGrupoPedagogico>({});
  const [selectedGrupo, setSelectedGrupo] = useState<GrupoPedagogico | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  // Fetch grupos
  const fetchGrupos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listarGruposPedagogicos(filtros);
      setGrupos(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar grupos';
      setError(message);
      console.error('useGruposPedagogicos: Error al cargar:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    fetchGrupos();
  }, [fetchGrupos]);

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
        await actualizarGrupoPedagogico(grupoId, {
          casa_tipo: casaTipo ?? undefined,
          mundo_tipo: mundoTipo ?? undefined,
        });

        // Actualizar estado local
        setGrupos((prev) =>
          prev.map((g) =>
            g.id === grupoId
              ? {
                  ...g,
                  casa_tipo: casaTipo,
                  mundo_tipo: mundoTipo,
                }
              : g,
          ),
        );

        // Si hay un grupo seleccionado, actualizarlo
        if (selectedGrupo?.id === grupoId) {
          setSelectedGrupo((prev) =>
            prev
              ? {
                  ...prev,
                  casa_tipo: casaTipo,
                  mundo_tipo: mundoTipo,
                }
              : null,
          );
        }

        toast.success('Grupo actualizado');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al actualizar grupo';
        toast.error(message);
        throw err;
      }
    },
    [selectedGrupo],
  );

  // Migrar grupos legacy
  const handleMigrarLegacy = useCallback(async () => {
    setIsMigrating(true);
    try {
      const result = await migrarGruposLegacy();
      toast.success(result.mensaje);
      // Refetch para ver los cambios
      await fetchGrupos();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al migrar grupos';
      toast.error(message);
    } finally {
      setIsMigrating(false);
    }
  }, [fetchGrupos]);

  return {
    isLoading,
    error,
    grupos,
    filtros,
    setFiltros,
    clearFiltros,
    stats,
    selectedGrupo,
    setSelectedGrupo,
    handleActualizarGrupo,
    handleMigrarLegacy,
    isMigrating,
    refetch: fetchGrupos,
  };
}
