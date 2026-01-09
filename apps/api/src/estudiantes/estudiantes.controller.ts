import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ParseIdPipe } from '../common/pipes';
import { EstudiantesFacadeService } from './estudiantes-facade.service';
import { AccesoEstudianteService } from './services/acceso-estudiante.service';
import { EstudianteAulaService } from './services/estudiante-aula.service';
import { ActivityFeedService } from './services/activity-feed.service';
import { TipoActividadFeed } from '@prisma/client';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { QueryEstudiantesDto } from './dto/query-estudiantes.dto';
import { CrearEstudiantesConTutorDto } from './dto/crear-estudiantes-con-tutor.dto';
import {
  AsignarClasesDto,
  CopiarEstudianteDto,
  BuscarEstudiantePorEmailDto,
} from './dto/asignar-clases.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { EstudianteOwnershipGuard } from './guards/estudiante-ownership.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthUser, RequestWithAuthUser } from '../auth/interfaces';

/**
 * Controller para endpoints de estudiantes
 * Define las rutas HTTP para operaciones CRUD
 * Todas las rutas requieren autenticación JWT
 */
@Controller('estudiantes')
@UseGuards(JwtAuthGuard)
export class EstudiantesController {
  constructor(
    private readonly estudiantesService: EstudiantesFacadeService,
    private readonly accesoService: AccesoEstudianteService,
    private readonly aulaService: EstudianteAulaService,
    private readonly feedService: ActivityFeedService,
  ) {}

  /**
   * POST /estudiantes - Crear nuevo estudiante
   * @param createDto - Datos del estudiante
   * @param user - Usuario autenticado (del JWT)
   * @returns Estudiante creado
   */
  @Post()
  async create(
    @Body() createDto: CreateEstudianteDto,
    @GetUser() user: AuthUser,
  ) {
    return this.estudiantesService.create(user.id, createDto);
  }

  /**
   * GET /estudiantes/admin/all - Listar TODOS los estudiantes (solo admin)
   * @returns Lista completa de estudiantes
   */
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async findAllForAdmin() {
    return this.estudiantesService.findAll();
  }

  /**
   * GET /estudiantes - Listar estudiantes del tutor autenticado
   * @param query - Filtros y paginación
   * @param user - Usuario autenticado
   * @returns Lista de estudiantes con metadata
   */
  @Get()
  async findAll(
    @Query() query: QueryEstudiantesDto,
    @GetUser() user: AuthUser,
  ) {
    return this.estudiantesService.findAllByTutor(user.id, query);
  }

  /**
   * GET /estudiantes/count - Contar estudiantes del tutor
   * @param user - Usuario autenticado
   * @returns Total de estudiantes
   */
  @Get('count')
  async count(@GetUser() user: AuthUser) {
    const count = await this.estudiantesService.countByTutor(user.id);
    return { count };
  }

  /**
   * GET /estudiantes/estadisticas - Estadísticas de estudiantes
   * @param user - Usuario autenticado
   * @returns Estadísticas agregadas
   */
  @Get('estadisticas')
  async getEstadisticas(@GetUser() user: AuthUser) {
    return this.estudiantesService.getEstadisticas(user.id);
  }

  /**
   * GET /estudiantes/mi-proxima-clase - Obtener próxima clase del estudiante logueado
   * @param req - Request con usuario autenticado
   * @returns Información de la próxima clase o null si no hay ninguna
   */
  @Get('mi-proxima-clase')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async obtenerMiProximaClase(@Request() req: RequestWithAuthUser) {
    const estudianteId = req.user.id;

    const resultado =
      await this.estudiantesService.obtenerProximaClase(estudianteId);

    return resultado;
  }

  /**
   * GET /estudiantes/mis-companeros - Obtener compañeros de ClaseGrupo del estudiante logueado
   * @param req - Request con usuario autenticado
   * @returns Lista de compañeros con puntos ordenados descendente
   */
  @Get('mis-companeros')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async obtenerMisCompaneros(@Request() req: RequestWithAuthUser) {
    const estudianteId = req.user.id;
    return this.estudiantesService.obtenerCompanerosDeClase(estudianteId);
  }

