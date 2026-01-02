import { useState, useEffect, useCallback } from 'react';
import { getHistoricoMensual, type RevenueDataPoint } from '@/lib/api/admin.api';

/** Revenue data con index signature para Recharts */
export interface RevenueChartData {
  month: string;
  ingresos: number;
  pendientes: number;
  [key: string]: string | number;
}

interface UseRevenueDataReturn {
  data: RevenueChartData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * useRevenueData - Hook para datos de ingresos mensuales
 *
 * Llama al backend GET /admin/pagos/historico-mensual
 */
export function useRevenueData(meses = 6): UseRevenueDataReturn {
  const [data, setData] = useState<RevenueChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const rawData = await getHistoricoMensual(meses);

      // Mapear para agregar index signature para Recharts
      const mappedData: RevenueChartData[] = rawData.map((item: RevenueDataPoint) => ({
        month: item.month,
        ingresos: item.ingresos,
        pendientes: item.pendientes,
      }));

      setData(mappedData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar datos de ingresos';
      setError(message);
      console.error('useRevenueData: Error al cargar datos:', message);
    } finally {
      setIsLoading(false);
    }
  }, [meses]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
