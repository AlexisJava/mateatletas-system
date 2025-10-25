import { useDashboardStore } from '../store/dashboard.store';

// Selector hooks para optimizar re-renders
export const useDashboard = () => useDashboardStore((state) => state.dashboard);
export const useDashboardLoading = () => useDashboardStore((state) => state.isLoading);
export const useDashboardError = () => useDashboardStore((state) => state.error);

// Action hooks
export const useFetchDashboard = () => useDashboardStore((state) => state.fetchDashboard);
export const useClearDashboardError = () => useDashboardStore((state) => state.clearError);
export const useResetDashboard = () => useDashboardStore((state) => state.reset);
