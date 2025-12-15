import { getErrorMessage } from '@/lib/utils/error-handler';
import { create } from 'zustand';
import { casasApi } from '@/lib/api/casas.api';
import type {
  Casa,
  CreateCasaDto,
  UpdateCasaDto,
  QueryCasasDto,
  CasasEstadisticas,
} from '@/types/casa.types';

/**
 * Estado del store de Casas
 */
interface CasasState {
  // Datos
  casas: Casa[];
  casaActual: Casa | null;
  estadisticas: CasasEstadisticas | null;

  // Metadata de paginación
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  // Estados de carga y error
  isLoading: boolean;
  error: string | null;

  // Acciones
  fetchCasas: (_params?: QueryCasasDto) => Promise<void>;
  fetchCasaById: (_id: string) => Promise<void>;
  createCasa: (_data: CreateCasaDto) => Promise<Casa>;
  updateCasa: (_id: string, _data: UpdateCasaDto) => Promise<Casa>;
  deleteCasa: (_id: string) => Promise<void>;
  fetchEstadisticas: () => Promise<void>;
  recalcularPuntos: (_id: string) => Promise<Casa>;
  clearError: () => void;
  clearCasaActual: () => void;
}

/**
 * Store global de Casas usando Zustand
 *
 * Maneja:
 * - Lista de casas con paginación
 * - Casa actual (para detalles)
 * - Estadísticas y rankings
 * - Estados de carga y errores
 * - Operaciones CRUD
 */
export const useCasasStore = create<CasasState>((set) => ({
  // Estado inicial
  casas: [],
  casaActual: null,
  estadisticas: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  isLoading: false,
  error: null,

  /**
   * Obtener lista de casas con filtros y paginación
   */
  fetchCasas: async (params?: QueryCasasDto) => {
    set({ isLoading: true, error: null });

    try {
      const response = await casasApi.getAll(params);

      set({
        casas: Array.isArray(response.data) ? response.data : [],
        total: response.metadata?.total || 0,
        page: response.metadata?.page || 1,
        limit: response.metadata?.limit || 10,
        totalPages: response.metadata?.totalPages || 0,
        isLoading: false,
      });
    } catch (error: unknown) {
      console.error('Error al cargar casas:', error);
      set({
        casas: [],
        total: 0,
        error: getErrorMessage(error, 'Error al cargar casas'),
        isLoading: false,
      });
    }
  },

  /**
   * Obtener una casa específica por ID
   */
  fetchCasaById: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const casa = await casasApi.getById(id);

      set({
        casaActual: casa,
        isLoading: false,
      });
    } catch (error: unknown) {
      console.error(`Error al cargar casa ${id}:`, error);
      set({
        casaActual: null,
        error: getErrorMessage(error, 'Error al cargar casa'),
        isLoading: false,
      });
    }
  },

  /**
   * Crear una nueva casa
   */
  createCasa: async (data: CreateCasaDto) => {
    set({ isLoading: true, error: null });

    try {
      const nuevaCasa = await casasApi.create(data);

      // Agregar a la lista local
      set((state) => ({
        casas: [nuevaCasa, ...state.casas],
        total: state.total + 1,
        isLoading: false,
      }));

      return nuevaCasa;
    } catch (error: unknown) {
      console.error('Error al crear casa:', error);
      const errorMessage = getErrorMessage(error, 'Error al crear casa');
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualizar una casa existente
   */
  updateCasa: async (id: string, data: UpdateCasaDto) => {
    set({ isLoading: true, error: null });

    try {
      const casaActualizada = await casasApi.update(id, data);

      // Actualizar en la lista local
      set((state) => ({
        casas: state.casas.map((casa) => (casa.id === id ? casaActualizada : casa)),
        casaActual: state.casaActual?.id === id ? casaActualizada : state.casaActual,
        isLoading: false,
      }));

      return casaActualizada;
    } catch (error: unknown) {
      console.error(`Error al actualizar casa ${id}:`, error);
      const errorMessage = getErrorMessage(error, 'Error al actualizar casa');
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  /**
   * Eliminar una casa
   */
  deleteCasa: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      await casasApi.delete(id);

      // Eliminar de la lista local
      set((state) => ({
        casas: state.casas.filter((casa) => casa.id !== id),
        total: state.total - 1,
        casaActual: state.casaActual?.id === id ? null : state.casaActual,
        isLoading: false,
      }));
    } catch (error: unknown) {
      console.error(`Error al eliminar casa ${id}:`, error);
      const errorMessage = getErrorMessage(error, 'Error al eliminar casa');
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtener estadísticas generales de casas
   */
  fetchEstadisticas: async () => {
    set({ isLoading: true, error: null });

    try {
      const estadisticas = await casasApi.getEstadisticas();

      set({
        estadisticas,
        isLoading: false,
      });
    } catch (error: unknown) {
      console.error('Error al cargar estadísticas:', error);
      set({
        estadisticas: null,
        error: getErrorMessage(error, 'Error al cargar estadísticas'),
        isLoading: false,
      });
    }
  },

  /**
   * Recalcular puntos totales de una casa
   */
  recalcularPuntos: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const casaActualizada = await casasApi.recalcularPuntos(id);

      // Actualizar en la lista local
      set((state) => ({
        casas: state.casas.map((casa) => (casa.id === id ? casaActualizada : casa)),
        casaActual: state.casaActual?.id === id ? casaActualizada : state.casaActual,
        isLoading: false,
      }));

      return casaActualizada;
    } catch (error: unknown) {
      console.error(`Error al recalcular puntos de la casa ${id}:`, error);
      const errorMessage = getErrorMessage(error, 'Error al recalcular puntos');
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  /**
   * Limpiar mensaje de error
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Limpiar casa actual
   */
  clearCasaActual: () => {
    set({ casaActual: null });
  },
}));
