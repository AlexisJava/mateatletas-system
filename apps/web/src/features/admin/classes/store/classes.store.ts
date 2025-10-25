import { create } from 'zustand';
import type { ClaseListado } from '@/types/admin-clases.types';
import * as adminApi from '@/lib/api/admin.api';
import { getErrorMessage } from '@/lib/utils/error-handler';

interface CrearClaseDto {
  nombre: string;
  rutaCurricularId?: string;
  docenteId: string;
  sectorId?: string;
  fechaHoraInicio: string;
  duracionMinutos: number;
  cuposMaximo: number;
  descripcion?: string;
  productoId?: string;
}

interface ClassesStore {
  classes: ClaseListado[];
  isLoading: boolean;
  error: string | null;

  fetchClasses: () => Promise<void>;
  createClass: (data: CrearClaseDto) => Promise<boolean>;
  cancelClass: (claseId: string) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

export const useClassesStore = create<ClassesStore>((set, get) => ({
  classes: [],
  isLoading: false,
  error: null,

  fetchClasses: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await adminApi.getAllClasses();
      set({ classes: data, isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error loading classes'), classes: [], isLoading: false });
    }
  },

  createClass: async (data: CrearClaseDto): Promise<boolean> => {
    try {
      await adminApi.createClass(data);
      await get().fetchClasses();
      return true;
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error creating class') });
      return false;
    }
  },

  cancelClass: async (claseId: string): Promise<boolean> => {
    try {
      await adminApi.cancelClass(claseId);
      await get().fetchClasses();
      return true;
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error canceling class') });
      return false;
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({ classes: [], isLoading: false, error: null }),
}));
