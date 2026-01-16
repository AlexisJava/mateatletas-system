import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  listarDocentesFiltrados,
  asignarCasaDocente,
  removerCasaDocente,
  asignarMundoDocente,
  removerMundoDocente,
  actualizarTipoAsignacionDocente,
  obtenerPerfilAsignacionesDocente,
} from '@/lib/api/admin.api';
import type {
  CasaTipo,
  MundoTipo,
  TipoAsignacionDocente,
  DocenteAsignacionesPerfil,
  FiltrosAsignaciones,
  AsignacionesStats,
} from '../types/asignaciones.types';

/** Query key para invalidación */
export const DOCENTES_ASIGNACIONES_KEY = ['admin', 'docentes-asignaciones'] as const;

interface UseDocenteAsignacionesReturn {
  // Estado
  isLoading: boolean;
  error: string | null;
  docentes: DocenteAsignacionesPerfil[];

  // Filtros
  filtros: FiltrosAsignaciones;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosAsignaciones>>;
  clearFiltros: () => void;

  // Stats
  stats: AsignacionesStats;

  // Selección
  selectedDocente: DocenteAsignacionesPerfil | null;
  setSelectedDocente: (docente: DocenteAsignacionesPerfil | null) => void;

  // Acciones
  handleAsignarCasa: (docenteId: string, casaTipo: CasaTipo) => Promise<void>;
  handleRemoverCasa: (docenteId: string, casaTipo: CasaTipo) => Promise<void>;
  handleAsignarMundo: (docenteId: string, mundoTipo: MundoTipo) => Promise<void>;
  handleRemoverMundo: (docenteId: string, mundoTipo: MundoTipo) => Promise<void>;
  handleActualizarTipoAsignacion: (docenteId: string, tipo: TipoAsignacionDocente) => Promise<void>;
  refetch: () => Promise<void>;
  refreshDocente: (docenteId: string) => Promise<void>;
}

/**
 * Hook para gestionar asignaciones Casa/Mundo de docentes
 * Sistema Casa/Mundo 2026
 *
 * Usa React Query para:
 * - Cachear datos
 * - Navegación instantánea entre pestañas
 * - Invalidación automática al modificar
 */
