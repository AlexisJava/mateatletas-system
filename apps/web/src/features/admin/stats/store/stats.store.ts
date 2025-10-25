import { create } from 'zustand';
import { z } from 'zod';
import * as adminApi from '@/lib/api/admin.api';
import { SystemStats, parseSystemStats } from '../types/stats.schema';
import { ErrorFactory, AppError } from '../../shared/types/errors.types';

interface StatsStore {
  stats: SystemStats | null;
  isLoading: boolean;
  error: AppError | null;

  fetchStats: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useStatsStore = create<StatsStore>((set) => ({
  stats: null,
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const rawStats = await adminApi.getSystemStats();

      // Validar con Zod
      const stats = parseSystemStats(rawStats);

      set({ stats, isLoading: false });
    } catch (error: unknown) {
      // Convertir error a AppError
      let appError: AppError;

      if (error instanceof z.ZodError) {
        appError = ErrorFactory.fromZodError(error);
      } else {
        appError = ErrorFactory.fromAxiosError(error);
      }

      set({ error: appError, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({ stats: null, isLoading: false, error: null }),
}));
