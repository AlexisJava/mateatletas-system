import { create } from 'zustand';
import { SystemStats } from '@/types/admin.types';
import * as adminApi from '@/lib/api/admin.api';
import { getErrorMessage } from '@/lib/utils/error-handler';

interface StatsStore {
  stats: SystemStats | null;
  isLoading: boolean;
  error: string | null;

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
      const stats = await adminApi.getSystemStats();
      set({ stats, isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error loading stats'), isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({ stats: null, isLoading: false, error: null }),
}));
