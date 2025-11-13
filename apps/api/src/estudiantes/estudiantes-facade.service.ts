import { Injectable } from '@nestjs/common';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { QueryEstudiantesDto } from './dto/query-estudiantes.dto';
import { CrearEstudiantesConTutorDto } from './dto/crear-estudiantes-con-tutor.dto';
import { EstudianteQueryService } from './services/estudiante-query.service';
import { EstudianteCommandService } from './services/estudiante-command.service';
import { EstudianteCopyService } from './services/estudiante-copy.service';
import { EstudianteStatsService } from './services/estudiante-stats.service';

/**
 * Facade Service que orquesta todas las operaciones de estudiantes
 * Responsabilidad: API pública del módulo, delega a servicios especializados
 *
 * PATRON FACADE:
 * - Mantiene API externa idéntica (0 breaking changes)
 * - Delega a servicios especializados según patrón CQRS
 * - Simplifica el uso del módulo desde controllers
 */
@Injectable()
export class EstudiantesFacadeService {
  constructor(
    private queryService: EstudianteQueryService,
    private commandService: EstudianteCommandService,
    private copyService: EstudianteCopyService,
    private statsService: EstudianteStatsService,
  ) {}

  // ==================== QUERIES (Delegadas a QueryService) ====================

  /**
   * Obtiene todos los estudiantes de un tutor con filtros y paginación
   */
  async findAllByTutor(tutorId: string, query?: QueryEstudiantesDto) {
    return this.queryService.findAllByTutor(tutorId, query);
  }

  /**
   * Busca un estudiante por ID sin validación de ownership
   */
  async findOneById(id: string) {
    return this.queryService.findOneById(id);
  }

  /**
   * Obtiene un estudiante específico verificando ownership
   */
  async findOne(id: string, tutorId: string) {
    return this.queryService.findOne(id, tutorId);
  }

  /**
   * Obtiene TODOS los estudiantes (solo para admin)
   */
  async findAll(page: number = 1, limit: number = 50) {
    return this.queryService.findAll(page, limit);
  }

  /**
   * Cuenta el total de estudiantes de un tutor
   */
  async countByTutor(tutorId: string): Promise<number> {
    return this.queryService.countByTutor(tutorId);
  }

  /**
   * Obtiene el detalle COMPLETO de un estudiante
   */
  async getDetalleCompleto(estudianteId: string, tutorId: string) {
    return this.queryService.getDetalleCompleto(estudianteId, tutorId);
  }

  /**
   * Obtiene clases disponibles para un estudiante
   */
  async obtenerClasesDisponiblesParaEstudiante(estudianteId: string) {
    return this.queryService.obtenerClasesDisponiblesParaEstudiante(estudianteId);
  }

  /**
   * Obtener la próxima clase del estudiante
   */
  async obtenerProximaClase(estudianteId: string) {
    return this.queryService.obtenerProximaClase(estudianteId);
  }

  /**
   * Obtener compañeros de ClaseGrupo del estudiante
   */
  async obtenerCompanerosDeClase(estudianteId: string) {
    return this.queryService.obtenerCompanerosDeClase(estudianteId);
  }

  /**
   * Obtener los sectores en los que está inscrito el estudiante
   */
  async obtenerMisSectores(estudianteId: string) {
    return this.queryService.obtenerMisSectores(estudianteId);
  }

  // ==================== COMMANDS (Delegadas a CommandService) ====================

  /**
   * Crea un nuevo estudiante asociado a un tutor
   */
  async create(tutorId: string, createDto: CreateEstudianteDto) {
    return this.commandService.create(tutorId, createDto);
  }

  /**
   * Actualiza un estudiante existente
   */
  async update(id: string, tutorId: string, updateDto: UpdateEstudianteDto) {
    return this.commandService.update(id, tutorId, updateDto);
  }

  /**
   * Elimina un estudiante
   */
  async remove(id: string, tutorId: string) {
    return this.commandService.remove(id, tutorId);
  }

  /**
   * Actualiza la URL de animación idle del estudiante
   */
  async updateAnimacionIdle(id: string, animacion_idle_url: string) {
    return this.commandService.updateAnimacionIdle(id, animacion_idle_url);
  }

  /**
   * Actualiza el gradient de avatar del estudiante
   */
  async updateAvatarGradient(id: string, gradientId: number) {
    return this.commandService.updateAvatarGradient(id, gradientId);
  }

  /**
   * Actualiza el avatar 3D del estudiante
   */
  async updateAvatar3D(id: string, avatarUrl: string) {
    return this.commandService.updateAvatar3D(id, avatarUrl);
  }

  /**
   * TDD: Crear uno o múltiples estudiantes con tutor en un sector
   */
  async crearEstudiantesConTutor(dto: CrearEstudiantesConTutorDto) {
    return this.commandService.crearEstudiantesConTutor(dto);
  }

  /**
   * TDD: Asignar una clase a un estudiante
   */
  async asignarClaseAEstudiante(estudianteId: string, claseId: string) {
    return this.commandService.asignarClaseAEstudiante(estudianteId, claseId);
  }

  /**
   * TDD: Asignar múltiples clases a un estudiante
   */
  async asignarClasesAEstudiante(estudianteId: string, clasesIds: string[]) {
    return this.commandService.asignarClasesAEstudiante(estudianteId, clasesIds);
  }

  // ==================== COPY OPERATIONS (Delegadas a CopyService) ====================

  /**
   * TDD: Copiar estudiante existente a otro sector
   */
  async copiarEstudianteASector(estudianteId: string, nuevoSectorId: string) {
    return this.copyService.copiarEstudianteASector(estudianteId, nuevoSectorId);
  }

  /**
   * TDD: Buscar estudiante por email y copiarlo a otro sector
   */
  async copiarEstudiantePorDNIASector(email: string, nuevoSectorId: string) {
    return this.copyService.copiarEstudiantePorDNIASector(email, nuevoSectorId);
  }

  // ==================== STATISTICS (Delegadas a StatsService) ====================

  /**
   * Obtiene estadísticas agregadas de los estudiantes de un tutor
   */
  async getEstadisticas(tutorId: string) {
    return this.statsService.getEstadisticas(tutorId);
  }
}
