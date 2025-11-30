import { getErrorMessage } from '@/lib/utils/error-handler';
import { create } from 'zustand';
import * as cursosApi from '@/lib/api/cursos.api';
import type { Modulo, Leccion, ProgresoCurso } from '@/lib/api/cursos.api';
import type { Producto } from '@/types/catalogo.types';
import { apiClient } from '@/lib/axios';

interface Logro {
  id: string;
  nombre: string;
  descripcion: string;
}

interface CursosStore {
  // Data
  misCursos: Producto[]; // Cursos en los que está inscrito el estudiante
  cursoActual: Producto | null;
  modulos: Modulo[];
  lecciones: Leccion[];
  leccionActual: Leccion | null;
  progreso: ProgresoCurso | null;

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions - Estudiante
  fetchMisCursos: () => Promise<void>;
  fetchProgresoCurso: (_productoId: string) => Promise<void>;
  fetchSiguienteLeccion: (_productoId: string) => Promise<void>;
  completarLeccion: (
    _leccionId: string,
    _data?: cursosApi.CompletarLeccionDto,
  ) => Promise<{ success: boolean; puntos?: number; logro?: Logro }>;

  // Actions - General
  fetchModulosByCurso: (_productoId: string) => Promise<void>;
  fetchLeccion: (_leccionId: string) => Promise<void>;
  setCursoActual: (_curso: Producto) => Promise<void>;

  // Utilities
  clearError: () => void;
  reset: () => void;
}

export const useCursosStore = create<CursosStore>((set, get) => ({
  // Initial state
  misCursos: [],
  cursoActual: null,
  modulos: [],
  lecciones: [],
  leccionActual: null,
  progreso: null,
  isLoading: false,
  error: null,

  // ============================================================================
  // ESTUDIANTE - Mis Cursos
  // ============================================================================

  fetchMisCursos: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implementar endpoint /estudiantes/mis-cursos que retorne
      // los cursos en los que el estudiante está inscrito
      // Por ahora, obtenemos todos los cursos tipo 'Curso' del catálogo
      const data = await apiClient.get<Producto[]>('/productos', {
        params: {
          tipo: 'Curso',
          soloActivos: 'true',
        },
      });
      set({ misCursos: data, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Error al cargar cursos'),
        isLoading: false,
      });
    }
  },

  fetchProgresoCurso: async (productoId: string) => {
    set({ isLoading: true, error: null });
    try {
      const progreso = await cursosApi.getProgresoCurso(productoId);
      set({ progreso, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Error al cargar progreso'),
        isLoading: false,
        progreso: null,
      });
    }
  },

  fetchSiguienteLeccion: async (productoId: string) => {
    try {
      const leccion = await cursosApi.getSiguienteLeccion(productoId);
      set({ leccionActual: leccion });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error al obtener siguiente lección') });
    }
  },

  completarLeccion: async (
    leccionId: string,
    data: cursosApi.CompletarLeccionDto = {},
  ): Promise<{ success: boolean; puntos?: number; logro?: Logro }> => {
    try {
      const result = await cursosApi.completarLeccion(leccionId, data);

      // Refrescar progreso si hay curso actual
      const { cursoActual } = get();
      if (cursoActual) {
        await get().fetchProgresoCurso(cursoActual.id);
      }

      const logroDesbloqueado = result.logro_desbloqueado ?? undefined;

      return {
        success: true,
        puntos: result.puntos_ganados,
        logro: logroDesbloqueado,
      };
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error al completar lección') });
      return { success: false };
    }
  },

  // ============================================================================
  // GENERAL - Navegación de Contenido
  // ============================================================================

  fetchModulosByCurso: async (productoId: string) => {
    set({ isLoading: true, error: null });
    try {
      const modulos = await cursosApi.getModulosByProducto(productoId);
      set({ modulos, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Error al cargar módulos'),
        isLoading: false,
        modulos: [],
      });
    }
  },

  fetchLeccion: async (leccionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const leccion = await cursosApi.getLeccion(leccionId);
      set({ leccionActual: leccion, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Error al cargar lección'),
        isLoading: false,
        leccionActual: null,
      });
    }
  },

  setCursoActual: async (curso: Producto) => {
    set({ cursoActual: curso });
    // Cargar módulos y progreso automáticamente
    if (curso) {
      await get().fetchModulosByCurso(curso.id);
      await get().fetchProgresoCurso(curso.id);
    }
  },

  // ============================================================================
  // UTILITIES
  // ============================================================================

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      misCursos: [],
      cursoActual: null,
      modulos: [],
      lecciones: [],
      leccionActual: null,
      progreso: null,
      isLoading: false,
      error: null,
    }),
}));
