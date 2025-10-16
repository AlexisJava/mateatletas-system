import { getErrorMessage } from '@/lib/utils/error-handler';
import { create } from 'zustand';
import { Clase } from '@/types/clases.types';
import { getMisClasesDocente, cancelarClase, getClaseById } from '@/lib/api/clases.api';

/**
 * DocenteStore - Estado global para el panel del docente
 *
 * Responsabilidades:
 * - Gestionar las clases del docente
 * - Cancelar clases
 * - Ver detalles de clases
 */
interface DocenteStore {
  // ==================== STATE ====================

  /** Lista de clases del docente */
  misClases: Clase[];

  /** Clase actualmente seleccionada */
  claseActual: Clase | null;

  /** Estado de carga */
  isLoading: boolean;

  /** Estado de carga para operaciones individuales */
  isLoadingAction: boolean;

  /** Error actual */
  error: string | null;

  /** Filtro: mostrar clases pasadas */
  mostrarClasesPasadas: boolean;

  // ==================== ACTIONS ====================

  /**
   * Obtiene las clases del docente autenticado
   * @param incluirPasadas Si incluir clases finalizadas/canceladas
   */
  fetchMisClases: (incluirPasadas?: boolean) => Promise<void>;

  /**
   * Obtiene los detalles de una clase específica
   * @param claseId ID de la clase
   */
  fetchClaseDetalle: (claseId: string) => Promise<void>;

  /**
   * Cancela una clase
   * @param claseId ID de la clase
   * @returns true si se canceló correctamente
   */
  cancelarClase: (claseId: string) => Promise<boolean>;

  /**
   * Alterna el filtro de clases pasadas
   */
  toggleMostrarClasesPasadas: () => void;

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
 * useDocenteStore
 *
 * Hook de Zustand para gestión del panel docente
 *
 * @example
 * ```tsx
 * const { misClases, fetchMisClases, cancelarClase } = useDocenteStore();
 *
 * useEffect(() => {
 *   fetchMisClases();
 * }, []);
 *
 * const handleCancelar = async (claseId: string) => {
 *   const success = await cancelarClase(claseId);
 *   if (success) {
 *     toast.success('Clase cancelada');
 *   }
 * };
 * ```
 */
export const useDocenteStore = create<DocenteStore>((set, get) => ({
  // ==================== INITIAL STATE ====================
  misClases: [],
  claseActual: null,
  isLoading: false,
  isLoadingAction: false,
  error: null,
  mostrarClasesPasadas: false,

  // ==================== ACTIONS ====================

  fetchMisClases: async (incluirPasadas?: boolean) => {
    set({ isLoading: true, error: null });

    // Usar el parámetro o el estado actual
    const incluir = incluirPasadas ?? get().mostrarClasesPasadas;

    try {
      const clases = await getMisClasesDocente(incluir);
      set({ misClases: clases, isLoading: false });
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error, 'Error al cargar clases');
      set({ error: errorMsg, isLoading: false });
      console.error('Error fetchMisClases:', error);
    }
  },

  fetchClaseDetalle: async (claseId: string) => {
    set({ isLoading: true, error: null });
    try {
      const clase = await getClaseById(claseId);
      set({ claseActual: clase, isLoading: false });
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error, 'Error al cargar detalle de clase');
      set({ error: errorMsg, isLoading: false });
      console.error('Error fetchClaseDetalle:', error);
    }
  },

  cancelarClase: async (claseId: string): Promise<boolean> => {
    set({ isLoadingAction: true, error: null });
    try {
      await cancelarClase(claseId);

      // Recargar la lista de clases después de cancelar
      await get().fetchMisClases();

      set({ isLoadingAction: false });
      return true;
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error, 'Error al cancelar clase');
      set({ error: errorMsg, isLoadingAction: false });
      console.error('Error cancelarClase:', error);
      return false;
    }
  },

  toggleMostrarClasesPasadas: () => {
    const nuevoEstado = !get().mostrarClasesPasadas;
    set({ mostrarClasesPasadas: nuevoEstado });

    // Recargar clases con el nuevo filtro
    get().fetchMisClases(nuevoEstado);
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      misClases: [],
      claseActual: null,
      isLoading: false,
      isLoadingAction: false,
      error: null,
      mostrarClasesPasadas: false,
    });
  },
}));
