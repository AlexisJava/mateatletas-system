import { useState, useEffect, useMemo, useCallback } from 'react';
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
 */
export function useDocenteAsignaciones(): UseDocenteAsignacionesReturn {
  const [docentes, setDocentes] = useState<DocenteAsignacionesPerfil[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosAsignaciones>({});
  const [selectedDocente, setSelectedDocente] = useState<DocenteAsignacionesPerfil | null>(null);

  // Fetch docentes con filtros
  const fetchDocentes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await listarDocentesFiltrados({
        casa_tipo: filtros.casa_tipo,
        mundo_tipo: filtros.mundo_tipo,
        tipo_asignacion: filtros.tipo_asignacion,
      });
      setDocentes(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar docentes';
      setError(message);
      console.error('useDocenteAsignaciones: Error al cargar:', message);
    } finally {
      setIsLoading(false);
    }
  }, [filtros.casa_tipo, filtros.mundo_tipo, filtros.tipo_asignacion]);

  useEffect(() => {
    fetchDocentes();
  }, [fetchDocentes]);

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

  // Refrescar un docente específico (después de modificar)
  const refreshDocente = useCallback(async (docenteId: string) => {
    try {
      const perfil = await obtenerPerfilAsignacionesDocente(docenteId);
      setDocentes((prev) => prev.map((d) => (d.id === docenteId ? perfil : d)));
      // También actualizar selectedDocente si es el mismo
      setSelectedDocente((prev) => (prev?.id === docenteId ? perfil : prev));
    } catch (err) {
      console.error('Error al refrescar docente:', err);
    }
  }, []);

  // Asignar casa
  const handleAsignarCasa = useCallback(
    async (docenteId: string, casaTipo: CasaTipo) => {
      try {
        await asignarCasaDocente(docenteId, casaTipo);
        toast.success(`Casa ${casaTipo} asignada`);
        await refreshDocente(docenteId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al asignar casa';
        toast.error(message);
        throw err;
      }
    },
    [refreshDocente],
  );

  // Remover casa
  const handleRemoverCasa = useCallback(
    async (docenteId: string, casaTipo: CasaTipo) => {
      try {
        await removerCasaDocente(docenteId, casaTipo);
        toast.success(`Casa ${casaTipo} removida`);
        await refreshDocente(docenteId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al remover casa';
        toast.error(message);
        throw err;
      }
    },
    [refreshDocente],
  );

  // Asignar mundo
  const handleAsignarMundo = useCallback(
    async (docenteId: string, mundoTipo: MundoTipo) => {
      try {
        await asignarMundoDocente(docenteId, mundoTipo);
        toast.success(`Mundo ${mundoTipo} asignado`);
        await refreshDocente(docenteId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al asignar mundo';
        toast.error(message);
        throw err;
      }
    },
    [refreshDocente],
  );

  // Remover mundo
  const handleRemoverMundo = useCallback(
    async (docenteId: string, mundoTipo: MundoTipo) => {
      try {
        await removerMundoDocente(docenteId, mundoTipo);
        toast.success(`Mundo ${mundoTipo} removido`);
        await refreshDocente(docenteId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al remover mundo';
        toast.error(message);
        throw err;
      }
    },
    [refreshDocente],
  );

  // Actualizar tipo de asignación
  const handleActualizarTipoAsignacion = useCallback(
    async (docenteId: string, tipo: TipoAsignacionDocente) => {
      try {
        await actualizarTipoAsignacionDocente(docenteId, tipo);
        toast.success(`Tipo de asignación actualizado a ${tipo}`);
        await refreshDocente(docenteId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al actualizar tipo';
        toast.error(message);
        throw err;
      }
    },
    [refreshDocente],
  );

  return {
    isLoading,
    error,
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
    refetch: fetchDocentes,
    refreshDocente,
  };
}
