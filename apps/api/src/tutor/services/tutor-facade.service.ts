import { Injectable } from '@nestjs/common';
import { TutorQueryService } from './tutor-query.service';
import { TutorStatsService } from './tutor-stats.service';
import { TutorBusinessValidator } from '../validators/tutor-business.validator';
import { EstadoPago } from '../../pagos/domain/types/pagos.types';
import { MisInscripcionesResponse } from '../tutor.service';
import {
  DashboardResumenResponse,
  ProximasClasesResponse,
  AlertasResponse,
} from '../types/tutor-dashboard.types';

/**
 * TutorFacade
 *
 * Facade Service para el módulo Tutor.
 * Unifica las operaciones de Query, Stats y Validaciones.
 * Proporciona una API simplificada para el controlador.
 *
 * Responsabilidades:
 * - Orquestar llamadas entre QueryService, StatsService y Validator
 * - Validar reglas de negocio antes de ejecutar operaciones
 * - Mantener API simple y consistente
 *
 * Patrón: FACADE + CQRS
 * Beneficio: Separación de responsabilidades manteniendo API simple
 */
@Injectable()
export class TutorFacade {
  constructor(
    private readonly queryService: TutorQueryService,
    private readonly statsService: TutorStatsService,
    private readonly validator: TutorBusinessValidator,
  ) {}

  // ============================================================================
  // QUERIES (Lectura) - Delegación a QueryService
  // ============================================================================

  /**
   * Obtiene las inscripciones mensuales de un tutor con resumen
   *
   * @param tutorId - ID del tutor autenticado (viene del JWT)
   * @param periodo - Filtro opcional por período (YYYY-MM)
   * @param estadoPago - Filtro opcional por estado
   * @returns Inscripciones y resumen financiero
   */
  async getMisInscripciones(
    tutorId: string,
    periodo?: string,
    estadoPago?: EstadoPago,
  ): Promise<MisInscripcionesResponse> {
    // Validar que el tutor existe
    await this.validator.validarTutorExiste(tutorId);

    // Delegar a QueryService
    return this.queryService.getMisInscripciones(tutorId, periodo, estadoPago);
  }

  /**
   * Obtiene el resumen completo del dashboard del tutor
   *
   * @param tutorId - ID del tutor autenticado
   * @returns Dashboard con métricas, alertas, pagos pendientes y clases de hoy
   */
  async getDashboardResumen(
    tutorId: string,
  ): Promise<DashboardResumenResponse> {
    // Validar que el tutor existe
    await this.validator.validarTutorExiste(tutorId);

    // Delegar a QueryService (que a su vez usa StatsService)
    return this.queryService.getDashboardResumen(tutorId);
  }

  /**
   * Obtiene las próximas N clases de todos los hijos del tutor
   *
   * @param tutorId - ID del tutor autenticado
   * @param limit - Cantidad máxima de clases a retornar (default: 5)
   * @returns Lista de próximas clases ordenadas por fecha
   */
  async getProximasClases(
    tutorId: string,
    limit: number = 5,
  ): Promise<ProximasClasesResponse> {
    // Validar que el tutor existe
    await this.validator.validarTutorExiste(tutorId);

    // Validar límite
    this.validator.validarLimitProximasClases(limit);

    // Delegar a QueryService
    return this.queryService.getProximasClases(tutorId, limit);
  }

  /**
   * Obtiene todas las alertas activas del tutor
   *
   * @param tutorId - ID del tutor autenticado
   * @returns Lista de alertas ordenadas por prioridad
   */
  async obtenerAlertas(tutorId: string): Promise<AlertasResponse> {
    // Validar que el tutor existe
    await this.validator.validarTutorExiste(tutorId);

    // Delegar a QueryService
    return this.queryService.obtenerAlertas(tutorId);
  }
}
