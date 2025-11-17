import { Injectable } from '@nestjs/common';
import { TutorFacade } from './services/tutor-facade.service';
import { EstadoPagoFilter } from './dto/get-mis-inscripciones.dto';
import { EstadoPago } from '../pagos/domain/types/pagos.types';
import { InscripcionMensual } from '../pagos/domain/repositories/inscripcion-mensual.repository.interface';
import {
  DashboardResumenResponse,
  ProximasClasesResponse,
  AlertasResponse,
} from './types/tutor-dashboard.types';

/**
 * Response type para getMisInscripciones
 */
export interface MisInscripcionesResponse {
  inscripciones: InscripcionMensual[];
  resumen: {
    totalPendiente: number;
    totalPagado: number;
    cantidadInscripciones: number;
    estudiantesUnicos: number;
  };
}

/**
 * FACADE SERVICE para el módulo Tutor
 *
 * Este servicio actúa como una fachada que delega toda la lógica
 * a servicios especializados, eliminando duplicación de código.
 *
 * Servicios especializados:
 * - TutorQueryService: Queries (4 métodos)
 * - TutorStatsService: Statistics (6 métodos)
 * - TutorBusinessValidator: Validaciones de negocio (3 métodos)
 *
 * Patrón: FACADE + CQRS
 * Beneficio: Separación de responsabilidades, código más mantenible
 * Reducción: 676 líneas → ~50 líneas (93% reducción)
 */
@Injectable()
export class TutorService {
  constructor(private facade: TutorFacade) {}

  // ============================================================================
  // QUERIES (Lectura) - Delegación a Facade → QueryService
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
    estadoPago?: EstadoPagoFilter,
  ): Promise<MisInscripcionesResponse> {
    // Mapear EstadoPagoFilter a EstadoPago del dominio
    const estadoDominio: EstadoPago | undefined = estadoPago as
      | EstadoPago
      | undefined;

    return this.facade.getMisInscripciones(tutorId, periodo, estadoDominio);
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
    return this.facade.getDashboardResumen(tutorId);
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
    return this.facade.getProximasClases(tutorId, limit);
  }

  /**
   * Obtiene todas las alertas activas del tutor
   *
   * @param tutorId - ID del tutor autenticado
   * @returns Lista de alertas ordenadas por prioridad
   */
  async obtenerAlertas(tutorId: string): Promise<AlertasResponse> {
    return this.facade.obtenerAlertas(tutorId);
  }
}
