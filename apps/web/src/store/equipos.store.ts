import { getErrorMessage } from '@/lib/utils/error-handler';
import { create } from 'zustand';
import { equiposApi } from '@/lib/api/equipos.api';
import type {
  Equipo,
  CreateEquipoDto,
  UpdateEquipoDto,
  QueryEquiposDto,
  EquiposEstadisticas,
} from '@/types/equipo.types';

/**
 * Estado del store de Equipos
 */
interface EquiposState {
  // Datos
  equipos: Equipo[];
  equipoActual: Equipo | null;
  estadisticas: EquiposEstadisticas | null;

  // Metadata de paginación
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  // Estados de carga y error
  isLoading: boolean;
  error: string | null;

  // Acciones
  fetchEquipos: (_params?: QueryEquiposDto) => Promise<void>;
  fetchEquipoById: (_id: string) => Promise<void>;
  createEquipo: (_data: CreateEquipoDto) => Promise<Equipo>;
  updateEquipo: (_id: string, _data: UpdateEquipoDto) => Promise<Equipo>;
  deleteEquipo: (_id: string) => Promise<void>;
  fetchEstadisticas: () => Promise<void>;
  recalcularPuntos: (_id: string) => Promise<Equipo>;
  clearError: () => void;
  clearEquipoActual: () => void;
}

/**
 * Store global de Equipos usando Zustand
 *
 * Maneja:
 * - Lista de equipos con paginación
 * - Equipo actual (para detalles)
 * - Estadísticas y rankings
 * - Estados de carga y errores
 * - Operaciones CRUD
 */
export const useEquiposStore = create<EquiposState>((set) => ({
  // Estado inicial
  equipos: [],
  equipoActual: null,
  estadisticas: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  isLoading: false,
  error: null,

  /**
   * Obtener lista de equipos con filtros y paginación
   */
  fetchEquipos: async (params?: QueryEquiposDto) => {
    set({ isLoading: true, error: null });

    try {
      const response = await equiposApi.getAll(params);

      set({
        equipos: Array.isArray(response.data) ? response.data : [],
        total: response.metadata?.total || 0,
        page: response.metadata?.page || 1,
        limit: response.metadata?.limit || 10,
        totalPages: response.metadata?.totalPages || 0,
        isLoading: false,
      });
    } catch (error: unknown) {
      console.error('Error al cargar equipos:', error);
      set({
        equipos: [],
        total: 0,
        error: getErrorMessage(error, 'Error al cargar equipos'),
        isLoading: false,
      });
    }
  },

  /**
   * Obtener un equipo específico por ID
   */
  fetchEquipoById: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const equipo = await equiposApi.getById(id);

      set({
        equipoActual: equipo,
        isLoading: false,
      });
    } catch (error: unknown) {
      console.error(`Error al cargar equipo ${id}:`, error);
      set({
        equipoActual: null,
        error: getErrorMessage(error, 'Error al cargar equipo'),
        isLoading: false,
      });
    }
  },

  /**
   * Crear un nuevo equipo
   */
  createEquipo: async (data: CreateEquipoDto) => {
    set({ isLoading: true, error: null });

    try {
      const nuevoEquipo = await equiposApi.create(data);

      // Agregar a la lista local
      set((state) => ({
        equipos: [nuevoEquipo, ...state.equipos],
        total: state.total + 1,
        isLoading: false,
      }));

      return nuevoEquipo;
    } catch (error: unknown) {
      console.error('Error al crear equipo:', error);
      const errorMessage = getErrorMessage(error, 'Error al crear equipo');
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualizar un equipo existente
   */
  updateEquipo: async (id: string, data: UpdateEquipoDto) => {
    set({ isLoading: true, error: null });

    try {
      const equipoActualizado = await equiposApi.update(id, data);

      // Actualizar en la lista local
      set((state) => ({
        equipos: state.equipos.map((equipo) => (equipo.id === id ? equipoActualizado : equipo)),
        equipoActual: state.equipoActual?.id === id ? equipoActualizado : state.equipoActual,
        isLoading: false,
      }));

      return equipoActualizado;
    } catch (error: unknown) {
      console.error(`Error al actualizar equipo ${id}:`, error);
      const errorMessage = getErrorMessage(error, 'Error al actualizar equipo');
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  /**
   * Eliminar un equipo
   */
  deleteEquipo: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      await equiposApi.delete(id);

      // Eliminar de la lista local
      set((state) => ({
        equipos: state.equipos.filter((equipo) => equipo.id !== id),
        total: state.total - 1,
        equipoActual: state.equipoActual?.id === id ? null : state.equipoActual,
        isLoading: false,
      }));
    } catch (error: unknown) {
      console.error(`Error al eliminar equipo ${id}:`, error);
      const errorMessage = getErrorMessage(error, 'Error al eliminar equipo');
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtener estadísticas generales de equipos
   */
  fetchEstadisticas: async () => {
    set({ isLoading: true, error: null });

    try {
      const estadisticas = await equiposApi.getEstadisticas();

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
   * Recalcular puntos totales de un equipo
   */
  recalcularPuntos: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const equipoActualizado = await equiposApi.recalcularPuntos(id);

      // Actualizar en la lista local
      set((state) => ({
        equipos: state.equipos.map((equipo) => (equipo.id === id ? equipoActualizado : equipo)),
        equipoActual: state.equipoActual?.id === id ? equipoActualizado : state.equipoActual,
        isLoading: false,
      }));

      return equipoActualizado;
    } catch (error: unknown) {
      console.error(`Error al recalcular puntos del equipo ${id}:`, error);
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
   * Limpiar equipo actual
   */
  clearEquipoActual: () => {
    set({ equipoActual: null });
  },
}));
