/**
 * Zustand Store para Sectores y Rutas de Especialidad
 */

import { create } from 'zustand';
import type {
  Sector,
  RutaEspecialidad,
  DocenteRuta,
  CreateSectorDto,
  UpdateSectorDto,
  CreateRutaEspecialidadDto,
  UpdateRutaEspecialidadDto,
  AsignarRutasDocenteDto,
} from '@/types/sectores.types';
import * as sectoresApi from '@/lib/api/sectores.api';
import { handleStoreError } from '@/lib/utils/error-handler';

interface SectoresState {
  // State
  sectores: Sector[];
  rutas: RutaEspecialidad[];
  isLoading: boolean;
  error: string | null;

  // Actions - Sectores
  fetchSectores: () => Promise<void>;
  crearSector: (data: CreateSectorDto) => Promise<Sector | null>;
  actualizarSector: (id: string, data: UpdateSectorDto) => Promise<Sector | null>;
  eliminarSector: (id: string) => Promise<boolean>;

  // Actions - Rutas
  fetchRutas: (sectorId?: string) => Promise<void>;
  crearRuta: (data: CreateRutaEspecialidadDto) => Promise<RutaEspecialidad | null>;
  actualizarRuta: (id: string, data: UpdateRutaEspecialidadDto) => Promise<RutaEspecialidad | null>;
  eliminarRuta: (id: string) => Promise<boolean>;

  // Actions - Docentes
  asignarRutasDocente: (docenteId: string, data: AsignarRutasDocenteDto) => Promise<boolean>;
  obtenerRutasDocente: (docenteId: string) => Promise<DocenteRuta[]>;

  // Helpers
  getRutasBySector: (sectorId: string) => RutaEspecialidad[];
  clearError: () => void;
}

export const useSectoresStore = create<SectoresState>((set, get) => ({
  // Initial state
  sectores: [],
  rutas: [],
  isLoading: false,
  error: null,

  // ============================================================================
  // SECTORES
  // ============================================================================

  fetchSectores: async () => {
    set({ isLoading: true, error: null });
    try {
      const sectores = await sectoresApi.listarSectores();
      set({ sectores, isLoading: false });
    } catch (error: unknown) {
      set({
        error: handleStoreError('SectoresStore.fetchSectores', error, 'Error fetching sectores'),
        isLoading: false,
      });
    }
  },

  crearSector: async (data: CreateSectorDto) => {
    set({ isLoading: true, error: null });
    try {
      const sector = await sectoresApi.crearSector(data);
      set((state) => ({
        sectores: [...state.sectores, sector],
        isLoading: false,
      }));
      return sector;
    } catch (error: unknown) {
      set({
        error: handleStoreError('SectoresStore.crearSector', error, 'Error creating sector'),
        isLoading: false,
      });
      return null;
    }
  },

  actualizarSector: async (id: string, data: UpdateSectorDto) => {
    set({ isLoading: true, error: null });
    try {
      const sector = await sectoresApi.actualizarSector(id, data);
      set((state) => ({
        sectores: state.sectores.map((s) => (s.id === id ? sector : s)),
        isLoading: false,
      }));
      return sector;
    } catch (error: unknown) {
      set({
        error: handleStoreError('SectoresStore.actualizarSector', error, 'Error updating sector'),
        isLoading: false,
      });
      return null;
    }
  },

  eliminarSector: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await sectoresApi.eliminarSector(id);
      set((state) => ({
        sectores: state.sectores.filter((s) => s.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (error: unknown) {
      set({
        error: handleStoreError('SectoresStore.eliminarSector', error, 'Error deleting sector'),
        isLoading: false,
      });
      return false;
    }
  },

  // ============================================================================
  // RUTAS DE ESPECIALIDAD
  // ============================================================================

  fetchRutas: async (sectorId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const rutas = await sectoresApi.listarRutasEspecialidad(sectorId);
      set({ rutas, isLoading: false });
    } catch (error: unknown) {
      set({
        error: handleStoreError('SectoresStore.fetchRutas', error, 'Error fetching rutas'),
        isLoading: false,
      });
    }
  },

  crearRuta: async (data: CreateRutaEspecialidadDto) => {
    set({ isLoading: true, error: null });
    try {
      const ruta = await sectoresApi.crearRutaEspecialidad(data);
      set((state) => ({
        rutas: [...state.rutas, ruta],
        isLoading: false,
      }));

      // Refrescar sectores para actualizar el contador
      await get().fetchSectores();

      return ruta;
    } catch (error: unknown) {
      set({
        error: handleStoreError('SectoresStore.crearRuta', error, 'Error creating ruta'),
        isLoading: false,
      });
      return null;
    }
  },

  actualizarRuta: async (id: string, data: UpdateRutaEspecialidadDto) => {
    set({ isLoading: true, error: null });
    try {
      const ruta = await sectoresApi.actualizarRutaEspecialidad(id, data);
      set((state) => ({
        rutas: state.rutas.map((r) => (r.id === id ? ruta : r)),
        isLoading: false,
      }));
      return ruta;
    } catch (error: unknown) {
      set({
        error: handleStoreError('SectoresStore.actualizarRuta', error, 'Error updating ruta'),
        isLoading: false,
      });
      return null;
    }
  },

  eliminarRuta: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await sectoresApi.eliminarRutaEspecialidad(id);
      set((state) => ({
        rutas: state.rutas.filter((r) => r.id !== id),
        isLoading: false,
      }));

      // Refrescar sectores para actualizar el contador
      await get().fetchSectores();

      return true;
    } catch (error: unknown) {
      set({
        error: handleStoreError('SectoresStore.eliminarRuta', error, 'Error deleting ruta'),
        isLoading: false,
      });
      return false;
    }
  },

  // ============================================================================
  // ASIGNACIÓN DE RUTAS A DOCENTES
  // ============================================================================

  asignarRutasDocente: async (docenteId: string, data: AsignarRutasDocenteDto) => {
    set({ isLoading: true, error: null });
    try {
      await sectoresApi.asignarRutasDocente(docenteId, data);
      set({ isLoading: false });
      return true;
    } catch (error: unknown) {
      set({
        error: handleStoreError(
          'SectoresStore.asignarRutasDocente',
          error,
          'Error assigning rutas',
        ),
        isLoading: false,
      });
      return false;
    }
  },

  obtenerRutasDocente: async (docenteId: string) => {
    set({ isLoading: true, error: null });
    try {
      const rutas = await sectoresApi.obtenerRutasDocente(docenteId);
      set({ isLoading: false });
      return rutas;
    } catch (error: unknown) {
      set({
        error: handleStoreError(
          'SectoresStore.obtenerRutasDocente',
          error,
          'Error fetching docente rutas',
        ),
        isLoading: false,
      });
      return [];
    }
  },

  // ============================================================================
  // HELPERS
  // ============================================================================

  getRutasBySector: (sectorId: string) => {
    return get().rutas.filter((r) => r.sectorId === sectorId);
  },

  clearError: () => set({ error: null }),
}));
