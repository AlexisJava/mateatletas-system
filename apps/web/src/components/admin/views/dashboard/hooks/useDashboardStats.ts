import { useQuery } from '@tanstack/react-query';
import { getCombinedDashboardStats } from '@/lib/api/admin.api';
import type { DashboardStats } from '@/types/admin.types';

/** Query key para invalidación */
export const DASHBOARD_STATS_KEY = ['admin', 'dashboard', 'stats'] as const;

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener las estadísticas del dashboard
 *
 * Usa React Query para:
 * - Cachear datos por 5 minutos (staleTime del QueryProvider)
 * - Navegación instantánea entre pestañas
 * - Revalidación en background
 *
 * Llama al backend y combina datos de:
 * - GET /admin/dashboard
 * - GET /admin/estadisticas
 * - GET /casas/estadisticas
 */
export function useDashboardStats(): UseDashboardStatsReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: DASHBOARD_STATS_KEY,
    queryFn: getCombinedDashboardStats,
  });

  return {
    stats: data ?? null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Error al cargar estadísticas') : null,
    refetch: async () => {
      await refetch();
    },
  };
}
