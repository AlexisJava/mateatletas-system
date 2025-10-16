import { Injectable } from '@nestjs/common';
import { ClasesManagementService } from './services/clases-management.service';
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
 * - ClasesManagementService: CRUD de clases (programar, cancelar, listar, obtener)
 * - ClasesReservasService: Reservas (reservar, cancelar reservas)
 * - ClasesAsistenciaService: Asistencia (registrar asistencia)
 *
 * Patrón: FACADE
 * Beneficio: Separación de responsabilidades, código más mantenible
 * Reducción: 683 líneas → ~150 líneas (78% reducción)
 */
@Injectable()
export class ClasesService {
  constructor(
    private managementService: ClasesManagementService,
    private reservasService: ClasesReservasService,
    private asistenciaService: ClasesAsistenciaService,
  ) {}

  // ============================================================================
  // GESTIÓN DE CLASES (delegación a ClasesManagementService)
  // ============================================================================

  /**
   * Programar una nueva clase (solo Admin)
   * DELEGACIÓN: ClasesManagementService
   */
  async programarClase(dto: CrearClaseDto) {
    return this.managementService.programarClase(dto);
  }

  /**
   * Cancelar una clase (Admin o Docente de la clase)
   * DELEGACIÓN: ClasesManagementService
   */
  async cancelarClase(id: string, userId?: string, userRole?: string) {
    return this.managementService.cancelarClase(id, userId, userRole);
  }

  /**
   * Listar todas las clases (Admin) con paginación
   * DELEGACIÓN: ClasesManagementService
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
    return this.managementService.listarTodasLasClases(filtros, page, limit);
  }

  /**
   * Listar clases disponibles para tutores
   * DELEGACIÓN: ClasesManagementService
   */
  async listarClasesParaTutor(tutorId: string) {
    return this.managementService.listarClasesParaTutor(tutorId);
  }

  /**
   * Obtener calendario de clases para un tutor (filtrado por mes/año)
   * DELEGACIÓN: ClasesManagementService
   */
  async obtenerCalendarioTutor(
    tutorId: string,
    mes?: number,
    anio?: number,
  ) {
    return this.managementService.obtenerCalendarioTutor(tutorId, mes, anio);
  }

  /**
   * Listar clases de un docente
   * DELEGACIÓN: ClasesManagementService
   */
  async listarClasesDeDocente(docenteId: string, incluirPasadas = false) {
    return this.managementService.listarClasesDeDocente(
      docenteId,
      incluirPasadas,
    );
  }

  /**
   * Obtener detalles de una clase específica
   * DELEGACIÓN: ClasesManagementService
   */
  async obtenerClase(id: string) {
    return this.managementService.obtenerClase(id);
  }

  /**
   * Obtener rutas curriculares (para formularios)
   * DELEGACIÓN: ClasesManagementService
   */
  async listarRutasCurriculares() {
    return this.managementService.listarRutasCurriculares();
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