  /**
   * GET /estudiantes/mis-sectores - Obtener sectores en los que está inscrito el estudiante
   * Para el portal de estudiantes - sección "Tareas Asignadas"
   * Devuelve: Matemática, Programación, Ciencias (según inscripciones)
   * @param req - Request con usuario autenticado
   * @returns Array de sectores con grupos agrupados
   */
  @Get('mis-sectores')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async obtenerMisSectores(@Request() req: RequestWithAuthUser) {
    const estudianteId = req.user.id;
    return this.estudiantesService.obtenerMisSectores(estudianteId);
  }

  /**
   * GET /estudiantes/mis-clases - Obtener TODAS las clases del estudiante logueado
   * Para el portal de estudiantes - sección "Clases"
   * Incluye: docente, horario, link de videollamada (Google Meet/Zoom)
   * @param req - Request con usuario autenticado
   * @returns Array de clases ordenadas por próxima fecha
   */
  @Get('mis-clases')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async obtenerMisClases(@Request() req: RequestWithAuthUser) {
    const estudianteId = req.user.id;
    return this.estudiantesService.obtenerMisClases(estudianteId);
  }

  /**
   * GET /estudiantes/mi-plan - Obtener plan de suscripción del estudiante logueado
   * Para validar acceso a clases en vivo (solo STEAM_SINCRONICO)
   * @param req - Request con usuario autenticado
   * @returns Plan con información de acceso a clases en vivo
   */
  @Get('mi-plan')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async obtenerMiPlan(@Request() req: RequestWithAuthUser) {
    const estudianteId = req.user.id;
    return this.estudiantesService.obtenerMiPlan(estudianteId);
  }

  /**
   * GET /estudiantes/verificar-acceso - Verificar acceso del estudiante logueado
   * Determina si el estudiante puede acceder a la plataforma
   * basado en: plan directo, suscripción del tutor, comisión activa, o override
   * @param req - Request con usuario autenticado
   * @returns ResultadoAccesoEstudiante con permisos y detalles
   */
  @Get('verificar-acceso')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async verificarAcceso(@Request() req: RequestWithAuthUser) {
    const estudianteId = req.user.id;
    return this.accesoService.verificarAccesoEstudiante(estudianteId);
  }

  /**
   * GET /estudiantes/puede-entrar-clase - Verificar si puede entrar a una clase
   * Valida permisos para entrar a una clase específica (grupo o comisión)
   * @param req - Request con usuario autenticado
   * @param claseGrupoId - ID de la clase de grupo (opcional)
   * @param comisionId - ID de la comisión (opcional)
   * @returns ResultadoEntrarClase con permiso y motivo
   */
  @Get('puede-entrar-clase')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async puedeEntrarClase(
    @Request() req: RequestWithAuthUser,
    @Query('claseGrupoId') claseGrupoId?: string,
    @Query('comisionId') comisionId?: string,
  ) {
    const estudianteId = req.user.id;

    // Validar que se proporcione exactamente uno de los IDs
    if (!claseGrupoId && !comisionId) {
      throw new BadRequestException(
        'Debe proporcionar claseGrupoId o comisionId',
      );
    }
    if (claseGrupoId && comisionId) {
      throw new BadRequestException(
        'Solo uno de claseGrupoId o comisionId debe ser proporcionado',
      );
    }

    return this.accesoService.puedeEntrarAClase(
      estudianteId,
      claseGrupoId,
      comisionId,
    );
  }

  // ==================== ENDPOINTS DEL AULA VIRTUAL ====================

  /**
   * GET /estudiantes/mi-aula - Obtener resumen del aula virtual del estudiante
   * Incluye planificaciones activas de todos sus grupos con progreso
   * @param req - Request con usuario autenticado
   * @returns Resumen del aula con sectores, planificaciones y progreso
   */
  @Get('mi-aula')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async obtenerMiAula(@Request() req: RequestWithAuthUser) {
    const estudianteId = req.user.id;
    return this.aulaService.getMiAula(estudianteId);
  }

