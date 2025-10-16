import { create } from 'zustand';
import { estudiantesApi } from '@/lib/api/estudiantes.api';
import type {
  Estudiante,
  CreateEstudianteData,
  UpdateEstudianteData,
  QueryEstudiantesParams,
  Equipo,
} from '@/types/estudiante';

/**
 * Estado del store de estudiantes
 */
interface EstudiantesState {
  // Datos
  estudiantes: Estudiante[];
  estudianteActual: Estudiante | null;
  equipos: Equipo[];

  // UI State
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;

  // Metadata
  total: number;
  page: number;
  limit: number;

  // Acciones
  fetchEstudiantes: (params?: QueryEstudiantesParams) => Promise<void>;
  fetchEstudianteById: (id: string) => Promise<void>;
  createEstudiante: (data: CreateEstudianteData) => Promise<Estudiante>;
  updateEstudiante: (id: string, data: UpdateEstudianteData) => Promise<void>;
  deleteEstudiante: (id: string) => Promise<void>;
  fetchEquipos: () => Promise<void>;
  clearError: () => void;
  setEstudianteActual: (estudiante: Estudiante | null) => void;
}

/**
 * Store de Zustand para gestionar el estado de estudiantes
 * Centraliza todas las operaciones CRUD y el estado de la UI
 */
export const useEstudiantesStore = create<EstudiantesState>((set) => ({
  // Estado inicial
  estudiantes: [],
  estudianteActual: null,
  equipos: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,

  /**
   * Obtiene todos los estudiantes del tutor con filtros opcionales
   */
  fetchEstudiantes: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await estudiantesApi.getAll(params);
      set({
        estudiantes: Array.isArray(response.data) ? response.data : [],
        total: response.metadata?.total || 0,
        page: response.metadata?.page || 1,
        limit: response.metadata?.limit || 10,
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Error al cargar estudiantes',
        estudiantes: [], // Reset to empty array on error
        total: 0,
        isLoading: false,
      });
    }
  },

  /**
   * Obtiene un estudiante específico por ID
   */
  fetchEstudianteById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const estudiante = await estudiantesApi.getById(id);
      set({
        estudianteActual: estudiante,
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Error al cargar estudiante',
        isLoading: false,
      });
    }
  },

  /**
   * Crea un nuevo estudiante
   */
  createEstudiante: async (data) => {
    set({ isCreating: true, error: null });
    try {
      const nuevoEstudiante = await estudiantesApi.create(data);

      // Agregar a la lista local
      set((state) => ({
        estudiantes: [nuevoEstudiante, ...state.estudiantes],
        total: state.total + 1,
        isCreating: false,
      }));

      return nuevoEstudiante;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Error al crear estudiante',
        isCreating: false,
      });
      throw error;
    }
  },

  /**
   * Actualiza un estudiante existente
   */
  updateEstudiante: async (id, data) => {
    set({ isUpdating: true, error: null });
    try {
      const estudianteActualizado = await estudiantesApi.update(id, data);

      // Actualizar en la lista local
      set((state) => ({
        estudiantes: state.estudiantes.map((e) =>
          e.id === id ? estudianteActualizado : e,
        ),
        estudianteActual:
          state.estudianteActual?.id === id
            ? estudianteActualizado
            : state.estudianteActual,
        isUpdating: false,
      }));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error:
          err.response?.data?.message || 'Error al actualizar estudiante',
        isUpdating: false,
      });
      throw error;
    }
  },

  /**
   * Elimina un estudiante
   */
  deleteEstudiante: async (id) => {
    set({ isDeleting: true, error: null });
    try {
      await estudiantesApi.delete(id);

      // Remover de la lista local
      set((state) => ({
        estudiantes: state.estudiantes.filter((e) => e.id !== id),
        total: state.total - 1,
        estudianteActual:
          state.estudianteActual?.id === id ? null : state.estudianteActual,
        isDeleting: false,
      }));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Error al eliminar estudiante',
        isDeleting: false,
      });
      throw error;
    }
  },

  /**
   * Obtiene todos los equipos disponibles
   */
  fetchEquipos: async () => {
    try {
      const equipos = await estudiantesApi.getEquipos();
      set({ equipos });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        error: err.response?.data?.message || 'Error al cargar equipos',
      });
    }
  },

  /**
   * Limpia el error actual
   */
  clearError: () => set({ error: null }),

  /**
   * Establece el estudiante actual
   */
  setEstudianteActual: (estudiante) => set({ estudianteActual: estudiante }),
}));
