import { create } from 'zustand';
import {
  PlanificacionListItem,
  PlanificacionFilters,
  PlanificacionDetalle,
  PaginationOptions,
  CreatePlanificacionRequest,
  UpdatePlanificacionRequest,
  CreateActividadRequest,
  Actividad,
} from '@/types/planificacion.types';
import * as planificacionesApi from '@/lib/api/planificaciones.api';
import { getErrorMessage } from '@/lib/utils/error-handler';

interface PlanificacionesState {
  planificaciones: PlanificacionListItem[];
  detalle: PlanificacionDetalle | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: PlanificacionFilters;
  isLoadingList: boolean;
  isLoadingDetalle: boolean;
  isSubmitting: boolean;
  error: string | null;
  success: string | null;

  fetchPlanificaciones: (
    filters?: PlanificacionFilters,
    pagination?: PaginationOptions,
  ) => Promise<void>;
  fetchPlanificacionById: (id: string) => Promise<PlanificacionDetalle | null>;
  createPlanificacion: (data: CreatePlanificacionRequest) => Promise<boolean>;
  updatePlanificacion: (id: string, data: UpdatePlanificacionRequest) => Promise<boolean>;
  deletePlanificacion: (id: string) => Promise<boolean>;
  addActividad: (
    planificacionId: string,
    data: CreateActividadRequest,
  ) => Promise<Actividad | null>;
  updateActividad: (
    planificacionId: string,
    actividadId: string,
    data: Partial<CreateActividadRequest>,
  ) => Promise<Actividad | null>;
  deleteActividad: (planificacionId: string, actividadId: string) => Promise<boolean>;
  setFilters: (filters: PlanificacionFilters) => void;
  setPage: (page: number) => void;
  clearMessages: () => void;
  resetDetalle: () => void;
}

export const usePlanificacionesStore = create<PlanificacionesState>((set, get) => ({
  planificaciones: [],
  detalle: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  filters: {},
  isLoadingList: false,
  isLoadingDetalle: false,
  isSubmitting: false,
  error: null,
  success: null,

  fetchPlanificaciones: async (overrideFilters, overridePagination) => {
    const { filters, page, limit } = get();
    const nextFilters = overrideFilters ?? filters;
    const nextPage = overridePagination?.page ?? page ?? 1;
    const nextLimit = overridePagination?.limit ?? limit ?? 10;

    set({
      filters: nextFilters,
      page: nextPage,
      limit: nextLimit,
      isLoadingList: true,
      error: null,
      success: null,
    });

    try {
      const response = await planificacionesApi.getPlanificaciones(nextFilters, {
        page: nextPage,
        limit: nextLimit,
      });

      set({
        planificaciones: response.data,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.total_pages,
        isLoadingList: false,
      });
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Error al cargar planificaciones'),
        planificaciones: [],
        total: 0,
        totalPages: 0,
        isLoadingList: false,
      });
    }
  },

  fetchPlanificacionById: async (id: string) => {
    set({ isLoadingDetalle: true, error: null, success: null });

    try {
      const detalle = await planificacionesApi.getPlanificacionById(id);
      set({ detalle, isLoadingDetalle: false });
      return detalle;
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Error al cargar la planificación'),
        detalle: null,
        isLoadingDetalle: false,
      });
      return null;
    }
  },

  createPlanificacion: async (data: CreatePlanificacionRequest) => {
    set({ isSubmitting: true, error: null, success: null });
    try {
      await planificacionesApi.createPlanificacion(data);
      set({ success: 'Planificación creada correctamente.', isSubmitting: false });
      await get().fetchPlanificaciones({ ...get().filters }, { page: 1, limit: get().limit });
      return true;
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Error al crear la planificación'),
        isSubmitting: false,
      });
      return false;
    }
  },

  updatePlanificacion: async (id: string, data: UpdatePlanificacionRequest) => {
    set({ isSubmitting: true, error: null, success: null });

    try {
      const updated = await planificacionesApi.updatePlanificacion(id, data);
      set((state) => ({
        detalle: state.detalle?.id === id ? updated : state.detalle,
        success: 'Planificación actualizada correctamente.',
        isSubmitting: false,
      }));
      await get().fetchPlanificaciones();
      return true;
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Error al actualizar la planificación'),
        isSubmitting: false,
      });
      return false;
    }
  },

  deletePlanificacion: async (id: string) => {
    set({ isSubmitting: true, error: null, success: null });

    try {
      await planificacionesApi.deletePlanificacion(id);
      set((state) => ({
        detalle: state.detalle?.id === id ? null : state.detalle,
        success: 'Planificación eliminada correctamente.',
        isSubmitting: false,
      }));
      await get().fetchPlanificaciones();
      return true;
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Error al eliminar la planificación'),
        isSubmitting: false,
      });
      return false;
    }
  },

  addActividad: async (planificacionId: string, data: CreateActividadRequest) => {
    set({ isSubmitting: true, error: null, success: null });

    try {
      const actividad = await planificacionesApi.addActividadToPlanificacion(planificacionId, data);
      set((state) => ({
        detalle:
          state.detalle && state.detalle.id === planificacionId
            ? { ...state.detalle, actividades: [...state.detalle.actividades, actividad] }
            : state.detalle,
        success: 'Actividad agregada correctamente.',
        isSubmitting: false,
      }));
      return actividad;
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Error al agregar la actividad'),
        isSubmitting: false,
      });
      return null;
    }
  },

  updateActividad: async (
    planificacionId: string,
    actividadId: string,
    data: Partial<CreateActividadRequest>,
  ) => {
    set({ isSubmitting: true, error: null, success: null });

    try {
      const actividadActualizada = await planificacionesApi.updateActividad(
        planificacionId,
        actividadId,
        data,
      );

      set((state) => ({
        detalle:
          state.detalle && state.detalle.id === planificacionId
            ? {
                ...state.detalle,
                actividades: state.detalle.actividades.map((actividad) =>
                  actividad.id === actividadId ? actividadActualizada : actividad,
                ),
              }
            : state.detalle,
        success: 'Actividad actualizada correctamente.',
        isSubmitting: false,
      }));

      return actividadActualizada;
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Error al actualizar la actividad'),
        isSubmitting: false,
      });
      return null;
    }
  },

  deleteActividad: async (planificacionId: string, actividadId: string) => {
    set({ isSubmitting: true, error: null, success: null });

    try {
      await planificacionesApi.deleteActividad(planificacionId, actividadId);
      set((state) => ({
        detalle:
          state.detalle && state.detalle.id === planificacionId
            ? {
                ...state.detalle,
                actividades: state.detalle.actividades.filter((actividad) => actividad.id !== actividadId),
              }
            : state.detalle,
        success: 'Actividad eliminada correctamente.',
        isSubmitting: false,
      }));
      return true;
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Error al eliminar la actividad'),
        isSubmitting: false,
      });
      return false;
    }
  },

  setFilters: (filters: PlanificacionFilters) => {
    set({ filters, page: 1 });
    void get().fetchPlanificaciones(filters, { page: 1, limit: get().limit });
  },

  setPage: (page: number) => {
    const { limit, filters } = get();
    set({ page });
    void get().fetchPlanificaciones(filters, { page, limit });
  },

  clearMessages: () => set({ error: null, success: null }),
  resetDetalle: () => set({ detalle: null }),
}));