  /**
   * GET /estudiantes/aula/planificacion/:asignacionId - Obtener detalle de planificación
   * Solo muestra clases y contenido que el docente ha activado
   * @param req - Request con usuario autenticado
   * @param asignacionId - ID de la asignación de planificación
   * @returns Detalle de la planificación con clases activadas
   */
  @Get('aula/planificacion/:asignacionId')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async obtenerPlanificacionDetalle(
    @Request() req: RequestWithAuthUser,
    @Param('asignacionId', ParseIdPipe) asignacionId: string,
  ) {
    const estudianteId = req.user.id;
    return this.aulaService.getPlanificacionDetalle(estudianteId, asignacionId);
  }

  /**
   * GET /estudiantes/aula/contenido/:asignacionId/:claseId/:tipo - Obtener contenido de lección
   * @param req - Request con usuario autenticado
   * @param asignacionId - ID de la asignación
   * @param claseId - ID de la clase
   * @param tipo - 'teoria' o 'practica'
   * @returns Contenido completo con nodos
   */
  @Get('aula/contenido/:asignacionId/:claseId/:tipo')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async obtenerContenidoClase(
    @Request() req: RequestWithAuthUser,
    @Param('asignacionId', ParseIdPipe) asignacionId: string,
    @Param('claseId', ParseIdPipe) claseId: string,
    @Param('tipo') tipo: 'teoria' | 'practica',
  ) {
    const estudianteId = req.user.id;

    if (tipo !== 'teoria' && tipo !== 'practica') {
      throw new BadRequestException('Tipo debe ser "teoria" o "practica"');
    }

    return this.aulaService.getContenidoClase(
      estudianteId,
      asignacionId,
      claseId,
      tipo,
    );
  }

  /**
   * POST /estudiantes/aula/completar-leccion - Marcar lección como completada
   * @param req - Request con usuario autenticado
   * @param body - Datos de la lección completada
   * @returns Resultado con XP ganado
   */
  @Post('aula/completar-leccion')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async completarLeccion(
    @Request() req: RequestWithAuthUser,
    @Body()
    body: {
      asignacionId: string;
      claseId: string;
      tipo: 'teoria' | 'practica';
      tiempoSegundos: number;
    },
  ) {
    const estudianteId = req.user.id;

    if (body.tipo !== 'teoria' && body.tipo !== 'practica') {
      throw new BadRequestException('Tipo debe ser "teoria" o "practica"');
    }

    return this.aulaService.completarLeccion(
      estudianteId,
      body.asignacionId,
      body.claseId,
      body.tipo,
      body.tiempoSegundos,
    );
  }

  /**
   * GET /estudiantes/mis-tareas - Obtener tareas asignadas al estudiante
   * @param req - Request con usuario autenticado
   * @param filtro - 'todas', 'pendientes', 'completadas' (default: 'todas')
   * @returns Lista de tareas con progreso
   */
  @Get('mis-tareas')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async obtenerMisTareas(
    @Request() req: RequestWithAuthUser,
    @Query('filtro') filtro?: 'todas' | 'pendientes' | 'completadas',
  ) {
    const estudianteId = req.user.id;
    return this.aulaService.getMisTareas(estudianteId, filtro || 'todas');
  }

  /**
   * POST /estudiantes/tareas/:tareaAsignadaId/iniciar - Iniciar una tarea
   * @param req - Request con usuario autenticado
   * @param tareaAsignadaId - ID de la tarea asignada
   * @returns Contenido de la tarea y progreso
   */
  @Post('tareas/:tareaAsignadaId/iniciar')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async iniciarTarea(
    @Request() req: RequestWithAuthUser,
    @Param('tareaAsignadaId', ParseIdPipe) tareaAsignadaId: string,
  ) {
    const estudianteId = req.user.id;
    return this.aulaService.iniciarTarea(estudianteId, tareaAsignadaId);
  }

