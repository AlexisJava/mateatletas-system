import { useStatsStore } from '../store/stats.store';
import type { AppError } from '../../shared/types/errors.types';

// Selector hooks para optimizar re-renders
export const useStats = () => useStatsStore((state) => state.stats);
export const useStatsLoading = () => useStatsStore((state) => state.isLoading);

/**
 * Hook que retorna el error como AppError (type-safe)
 */
export const useStatsError = (): AppError | null => useStatsStore((state) => state.error);

/**
 * Hook que retorna el mensaje de error como string para compatibilidad
 */
export const useStatsErrorMessage = (): string | null => {
  const error = useStatsError();
  return error?.message || null;
};

// Action hooks
export const useFetchStats = () => useStatsStore((state) => state.fetchStats);
export const useClearStatsError = () => useStatsStore((state) => state.clearError);
export const useResetStats = () => useStatsStore((state) => state.reset);
