import { useState, useEffect, useCallback } from 'react';
import { getCombinedDashboardStats } from '@/lib/api/admin.api';
import { MOCK_DASHBOARD_STATS } from '@/lib/constants/admin-mock-data';
import type { DashboardStats } from '@/types/admin.types';

interface UseDashboardStatsReturn {
  stats: DashboardStats;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener las estadísticas del dashboard
 *
 * Llama al backend y combina datos de:
 * - GET /admin/dashboard
 * - GET /admin/estadisticas
 * - GET /casas/estadisticas
 *
 * Fallback a mock data si hay error (desarrollo sin backend)
 */
export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats>(MOCK_DASHBOARD_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getCombinedDashboardStats();
      setStats(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar estadísticas';
      setError(message);
      console.warn('useDashboardStats: Usando datos mock por error:', message);
      // Mantener mock data como fallback
      setStats(MOCK_DASHBOARD_STATS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
