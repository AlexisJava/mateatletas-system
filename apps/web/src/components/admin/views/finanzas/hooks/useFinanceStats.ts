import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFinanceMetrics,
  getFinanceConfig,
  updateFinanceConfig,
  type FinanceStats,
  type TierConfig,
} from '@/lib/api/admin.api';

/** Query keys para invalidación */
export const FINANCE_METRICS_KEY = ['admin', 'finance', 'metrics'] as const;
export const FINANCE_CONFIG_KEY = ['admin', 'finance', 'config'] as const;

interface UseFinanceStatsReturn {
  stats: FinanceStats | null;
  config: TierConfig | null;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
  refetch: () => Promise<void>;
  saveConfig: (newConfig: TierConfig) => Promise<void>;
}

/**
 * Hook para obtener métricas y configuración de finanzas
 *
 * Usa React Query para:
 * - Cachear datos por 5 minutos
 * - Navegación instantánea entre pestañas
 * - Invalidación automática al guardar config
 *
 * Llama al backend:
 * - GET /pagos/dashboard/metricas
 * - GET /pagos/configuracion
 */
export function useFinanceStats(): UseFinanceStatsReturn {
  const queryClient = useQueryClient();

  // Query para métricas
  const metricsQuery = useQuery({
    queryKey: FINANCE_METRICS_KEY,
    queryFn: getFinanceMetrics,
  });

  // Query para configuración
  const configQuery = useQuery({
    queryKey: FINANCE_CONFIG_KEY,
    queryFn: getFinanceConfig,
  });

  // Mutation para guardar configuración
  const saveMutation = useMutation({
    mutationFn: updateFinanceConfig,
    onSuccess: (updated) => {
      // Actualizar cache directamente
      queryClient.setQueryData(FINANCE_CONFIG_KEY, updated);
    },
  });

  const isLoading = metricsQuery.isLoading || configQuery.isLoading;
  const error = metricsQuery.error || configQuery.error;

  return {
    stats: metricsQuery.data ?? null,
    config: configQuery.data ?? null,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : 'Error al cargar datos de finanzas'
      : null,
    isSaving: saveMutation.isPending,
    refetch: async () => {
      await Promise.all([metricsQuery.refetch(), configQuery.refetch()]);
    },
    saveConfig: async (newConfig: TierConfig) => {
      await saveMutation.mutateAsync(newConfig);
    },
  };
}
