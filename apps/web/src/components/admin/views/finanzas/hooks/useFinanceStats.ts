import { useState, useEffect, useCallback } from 'react';
import {
  getFinanceMetrics,
  getFinanceConfig,
  updateFinanceConfig,
  type FinanceStats,
  type TierConfig,
} from '@/lib/api/admin.api';

// Valores por defecto cuando el backend no está disponible
const MOCK_STATS: FinanceStats = {
  ingresosMes: 4200000,
  pagosPendientes: 320000,
  inscripcionesActivas: 298,
  tasaCobro: 92.9,
  cambios: {
    ingresos: 15.3,
    pendientes: -5.2,
    inscripciones: 12,
    tasaCobro: 2.1,
  },
};

const MOCK_CONFIG: TierConfig = {
  precioSteamLibros: 40000,
  precioSteamAsincronico: 65000,
  precioSteamSincronico: 95000,
  descuentoSegundoHermano: 10,
  diaVencimiento: 15,
  diasAntesRecordatorio: 5,
  notificacionesActivas: true,
};

interface UseFinanceStatsReturn {
  stats: FinanceStats;
  config: TierConfig;
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
 *
 * Fallback a mock data si hay error (desarrollo sin backend)
 */
export function useFinanceStats(): UseFinanceStatsReturn {
  const [stats, setStats] = useState<FinanceStats>(MOCK_STATS);
  const [config, setConfig] = useState<TierConfig>(MOCK_CONFIG);
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
      console.warn('useFinanceStats: Usando datos mock por error:', message);
      // Mantener mock data como fallback
      setStats(MOCK_STATS);
      setConfig(MOCK_CONFIG);
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
