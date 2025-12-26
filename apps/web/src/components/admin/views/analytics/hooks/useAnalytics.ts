import { useState, useEffect, useCallback } from 'react';
import { getCombinedDashboardStats, getCasasEstadisticas } from '@/lib/api/admin.api';
import {
  MOCK_DASHBOARD_STATS,
  MOCK_CASA_DISTRIBUTION,
  MOCK_RETENTION_DATA,
} from '@/lib/constants/admin-mock-data';

/**
 * Tipos para analytics
 * Nota: [key: string] es necesario para compatibilidad con Recharts
 */
export interface CasaDistribution {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

export interface RetentionDataPoint {
  month: string;
  nuevos: number;
  activos: number;
  bajas: number;
  [key: string]: string | number;
}

export interface AnalyticsStats {
  estudiantesActivos: number;
  crecimientoMensual: number;
  tasaRetencion: number;
  librosLeidos: number;
}

export interface AnalyticsData {
  stats: AnalyticsStats;
  casaDistribution: CasaDistribution[];
  retentionData: RetentionDataPoint[];
}

interface UseAnalyticsReturn {
  isLoading: boolean;
  error: string | null;
  data: AnalyticsData;
  refetch: () => Promise<void>;
}

// Colores por tipo de casa
const CASA_COLORS: Record<string, string> = {
  QUANTUM: '#6366f1',
  VERTEX: '#22c55e',
  PULSAR: '#ec4899',
  Quantum: '#6366f1',
  Vertex: '#22c55e',
  Pulsar: '#ec4899',
};

// Mock data para fallback
const MOCK_ANALYTICS: AnalyticsData = {
  stats: {
    estudiantesActivos: MOCK_DASHBOARD_STATS.estudiantesActivos,
    crecimientoMensual: MOCK_DASHBOARD_STATS.crecimientoMensual,
    tasaRetencion: 94.2,
    librosLeidos: 2100,
  },
  casaDistribution: MOCK_CASA_DISTRIBUTION,
  retentionData: MOCK_RETENTION_DATA,
};

/**
 * useAnalytics - Hook para datos de analytics
 *
 * Combina llamadas al backend:
 * - GET /admin/dashboard + /admin/estadisticas + /casas/estadisticas
 *
 * Fallback a mock data si hay error (desarrollo sin backend)
 */
export function useAnalytics(): UseAnalyticsReturn {
  const [data, setData] = useState<AnalyticsData>(MOCK_ANALYTICS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch en paralelo
      const [dashboardStats, casasStats] = await Promise.all([
        getCombinedDashboardStats(),
        getCasasEstadisticas(),
      ]);

      // Mapear distribución de casas desde el ranking
      const casaDistribution: CasaDistribution[] = casasStats.ranking.map((casa) => ({
        name: casa.nombre,
        value: casa.cantidadEstudiantes,
        color: CASA_COLORS[casa.tipo] || CASA_COLORS[casa.nombre] || '#6366f1',
      }));

      // Calcular tasa de retención (estudiantes activos / total)
      const tasaRetencion =
        dashboardStats.totalEstudiantes > 0
          ? Math.round(
              (dashboardStats.estudiantesActivos / dashboardStats.totalEstudiantes) * 1000,
            ) / 10
          : 0;

      setData({
        stats: {
          estudiantesActivos: dashboardStats.estudiantesActivos,
          crecimientoMensual: dashboardStats.crecimientoMensual,
          tasaRetencion,
          librosLeidos: 0, // TODO: Endpoint de biblioteca cuando exista
        },
        casaDistribution,
        // Retención mensual requiere endpoint de histórico - usar mock por ahora
        retentionData: MOCK_RETENTION_DATA,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar analytics';
      setError(message);
      console.warn('useAnalytics: Usando datos mock por error:', message);
      setData(MOCK_ANALYTICS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    isLoading,
    error,
    data,
    refetch: fetchData,
  };
}
