import { useStatsStore } from '../store/stats.store';

// Selector hooks para optimizar re-renders
export const useStats = () => useStatsStore((state) => state.stats);
export const useStatsLoading = () => useStatsStore((state) => state.isLoading);
export const useStatsError = () => useStatsStore((state) => state.error);

// Action hooks
export const useFetchStats = () => useStatsStore((state) => state.fetchStats);
export const useClearStatsError = () => useStatsStore((state) => state.clearError);
export const useResetStats = () => useStatsStore((state) => state.reset);
