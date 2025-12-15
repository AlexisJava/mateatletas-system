import { Injectable } from '@nestjs/common';
import { ClaseQueryService } from './clase-query.service';
import { ClaseCommandService } from './clase-command.service';
import { ClaseStatsService } from './clase-stats.service';
import { CrearClaseDto } from '../dto/crear-clase.dto';

/**
 * Facade que unifica los servicios especializados de Clases
 *
 * Responsabilidad: Delegación pura
 * - Queries → ClaseQueryService
 * - Commands → ClaseCommandService
 * - Stats → ClaseStatsService
 *
 * IMPORTANTE: No contiene lógica de negocio, solo delegación
 *
 * Este facade secundario permite que ClasesService (facade principal)
 * acceda a todas las operaciones de management a través de un único punto.
 */
@Injectable()
export class ClasesManagementFacade {
  constructor(
    private queryService: ClaseQueryService,
    private commandService: ClaseCommandService,
    private statsService: ClaseStatsService,
  ) {}

  // ========================================
  // QUERIES (8 métodos)
  // ========================================

  /**
   * Listar todas las clases (Admin) con paginación
   */
  async listarTodasLasClases(
    filtros?: {
      fechaDesde?: Date;
      fechaHasta?: Date;
      estado?: 'Programada' | 'Cancelada';
      docenteId?: string;
    },
    page?: number,
    limit?: number,
  ) {
    return this.queryService.listarTodasLasClases(filtros, page, limit);
  }

  /**
   * Listar clases disponibles para tutores
   */
  async listarClasesParaTutor(tutorId: string) {
    return this.queryService.listarClasesParaTutor(tutorId);
  }

  /**
   * Obtener calendario de clases para un tutor (filtrado por mes/año)
   */
  async obtenerCalendarioTutor(tutorId: string, mes?: number, año?: number) {
    return this.queryService.obtenerCalendarioTutor(tutorId, mes, año);
  }

  /**
   * Listar clases de un docente
   */
  async listarClasesDeDocente(docenteId: string, incluirPasadas = false) {
    return this.queryService.listarClasesDeDocente(docenteId, incluirPasadas);
  }

  /**
   * Obtener detalles de una clase específica
   */
  async obtenerClase(id: string) {
    return this.queryService.obtenerClase(id);
  }

  /**
   * Obtener estudiantes inscritos en una clase
   */
  async obtenerEstudiantesDeClase(claseId: string) {
    return this.queryService.obtenerEstudiantesDeClase(claseId);
  }

  // ========================================
  // COMMANDS (4 métodos)
  // ========================================

  /**
   * Programar una nueva clase (solo Admin)
   */
  async programarClase(dto: CrearClaseDto) {
    return this.commandService.programarClase(dto);
  }

  /**
   * Cancelar una clase programada
   * RESILIENCIA: Notificaciones con Promise.allSettled
   */
  async cancelarClase(id: string, userId: string, userRole: string) {
    return this.commandService.cancelarClase(id, userId, userRole);
  }

  /**
   * Eliminar una clase permanentemente (Solo Admin)
   */
  async eliminarClase(id: string) {
    return this.commandService.eliminarClase(id);
  }

  /**
   * Asignar estudiantes a una clase (solo Admin)
   */
  async asignarEstudiantesAClase(claseId: string, estudianteIds: string[]) {
    return this.commandService.asignarEstudiantesAClase(claseId, estudianteIds);
  }

  // ========================================
  // STATS (3 métodos)
  // ========================================

  /**
   * Obtener estadísticas de ocupación de clases
   */
  async obtenerEstadisticasOcupacion(filtros?: {
    fechaDesde?: Date;
    fechaHasta?: Date;
    docenteId?: string;
  }) {
    return this.statsService.obtenerEstadisticasOcupacion(filtros);
  }

  /**
   * Obtener resumen mensual de clases para un tutor
   */
  async obtenerResumenMensual(tutorId: string, mes: number, año: number) {
    return this.statsService.obtenerResumenMensual(tutorId, mes, año);
  }

  /**
   * Obtener reporte de asistencia de una clase
   */
  async obtenerReporteAsistencia(claseId: string) {
    return this.statsService.obtenerReporteAsistencia(claseId);
  }
}
