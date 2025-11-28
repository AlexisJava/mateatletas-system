import { getErrorMessage } from '@/lib/utils/error-handler';
/**
 * Zustand Store para Pagos y Membresías
 */

import { create } from 'zustand';
import { Membresia, InscripcionCurso, PreferenciaPago } from '@/types/pago.types';
import * as pagosApi from '@/lib/api/pagos.api';

interface PagosStore {
  // State
  membresiaActual: Membresia | null;
  inscripciones: InscripcionCurso[];
  isLoading: boolean;
  error: string | null;
  preferenciaPago: PreferenciaPago | null;

  // Actions
  fetchMembresiaActual: () => Promise<void>;
  fetchInscripciones: () => Promise<void>;
  crearPreferenciaSuscripcion: (productoId: string) => Promise<string | null>;
  crearPreferenciaCurso: (productoId: string, estudianteId: string) => Promise<string | null>;
  activarMembresiaManual: (membresiaId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const usePagosStore = create<PagosStore>((set) => ({
  // Initial state
  membresiaActual: null,
  inscripciones: [],
  isLoading: false,
  error: null,
  preferenciaPago: null,

  // Fetch membresía actual
  fetchMembresiaActual: async () => {
    set({ isLoading: true, error: null });
    try {
      const membresia = await pagosApi.getMembresiaActual();
      set({ membresiaActual: membresia, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Error al cargar membresía'),
        isLoading: false,
      });
    }
  },

  // Fetch inscripciones a cursos
  fetchInscripciones: async () => {
    set({ isLoading: true, error: null });
    try {
      const inscripciones = await pagosApi.getInscripciones();
      set({ inscripciones, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Error al cargar inscripciones'),
        isLoading: false,
      });
    }
  },

  // Crear preferencia de suscripción y retornar URL
  crearPreferenciaSuscripcion: async (productoId: string) => {
    set({ isLoading: true, error: null });
    try {
      const preferencia = await pagosApi.crearPreferenciaSuscripcion(productoId);
      set({ preferenciaPago: preferencia, isLoading: false });
      return preferencia.init_point;
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Error al crear preferencia de pago'),
        isLoading: false,
      });
      return null;
    }
  },

  // Crear preferencia de curso y retornar URL
  crearPreferenciaCurso: async (productoId: string, estudianteId: string) => {
    set({ isLoading: true, error: null });
    try {
      const preferencia = await pagosApi.crearPreferenciaCurso(productoId, estudianteId);
      set({ preferenciaPago: preferencia, isLoading: false });
      return preferencia.init_point;
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Error al crear preferencia de pago'),
        isLoading: false,
      });
      return null;
    }
  },

  // Activar membresía manualmente (MOCK)
  activarMembresiaManual: async (membresiaId: string) => {
    set({ isLoading: true, error: null });
    try {
      const membresia = await pagosApi.activarMembresiaManual(membresiaId);
      set({ membresiaActual: membresia, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Error al activar membresía'),
        isLoading: false,
      });
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset store
  reset: () => {
    set({
      membresiaActual: null,
      inscripciones: [],
      isLoading: false,
      error: null,
      preferenciaPago: null,
    });
  },
}));