export function useDocenteAsignaciones(): UseDocenteAsignacionesReturn {
  const queryClient = useQueryClient();

  // Estado local para UI
  const [filtros, setFiltros] = useState<FiltrosAsignaciones>({});
  const [selectedDocente, setSelectedDocente] = useState<DocenteAsignacionesPerfil | null>(null);

  // Query principal - incluye filtros del servidor en la key
  const serverFiltros = {
    casa_tipo: filtros.casa_tipo,
    mundo_tipo: filtros.mundo_tipo,
    tipo_asignacion: filtros.tipo_asignacion,
  };

  const {
    data: docentes = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...DOCENTES_ASIGNACIONES_KEY, serverFiltros],
    queryFn: () => listarDocentesFiltrados(serverFiltros),
  });

  // Filtrado local por búsqueda (nombre/apellido)
  const docentesFiltrados = useMemo(() => {
    if (!filtros.busqueda) return docentes;

    const busqueda = filtros.busqueda.toLowerCase();
    return docentes.filter(
      (d) =>
        d.nombre.toLowerCase().includes(busqueda) || d.apellido.toLowerCase().includes(busqueda),
    );
  }, [docentes, filtros.busqueda]);

  // Estadísticas
  const stats: AsignacionesStats = useMemo(() => {
    const total = docentes.length;
    const conCasa = docentes.filter((d) => d.casas.length > 0).length;
    const conMundo = docentes.filter((d) => d.mundos.length > 0).length;

    const porTipo = {
      CLASE_GRUPOS: docentes.filter((d) => d.tipo_asignacion === 'CLASE_GRUPOS').length,
      COMISIONES: docentes.filter((d) => d.tipo_asignacion === 'COMISIONES').length,
      AMBOS: docentes.filter((d) => d.tipo_asignacion === 'AMBOS').length,
    };

    return {
      totalDocentes: total,
      conCasaAsignada: conCasa,
      conMundoAsignado: conMundo,
      porTipoAsignacion: porTipo,
    };
  }, [docentes]);

  // Limpiar filtros
  const clearFiltros = useCallback(() => {
    setFiltros({});
  }, []);

  // Helper para refrescar un docente específico y actualizar cache
  const refreshDocente = useCallback(
    async (docenteId: string) => {
      try {
        const perfil = await obtenerPerfilAsignacionesDocente(docenteId);

        // Actualizar en el cache de la query actual
        queryClient.setQueryData<DocenteAsignacionesPerfil[]>(
          [...DOCENTES_ASIGNACIONES_KEY, serverFiltros],
          (old) => old?.map((d) => (d.id === docenteId ? perfil : d)) ?? [],
        );

        // Actualizar selectedDocente si es el mismo
        if (selectedDocente?.id === docenteId) {
          setSelectedDocente(perfil);
        }
      } catch (err) {
        console.error('Error al refrescar docente:', err);
      }
    },
    [queryClient, serverFiltros, selectedDocente?.id],
  );

  // Mutation para asignar casa
  const asignarCasaMutation = useMutation({
    mutationFn: async ({ docenteId, casaTipo }: { docenteId: string; casaTipo: CasaTipo }) => {
      await asignarCasaDocente(docenteId, casaTipo);
      return { docenteId, casaTipo };
    },
    onSuccess: async ({ docenteId, casaTipo }) => {
      toast.success(`Casa ${casaTipo} asignada`);
      await refreshDocente(docenteId);
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Error al asignar casa';
      toast.error(message);
    },
  });

  // Mutation para remover casa
  const removerCasaMutation = useMutation({
    mutationFn: async ({ docenteId, casaTipo }: { docenteId: string; casaTipo: CasaTipo }) => {
      await removerCasaDocente(docenteId, casaTipo);
      return { docenteId, casaTipo };
    },
    onSuccess: async ({ docenteId, casaTipo }) => {
      toast.success(`Casa ${casaTipo} removida`);
      await refreshDocente(docenteId);
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Error al remover casa';
      toast.error(message);
    },
  });

  // Mutation para asignar mundo
  const asignarMundoMutation = useMutation({
    mutationFn: async ({ docenteId, mundoTipo }: { docenteId: string; mundoTipo: MundoTipo }) => {
      await asignarMundoDocente(docenteId, mundoTipo);
      return { docenteId, mundoTipo };
    },
    onSuccess: async ({ docenteId, mundoTipo }) => {
      toast.success(`Mundo ${mundoTipo} asignado`);
      await refreshDocente(docenteId);
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Error al asignar mundo';
      toast.error(message);
    },
  });

  // Mutation para remover mundo
  const removerMundoMutation = useMutation({
    mutationFn: async ({ docenteId, mundoTipo }: { docenteId: string; mundoTipo: MundoTipo }) => {
      await removerMundoDocente(docenteId, mundoTipo);
      return { docenteId, mundoTipo };
    },
    onSuccess: async ({ docenteId, mundoTipo }) => {
      toast.success(`Mundo ${mundoTipo} removido`);
      await refreshDocente(docenteId);
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Error al remover mundo';
      toast.error(message);
    },
  });

  // Mutation para actualizar tipo asignación
  const actualizarTipoMutation = useMutation({
    mutationFn: async ({ docenteId, tipo }: { docenteId: string; tipo: TipoAsignacionDocente }) => {
      await actualizarTipoAsignacionDocente(docenteId, tipo);
      return { docenteId, tipo };
    },
    onSuccess: async ({ docenteId, tipo }) => {
      toast.success(`Tipo de asignación actualizado a ${tipo}`);
      await refreshDocente(docenteId);
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Error al actualizar tipo';
      toast.error(message);
    },
  });

  // Handlers que expone el hook
  const handleAsignarCasa = useCallback(
    async (docenteId: string, casaTipo: CasaTipo) => {
      await asignarCasaMutation.mutateAsync({ docenteId, casaTipo });
    },
    [asignarCasaMutation],
  );

  const handleRemoverCasa = useCallback(
    async (docenteId: string, casaTipo: CasaTipo) => {
      await removerCasaMutation.mutateAsync({ docenteId, casaTipo });
    },
    [removerCasaMutation],
  );

  const handleAsignarMundo = useCallback(
    async (docenteId: string, mundoTipo: MundoTipo) => {
      await asignarMundoMutation.mutateAsync({ docenteId, mundoTipo });
    },
    [asignarMundoMutation],
  );

  const handleRemoverMundo = useCallback(
    async (docenteId: string, mundoTipo: MundoTipo) => {
      await removerMundoMutation.mutateAsync({ docenteId, mundoTipo });
    },
    [removerMundoMutation],
  );

  const handleActualizarTipoAsignacion = useCallback(
    async (docenteId: string, tipo: TipoAsignacionDocente) => {
      await actualizarTipoMutation.mutateAsync({ docenteId, tipo });
    },
    [actualizarTipoMutation],
  );

  return {
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Error al cargar docentes') : null,
    docentes: docentesFiltrados,
    filtros,
    setFiltros,
    clearFiltros,
    stats,
    selectedDocente,
    setSelectedDocente,
    handleAsignarCasa,
    handleRemoverCasa,
    handleAsignarMundo,
    handleRemoverMundo,
    handleActualizarTipoAsignacion,
    refetch: async () => {
      await refetch();
    },
    refreshDocente,
  };
}
