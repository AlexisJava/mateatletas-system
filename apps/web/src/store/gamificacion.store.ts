import { getErrorMessage } from '@/lib/utils/error-handler';
import { create } from 'zustand';
import {
  gamificacionApi,
  DashboardData,
  Logro,
  Puntos,
  Ranking,
  Progreso,
} from '@/lib/api/gamificacion.api';

interface GamificacionState {
  // Data
  dashboard: DashboardData | null;
  logros: Logro[];
  puntos: Puntos | null;
  ranking: Ranking | null;
  progreso: Progreso[];

  // UI State
  isLoading: boolean;
  error: string | null;
  logroRecienDesbloqueado: Logro | null;

  // Actions
  fetchDashboard: (estudianteId: string) => Promise<void>;
  fetchLogros: (estudianteId: string) => Promise<void>;
  fetchPuntos: (estudianteId: string) => Promise<void>;
  fetchRanking: (estudianteId: string) => Promise<void>;
  fetchProgreso: (estudianteId: string) => Promise<void>;
  desbloquearLogro: (logroId: string) => Promise<void>;
  clearLogroModal: () => void;
}

export const useGamificacionStore = create<GamificacionState>((set, get) => ({
  // Initial state
  dashboard: null,
  logros: [],
  puntos: null,
  ranking: null,
  progreso: [],
  isLoading: false,
  error: null,
  logroRecienDesbloqueado: null,

  /**
   * Fetch dashboard completo
   */
  fetchDashboard: async (estudianteId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await gamificacionApi.getDashboard(estudianteId);
      set({ dashboard: data, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Error al cargar dashboard'),
        isLoading: false,
      });
    }
  },

  /**
   * Fetch logros
   */
  fetchLogros: async (estudianteId: string) => {
    set({ isLoading: true, error: null });
    try {
      const logros = await gamificacionApi.getLogros(estudianteId);
      set({ logros, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Error al cargar logros'),
        isLoading: false,
      });
    }
  },

  /**
   * Fetch puntos
   */
  fetchPuntos: async (estudianteId: string) => {
    try {
      const puntos = await gamificacionApi.getPuntos(estudianteId);
      set({ puntos });
    } catch (error: unknown) {
      console.error('Error al cargar puntos:', error);
    }
  },

  /**
   * Fetch ranking
   */
  fetchRanking: async (estudianteId: string) => {
    set({ isLoading: true, error: null });
    try {
      const ranking = await gamificacionApi.getRanking(estudianteId);
      set({ ranking, isLoading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Error al cargar ranking'),
        isLoading: false,
      });
    }
  },

  /**
   * Fetch progreso
   */
  fetchProgreso: async (estudianteId: string) => {
    try {
      const progreso = await gamificacionApi.getProgreso(estudianteId);
      set({ progreso });
    } catch (error: unknown) {
      console.error('Error al cargar progreso:', error);
    }
  },

  /**
   * Desbloquear logro (trigger confetti!)
   */
  desbloquearLogro: async (logroId: string) => {
    try {
      await gamificacionApi.desbloquearLogro(logroId);

      // Actualizar logro en la lista
      const logros = get().logros.map((logro) =>
        logro.id === logroId
          ? { ...logro, desbloqueado: true, fecha_desbloqueo: new Date() }
          : logro,
      );

      const logroDesbloqueado = logros.find((l) => l.id === logroId);

      set({
        logros,
        logroRecienDesbloqueado: logroDesbloqueado || null,
      });
    } catch (error: unknown) {
      console.error('Error al desbloquear logro:', error);
    }
  },

  /**
   * Cerrar modal de logro
   */
  clearLogroModal: () => {
    set({ logroRecienDesbloqueado: null });
  },
}));
