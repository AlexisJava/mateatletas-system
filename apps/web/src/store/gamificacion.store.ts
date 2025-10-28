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
  loading: {
    dashboard: boolean;
    logros: boolean;
    ranking: boolean;
    progreso: boolean;
  };
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
  loading: {
    dashboard: false,
    logros: false,
    ranking: false,
    progreso: false,
  },
  isLoading: false,
  error: null,
  logroRecienDesbloqueado: null,

  /**
   * Fetch dashboard completo
   */
  fetchDashboard: async (estudianteId: string) => {
    set((state) => {
      const nextLoading = { ...state.loading, dashboard: true };
      return {
        loading: nextLoading,
        isLoading: Object.values(nextLoading).some(Boolean),
        error: null,
      };
    });
    try {
      const data = await gamificacionApi.getDashboard(estudianteId);
      set((state) => {
        const nextLoading = { ...state.loading, dashboard: false };
        return {
          dashboard: data,
          loading: nextLoading,
          isLoading: Object.values(nextLoading).some(Boolean),
        };
      });
    } catch (error: unknown) {
      set((state) => {
        const nextLoading = { ...state.loading, dashboard: false };
        return {
          error: getErrorMessage(error, 'Error al cargar dashboard'),
          loading: nextLoading,
          isLoading: Object.values(nextLoading).some(Boolean),
        };
      });
    }
  },

  /**
   * Fetch logros
   */
  fetchLogros: async (estudianteId: string) => {
    set((state) => {
      const nextLoading = { ...state.loading, logros: true };
      return {
        loading: nextLoading,
        isLoading: Object.values(nextLoading).some(Boolean),
        error: null,
      };
    });
    try {
      const logros = await gamificacionApi.getLogros(estudianteId);
      set((state) => {
        const nextLoading = { ...state.loading, logros: false };
        return {
          logros,
          loading: nextLoading,
          isLoading: Object.values(nextLoading).some(Boolean),
        };
      });
    } catch (error: unknown) {
      set((state) => {
        const nextLoading = { ...state.loading, logros: false };
        return {
          error: getErrorMessage(error, 'Error al cargar logros'),
          loading: nextLoading,
          isLoading: Object.values(nextLoading).some(Boolean),
        };
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
    set((state) => {
      const nextLoading = { ...state.loading, ranking: true };
      return {
        loading: nextLoading,
        isLoading: Object.values(nextLoading).some(Boolean),
        error: null,
      };
    });
    try {
      const ranking = await gamificacionApi.getRanking(estudianteId);
      set((state) => {
        const nextLoading = { ...state.loading, ranking: false };
        return {
          ranking,
          loading: nextLoading,
          isLoading: Object.values(nextLoading).some(Boolean),
        };
      });
    } catch (error: unknown) {
      set((state) => {
        const nextLoading = { ...state.loading, ranking: false };
        return {
          error: getErrorMessage(error, 'Error al cargar ranking'),
          loading: nextLoading,
          isLoading: Object.values(nextLoading).some(Boolean),
        };
      });
    }
  },

  /**
   * Fetch progreso
   */
  fetchProgreso: async (estudianteId: string) => {
    try {
      set((state) => {
        const nextLoading = { ...state.loading, progreso: true };
        return {
          loading: nextLoading,
          isLoading: Object.values(nextLoading).some(Boolean),
        };
      });
      const progreso = await gamificacionApi.getProgreso(estudianteId);
      set((state) => {
        const nextLoading = { ...state.loading, progreso: false };
        return {
          progreso,
          loading: nextLoading,
          isLoading: Object.values(nextLoading).some(Boolean),
        };
      });
    } catch (error: unknown) {
      set((state) => {
        const nextLoading = { ...state.loading, progreso: false };
        return {
          loading: nextLoading,
          isLoading: Object.values(nextLoading).some(Boolean),
        };
      });
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
