import { useState, useEffect, useCallback } from 'react';
import {
  getFinanceMetrics,
  getFinanceConfig,
  updateFinanceConfig,
  type FinanceStats,
  type TierConfig,
} from '@/lib/api/admin.api';

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
 * Llama al backend:
 * - GET /pagos/dashboard/metricas
 * - GET /pagos/configuracion
 */
export function useFinanceStats(): UseFinanceStatsReturn {
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [config, setConfig] = useState<TierConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [metricsData, configData] = await Promise.all([
        getFinanceMetrics(),
        getFinanceConfig(),
      ]);
      setStats(metricsData);
      setConfig(configData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar datos de finanzas';
      setError(message);
      console.error('useFinanceStats: Error al cargar datos:', message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveConfig = useCallback(async (newConfig: TierConfig) => {
    setIsSaving(true);
    try {
      const updated = await updateFinanceConfig(newConfig);
      setConfig(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar configuración';
      console.error('useFinanceStats.saveConfig:', message);
      throw err; // Re-throw para que el componente pueda mostrar error
    } finally {
      setIsSaving(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats,
    config,
    isLoading,
    error,
    isSaving,
    refetch: fetchData,
    saveConfig,
  };
}
