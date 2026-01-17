import { useQuery } from '@tanstack/react-query';
import { getDistribucionTiers, type DistribucionTiers } from '@/lib/api/admin.api';

/** Query key para invalidación */
export const TIER_DISTRIBUTION_KEY = ['admin', 'dashboard', 'tier-distribution'] as const;

interface UseTierDistributionReturn {
  distribution: DistribucionTiers | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener la distribución de estudiantes por tier
 *
 * Llama al backend: GET /admin/estadisticas/distribucion-tiers
 */
export function useTierDistribution(): UseTierDistributionReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: TIER_DISTRIBUTION_KEY,
    queryFn: getDistribucionTiers,
  });

  return {
    distribution: data ?? null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Error al cargar distribución') : null,
    refetch: async () => {
      await refetch();
    },
  };
}
