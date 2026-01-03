import { Injectable } from '@nestjs/common';
import { DocenteQueryService } from './docente-query.service';
import { DocenteCommandService } from './docente-command.service';
import { DocenteStatsService } from './docente-stats.service';
import { CreateDocenteDto } from '../dto/create-docente.dto';
import { UpdateDocenteDto } from '../dto/update-docente.dto';

/**
 * Facade Service para el módulo Docentes
 *
 * Unifica las operaciones de Query, Command y Stats.
 * Proporciona una API simplificada para el controlador.
 *
 * Patrón: FACADE + CQRS
 * Beneficio: Separación de responsabilidades manteniendo API simple
 */
@Injectable()
export class DocentesFacade {
  constructor(
    private queryService: DocenteQueryService,
    private commandService: DocenteCommandService,
    private statsService: DocenteStatsService,
  ) {}

  // ============================================================================
  // COMMANDS (Escritura) - Delegación a CommandService
  // ============================================================================

  /**
   * Crea un nuevo docente
   * @param createDto - Datos del docente a crear
   * @returns Docente creado (sin password_hash) + generatedPassword si se auto-generó
   */
  async create(createDto: CreateDocenteDto) {
    return this.commandService.create(createDto);
  }

  /**
   * Actualiza un docente existente
   * @param id - ID del docente
   * @param updateDto - Datos a actualizar
   * @returns Docente actualizado sin password_hash
   */
  async update(id: string, updateDto: UpdateDocenteDto) {
    return this.commandService.update(id, updateDto);
  }

  /**
   * Elimina un docente
   * @param id - ID del docente
   * @returns Mensaje de confirmación
   */
  async remove(id: string) {
    return this.commandService.remove(id);
  }

  /**
   * Reasigna todas las clases de un docente a otro
   * @param fromDocenteId - ID del docente actual
   * @param toDocenteId - ID del nuevo docente
   * @returns Resultado de la reasignación
   */
  async reasignarClases(fromDocenteId: string, toDocenteId: string) {
    return this.commandService.reasignarClases(fromDocenteId, toDocenteId);
  }

  // ============================================================================
  // QUERIES (Lectura) - Delegación a QueryService
  // ============================================================================

  /**
   * Lista todos los docentes con paginación
   * @param page - Número de página (default: 1)
   * @param limit - Registros por página (default: 20)
   * @returns Lista paginada de docentes sin password_hash
   */
  async findAll(page?: number, limit?: number) {
    return this.queryService.findAll(page, limit);
  }

  /**
   * Busca un docente por email (usado para autenticación)
   * IMPORTANTE: Este método SÍ retorna password_hash para verificación
   * @param email - Email del docente
   * @returns Docente con password_hash incluido, o null si no existe
   */
  async findByEmail(email: string) {
    return this.queryService.findByEmail(email);
  }

  /**
   * Busca un docente por ID
   * @param id - ID del docente
   * @returns Docente sin password_hash, incluye sectores únicos
   */
  async findById(id: string) {
    return this.queryService.findById(id);
  }

  // ============================================================================
  // STATISTICS (Estadísticas) - Delegación a StatsService
  // ============================================================================

  /**
   * Obtiene el dashboard del docente con datos accionables
   * @param docenteId - ID del docente
   * @returns Dashboard con clase inminente, alertas y estadísticas
   */
  async getDashboard(docenteId: string) {
    return this.statsService.getDashboard(docenteId);
  }

  /**
   * Obtiene estadísticas COMPLETAS del docente para la página de Observaciones
   * @param docenteId - ID del docente
   * @returns Estadísticas detalladas (top estudiantes, asistencia, ranking)
   */
  async getEstadisticasCompletas(docenteId: string) {
    return this.statsService.getEstadisticasCompletas(docenteId);
  }

  /**
   * Obtiene las clases del mes para el calendario del docente
   * @param docenteId - ID del docente
   * @param mes - Mes (1-12)
   * @param anio - Año (ej: 2025)
   * @returns Clases del mes con stats
   */
  async getClasesDelMes(docenteId: string, mes: number, anio: number) {
    return this.statsService.getClasesDelMes(docenteId, mes, anio);
  }

  /**
   * Obtiene el detalle de una comisión específica con sus estudiantes
   * @param comisionId - ID de la comisión
   * @param docenteId - ID del docente (para verificar ownership)
   * @returns Detalle de la comisión con lista de estudiantes
   */
  async getComisionDetalle(comisionId: string, docenteId: string) {
    return this.statsService.getComisionDetalle(comisionId, docenteId);
  }
}
