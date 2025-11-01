/**
 * Notificaciones Store - Zustand
 * Manejo de estado global de notificaciones
 */

import { create } from 'zustand';
import {
  type Notificacion,
  getNotificaciones,
  getNotificacionesCount,
  marcarNotificacionComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion,
} from '@/lib/api/notificaciones.api';
import { getErrorMessage } from '@/lib/utils/error-handler';

// ============================================================================
// TYPES
// ============================================================================

interface NotificacionesState {
  // State
  notificaciones: Notificacion[];
  countNoLeidas: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNotificaciones: (soloNoLeidas?: boolean) => Promise<void>;
  fetchCount: () => Promise<void>;
  marcarComoLeida: (id: string) => Promise<void>;
  marcarTodasLeidas: () => Promise<void>;
  eliminar: (id: string) => Promise<void>;
  resetError: () => void;
}

// ============================================================================
// STORE
// ============================================================================

export const useNotificacionesStore = create<NotificacionesState>((set) => ({
  // Initial state
  notificaciones: [],
  countNoLeidas: 0,
  isLoading: false,
  error: null,

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Obtener notificaciones del usuario actual
   */
  fetchNotificaciones: async (soloNoLeidas = false) => {
    set({ isLoading: true, error: null });
    try {
      const notificaciones = await getNotificaciones(soloNoLeidas);
      const countNoLeidas = notificaciones.filter(n => !n.leida).length;

      set({
        notificaciones,
        countNoLeidas,
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Error al cargar notificaciones'),
        isLoading: false,
      });
    }
  },

  /**
   * Obtener solo el contador de notificaciones no leídas
   */
  fetchCount: async () => {
    try {
      const count = await getNotificacionesCount();
      set({ countNoLeidas: count });
    } catch (error: unknown) {
      console.error('Error al obtener contador:', error);
      // No seteamos error para no mostrar mensaje, solo log
    }
  },

  /**
   * Marcar una notificación como leída
   */
  marcarComoLeida: async (id: string) => {
    try {
      await marcarNotificacionComoLeida(id);

      // Actualizar estado local
      set((state) => ({
        notificaciones: state.notificaciones.map((n) =>
          n.id === id ? { ...n, leida: true } : n
        ),
        countNoLeidas: Math.max(0, state.countNoLeidas - 1),
      }));
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Error al marcar notificación como leída'),
      });
    }
  },

  /**
   * Marcar todas las notificaciones como leídas
   */
  marcarTodasLeidas: async () => {
    try {
      await marcarTodasComoLeidas();

      // Actualizar estado local
      set((state) => ({
        notificaciones: state.notificaciones.map((n) => ({ ...n, leida: true })),
        countNoLeidas: 0,
      }));
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Error al marcar todas como leídas'),
      });
    }
  },

  /**
   * Eliminar una notificación
   */
  eliminar: async (id: string) => {
    try {
      await eliminarNotificacion(id);

      // Actualizar estado local
      set((state) => {
        const notificacionEliminada = state.notificaciones.find(n => n.id === id);
        const esNoLeida = notificacionEliminada && !notificacionEliminada.leida;

        return {
          notificaciones: state.notificaciones.filter((n) => n.id !== id),
          countNoLeidas: esNoLeida ? Math.max(0, state.countNoLeidas - 1) : state.countNoLeidas,
        };
      });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Error al eliminar notificación'),
      });
    }
  },

  /**
   * Resetear error
   */
  resetError: () => {
    set({ error: null });
  },
}));
