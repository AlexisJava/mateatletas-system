import { getErrorMessage } from '@/lib/utils/error-handler';
import { create } from 'zustand';
import {
  ListaAsistencia,
  EstadisticasClase,
  ResumenDocenteAsistencia,
  HistorialAsistencia,
  MarcarAsistenciaDto,
} from '@/types/asistencia.types';
import {
  marcarAsistencia as apiMarcarAsistencia,
  getAsistenciaClase,
  getEstadisticasClase,
  getHistorialEstudiante,
  getResumenDocente,
} from '@/lib/api/asistencia.api';

/**
 * AsistenciaStore - Estado global para gestión de asistencia
 *
 * Responsabilidades:
 * - Gestionar lista de asistencia de una clase
 * - Marcar asistencia de estudiantes
 * - Obtener estadísticas de clases
 * - Obtener historial de asistencia de estudiantes
 * - Obtener resumen del docente
 */
interface AsistenciaStore {
  // ==================== STATE ====================

  /** Lista de asistencia de la clase actual */
  listaAsistencia: ListaAsistencia | null;

  /** Estadísticas de la clase actual */
  estadisticas: EstadisticasClase | null;

  /** Historial de asistencia de un estudiante */
  historial: HistorialAsistencia | null;

  /** Resumen global del docente */
  resumenDocente: ResumenDocenteAsistencia | null;

  /** Estado de carga */
  isLoading: boolean;

  /** Estado de carga para operaciones individuales */
  isLoadingMarcacion: boolean;

  /** Error actual */
  error: string | null;

  // ==================== ACTIONS ====================

  /**
   * Obtiene la lista de asistencia de una clase
   * @param claseId ID de la clase
   */
  fetchListaAsistencia: (claseId: string) => Promise<void>;

  /**
   * Marca la asistencia de un estudiante
   * @param claseId ID de la clase
   * @param estudianteId ID del estudiante
   * @param data Datos de asistencia (estado, observaciones, puntos)
   * @returns true si se marcó correctamente
   */
  marcarAsistencia: (
    claseId: string,
    estudianteId: string,
    data: MarcarAsistenciaDto
  ) => Promise<boolean>;

  /**
   * Obtiene las estadísticas de una clase
   * @param claseId ID de la clase
   */
  fetchEstadisticas: (claseId: string) => Promise<void>;

  /**
   * Obtiene el historial de asistencia de un estudiante
   * @param estudianteId ID del estudiante
   */
  fetchHistorialEstudiante: (estudianteId: string) => Promise<void>;

  /**
   * Obtiene el resumen global del docente autenticado
   */
  fetchResumenDocente: () => Promise<void>;

  /**
   * Limpia el error actual
   */
  clearError: () => void;

  /**
   * Reinicia el estado completo
   */
  reset: () => void;
}

/**
 * useAsistenciaStore
 *
 * Hook de Zustand para gestión de asistencia
 *
 * @example
 * ```tsx
 * const { listaAsistencia, fetchListaAsistencia, marcarAsistencia } = useAsistenciaStore();
 *
 * useEffect(() => {
 *   fetchListaAsistencia(claseId);
 * }, [claseId]);
 *
 * const handleMarcar = async (estudianteId: string) => {
 *   const success = await marcarAsistencia(claseId, estudianteId, {
 *     estado: 'Presente',
 *     puntosOtorgados: 10,
 *   });
 *   if (success) {
 *     toast.success('Asistencia marcada');
 *   }
 * };
 * ```
 */
export const useAsistenciaStore = create<AsistenciaStore>((set, get) => ({
  // ==================== INITIAL STATE ====================
  listaAsistencia: null,
  estadisticas: null,
  historial: null,
  resumenDocente: null,
  isLoading: false,
  isLoadingMarcacion: false,
  error: null,

  // ==================== ACTIONS ====================

  fetchListaAsistencia: async (claseId: string) => {
    set({ isLoading: true, error: null });
    try {
      const lista = await getAsistenciaClase(claseId);
      set({ listaAsistencia: lista, isLoading: false });
    } catch (error) {
      const errorMsg = getErrorMessage(error, 'Error al cargar lista de asistencia');
      set({ error: errorMsg, isLoading: false });
      console.error('Error fetchListaAsistencia:', error);
    }
  },

  marcarAsistencia: async (
    claseId: string,
    estudianteId: string,
    data: MarcarAsistenciaDto
  ): Promise<boolean> => {
    set({ isLoadingMarcacion: true, error: null });
    try {
      await apiMarcarAsistencia(claseId, estudianteId, data);

      // Recargar la lista de asistencia para actualizar el estado
      await get().fetchListaAsistencia(claseId);

      set({ isLoadingMarcacion: false });
      return true;
    } catch (error) {
      const errorMsg = getErrorMessage(error, 'Error al marcar asistencia');
      set({ error: errorMsg, isLoadingMarcacion: false });
      console.error('Error marcarAsistencia:', error);
      return false;
    }
  },

  fetchEstadisticas: async (claseId: string) => {
    set({ isLoading: true, error: null });
    try {
      const stats = await getEstadisticasClase(claseId);
      set({ estadisticas: stats, isLoading: false });
    } catch (error) {
      const errorMsg = getErrorMessage(error, 'Error al cargar estadísticas');
      set({ error: errorMsg, isLoading: false });
      console.error('Error fetchEstadisticas:', error);
    }
  },

  fetchHistorialEstudiante: async (estudianteId: string) => {
    set({ isLoading: true, error: null });
    try {
      const hist = await getHistorialEstudiante(estudianteId);
      set({ historial: hist, isLoading: false });
    } catch (error) {
      const errorMsg = getErrorMessage(error, 'Error al cargar historial');
      set({ error: errorMsg, isLoading: false });
      console.error('Error fetchHistorialEstudiante:', error);
    }
  },

  fetchResumenDocente: async () => {
    set({ isLoading: true, error: null });
    try {
      const resumen = await getResumenDocente();
      set({ resumenDocente: resumen, isLoading: false });
    } catch (error) {
      const errorMsg = getErrorMessage(error, 'Error al cargar resumen del docente');
      set({ error: errorMsg, isLoading: false });
      console.error('Error fetchResumenDocente:', error);
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      listaAsistencia: null,
      estadisticas: null,
      historial: null,
      resumenDocente: null,
      isLoading: false,
      isLoadingMarcacion: false,
      error: null,
    });
  },
}));