  /**
   * POST /estudiantes/tareas/:tareaAsignadaId/completar - Completar una tarea
   * @param req - Request con usuario autenticado
   * @param tareaAsignadaId - ID de la tarea asignada
   * @param body - Tiempo dedicado y calificación opcional
   * @returns Resultado con XP ganado
   */
  @Post('tareas/:tareaAsignadaId/completar')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async completarTarea(
    @Request() req: RequestWithAuthUser,
    @Param('tareaAsignadaId', ParseIdPipe) tareaAsignadaId: string,
    @Body() body: { tiempoSegundos: number; calificacion?: number },
  ) {
    const estudianteId = req.user.id;
    return this.aulaService.completarTarea(
      estudianteId,
      tareaAsignadaId,
      body.tiempoSegundos,
      body.calificacion,
    );
  }

  /**
   * GET /estudiantes/aula/leaderboard/:asignacionId - Obtener leaderboard de una planificación
   * Muestra ranking de compañeros del mismo grupo ordenado por progreso
   * @param req - Request con usuario autenticado
   * @param asignacionId - ID de la asignación de planificación
   * @returns Leaderboard con posiciones y progreso de cada estudiante
   */
  @Get('aula/leaderboard/:asignacionId')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async obtenerLeaderboard(
    @Request() req: RequestWithAuthUser,
    @Param('asignacionId', ParseIdPipe) asignacionId: string,
  ) {
    const estudianteId = req.user.id;
    return this.aulaService.getLeaderboard(estudianteId, asignacionId);
  }

  // ==================== FIN ENDPOINTS DEL AULA VIRTUAL ====================

  // ==================== ENDPOINTS DE ACTIVITY FEED ====================

