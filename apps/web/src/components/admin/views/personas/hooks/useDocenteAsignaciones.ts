/**
 * useDocenteAsignaciones - Hook para gestión de asignaciones Casa/Mundo
 *
 * Integrado en PersonasView para FASE 2 del refactor.
 * Mutations para asignar/remover casas y mundos a docentes.
 */
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
} from '@/lib/api/admin.api';

export type { CasaTipo, MundoTipo, TipoAsignacionDocente, DocenteAsignacionesPerfil };

/** Query key para invalidación */
export const DOCENTE_ASIGNACIONES_KEY = ['admin', 'docente-asignaciones'] as const;

/** Filtros para la vista de asignaciones */
export interface FiltrosAsignaciones {
  casa_tipo?: CasaTipo;
  mundo_tipo?: MundoTipo;
  tipo_asignacion?: TipoAsignacionDocente;
  busqueda?: string;
}

/** Stats de asignaciones */
export interface AsignacionesStats {
  totalDocentes: number;
  conCasaAsignada: number;
  conMundoAsignado: number;
  porTipoAsignacion: {
    CLASE_GRUPOS: number;
    COMISIONES: number;
    AMBOS: number;
  };
}

/** Configuración de colores por Casa */
export const CASA_CONFIG: Record<CasaTipo, { label: string; color: string; bgColor: string }> = {
  QUANTUM: {
    label: 'Quantum (6-9)',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
  },
  VERTEX: {
    label: 'Vertex (10-12)',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  PULSAR: {
    label: 'Pulsar (13-17)',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
  },
};

/** Configuración de colores por Mundo */
export const MUNDO_CONFIG: Record<MundoTipo, { label: string; color: string; bgColor: string }> = {
  MATEMATICA: {
    label: 'Matemática',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  PROGRAMACION: {
    label: 'Programación',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  CIENCIAS: {
    label: 'Ciencias',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/20',
  },
};

/** Configuración por tipo de asignación */
export const TIPO_ASIGNACION_CONFIG: Record<
  TipoAsignacionDocente,
  { label: string; description: string }
> = {
  CLASE_GRUPOS: {
    label: 'Clase Grupos',
    description: 'Trabaja con grupos de clase',
  },
  COMISIONES: {
    label: 'Comisiones',
    description: 'Trabaja con comisiones',
  },
  AMBOS: {
    label: 'Ambos',
    description: 'Trabaja con grupos y comisiones',
  },
};

interface UseDocenteAsignacionesReturn {
  isLoading: boolean;
  error: string | null;
  docentes: DocenteAsignacionesPerfil[];
  filtros: FiltrosAsignaciones;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosAsignaciones>>;
  clearFiltros: () => void;
  stats: AsignacionesStats;
  selectedDocente: DocenteAsignacionesPerfil | null;
  setSelectedDocente: (docente: DocenteAsignacionesPerfil | null) => void;
  handleAsignarCasa: (docenteId: string, casaTipo: CasaTipo) => Promise<void>;
  handleRemoverCasa: (docenteId: string, casaTipo: CasaTipo) => Promise<void>;
  handleAsignarMundo: (docenteId: string, mundoTipo: MundoTipo) => Promise<void>;
  handleRemoverMundo: (docenteId: string, mundoTipo: MundoTipo) => Promise<void>;
  handleActualizarTipoAsignacion: (docenteId: string, tipo: TipoAsignacionDocente) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook para gestionar asignaciones Casa/Mundo de docentes
 * Integrado en PersonasView para unificar la gestión
 */
export function useDocenteAsignaciones(): UseDocenteAsignacionesReturn {
  const queryClient = useQueryClient();

  const [filtros, setFiltros] = useState<FiltrosAsignaciones>({});
  const [selectedDocente, setSelectedDocente] = useState<DocenteAsignacionesPerfil | null>(null);

  // Filtros del servidor
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
    queryKey: [...DOCENTE_ASIGNACIONES_KEY, serverFiltros],
    queryFn: () => listarDocentesFiltrados(serverFiltros),
  });

  // Filtrado local por búsqueda
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

  const clearFiltros = useCallback(() => {
    setFiltros({});
  }, []);

  // Refresh individual docente
  const refreshDocente = useCallback(
    async (docenteId: string) => {
      try {
        const perfil = await obtenerPerfilAsignacionesDocente(docenteId);
        queryClient.setQueryData<DocenteAsignacionesPerfil[]>(
          [...DOCENTE_ASIGNACIONES_KEY, serverFiltros],
          (old) => old?.map((d) => (d.id === docenteId ? perfil : d)) ?? [],
        );
        if (selectedDocente?.id === docenteId) {
          setSelectedDocente(perfil);
        }
      } catch (err) {
        console.error('Error al refrescar docente:', err);
      }
    },
    [queryClient, serverFiltros, selectedDocente?.id],
  );

  // Mutations
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
      toast.error(err instanceof Error ? err.message : 'Error al asignar casa');
    },
  });

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
      toast.error(err instanceof Error ? err.message : 'Error al remover casa');
    },
  });

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
      toast.error(err instanceof Error ? err.message : 'Error al asignar mundo');
    },
  });

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
      toast.error(err instanceof Error ? err.message : 'Error al remover mundo');
    },
  });

  const actualizarTipoMutation = useMutation({
    mutationFn: async ({ docenteId, tipo }: { docenteId: string; tipo: TipoAsignacionDocente }) => {
      await actualizarTipoAsignacionDocente(docenteId, tipo);
      return { docenteId, tipo };
    },
    onSuccess: async ({ docenteId, tipo }) => {
      toast.success(`Tipo actualizado a ${tipo}`);
      await refreshDocente(docenteId);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar tipo');
    },
  });

  // Handlers
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
  };
}
