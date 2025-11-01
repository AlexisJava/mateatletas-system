import { create } from 'zustand';
import { DashboardData } from '@/types/admin.types';
import * as adminApi from '@/lib/api/admin.api';
import { getErrorMessage } from '@/lib/utils/error-handler';

interface DashboardStore {
  dashboard: DashboardData | null;
  isLoading: boolean;
  error: string | null;

  fetchDashboard: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  dashboard: null,
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await adminApi.getDashboard();
      set({ dashboard: data, isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Error loading dashboard'), isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({ dashboard: null, isLoading: false, error: null }),
}));
