import { useQuery } from '@tanstack/react-query';
import {
  getCombinedDashboardStats,
  getCasasEstadisticas,
  getRetentionStats,
  getDistribucionTiers,
  getFinanceMetrics,
  getHistoricoMensual,
  getSuscripcionesMetricas,
  getSuscripcionesMorosas,
  type RetentionDataPoint as ApiRetentionDataPoint,
  type RevenueDataPoint,
  type SuscripcionesMetricas,
  type SuscripcionMorosa,
  type DistribucionTiers,
  type FinanceStats,
} from '@/lib/api/admin.api';
import { CASA_COLORS, type CasaTipo } from '@/components/admin/constants/colors.constants';

/** Query key para invalidación */
export const ANALYTICS_KEY = ['admin', 'analytics'] as const;

// =============================================================================
// TIPOS
// =============================================================================

/**
 * Distribución de estudiantes por casa
 * Nota: [key: string] es necesario para compatibilidad con Recharts
 */
export interface CasaDistribution {
  name: string;
  value: number;
  color: string;
  puntosTotales: number;
  [key: string]: string | number;
}

/**
 * Punto de datos de retención mensual
 */
export interface RetentionDataPoint {
  month: string;
  nuevos: number;
  activos: number;
  bajas: number;
  [key: string]: string | number;
}

/**
 * Estadísticas generales del sistema
 */
export interface OverviewStats {
  // Estudiantes
  totalEstudiantes: number;
  estudiantesActivos: number;
  crecimientoMensual: number;
  tasaRetencion: number;
  // Financiero
  ingresosMes: number;
  pagosPendientes: number;
  tasaCobro: number;
  // Suscripciones
  inscripcionesActivas: number;
}

/**
 * Datos de distribución por tiers
 */
export interface TierDistributionData {
  STEAM_LIBROS: number;
  STEAM_ASINCRONICO: number;
  STEAM_SINCRONICO: number;
  SIN_PLAN: number;
  total: number;
}

/**
 * Datos de Mercado Pago / Suscripciones
 */
export interface SuscripcionesMPData {
  metricas: SuscripcionesMetricas;
  morosas: SuscripcionMorosa[];
  totalMorosas: number;
}

/**
 * Todos los datos de analytics
 */
export interface AnalyticsData {
  // Overview
  overview: OverviewStats;
  // Casas
  casaDistribution: CasaDistribution[];
  // Retención
  retentionData: RetentionDataPoint[];
  // Tiers
  tierDistribution: TierDistributionData;
  // Finanzas
  financeStats: FinanceStats;
  historicoMensual: RevenueDataPoint[];
  // Mercado Pago
  suscripcionesMP: SuscripcionesMPData;
}

interface UseAnalyticsReturn {
  isLoading: boolean;
  error: string | null;
  data: AnalyticsData | null;
  refetch: () => Promise<void>;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Obtener color de casa desde constantes centralizadas
 */
function getCasaColor(casaTipo: string): string {
  const normalized = casaTipo.toUpperCase() as CasaTipo;
  return CASA_COLORS[normalized]?.solid ?? CASA_COLORS.VERTEX.solid;
}

/**
 * Fetch seguro que retorna un valor por defecto en caso de error
 */
async function safeFetch<T>(
  fetcher: () => Promise<T>,
  defaultValue: T,
  errorContext: string,
): Promise<T> {
  try {
    return await fetcher();
  } catch (error) {
    console.warn(`[Analytics] ${errorContext}:`, error);
    return defaultValue;
  }
}

// =============================================================================
// DATA FETCHING
// =============================================================================

/**
 * Función para obtener todos los datos de analytics
 */
async function fetchAnalyticsData(): Promise<AnalyticsData> {
  // Fetch en paralelo para máxima velocidad
  const [
    dashboardStats,
    casasStats,
    retentionData,
    tierDistribution,
    financeStats,
    historicoMensual,
    suscripcionesMetricas,
    suscripcionesMorosas,
  ] = await Promise.all([
    getCombinedDashboardStats(),
    getCasasEstadisticas(),
    getRetentionStats(6),
    safeFetch(
      getDistribucionTiers,
      { STEAM_LIBROS: 0, STEAM_ASINCRONICO: 0, STEAM_SINCRONICO: 0, SIN_PLAN: 0, total: 0 },
      'Error fetching tier distribution',
    ),
    safeFetch(
      getFinanceMetrics,
      {
        ingresosMes: 0,
        pagosPendientes: 0,
        inscripcionesActivas: 0,
        tasaCobro: 0,
        cambios: { ingresos: 0, pendientes: 0, inscripciones: 0, tasaCobro: 0 },
      },
      'Error fetching finance metrics',
    ),
    safeFetch(() => getHistoricoMensual(6), [], 'Error fetching monthly history'),
    safeFetch(
      getSuscripcionesMetricas,
      {
        totalActivas: 0,
        totalMorosas: 0,
        totalEnGracia: 0,
        totalCanceladasMes: 0,
        ingresosMes: 0,
        tasaCancelacion: 0,
      },
      'Error fetching suscripciones metrics',
    ),
    safeFetch(
      getSuscripcionesMorosas,
      { morosas: [], total: 0 },
      'Error fetching suscripciones morosas',
    ),
  ]);

  // Mapear distribución de casas desde el ranking usando colores centralizados
  const casaDistribution: CasaDistribution[] = casasStats.ranking.map((casa) => ({
    name: casa.nombre,
    value: casa.cantidadEstudiantes,
    color: getCasaColor(casa.tipo),
    puntosTotales: casa.puntosTotales,
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
    overview: {
      totalEstudiantes: dashboardStats.totalEstudiantes,
      estudiantesActivos: dashboardStats.estudiantesActivos,
      crecimientoMensual: dashboardStats.crecimientoMensual,
      tasaRetencion,
      ingresosMes: dashboardStats.ingresosMes,
      pagosPendientes: dashboardStats.ingresosPendientes,
      tasaCobro: dashboardStats.tasaCobro,
      inscripcionesActivas: dashboardStats.inscripcionesActivas,
    },
    casaDistribution,
    retentionData: mappedRetentionData,
    tierDistribution,
    financeStats,
    historicoMensual,
    suscripcionesMP: {
      metricas: suscripcionesMetricas,
      morosas: suscripcionesMorosas?.morosas ?? [],
      totalMorosas: suscripcionesMorosas?.total ?? 0,
    },
  };
}

// =============================================================================
// HOOK PRINCIPAL
// =============================================================================

/**
 * useAnalytics - Hook completo para datos de analytics
 *
 * Usa React Query para:
 * - Cachear datos por 5 minutos
 * - Navegación instantánea entre pestañas
 *
 * Combina múltiples endpoints:
 * - /admin/dashboard + /admin/estadisticas + /casas/estadisticas
 * - /admin/analytics/retencion
 * - /admin/estadisticas/distribucion-tiers
 * - /pagos/dashboard/metricas + /admin/pagos/historico-mensual
 * - /suscripciones/admin/metricas + /suscripciones/admin/morosas
 */
export function useAnalytics(): UseAnalyticsReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ANALYTICS_KEY,
    queryFn: fetchAnalyticsData,
    staleTime: 5 * 60 * 1000, // 5 minutos
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
