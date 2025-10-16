import { getErrorMessage } from '@/lib/utils/error-handler';
/**
 * Zustand Store para Clases y Reservas
 */

import { create } from 'zustand';
import {
  Clase,
  InscripcionClase,
  RutaCurricular,
  FiltroClases,
  CrearReservaDto,
} from '@/types/clases.types';
import * as clasesApi from '@/lib/api/clases.api';

interface ClasesStore {
  // Estado
  clases: Clase[];
  misReservas: InscripcionClase[];
  rutasCurriculares: RutaCurricular[];
  claseSeleccionada: Clase | null;
  filtros: FiltroClases;
  isLoading: boolean;
  error: string | null;

  // Acciones
  fetchClases: () => Promise<void>;
  fetchMisReservas: () => Promise<void>;
  fetchRutasCurriculares: () => Promise<void>;
  setFiltros: (filtros: Partial<FiltroClases>) => void;
  resetFiltros: () => void;
  reservarClase: (claseId: string, data: CrearReservaDto) => Promise<boolean>;
  cancelarReserva: (inscripcionId: string) => Promise<boolean>;
  setClaseSeleccionada: (clase: Clase | null) => void;
  getClasesFiltradas: () => Clase[];
}

export const useClasesStore = create<ClasesStore>((set, get) => ({
  // Estado inicial
  clases: [],
  misReservas: [],
  rutasCurriculares: [],
  claseSeleccionada: null,
  filtros: {
    soloDisponibles: true,
  },
  isLoading: false,
  error: null,

  // Obtener todas las clases
  fetchClases: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filtros } = get();
      const clases = await clasesApi.getClases(filtros);
      set({ clases, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Error al cargar clases'),
        isLoading: false,
      });
    }
  },

  // Obtener mis reservas
  fetchMisReservas: async () => {
    set({ isLoading: true, error: null });
    try {
      const misReservas = await clasesApi.getMisReservas();
      set({ misReservas, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Error al cargar reservas'),
        isLoading: false,
      });
    }
  },

  // Obtener rutas curriculares
  fetchRutasCurriculares: async () => {
    set({ isLoading: true, error: null });
    try {
      const rutasCurriculares = await clasesApi.getRutasCurriculares();
      set({ rutasCurriculares, isLoading: false });
    } catch (error: unknown) {
      set({
        error:
          getErrorMessage(error, 'Error al cargar rutas curriculares'),
        isLoading: false,
      });
    }
  },

  // Actualizar filtros
  setFiltros: (nuevosFiltros: Partial<FiltroClases>) => {
    const { filtros } = get();
    set({ filtros: { ...filtros, ...nuevosFiltros } });
  },

  // Resetear filtros
  resetFiltros: () => {
    set({
      filtros: {
        soloDisponibles: true,
      },
    });
  },

  // Reservar una clase
  reservarClase: async (claseId: string, data: CrearReservaDto) => {
    set({ isLoading: true, error: null });
    try {
      const nuevaReserva = await clasesApi.reservarClase(claseId, data);

      // Actualizar estado local
      const { clases, misReservas } = get();

      // Decrementar cupo disponible en la clase
      const clasesActualizadas = clases.map((clase) =>
        clase.id === claseId
          ? { ...clase, cupo_disponible: clase.cupo_disponible - 1 }
          : clase
      );

      set({
        clases: clasesActualizadas,
        misReservas: [...misReservas, nuevaReserva],
        isLoading: false,
      });

      return true;
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Error al reservar clase'),
        isLoading: false,
      });
      return false;
    }
  },

  // Cancelar una reserva
  cancelarReserva: async (inscripcionId: string) => {
    set({ isLoading: true, error: null });
    try {
      await clasesApi.cancelarReserva(inscripcionId);

      // Actualizar estado local
      const { misReservas, clases } = get();

      // Obtener la reserva cancelada para conocer la clase
      const reservaCancelada = misReservas.find((r) => r.id === inscripcionId);

      // Remover de mis reservas
      const reservasActualizadas = misReservas.filter(
        (r) => r.id !== inscripcionId
      );

      // Incrementar cupo disponible en la clase
      const clasesActualizadas = clases.map((clase) =>
        clase.id === reservaCancelada?.clase_id
          ? { ...clase, cupo_disponible: clase.cupo_disponible + 1 }
          : clase
      );

      set({
        misReservas: reservasActualizadas,
        clases: clasesActualizadas,
        isLoading: false,
      });

      return true;
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Error al cancelar reserva'),
        isLoading: false,
      });
      return false;
    }
  },

  // Seleccionar una clase
  setClaseSeleccionada: (clase: Clase | null) => {
    set({ claseSeleccionada: clase });
  },

  // Obtener clases filtradas (computado en el cliente)
  getClasesFiltradas: () => {
    const { clases } = get();
    return clases;
  },
}));