  /**
   * GET /estudiantes/feed - Obtener activity feed de estudiantes
   * Muestra logros, completados y actividades para motivación social
   * @param casaId - Filtrar por casa (opcional)
   * @param tipo - Filtrar por tipo de actividad (opcional)
   * @param page - Página (default: 1)
   * @param limit - Items por página (default: 20, max: 50)
   * @returns Feed de actividades con reacciones agrupadas
   */
  @Get('feed')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async getFeed(
    @Query('casaId') casaId?: string,
    @Query('tipo') tipo?: TipoActividadFeed,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.feedService.getFeed({
      casaId,
      tipo,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  /**
   * GET /estudiantes/feed/mi-casa - Obtener feed de la casa del estudiante logueado
   * Muestra solo actividades de compañeros de casa
   * @param req - Request con usuario autenticado
   * @param limit - Items a mostrar (default: 10)
   * @returns Feed de actividades de la casa
   */
  @Get('feed/mi-casa')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async getFeedMiCasa(
    @Request() req: RequestWithAuthUser,
    @Query('limit') limit?: string,
  ) {
    const estudianteId = req.user.id;
    // Obtener la casa del estudiante
    const estudiante = await this.estudiantesService.findOneById(estudianteId);
    if (!estudiante.casaId) {
      return {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0, hasMore: false },
      };
    }
    return this.feedService.getFeedByCasa(
      estudiante.casaId,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  /**
   * GET /estudiantes/feed/mi-comision - Obtener feed de compañeros de comisión (ClaseGrupo)
   * Muestra actividades de estudiantes inscriptos en las mismas clases grupales
   * @param req - Request con usuario autenticado
   * @param limit - Items a mostrar (default: 10)
   * @returns Feed de actividades de compañeros de comisión
   */
  @Get('feed/mi-comision')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async getFeedMiComision(
    @Request() req: RequestWithAuthUser,
    @Query('limit') limit?: string,
  ) {
    const estudianteId = req.user.id;

    // Obtener compañeros de las mismas clases grupales
    const companeros =
      await this.estudiantesService.obtenerCompanerosDeClase(estudianteId);

    // Incluir al propio estudiante + compañeros
    const estudianteIds = [estudianteId, ...companeros.map((c) => c.id)];

    return this.feedService.getFeedByEstudiantes(
      estudianteIds,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  /**
   * GET /estudiantes/feed/mis-actividades - Obtener actividades del estudiante logueado
   * @param req - Request con usuario autenticado
   * @param limit - Items a mostrar (default: 10)
   * @returns Feed de actividades propias
   */
  @Get('feed/mis-actividades')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async getMisActividades(
    @Request() req: RequestWithAuthUser,
    @Query('limit') limit?: string,
  ) {
    const estudianteId = req.user.id;
    return this.feedService.getFeedByEstudiante(
      estudianteId,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  /**
   * POST /estudiantes/feed/:actividadId/reaccion - Agregar reacción a actividad
   * @param req - Request con usuario autenticado
   * @param actividadId - ID de la actividad
   * @param body - { emoji: string }
   * @returns Reacción creada
   */
  @Post('feed/:actividadId/reaccion')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async addReaction(
    @Request() req: RequestWithAuthUser,
    @Param('actividadId', ParseIdPipe) actividadId: string,
    @Body() body: { emoji: string },
  ) {
    const estudianteId = req.user.id;
    return this.feedService.addReaction(actividadId, estudianteId, body.emoji);
  }

  /**
   * DELETE /estudiantes/feed/:actividadId/reaccion - Eliminar reacción de actividad
   * @param req - Request con usuario autenticado
   * @param actividadId - ID de la actividad
   * @param emoji - Emoji a eliminar
   * @returns Resultado de eliminación
   */
  @Delete('feed/:actividadId/reaccion')
  @UseGuards(RolesGuard)
  @Roles(Role.ESTUDIANTE)
  async removeReaction(
    @Request() req: RequestWithAuthUser,
    @Param('actividadId', ParseIdPipe) actividadId: string,
    @Query('emoji') emoji: string,
  ) {
    const estudianteId = req.user.id;
    return this.feedService.removeReaction(actividadId, estudianteId, emoji);
  }

  // ==================== FIN ENDPOINTS DE ACTIVITY FEED ====================

  /**
   * GET /estudiantes/:id/detalle-completo - Obtener detalle COMPLETO del estudiante
   * Para el portal de tutores - pestaña "Mis Hijos"
   * Incluye: gamificación, asistencias, inscripciones, estadísticas
   * @param id - ID del estudiante
   * @param user - Usuario autenticado (tutor)
   * @returns Detalle completo del estudiante con todas sus métricas
   */
  @Get(':id/detalle-completo')
  @UseGuards(EstudianteOwnershipGuard)
  async getDetalleCompleto(
    @Param('id', ParseIdPipe) id: string,
    @GetUser() user: AuthUser,
  ) {
    return this.estudiantesService.getDetalleCompleto(id, user.id);
  }

  /**
   * GET /estudiantes/:id - Obtener un estudiante específico
   * Verifica ownership del estudiante
   * @param id - ID del estudiante
   * @param user - Usuario autenticado
   * @returns Estudiante con sus relaciones
   */
  @Get(':id')
  @UseGuards(EstudianteOwnershipGuard)
  async findOne(
    @Param('id', ParseIdPipe) id: string,
    @GetUser() user: AuthUser,
  ) {
    return this.estudiantesService.findOne(id, user.id);
  }

  /**
   * PATCH /estudiantes/:id - Actualizar estudiante
   * Verifica ownership del estudiante
   * @param id - ID del estudiante
   * @param updateDto - Datos a actualizar
   * @param user - Usuario autenticado
   * @returns Estudiante actualizado
   */
  @Patch(':id')
  @UseGuards(EstudianteOwnershipGuard)
  async update(
    @Param('id', ParseIdPipe) id: string,
    @Body() updateDto: UpdateEstudianteDto,
    @GetUser() user: AuthUser,
  ) {
    return this.estudiantesService.update(id, user.id, updateDto);
  }

  /**
   * PATCH /estudiantes/:id/avatar - Actualizar avatar del estudiante
   *
   * SECURITY FIX (2025-10-18):
   * - Agregado EstudianteOwnershipGuard para prevenir modificación no autorizada
   * - Solo el tutor dueño del estudiante puede actualizar el avatar
   * - Previene CVE-INTERNAL-001: Unauthorized avatar modification
   *
   * @param id - ID del estudiante
   * @param body - { avatarUrl: string }
   * @param user - Usuario autenticado (inyectado por JwtAuthGuard, usado por EstudianteOwnershipGuard)
   * @returns Estudiante actualizado con nuevo avatar
   * @throws {ForbiddenException} Si el tutor no es dueño del estudiante
   * @throws {NotFoundException} Si el estudiante no existe
   */
  @Patch(':id/avatar')
  @UseGuards(EstudianteOwnershipGuard)
  async updateAvatar(
    @Param('id', ParseIdPipe) id: string,
    @Body() body: { avatar_gradient: number },
    @GetUser() _user: AuthUser,
  ) {
    // Nota: No necesitamos usar '_user' aquí porque el guard ya validó ownership
    // El guard se ejecuta ANTES de este método y rechaza requests no autorizados
    return this.estudiantesService.updateAvatarGradient(
      id,
      body.avatar_gradient,
    );
  }

  /**
   * DELETE /estudiantes/:id - Eliminar estudiante
   * Verifica ownership del estudiante
   * @param id - ID del estudiante
   * @param user - Usuario autenticado
   * @returns Mensaje de confirmación
   */
  @Delete(':id')
  @UseGuards(EstudianteOwnershipGuard)
  async remove(
    @Param('id', ParseIdPipe) id: string,
    @GetUser() user: AuthUser,
  ) {
    await this.estudiantesService.remove(id, user.id);
    return {
      message: 'Estudiante eliminado exitosamente',
    };
  }

  /**
   * POST /estudiantes/crear-con-tutor - Crear estudiantes con tutor en un sector (Admin)
   * @param dto - Datos de estudiantes y tutor
   * @returns Estudiantes creados con credenciales generadas
   */
  @Post('crear-con-tutor')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async crearConTutor(@Body() dto: CrearEstudiantesConTutorDto) {
    return this.estudiantesService.crearEstudiantesConTutor(dto);
  }

  /**
   * PATCH /estudiantes/:id/copiar-a-sector - Copiar estudiante a otro sector (Admin)
   * @param id - ID del estudiante
   * @param dto - ID del sector destino
   * @returns Estudiante con sector actualizado
   */
  @Patch(':id/copiar-a-sector')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async copiarASector(
    @Param('id', ParseIdPipe) id: string,
    @Body() dto: CopiarEstudianteDto,
  ) {
    return this.estudiantesService.copiarEstudianteASector(id, dto.sectorId);
  }

  /**
   * POST /estudiantes/copiar-por-email - Buscar estudiante por email y copiarlo a sector (Admin)
   * @param body - Email del estudiante y sector destino
   * @returns Estudiante con sector actualizado
   */
  @Post('copiar-por-email')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async copiarPorEmail(
    @Body() body: BuscarEstudiantePorEmailDto & { sectorId: string },
  ) {
    return this.estudiantesService.copiarEstudiantePorDNIASector(
      body.email,
      body.sectorId,
    );
  }

  /**
   * POST /estudiantes/:id/asignar-clases - Asignar clases a estudiante (Admin)
   * @param id - ID del estudiante
   * @param dto - IDs de las clases
   * @returns Inscripciones creadas
   */
  @Post(':id/asignar-clases')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async asignarClases(
    @Param('id', ParseIdPipe) id: string,
    @Body() dto: AsignarClasesDto,
  ) {
    const primeraClaseId = dto.clasesIds[0];
    if (dto.clasesIds.length === 1 && primeraClaseId) {
      return [
        await this.estudiantesService.asignarClaseAEstudiante(
          id,
          primeraClaseId,
        ),
      ];
    }
    return this.estudiantesService.asignarClasesAEstudiante(id, dto.clasesIds);
  }

  /**
   * GET /estudiantes/:id/clases-disponibles - Obtener clases disponibles para estudiante (Admin)
   * @param id - ID del estudiante
   * @returns Clases del sector con cupos disponibles
   */
  @Get(':id/clases-disponibles')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async obtenerClasesDisponibles(@Param('id', ParseIdPipe) id: string) {
    return this.estudiantesService.obtenerClasesDisponiblesParaEstudiante(id);
  }
}
