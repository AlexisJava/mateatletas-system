import { Injectable } from '@nestjs/common';
import { DashboardDocenteResponse } from '../dto/dashboard-response.dto';

// Delegated services
import { DocenteDashboardQueriesService } from './docente-dashboard-queries.service';
import { DocenteEstudiantesStatsService } from './docente-estudiantes-stats.service';
import { DocenteCalendarioQueriesService } from './docente-calendario-queries.service';
import { DocenteDashboardGraphsService } from './docente-dashboard-graphs.service';

/**
 * Stats Service - Facade for docente statistics and reports
 *
 * This service acts as a coordinator, delegating to specialized services:
 * - DocenteDashboardQueriesService: Dashboard and main queries
 * - DocenteEstudiantesStatsService: Student statistics and rankings
 * - DocenteCalendarioQueriesService: Calendar and schedule queries
 * - DocenteDashboardGraphsService: Dashboard visualizations
 *
 * Pattern: Facade + CQRS (Command Query Responsibility Segregation)
 *
 * NOTE: This file was refactored from 1,872 lines to ~150 lines.
 * Logic was extracted to specialized services for better maintainability.
 */
@Injectable()
export class DocenteStatsService {
  constructor(
    private dashboardQueries: DocenteDashboardQueriesService,
    private estudiantesStats: DocenteEstudiantesStatsService,
    private calendarioQueries: DocenteCalendarioQueriesService,
    private dashboardGraphs: DocenteDashboardGraphsService,
  ) {}

  // ============================================================================
  // DASHBOARD METHODS - Delegated to DocenteDashboardQueriesService
  // ============================================================================

  /**
   * Obtiene el dashboard del docente con datos accionables
   * @param docenteId - ID del docente
   * @returns Dashboard con clase inminente, alertas y estadísticas
   */
  async getDashboard(docenteId: string): Promise<DashboardDocenteResponse> {
    return this.dashboardQueries.getDashboard(docenteId);
  }

  /**
   * Obtiene el detalle de una comisión específica con sus estudiantes inscritos
   * @param comisionId - ID de la comisión
   * @param docenteId - ID del docente (para verificar ownership)
   * @returns Detalle de la comisión con lista de estudiantes
   */
  async getComisionDetalle(comisionId: string, docenteId: string) {
    return this.dashboardQueries.getComisionDetalle(comisionId, docenteId);
  }

  /**
   * Obtiene todas las comisiones asignadas al docente
   * Incluye: producto, casa, inscripciones_count, proxima_clase
   * @param docenteId - ID del docente
   * @returns Lista de comisiones formateadas
   */
  async getMisComisiones(docenteId: string) {
    return this.dashboardQueries.getMisComisiones(docenteId);
  }

  // ============================================================================
  // STATISTICS METHODS - Delegated to DocenteEstudiantesStatsService
  // ============================================================================

  /**
   * Obtiene estadísticas COMPLETAS del docente para la página de Observaciones
   * @param docenteId - ID del docente
   * @returns Estadísticas completas con rankings y métricas
   */
  async getEstadisticasCompletas(docenteId: string) {
    return this.estudiantesStats.getEstadisticasCompletas(docenteId);
  }

  // ============================================================================
  // CALENDAR METHODS - Delegated to DocenteCalendarioQueriesService
  // ============================================================================

  /**
   * Obtiene las clases del mes para el calendario del docente
   * @param docenteId - ID del docente
   * @param mes - Mes (1-12)
   * @param anio - Año (ej: 2025)
   * @returns Clases del mes con información de estudiantes
   */
  async getClasesDelMes(docenteId: string, mes: number, anio: number) {
    return this.calendarioQueries.getClasesDelMes(docenteId, mes, anio);
  }

  /**
   * Obtiene la próxima clase del docente basado en sus comisiones activas
   * @param docenteId - ID del docente
   * @returns Próxima clase con comisión, fecha_hora y minutos_restantes, o null
   */
  async getProximaClase(docenteId: string) {
    return this.calendarioQueries.getProximaClase(docenteId);
  }

  // ============================================================================
  // GRAPH METHODS - Delegated to DocenteDashboardGraphsService
  // ============================================================================

  /**
   * Obtiene la carga horaria semanal del docente
   * @param docenteId - ID del docente
   * @returns Data para gráfico de barras con clases por día
   */
  async getCargaHorariaSemanal(docenteId: string) {
    return this.dashboardGraphs.getCargaHorariaSemanal(docenteId);
  }

  /**
   * Obtiene la tendencia de asistencia de las últimas semanas
   * @param docenteId - ID del docente
   * @returns Data para gráfico de línea con promedio semanal
   */
  async getTendenciaAsistencia(docenteId: string) {
    return this.dashboardGraphs.getTendenciaAsistencia(docenteId);
  }

  /**
   * Obtiene la distribución de estudiantes por comisión del docente
   * @param docenteId - ID del docente
   * @returns Data para gráfico de torta con estudiantes por comisión
   */
  async getDistribucionEstudiantes(docenteId: string) {
    return this.dashboardGraphs.getDistribucionEstudiantes(docenteId);
  }

  /**
   * Obtiene el progreso de una comisión (sesiones completadas vs total)
   * @param comisionId - ID de la comisión
   * @param docenteId - ID del docente (para verificar ownership)
   * @returns Progreso con sesión actual, total y porcentaje
   */
  async getProgresoComision(comisionId: string, docenteId: string) {
    return this.dashboardGraphs.getProgresoComision(comisionId, docenteId);
  }

  /**
   * Obtiene el total de puntos otorgados por el docente
   * @param docenteId - ID del docente
   * @returns Total de puntos otorgados
   */
  async getPuntosOtorgados(docenteId: string) {
    return this.dashboardGraphs.getPuntosOtorgados(docenteId);
  }
}
