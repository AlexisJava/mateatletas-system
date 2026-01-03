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
  ParseIntPipe,
} from '@nestjs/common';
import { ParseIdPipe } from '../common/pipes';
import { DocentesService } from './docentes.service';
import { DocentePlanificacionesService } from './services/docente-planificaciones.service';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';
import { ReasignarClasesDto } from './dto/reasignar-clases.dto';
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

  // ============================================================================
  // COMISIONES - Endpoints para ver comisiones asignadas al docente
  // ============================================================================

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
   * POST /docentes/asignaciones/:id/semanas/:numero/activar - Activar una semana
   * @param id - ID de la asignación
   * @param numero - Número de semana (1 a semanas_total)
   * @param user - Usuario autenticado (del JWT)
   */
  @Post('asignaciones/:id/semanas/:numero/activar')
  @Roles(Role.DOCENTE)
  async activarSemana(
    @Param('id', ParseIdPipe) id: string,
    @Param('numero', ParseIntPipe) numero: number,
    @GetUser() user: AuthUser,
  ) {
    await this.planificacionesService.activarSemana(id, numero, user.id);
    return { success: true, message: `Semana ${numero} activada` };
  }

  /**
   * POST /docentes/asignaciones/:id/semanas/:numero/desactivar - Desactivar una semana
   * @param id - ID de la asignación
   * @param numero - Número de semana (1 a semanas_total)
   * @param user - Usuario autenticado (del JWT)
   */
  @Post('asignaciones/:id/semanas/:numero/desactivar')
  @Roles(Role.DOCENTE)
  async desactivarSemana(
    @Param('id', ParseIdPipe) id: string,
    @Param('numero', ParseIntPipe) numero: number,
    @GetUser() user: AuthUser,
  ) {
    await this.planificacionesService.desactivarSemana(id, numero, user.id);
    return { success: true, message: `Semana ${numero} desactivada` };
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
  // ADMIN ENDPOINTS
  // ============================================================================

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
