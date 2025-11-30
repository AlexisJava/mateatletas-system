import { getErrorMessage } from '@/lib/utils/error-handler';
/**
 * Zustand Store para Clases y Reservas
 */

import { create } from 'zustand';
import {
  Clase,
  ClaseConRelaciones,
  InscripcionClase,
  RutaCurricular,
  FiltroClases,
  CrearReservaDto,
} from '@/types/clases.types';
import * as clasesApi from '@/lib/api/clases.api';

interface ClasesStore {
  // Estado
  clases: ClaseConRelaciones[];
  misReservas: InscripcionClase[];
  rutasCurriculares: RutaCurricular[];
  claseSeleccionada: ClaseConRelaciones | null;
  filtros: FiltroClases;
  isLoading: boolean;
  error: string | null;

  // Acciones
  fetchClases: () => Promise<void>;
  fetchMisReservas: () => Promise<void>;
  fetchRutasCurriculares: () => Promise<void>;
  setFiltros: (_filtros: Partial<FiltroClases>) => void;
  resetFiltros: () => void;
  reservarClase: (_claseId: string, _data: CrearReservaDto) => Promise<boolean>;
  cancelarReserva: (_inscripcionId: string) => Promise<boolean>;
  setClaseSeleccionada: (_clase: ClaseConRelaciones | null) => void;
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
        error: getErrorMessage(error, 'Error al cargar rutas curriculares'),
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

      // Actualizar cupos ocupados en la clase
      const clasesActualizadas = clases.map((clase) =>
        clase.id === claseId
          ? {
              ...clase,
              cupos_ocupados: (clase.cupos_ocupados ?? clase._count?.inscripciones ?? 0) + 1,
              _count: clase._count
                ? {
                    ...clase._count,
                    inscripciones: (clase._count.inscripciones ?? 0) + 1,
                  }
                : clase._count,
            }
          : clase,
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
      const reservasActualizadas = misReservas.filter((r) => r.id !== inscripcionId);

      // Actualizar cupos ocupados en la clase
      const clasesActualizadas = clases.map((clase) =>
        clase.id === reservaCancelada?.clase_id
          ? {
              ...clase,
              cupos_ocupados: Math.max(
                (clase.cupos_ocupados ?? clase._count?.inscripciones ?? 0) - 1,
                0,
              ),
              _count: clase._count
                ? {
                    ...clase._count,
                    inscripciones: Math.max((clase._count.inscripciones ?? 0) - 1, 0),
                  }
                : clase._count,
            }
          : clase,
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
  setClaseSeleccionada: (clase: ClaseConRelaciones | null) => {
    set({ claseSeleccionada: clase });
  },

  // Obtener clases filtradas (computado en el cliente)
  getClasesFiltradas: () => {
    const { clases } = get();
    return clases;
  },
}));
