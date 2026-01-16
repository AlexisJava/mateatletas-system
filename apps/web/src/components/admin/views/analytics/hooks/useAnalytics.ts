import { useQuery } from '@tanstack/react-query';
import {
  getCombinedDashboardStats,
  getCasasEstadisticas,
  getRetentionStats,
  getLibrosLeidos,
  type RetentionDataPoint as ApiRetentionDataPoint,
} from '@/lib/api/admin.api';

/** Query key para invalidación */
export const ANALYTICS_KEY = ['admin', 'analytics'] as const;

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
  data: AnalyticsData | null;
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

/**
 * Función para obtener todos los datos de analytics
 */
async function fetchAnalyticsData(): Promise<AnalyticsData> {
  const [dashboardStats, casasStats, retentionData, librosLeidosStats] = await Promise.all([
    getCombinedDashboardStats(),
    getCasasEstadisticas(),
    getRetentionStats(6),
    getLibrosLeidos().catch(() => ({
      total: 0,
      porEstudiante: 0,
      completadosEsteMes: 0,
      tendencia: [],
    })),
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
      ? Math.round((dashboardStats.estudiantesActivos / dashboardStats.totalEstudiantes) * 1000) /
        10
      : 0;

  // Mapear retentionData para agregar index signature para Recharts
  const mappedRetentionData: RetentionDataPoint[] = retentionData.map(
    (item: ApiRetentionDataPoint) => ({
      month: item.month,
      nuevos: item.nuevos,
      activos: item.activos,
      bajas: item.bajas,
    }),
  );

  return {
    stats: {
      estudiantesActivos: dashboardStats.estudiantesActivos,
      crecimientoMensual: dashboardStats.crecimientoMensual,
      tasaRetencion,
      librosLeidos: librosLeidosStats.total,
    },
    casaDistribution,
    retentionData: mappedRetentionData,
  };
}

/**
 * useAnalytics - Hook para datos de analytics
 *
 * Usa React Query para:
 * - Cachear datos por 5 minutos
 * - Navegación instantánea entre pestañas
 *
 * Combina llamadas al backend:
 * - GET /admin/dashboard + /admin/estadisticas + /casas/estadisticas
 */
export function useAnalytics(): UseAnalyticsReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ANALYTICS_KEY,
    queryFn: fetchAnalyticsData,
  });

  return {
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Error al cargar analytics') : null,
    data: data ?? null,
    refetch: async () => {
      await refetch();
    },
  };
}
