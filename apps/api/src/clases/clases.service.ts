import { Injectable } from '@nestjs/common';
import { ClasesManagementFacade } from './services/clases-management-facade.service';
import { ClasesReservasService } from './services/clases-reservas.service';
import { ClasesAsistenciaService } from './services/clases-asistencia.service';
import { CrearClaseDto } from './dto/crear-clase.dto';
import { ReservarClaseDto } from './dto/reservar-clase.dto';
import { RegistrarAsistenciaDto } from './dto/registrar-asistencia.dto';

/**
 * FACADE SERVICE para el módulo Clases
 *
 * Este servicio actúa como una fachada que delega toda la lógica
 * a servicios especializados, eliminando duplicación de código.
 *
 * Servicios especializados:
 * - ClasesManagementFacade: CRUD de clases (programar, cancelar, listar, obtener)
 *   └─ ClaseQueryService: Queries (8 métodos)
 *   └─ ClaseCommandService: Commands (4 métodos)
 *   └─ ClaseStatsService: Estadísticas (3 métodos)
 * - ClasesReservasService: Reservas (reservar, cancelar reservas)
 * - ClasesAsistenciaService: Asistencia (registrar asistencia)
 *
 * Patrón: FACADE + CQRS
 * Beneficio: Separación de responsabilidades, código más mantenible
 * Reducción: 683 líneas → ~150 líneas (78% reducción)
 */
@Injectable()
export class ClasesService {
  constructor(
    private managementFacade: ClasesManagementFacade,
    private reservasService: ClasesReservasService,
    private asistenciaService: ClasesAsistenciaService,
  ) {}

  // ============================================================================
  // GESTIÓN DE CLASES (delegación a ClasesManagementFacade)
  // ============================================================================

  /**
   * Programar una nueva clase (solo Admin)
   * DELEGACIÓN: ClasesManagementFacade → ClaseCommandService
   */
  async programarClase(dto: CrearClaseDto) {
    return this.managementFacade.programarClase(dto);
  }

  /**
   * Cancelar una clase (Admin o Docente de la clase)
   * DELEGACIÓN: ClasesManagementFacade → ClaseCommandService
   */
  async cancelarClase(id: string, userId: string, userRole: string) {
    return this.managementFacade.cancelarClase(id, userId, userRole);
  }

  /**
   * Eliminar una clase permanentemente (Admin)
   * DELEGACIÓN: ClasesManagementFacade → ClaseCommandService
   */
  async eliminarClase(id: string) {
    return this.managementFacade.eliminarClase(id);
  }

  /**
   * Listar todas las clases (Admin) con paginación
   * DELEGACIÓN: ClasesManagementFacade → ClaseQueryService
   */
  async listarTodasLasClases(
    filtros?: {
      fechaDesde?: Date;
      fechaHasta?: Date;
      estado?: 'Programada' | 'Cancelada';
      docenteId?: string;
      rutaCurricularId?: string;
    },
    page?: number,
    limit?: number,
  ) {
    return this.managementFacade.listarTodasLasClases(filtros, page, limit);
  }

  /**
   * Listar clases disponibles para tutores
   * DELEGACIÓN: ClasesManagementFacade → ClaseQueryService
   */
  async listarClasesParaTutor(tutorId: string) {
    return this.managementFacade.listarClasesParaTutor(tutorId);
  }

  /**
   * Listar reservas activas del tutor autenticado
   * DELEGACIÓN: ClasesReservasService
   */
  async listarReservasDeTutor(tutorId: string) {
    return this.reservasService.listarReservasDeTutor(tutorId);
  }

  /**
   * Obtener calendario de clases para un tutor (filtrado por mes/año)
   * DELEGACIÓN: ClasesManagementFacade → ClaseQueryService
   */
  async obtenerCalendarioTutor(tutorId: string, mes?: number, anio?: number) {
    return this.managementFacade.obtenerCalendarioTutor(tutorId, mes, anio);
  }

  /**
   * Listar clases de un docente
   * DELEGACIÓN: ClasesManagementFacade → ClaseQueryService
   */
  async listarClasesDeDocente(docenteId: string, incluirPasadas = false) {
    return this.managementFacade.listarClasesDeDocente(
      docenteId,
      incluirPasadas,
    );
  }

  /**
   * Obtener detalles de una clase específica
   * DELEGACIÓN: ClasesManagementFacade → ClaseQueryService
   */
  async obtenerClase(id: string) {
    return this.managementFacade.obtenerClase(id);
  }

  /**
   * Obtener rutas curriculares (para formularios)
   * DELEGACIÓN: ClasesManagementFacade → ClaseQueryService
   */
  async listarRutasCurriculares() {
    return this.managementFacade.listarRutasCurriculares();
  }

  /**
   * Obtener detalles de una ruta curricular específica
   * DELEGACIÓN: ClasesManagementFacade → ClaseQueryService
   */
  async obtenerRutaCurricularPorId(id: string) {
    return this.managementFacade.obtenerRutaCurricularPorId(id);
  }

  /**
   * Asignar estudiantes a una clase (solo Admin)
   * DELEGACIÓN: ClasesManagementFacade → ClaseCommandService
   */
  async asignarEstudiantesAClase(claseId: string, estudianteIds: string[]) {
    return this.managementFacade.asignarEstudiantesAClase(
      claseId,
      estudianteIds,
    );
  }

  /**
   * Obtener estudiantes inscritos en una clase
   * DELEGACIÓN: ClasesManagementFacade → ClaseQueryService
   */
  async obtenerEstudiantesDeClase(claseId: string) {
    return this.managementFacade.obtenerEstudiantesDeClase(claseId);
  }

  // ============================================================================
  // RESERVAS (delegación a ClasesReservasService)
  // ============================================================================

  /**
   * Reservar un cupo en una clase (Tutor reserva para su estudiante)
   * DELEGACIÓN: ClasesReservasService
   */
  async reservarClase(claseId: string, tutorId: string, dto: ReservarClaseDto) {
    return this.reservasService.reservarClase(claseId, tutorId, dto);
  }

  /**
   * Cancelar una reserva (Tutor cancela inscripción de su estudiante)
   * DELEGACIÓN: ClasesReservasService
   */
  async cancelarReserva(inscripcionId: string, tutorId: string) {
    return this.reservasService.cancelarReserva(inscripcionId, tutorId);
  }

  // ============================================================================
  // ASISTENCIA (delegación a ClasesAsistenciaService)
  // ============================================================================

  /**
   * Registrar asistencia (Docente registra después de la clase)
   * DELEGACIÓN: ClasesAsistenciaService
   */
  async registrarAsistencia(
    claseId: string,
    docenteId: string,
    dto: RegistrarAsistenciaDto,
  ) {
    return this.asistenciaService.registrarAsistencia(claseId, docenteId, dto);
  }
}
