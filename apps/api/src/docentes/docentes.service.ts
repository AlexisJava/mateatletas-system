import { Injectable } from '@nestjs/common';
import { DocentesFacade } from './services/docentes-facade.service';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';

/**
 * FACADE SERVICE para el módulo Docentes
 *
 * Este servicio actúa como una fachada que delega toda la lógica
 * a servicios especializados, eliminando duplicación de código.
 *
 * Servicios especializados:
 * - DocenteQueryService: Queries (4 métodos)
 * - DocenteCommandService: Commands (4 métodos)
 * - DocenteStatsService: Statistics (2 métodos)
 * - DocenteBusinessValidator: Validaciones de negocio (5 métodos)
 *
 * Patrón: FACADE + CQRS
 * Beneficio: Separación de responsabilidades, código más mantenible
 * Reducción: 927 líneas → ~120 líneas (87% reducción)
 */
@Injectable()
export class DocentesService {
  constructor(private facade: DocentesFacade) {}

  // ============================================================================
  // COMMANDS (Escritura) - Delegación a Facade → CommandService
  // ============================================================================

  /**
   * Crea un nuevo docente
   * @param createDto - Datos del docente a crear
   * @returns Docente creado (sin password_hash) + generatedPassword si se auto-generó
   */
  async create(createDto: CreateDocenteDto) {
    return this.facade.create(createDto);
  }

  /**
   * Actualiza un docente existente
   * @param id - ID del docente
   * @param updateDto - Datos a actualizar
   * @returns Docente actualizado sin password_hash
   */
  async update(id: string, updateDto: UpdateDocenteDto) {
    return this.facade.update(id, updateDto);
  }

  /**
   * Elimina un docente
   * @param id - ID del docente
   * @returns Mensaje de confirmación
   */
  async remove(id: string) {
    return this.facade.remove(id);
  }

  /**
   * Reasigna todas las clases de un docente a otro
   * @param fromDocenteId - ID del docente actual
   * @param toDocenteId - ID del nuevo docente
   * @returns Resultado de la reasignación
   */
  async reasignarClases(fromDocenteId: string, toDocenteId: string) {
    return this.facade.reasignarClases(fromDocenteId, toDocenteId);
  }

  // ============================================================================
  // QUERIES (Lectura) - Delegación a Facade → QueryService
  // ============================================================================

  /**
   * Lista todos los docentes con paginación
   * @param page - Número de página (default: 1)
   * @param limit - Registros por página (default: 20)
   * @returns Lista paginada de docentes sin password_hash
   */
  async findAll(page?: number, limit?: number) {
    return this.facade.findAll(page, limit);
  }

  /**
   * Busca un docente por email (usado para autenticación)
   * IMPORTANTE: Este método SÍ retorna password_hash para verificación
   * @param email - Email del docente
   * @returns Docente con password_hash incluido, o null si no existe
   */
  async findByEmail(email: string) {
    return this.facade.findByEmail(email);
  }

  /**
   * Busca un docente por ID
   * @param id - ID del docente
   * @returns Docente sin password_hash, incluye sectores únicos
   */
  async findById(id: string) {
    return this.facade.findById(id);
  }

  // ============================================================================
  // STATISTICS (Estadísticas) - Delegación a Facade → StatsService
  // ============================================================================

  /**
   * Obtiene el dashboard del docente con datos accionables
   * @param docenteId - ID del docente
   * @returns Dashboard con clase inminente, alertas y estadísticas
   */
  async getDashboard(docenteId: string) {
    return this.facade.getDashboard(docenteId);
  }

  /**
   * Obtiene estadísticas COMPLETAS del docente para la página de Observaciones
   * @param docenteId - ID del docente
   * @returns Estadísticas detalladas (top estudiantes, asistencia, ranking)
   */
  async getEstadisticasCompletas(docenteId: string) {
    return this.facade.getEstadisticasCompletas(docenteId);
  }

  /**
   * Obtiene las clases del mes para el calendario del docente
   * @param docenteId - ID del docente
   * @param mes - Mes (1-12)
   * @param anio - Año (ej: 2025)
   * @returns Clases del mes con stats
   */
  async getClasesDelMes(docenteId: string, mes: number, anio: number) {
    return this.facade.getClasesDelMes(docenteId, mes, anio);
  }
}
