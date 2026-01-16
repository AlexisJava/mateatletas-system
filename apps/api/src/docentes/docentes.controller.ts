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
} from '@nestjs/common';
import { ParseIdPipe } from '../common/pipes';
import { DocentesService } from './docentes.service';
import { DocentePlanificacionesService } from './services/docente-planificaciones.service';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';
import { ReasignarClasesDto } from './dto/reasignar-clases.dto';
import { AsignarTareaDto } from './dto/asignar-tarea.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role, Roles } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/interfaces';

/**
 * Controller para endpoints de docentes
 * Define las rutas HTTP para operaciones CRUD
 * Incluye endpoints para Admin y para Docentes (self-service)
 */
@Controller('docentes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocentesController {
  constructor(
    private readonly docentesService: DocentesService,
    private readonly planificacionesService: DocentePlanificacionesService,
  ) {}

  /**
   * POST /docentes - Crear nuevo docente (Admin only)
   * @param createDto - Datos del docente
   * @returns Docente creado
   */
  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createDto: CreateDocenteDto) {
    return this.docentesService.create(createDto);
  }

  /**
   * GET /docentes - Listar todos los docentes (Admin only)
   * @returns Lista de docentes
   */
  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    return this.docentesService.findAll();
  }

  /**
   * GET /docentes/me/dashboard - Obtener dashboard del docente autenticado
   * DEBE ir ANTES de GET /docentes/me para evitar conflictos de rutas
   * @param user - Usuario autenticado (del JWT)
   * @returns Dashboard con clase inminente, alertas y stats
   */
  @Get('me/dashboard')
  @Roles(Role.DOCENTE)
  async getDashboard(@GetUser() user: AuthUser) {
    return this.docentesService.getDashboard(user.id);
  }

  /**
   * GET /docentes/me/estadisticas-completas - Obtener estadísticas detalladas
   * Para la página de Observaciones del portal docente
   * Incluye: top estudiantes por puntos, asistencia perfecta, faltas, ranking de grupos, etc.
   * @param user - Usuario autenticado (del JWT)
   * @returns Estadísticas completas y detalladas
   */
  @Get('me/estadisticas-completas')
  @Roles(Role.DOCENTE)
  async getEstadisticasCompletas(@GetUser() user: AuthUser) {
    return this.docentesService.getEstadisticasCompletas(user.id);
  }

  /**
   * GET /docentes/me/clases-del-mes - Obtener clases del mes para el calendario
   * @param user - Usuario autenticado (del JWT)
   * @param mes - Mes (1-12), por defecto mes actual
   * @param anio - Año (ej: 2025), por defecto año actual
   * @returns Clases del mes con stats
   */
  @Get('me/clases-del-mes')
  @Roles(Role.DOCENTE)
  async getClasesDelMes(
    @GetUser() user: AuthUser,
    @Query('mes') mes?: string,
    @Query('anio') anio?: string,
  ) {
    const now = new Date();
    const mesNum = mes ? parseInt(mes, 10) : now.getMonth() + 1;
    const anioNum = anio ? parseInt(anio, 10) : now.getFullYear();
    return this.docentesService.getClasesDelMes(user.id, mesNum, anioNum);
  }

  /**
   * GET /docentes/me - Obtener perfil del docente autenticado
   * @param user - Usuario autenticado (del JWT)
   * @returns Perfil del docente
   */
  @Get('me')
  @Roles(Role.DOCENTE)
  async getProfile(@GetUser() user: AuthUser) {
    return this.docentesService.findById(user.id);
  }

  /**
   * PATCH /docentes/me - Actualizar perfil del docente autenticado
   * @param user - Usuario autenticado
   * @param updateDto - Datos a actualizar
   * @returns Docente actualizado
   */
  @Patch('me')
  @Roles(Role.DOCENTE)
  async updateProfile(
    @GetUser() user: AuthUser,
    @Body() updateDto: UpdateDocenteDto,
  ) {
    return this.docentesService.update(user.id, updateDto);
  }

  /**
   * GET /docentes/me/proxima-clase - Obtener la próxima clase del docente
   * @param user - Usuario autenticado (del JWT)
   * @returns Próxima clase con comisión, fecha_hora y minutos_restantes, o null
   */
  @Get('me/proxima-clase')
  @Roles(Role.DOCENTE)
  async getProximaClase(@GetUser() user: AuthUser) {
    return this.docentesService.getProximaClase(user.id);
  }

  /**
   * GET /docentes/me/carga-horaria-semanal - Distribución de clases por día
   * @param user - Usuario autenticado (del JWT)
   * @returns { data: [{ day: 'Lun', classes: 2 }, ...] }
   */
  @Get('me/carga-horaria-semanal')
  @Roles(Role.DOCENTE)
  async getCargaHorariaSemanal(@GetUser() user: AuthUser) {
    return this.docentesService.getCargaHorariaSemanal(user.id);
  }

  /**
   * GET /docentes/me/tendencia-asistencia - Tendencia de asistencia últimas 5 semanas
   * @param user - Usuario autenticado (del JWT)
   * @returns { data: [{ week: 'S1', avg: 85 }, ...] }
   */
  @Get('me/tendencia-asistencia')
  @Roles(Role.DOCENTE)
  async getTendenciaAsistencia(@GetUser() user: AuthUser) {
    return this.docentesService.getTendenciaAsistencia(user.id);
  }

  /**
   * GET /docentes/me/distribucion-estudiantes - Estudiantes por comisión
   * @param user - Usuario autenticado (del JWT)
   * @returns { data: [{ name: 'Comisión', value: 15 }, ...], total: 60 }
   */
  @Get('me/distribucion-estudiantes')
  @Roles(Role.DOCENTE)
  async getDistribucionEstudiantes(@GetUser() user: AuthUser) {
    return this.docentesService.getDistribucionEstudiantes(user.id);
  }

  // ============================================================================
  // COMISIONES - Endpoints para ver comisiones asignadas al docente
  // ============================================================================

  /**
   * GET /docentes/me/comisiones - Listar todas las comisiones del docente
   * @param user - Usuario autenticado (del JWT)
   * @returns Lista de comisiones con inscripciones_count y proxima_clase
   */
  @Get('me/comisiones')
  @Roles(Role.DOCENTE)
  async getMisComisiones(@GetUser() user: AuthUser) {
    return this.docentesService.getMisComisiones(user.id);
  }

  /**
   * GET /docentes/me/comisiones/:id - Obtener detalles de una comisión
   * @param id - ID de la comisión
   * @param user - Usuario autenticado (del JWT)
   * @returns Detalles de la comisión con estudiantes inscritos
   */
  @Get('me/comisiones/:id')
  @Roles(Role.DOCENTE)
  async getComisionDetalle(
    @Param('id', ParseIdPipe) id: string,
    @GetUser() user: AuthUser,
  ) {
    return this.docentesService.getComisionDetalle(id, user.id);
  }

  /**
   * GET /docentes/me/comisiones/:id/estudiantes - Listar estudiantes de una comisión
   * @param id - ID de la comisión
   * @param user - Usuario autenticado (del JWT)
   * @returns Lista de estudiantes con stats, tutor, casa, etc.
   */
  @Get('me/comisiones/:id/estudiantes')
  @Roles(Role.DOCENTE)
  async getEstudiantesComision(
    @Param('id', ParseIdPipe) id: string,
    @GetUser() user: AuthUser,
  ) {
    return this.docentesService.getEstudiantesComision(id, user.id);
  }

  /**
   * GET /docentes/me/comisiones/:id/metricas - Obtener métricas de una comisión
   * @param id - ID de la comisión
   * @param user - Usuario autenticado (del JWT)
   * @returns Métricas: asistencia promedio, total estudiantes, clases, puntos
   */
  @Get('me/comisiones/:id/metricas')
  @Roles(Role.DOCENTE)
  async getMetricasComision(
    @Param('id', ParseIdPipe) id: string,
    @GetUser() user: AuthUser,
  ) {
    return this.docentesService.getMetricasComision(id, user.id);
  }

  /**
   * GET /docentes/me/comisiones/:id/progreso - Obtener progreso de sesiones
   * @param id - ID de la comisión
   * @param user - Usuario autenticado (del JWT)
   * @returns { sesionActual, totalSesiones, porcentajeCompletado }
   */
  @Get('me/comisiones/:id/progreso')
  @Roles(Role.DOCENTE)
  async getProgresoComision(
    @Param('id', ParseIdPipe) id: string,
    @GetUser() user: AuthUser,
  ) {
    return this.docentesService.getProgresoComision(id, user.id);
  }

  /**
   * GET /docentes/me/comisiones/:id/historial-asistencia - Historial de asistencia
   * @param id - ID de la comisión
   * @param user - Usuario autenticado (del JWT)
   * @param desde - Fecha desde (YYYY-MM-DD), opcional
   * @param hasta - Fecha hasta (YYYY-MM-DD), opcional
   * @returns Historial de asistencia agrupado por fecha
   */
  @Get('me/comisiones/:id/historial-asistencia')
  @Roles(Role.DOCENTE)
  async getHistorialAsistencia(
    @Param('id', ParseIdPipe) id: string,
    @GetUser() user: AuthUser,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    const desdeDate = desde ? new Date(desde) : undefined;
    const hastaDate = hasta ? new Date(hasta) : undefined;
    return this.docentesService.getHistorialAsistencia(
      id,
      user.id,
      desdeDate,
      hastaDate,
    );
  }

  // ============================================================================
  // PLANIFICACIONES - Endpoints para gestión de planificaciones docente
  // ============================================================================

  /**
   * GET /docentes/me/asignaciones - Obtener asignaciones de planificaciones
   * @param user - Usuario autenticado (del JWT)
   * @returns Lista de asignaciones con planificación, grupo y semanas activas
   */
  @Get('me/asignaciones')
  @Roles(Role.DOCENTE)
  async getMisAsignaciones(@GetUser() user: AuthUser) {
    return this.planificacionesService.getMisAsignaciones(user.id);
  }

  /**
   * POST /docentes/asignaciones/:id/clases/:claseId/activar - Activar una clase (teoría + práctica)
   * @param id - ID de la asignación
   * @param claseId - ID de la clase
   * @param user - Usuario autenticado (del JWT)
   */
  @Post('asignaciones/:id/clases/:claseId/activar')
  @Roles(Role.DOCENTE)
  async activarClase(
    @Param('id', ParseIdPipe) id: string,
    @Param('claseId', ParseIdPipe) claseId: string,
    @GetUser() user: AuthUser,
  ) {
    await this.planificacionesService.activarClase(id, claseId, user.id);
    return { success: true, message: 'Clase activada' };
  }

  /**
   * POST /docentes/asignaciones/:id/clases/:claseId/desactivar - Desactivar una clase
   * @param id - ID de la asignación
   * @param claseId - ID de la clase
   * @param user - Usuario autenticado (del JWT)
   */
  @Post('asignaciones/:id/clases/:claseId/desactivar')
  @Roles(Role.DOCENTE)
  async desactivarClase(
    @Param('id', ParseIdPipe) id: string,
    @Param('claseId', ParseIdPipe) claseId: string,
    @GetUser() user: AuthUser,
  ) {
    await this.planificacionesService.desactivarClase(id, claseId, user.id);
    return { success: true, message: 'Clase desactivada' };
  }

  /**
   * POST /docentes/asignaciones/:id/clases/:claseId/teoria/activar - Activar solo teoría
   * @param id - ID de la asignación
   * @param claseId - ID de la clase
   * @param user - Usuario autenticado (del JWT)
   */
  @Post('asignaciones/:id/clases/:claseId/teoria/activar')
  @Roles(Role.DOCENTE)
  async activarTeoria(
    @Param('id', ParseIdPipe) id: string,
    @Param('claseId', ParseIdPipe) claseId: string,
    @GetUser() user: AuthUser,
  ) {
    await this.planificacionesService.activarTeoria(id, claseId, user.id);
    return { success: true, message: 'Teoría activada' };
  }

  /**
   * POST /docentes/asignaciones/:id/clases/:claseId/teoria/desactivar - Desactivar solo teoría
   * @param id - ID de la asignación
   * @param claseId - ID de la clase
   * @param user - Usuario autenticado (del JWT)
   */
  @Post('asignaciones/:id/clases/:claseId/teoria/desactivar')
  @Roles(Role.DOCENTE)
  async desactivarTeoria(
    @Param('id', ParseIdPipe) id: string,
    @Param('claseId', ParseIdPipe) claseId: string,
    @GetUser() user: AuthUser,
  ) {
    await this.planificacionesService.desactivarTeoria(id, claseId, user.id);
    return { success: true, message: 'Teoría desactivada' };
  }

  /**
   * POST /docentes/asignaciones/:id/clases/:claseId/practica/activar - Activar solo práctica
   * @param id - ID de la asignación
   * @param claseId - ID de la clase
   * @param user - Usuario autenticado (del JWT)
   */
  @Post('asignaciones/:id/clases/:claseId/practica/activar')
  @Roles(Role.DOCENTE)
  async activarPractica(
    @Param('id', ParseIdPipe) id: string,
    @Param('claseId', ParseIdPipe) claseId: string,
    @GetUser() user: AuthUser,
  ) {
    await this.planificacionesService.activarPractica(id, claseId, user.id);
    return { success: true, message: 'Práctica activada' };
  }

  /**
   * POST /docentes/asignaciones/:id/clases/:claseId/practica/desactivar - Desactivar solo práctica
   * @param id - ID de la asignación
   * @param claseId - ID de la clase
   * @param user - Usuario autenticado (del JWT)
   */
  @Post('asignaciones/:id/clases/:claseId/practica/desactivar')
  @Roles(Role.DOCENTE)
  async desactivarPractica(
    @Param('id', ParseIdPipe) id: string,
    @Param('claseId', ParseIdPipe) claseId: string,
    @GetUser() user: AuthUser,
  ) {
    await this.planificacionesService.desactivarPractica(id, claseId, user.id);
    return { success: true, message: 'Práctica desactivada' };
  }

  /**
   * GET /docentes/asignaciones/:id/progreso - Obtener progreso de estudiantes
   * @param id - ID de la asignación
   * @param user - Usuario autenticado (del JWT)
   * @returns Lista de progresos de estudiantes
   */
  @Get('asignaciones/:id/progreso')
  @Roles(Role.DOCENTE)
  async getProgresoEstudiantes(
    @Param('id', ParseIdPipe) id: string,
    @GetUser() user: AuthUser,
  ) {
    return this.planificacionesService.getProgresoEstudiantes(id, user.id);
  }

  // ============================================================================
  // TAREAS - Endpoints para gestión de tareas por clase
  // ============================================================================

  /**
   * GET /docentes/asignaciones/:id/clases/:claseId/tareas - Obtener tareas de una clase
   * @param id - ID de la asignación
   * @param claseId - ID de la clase
   * @param user - Usuario autenticado (del JWT)
   * @returns Lista de tareas con estado de asignación
   */
  @Get('asignaciones/:id/clases/:claseId/tareas')
  @Roles(Role.DOCENTE)
  async getTareasClase(
    @Param('id', ParseIdPipe) id: string,
    @Param('claseId', ParseIdPipe) claseId: string,
    @GetUser() user: AuthUser,
  ) {
    return this.planificacionesService.getTareasClase(id, claseId, user.id);
  }

  /**
   * POST /docentes/asignaciones/:id/tareas/:tareaClaseId/asignar - Asignar tarea al grupo
   * @param id - ID de la asignación
   * @param tareaClaseId - ID de la tarea de clase
   * @param dto - Fecha límite opcional (body puede estar vacío)
   * @param user - Usuario autenticado (del JWT)
   */
  @Post('asignaciones/:id/tareas/:tareaClaseId/asignar')
  @Roles(Role.DOCENTE)
  async asignarTarea(
    @Param('id', ParseIdPipe) id: string,
    @Param('tareaClaseId', ParseIdPipe) tareaClaseId: string,
    @Body() dto: AsignarTareaDto = {},
    @GetUser() user: AuthUser,
  ) {
    const fechaLimite = dto.fecha_limite
      ? new Date(dto.fecha_limite)
      : undefined;
    return this.planificacionesService.asignarTarea(
      id,
      tareaClaseId,
      user.id,
      fechaLimite,
    );
  }

  /**
   * POST /docentes/asignaciones/:id/tareas/:tareaClaseId/desasignar - Desasignar tarea
   * @param id - ID de la asignación
   * @param tareaClaseId - ID de la tarea de clase
   * @param user - Usuario autenticado (del JWT)
   */
  @Post('asignaciones/:id/tareas/:tareaClaseId/desasignar')
  @Roles(Role.DOCENTE)
  async desasignarTarea(
    @Param('id', ParseIdPipe) id: string,
    @Param('tareaClaseId', ParseIdPipe) tareaClaseId: string,
    @GetUser() user: AuthUser,
  ) {
    return this.planificacionesService.desasignarTarea(
      id,
      tareaClaseId,
      user.id,
    );
  }

  /**
   * GET /docentes/asignaciones/:id/tareas/progreso - Obtener progreso de tareas
   * @param id - ID de la asignación
   * @param user - Usuario autenticado (del JWT)
   * @returns Progreso de tareas por estudiante
   */
  @Get('asignaciones/:id/tareas/progreso')
  @Roles(Role.DOCENTE)
  async getProgresoTareas(
    @Param('id', ParseIdPipe) id: string,
    @GetUser() user: AuthUser,
  ) {
    return this.planificacionesService.getProgresoTareas(id, user.id);
  }

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  /**
   * GET /docentes/clases-count-batch - Obtener conteo de clases de TODOS los docentes
   * Evita N+1 cuando se necesita el conteo de múltiples docentes
   * Requiere autenticación y rol Admin
   * @returns Record<docenteId, { claseGrupos, comisiones, total }>
   */
  @Get('clases-count-batch')
  @Roles(Role.ADMIN)
  async getClasesCountBatch() {
    return this.docentesService.getClasesCountBatch();
  }

  /**
   * GET /docentes/:id/clases-count - Obtener conteo de clases asignadas (Admin only)
   * @param id - ID del docente
   * @returns { claseGrupos, comisiones, total }
   */
  @Get(':id/clases-count')
  @Roles(Role.ADMIN)
  async getClasesCount(@Param('id', ParseIdPipe) id: string) {
    return this.docentesService.getClasesCount(id);
  }

  /**
   * GET /docentes/:id - Obtener un docente específico (Admin only)
   * @param id - ID del docente
   * @returns Docente encontrado
   */
  @Get(':id')
  @Roles(Role.ADMIN)
  async findOne(@Param('id', ParseIdPipe) id: string) {
    return this.docentesService.findById(id);
  }

  /**
   * PATCH /docentes/:id - Actualizar un docente (Admin only)
   * @param id - ID del docente
   * @param updateDto - Datos a actualizar
   * @returns Docente actualizado
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id', ParseIdPipe) id: string,
    @Body() updateDto: UpdateDocenteDto,
  ) {
    return this.docentesService.update(id, updateDto);
  }

  /**
   * POST /docentes/:id/reasignar-clases - Reasignar clases a otro docente (Admin only)
   * @param id - ID del docente actual (desde)
   * @param dto - { toDocenteId: string } - ID del nuevo docente (hacia)
   * @returns Cantidad de clases reasignadas
   */
  @Post(':id/reasignar-clases')
  @Roles(Role.ADMIN)
  async reasignarClases(
    @Param('id', ParseIdPipe) fromDocenteId: string,
    @Body() dto: ReasignarClasesDto,
  ) {
    return this.docentesService.reasignarClases(fromDocenteId, dto.toDocenteId);
  }

  /**
   * DELETE /docentes/:id - Eliminar un docente (Admin only)
   * Solo permite eliminar si no tiene clases asignadas
   * @param id - ID del docente
   * @returns Mensaje de confirmación
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id', ParseIdPipe) id: string) {
    return this.docentesService.remove(id);
  }
}
