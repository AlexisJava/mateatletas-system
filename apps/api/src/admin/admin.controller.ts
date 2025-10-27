import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { RutasCurricularesService } from './rutas-curriculares.service';
import { SectoresRutasService } from './services/sectores-rutas.service';
import { ClaseGruposService } from './clase-grupos.service';
import { AsistenciasService } from './asistencias.service';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { CrearRutaDto } from './dto/crear-ruta.dto';
import { ActualizarRutaDto } from './dto/actualizar-ruta.dto';
import { CrearAlertaDto } from './dto/crear-alerta.dto';
import { CreateSectorDto, UpdateSectorDto } from './dto/sector.dto';
import {
  CreateRutaEspecialidadDto,
  UpdateRutaEspecialidadDto,
  AsignarRutasDocenteDto,
} from './dto/ruta-especialidad.dto';
import { CrearEstudianteRapidoDto } from './dto/crear-estudiante-rapido.dto';
import { CrearClaseGrupoDto } from './dto/crear-clase-grupo.dto';
import { ActualizarClaseGrupoDto } from './dto/actualizar-clase-grupo.dto';
import {
  RegistrarAsistenciasDto,
  ActualizarAsistenciaDto,
  FiltrosHistorialAsistenciasDto,
} from './dto/asistencias.dto';
import { FiltrosClaseGruposDto } from './dto/filtros-clase-grupos.dto';
import {
  ResetPasswordDto,
  ResetPasswordMasivoDto,
} from './dto/reset-password.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly rutasService: RutasCurricularesService,
    private readonly sectoresRutasService: SectoresRutasService,
    private readonly claseGruposService: ClaseGruposService,
    private readonly asistenciasService: AsistenciasService,
  ) {}

  /**
   * Obtener estadísticas del dashboard
   * GET /api/admin/dashboard
   * Rol: Admin
   */
  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  /**
   * Obtener estadísticas del sistema
   * GET /api/admin/estadisticas
   * Rol: Admin
   */
  @Get('estadisticas')
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }

  /**
   * Listar alertas pendientes
   * GET /api/admin/alertas
   * Rol: Admin
   */
  @Get('alertas')
  async listarAlertas() {
    return this.adminService.listarAlertas();
  }

  /**
   * Marcar alerta como resuelta
   * PATCH /api/admin/alertas/:id/resolver
   * Rol: Admin
   */
  @Patch('alertas/:id/resolver')
  async resolverAlerta(@Param('id') id: string) {
    return this.adminService.resolverAlerta(id);
  }

  /**
   * Obtener sugerencia para resolver una alerta
   * GET /api/admin/alertas/:id/sugerencia
   * Rol: Admin
   */
  @Get('alertas/:id/sugerencia')
  async sugerirSolucion(@Param('id') id: string) {
    return this.adminService.sugerirSolucion(id);
  }

  /**
   * Listar usuarios administrables
   * GET /api/admin/usuarios
   * Rol: Admin
   */
  @Get('usuarios')
  async listarUsuarios() {
    return this.adminService.listarUsuarios();
  }

  /**
   * Listar estudiantes del sistema
   * GET /api/admin/estudiantes
   * Rol: Admin
   * Query params: page, limit, search
   */
  @Get('estudiantes')
  async listarEstudiantes(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.listarEstudiantes({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
    });
  }

  /**
   * Obtener credenciales de todos los usuarios
   * GET /api/admin/credenciales
   * Rol: Admin
   * Retorna todos los usuarios con sus credenciales temporales
   */
  @Get('credenciales')
  async obtenerCredenciales() {
    return this.adminService.obtenerTodasLasCredenciales();
  }

  /**
   * Resetear contraseña de un usuario específico
   * POST /api/admin/credenciales/:usuarioId/reset
   * Rol: Admin
   *
   * Genera una nueva contraseña temporal y marca debe_cambiar_password = true
   * Funciona para Tutores, Estudiantes y Docentes
   */
  @Post('credenciales/:usuarioId/reset')
  @ApiOperation({
    summary: 'Resetear contraseña de usuario',
    description:
      'Genera nueva contraseña temporal y obliga al usuario a cambiarla en el próximo login',
  })
  @HttpCode(HttpStatus.OK)
  async resetearPassword(
    @Param('usuarioId') usuarioId: string,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.adminService.resetearPasswordUsuario(
      usuarioId,
      dto.tipoUsuario,
    );
  }

  /**
   * Resetear contraseñas masivamente
   * POST /api/admin/credenciales/reset-masivo
   * Rol: Admin
   *
   * Resetea contraseñas de múltiples usuarios a la vez
   * Body: { usuarios: Array<{ id: string, tipoUsuario: 'tutor' | 'estudiante' | 'docente' }> }
   */
  @Post('credenciales/reset-masivo')
  @ApiOperation({
    summary: 'Resetear contraseñas masivamente',
    description:
      'Resetea contraseñas de múltiples usuarios en una sola operación',
  })
  @HttpCode(HttpStatus.OK)
  async resetearPasswordMasivo(@Body() dto: ResetPasswordMasivoDto) {
    return this.adminService.resetearPasswordsMasivo(dto.usuarios);
  }

  /**
   * Crear estudiante rápido con tutor automático
   * POST /api/admin/estudiantes
   * Rol: Admin
   */
  @Post('estudiantes')
  async crearEstudianteRapido(@Body() dto: CrearEstudianteRapidoDto) {
    return this.adminService.crearEstudianteRapido(dto);
  }

  /**
   * Cambiar rol de un usuario (agregar un rol)
   * POST /api/admin/usuarios/:id/role
   * Rol: Admin
   */
  @Post('usuarios/:id/role')
  async cambiarRolUsuario(
    @Param('id') id: string,
    @Body('role', new ParseEnumPipe(Role)) role: Role,
  ) {
    return this.adminService.changeUserRole(id, role);
  }

  /**
   * Actualizar roles completos de un usuario (multi-rol)
   * PUT /api/admin/usuarios/:id/roles
   * Rol: Admin
   */
  @Put('usuarios/:id/roles')
  async actualizarRolesUsuario(
    @Param('id') id: string,
    @Body('roles') roles: Role[],
  ) {
    // Validar que al menos haya un rol
    if (!roles || roles.length === 0) {
      throw new BadRequestException('Debe proporcionar al menos un rol');
    }
    return this.adminService.updateUserRoles(id, roles);
  }

  /**
   * Eliminar usuario
   * DELETE /api/admin/usuarios/:id
   * Rol: Admin
   */
  @Delete('usuarios/:id')
  async eliminarUsuario(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  /**
   * Crear alerta manualmente (para testing)
   * POST /api/admin/alertas
   * Rol: Admin
   */
  @Post('alertas')
  async crearAlerta(@Body() dto: CrearAlertaDto) {
    return this.adminService.crearAlerta(
      dto.estudianteId,
      dto.claseId,
      dto.descripcion,
    );
  }

  // ========================================
  // GESTIÓN DE RUTAS CURRICULARES
  // ========================================

  /**
   * Listar todas las rutas curriculares
   * GET /api/admin/rutas-curriculares
   * Rol: Admin, Docente (también necesitan ver rutas)
   */
  @Get('rutas-curriculares')
  @Roles(Role.Admin, Role.Docente)
  async listarRutas() {
    return this.rutasService.listarTodas();
  }

  /**
   * Obtener una ruta curricular por ID
   * GET /api/admin/rutas-curriculares/:id
   * Rol: Admin, Docente
   */
  @Get('rutas-curriculares/:id')
  @Roles(Role.Admin, Role.Docente)
  async obtenerRuta(@Param('id') id: string) {
    return this.rutasService.obtenerPorId(id);
  }

  /**
   * Crear nueva ruta curricular
   * POST /api/admin/rutas-curriculares
   * Rol: Admin
   */
  @Post('rutas-curriculares')
  async crearRuta(@Body() dto: CrearRutaDto) {
    return this.rutasService.crear(dto);
  }

  /**
   * Actualizar ruta curricular
   * PATCH /api/admin/rutas-curriculares/:id
   * Rol: Admin
   */
  @Patch('rutas-curriculares/:id')
  async actualizarRuta(
    @Param('id') id: string,
    @Body() dto: ActualizarRutaDto,
  ) {
    return this.rutasService.actualizar(id, dto);
  }

  /**
   * Eliminar ruta curricular
   * DELETE /api/admin/rutas-curriculares/:id
   * Rol: Admin
   * Solo elimina si no tiene clases asociadas
   */
  @Delete('rutas-curriculares/:id')
  async eliminarRuta(@Param('id') id: string) {
    return this.rutasService.eliminar(id);
  }

  // ============================================================================
  // SECTORES Y RUTAS DE ESPECIALIDAD
  // ============================================================================

  /**
   * Listar todos los sectores con sus rutas
   * GET /api/admin/sectores
   * Rol: Admin
   */
  @Get('sectores')
  async listarSectores() {
    return this.sectoresRutasService.listarSectores();
  }

  /**
   * Obtener un sector por ID
   * GET /api/admin/sectores/:id
   * Rol: Admin
   */
  @Get('sectores/:id')
  async obtenerSector(@Param('id') id: string) {
    return this.sectoresRutasService.obtenerSector(id);
  }

  /**
   * Crear un nuevo sector
   * POST /api/admin/sectores
   * Rol: Admin
   */
  @Post('sectores')
  async crearSector(@Body() data: CreateSectorDto) {
    return this.sectoresRutasService.crearSector(data);
  }

  /**
   * Actualizar un sector
   * PUT /api/admin/sectores/:id
   * Rol: Admin
   */
  @Put('sectores/:id')
  async actualizarSector(
    @Param('id') id: string,
    @Body() data: UpdateSectorDto,
  ) {
    return this.sectoresRutasService.actualizarSector(id, data);
  }

  /**
   * Eliminar un sector (soft delete)
   * DELETE /api/admin/sectores/:id
   * Rol: Admin
   */
  @Delete('sectores/:id')
  async eliminarSector(@Param('id') id: string) {
    return this.sectoresRutasService.eliminarSector(id);
  }

  /**
   * Listar todas las rutas de especialidad
   * GET /api/admin/rutas-especialidad?sectorId=xxx (opcional)
   * Rol: Admin
   */
  @Get('rutas-especialidad')
  async listarRutasEspecialidad(@Query('sectorId') sectorId?: string) {
    return this.sectoresRutasService.listarRutas(sectorId);
  }

  /**
   * Obtener una ruta de especialidad por ID
   * GET /api/admin/rutas-especialidad/:id
   * Rol: Admin
   */
  @Get('rutas-especialidad/:id')
  async obtenerRutaEspecialidad(@Param('id') id: string) {
    return this.sectoresRutasService.obtenerRuta(id);
  }

  /**
   * Crear una nueva ruta de especialidad
   * POST /api/admin/rutas-especialidad
   * Rol: Admin
   */
  @Post('rutas-especialidad')
  async crearRutaEspecialidad(@Body() data: CreateRutaEspecialidadDto) {
    return this.sectoresRutasService.crearRuta(data);
  }

  /**
   * Actualizar una ruta de especialidad
   * PUT /api/admin/rutas-especialidad/:id
   * Rol: Admin
   */
  @Put('rutas-especialidad/:id')
  async actualizarRutaEspecialidad(
    @Param('id') id: string,
    @Body() data: UpdateRutaEspecialidadDto,
  ) {
    return this.sectoresRutasService.actualizarRuta(id, data);
  }

  /**
   * Eliminar una ruta de especialidad (soft delete)
   * DELETE /api/admin/rutas-especialidad/:id
   * Rol: Admin
   */
  @Delete('rutas-especialidad/:id')
  async eliminarRutaEspecialidad(@Param('id') id: string) {
    return this.sectoresRutasService.eliminarRuta(id);
  }

  /**
   * Obtener las rutas asignadas a un docente
   * GET /api/admin/docentes/:docenteId/rutas
   * Rol: Admin
   */
  @Get('docentes/:docenteId/rutas')
  async obtenerRutasDocente(@Param('docenteId') docenteId: string) {
    return this.sectoresRutasService.obtenerRutasDocente(docenteId);
  }

  /**
   * Asignar rutas a un docente (reemplaza las anteriores)
   * PUT /api/admin/docentes/:docenteId/rutas
   * Rol: Admin
   */
  @Put('docentes/:docenteId/rutas')
  async asignarRutasDocente(
    @Param('docenteId') docenteId: string,
    @Body() data: AsignarRutasDocenteDto,
  ) {
    return this.sectoresRutasService.asignarRutasDocente(docenteId, data);
  }

  /**
   * Agregar una ruta a un docente
   * POST /api/admin/docentes/:docenteId/rutas/:rutaId
   * Rol: Admin
   */
  @Post('docentes/:docenteId/rutas/:rutaId')
  async agregarRutaDocente(
    @Param('docenteId') docenteId: string,
    @Param('rutaId') rutaId: string,
  ) {
    return this.sectoresRutasService.agregarRutaDocente(docenteId, rutaId);
  }

  /**
   * Eliminar una ruta de un docente
   * DELETE /api/admin/docentes/:docenteId/rutas/:rutaId
   * Rol: Admin
   */
  @Delete('docentes/:docenteId/rutas/:rutaId')
  async eliminarRutaDocente(
    @Param('docenteId') docenteId: string,
    @Param('rutaId') rutaId: string,
  ) {
    return this.sectoresRutasService.eliminarRutaDocente(docenteId, rutaId);
  }

  /**
   * Obtener métricas de circuit breakers
   * GET /api/admin/circuit-metrics
   * Rol: Admin
   *
   * Retorna el estado de los circuit breakers de AdminService
   * Útil para monitoring y debugging de resiliencia
   */
  @Get('circuit-metrics')
  async getCircuitMetrics() {
    return this.adminService.getCircuitMetrics();
  }

  /**
   * Crear un nuevo ClaseGrupo (grupo recurrente de clases)
   * POST /api/admin/clase-grupos
   * Rol: Admin
   *
   * Permite crear un grupo estable de estudiantes que se reúne semanalmente
   * Ejemplo: "GRUPO B1 - Matemática - Lunes 19:30"
   */
  @Post('clase-grupos')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear grupo de clases recurrente',
    description: `
      Crea un ClaseGrupo con horario recurrente semanal.

      Tipos:
      - GRUPO_REGULAR: Finaliza automáticamente el 15/dic del año lectivo
      - CURSO_TEMPORAL: Fecha de fin específica

      El sistema:
      1. Crea el ClaseGrupo
      2. Inscribe a los estudiantes especificados
      3. NO crea instancias duplicadas (1 registro para todo el año)
    `,
  })
  async crearClaseGrupo(@Body() dto: CrearClaseGrupoDto) {
    return this.claseGruposService.crearClaseGrupo(dto);
  }

  /**
   * Listar todos los ClaseGrupos
   * GET /api/admin/clase-grupos
   * Rol: Admin
   *
   * Permite filtrar por año lectivo, estado activo, docente o tipo
   */
  @Get('clase-grupos')
  @ApiOperation({
    summary: 'Listar grupos de clases',
    description: 'Obtiene todos los ClaseGrupos con filtros opcionales',
  })
  async listarClaseGrupos(@Query() filtros: FiltrosClaseGruposDto) {
    return this.claseGruposService.listarClaseGrupos(filtros);
  }

  /**
   * Obtener un ClaseGrupo por ID
   * GET /api/admin/clase-grupos/:id
   * Rol: Admin
   *
   * Retorna todos los detalles del grupo incluyendo estudiantes inscritos
   */
  @Get('clase-grupos/:id')
  @ApiOperation({
    summary: 'Obtener detalle de un grupo',
    description: 'Obtiene un ClaseGrupo con todos sus detalles e inscripciones',
  })
  async obtenerClaseGrupo(@Param('id') id: string) {
    return this.claseGruposService.obtenerClaseGrupo(id);
  }

  /**
   * Actualizar un grupo de clases
   * PUT /api/admin/clase-grupos/:id
   * Rol: Admin
   */
  @Put('clase-grupos/:id')
  @ApiOperation({
    summary: 'Actualizar un grupo de clases',
    description: 'Actualiza los datos de un ClaseGrupo existente',
  })
  async actualizarClaseGrupo(
    @Param('id') id: string,
    @Body() dto: ActualizarClaseGrupoDto,
  ) {
    return this.claseGruposService.actualizarClaseGrupo(id, dto);
  }

  /**
   * Agregar estudiantes a un grupo de clases
   * POST /api/admin/clase-grupos/:id/estudiantes
   * Rol: Admin
   */
  @Post('clase-grupos/:id/estudiantes')
  @ApiOperation({
    summary: 'Agregar estudiantes a un grupo',
    description: 'Inscribe uno o más estudiantes en un ClaseGrupo existente',
  })
  async agregarEstudiantesAGrupo(
    @Param('id') id: string,
    @Body() body: { estudiantes_ids: string[] },
  ) {
    return this.claseGruposService.agregarEstudiantes(id, body.estudiantes_ids);
  }

  /**
   * Remover un estudiante de un grupo de clases
   * DELETE /api/admin/clase-grupos/:id/estudiantes/:estudianteId
   * Rol: Admin
   */
  @Delete('clase-grupos/:id/estudiantes/:estudianteId')
  @ApiOperation({
    summary: 'Remover estudiante de un grupo',
    description: 'Elimina la inscripción de un estudiante en un ClaseGrupo',
  })
  async removerEstudianteDeGrupo(
    @Param('id') id: string,
    @Param('estudianteId') estudianteId: string,
  ) {
    return this.claseGruposService.removerEstudiante(id, estudianteId);
  }

  /**
   * Eliminar un grupo de clases (soft delete)
   * DELETE /api/admin/clase-grupos/:id
   * Rol: Admin
   */
  @Delete('clase-grupos/:id')
  @ApiOperation({
    summary: 'Eliminar un grupo de clases',
    description: 'Desactiva un ClaseGrupo (soft delete)',
  })
  async eliminarClaseGrupo(@Param('id') id: string) {
    return this.claseGruposService.eliminarClaseGrupo(id);
  }

  /**
   * Registrar asistencias para una fecha específica
   * POST /api/admin/clase-grupos/:id/asistencias
   * Rol: Admin
   */
  @Post('clase-grupos/:id/asistencias')
  @ApiOperation({
    summary: 'Registrar asistencias',
    description:
      'Registra la asistencia de estudiantes para una fecha específica',
  })
  async registrarAsistencias(
    @Param('id') id: string,
    @Body() dto: RegistrarAsistenciasDto,
  ) {
    return this.asistenciasService.registrarAsistencias(id, dto);
  }

  /**
   * Obtener asistencias por fecha
   * GET /api/admin/clase-grupos/:id/asistencias
   * Rol: Admin
   */
  @Get('clase-grupos/:id/asistencias')
  @ApiOperation({
    summary: 'Obtener asistencias por fecha',
    description:
      'Lista las asistencias de un ClaseGrupo para una fecha específica',
  })
  async obtenerAsistenciasPorFecha(
    @Param('id') id: string,
    @Query('fecha') fecha: string,
  ) {
    return this.asistenciasService.obtenerAsistenciasPorFecha(id, fecha);
  }

  /**
   * Obtener historial de asistencias
   * GET /api/admin/clase-grupos/:id/asistencias/historial
   * Rol: Admin
   */
  @Get('clase-grupos/:id/asistencias/historial')
  @ApiOperation({
    summary: 'Obtener historial de asistencias',
    description: 'Lista el historial completo de asistencias de un ClaseGrupo',
  })
  async obtenerHistorialAsistencias(
    @Param('id') id: string,
    @Query() filtros: FiltrosHistorialAsistenciasDto,
  ) {
    return this.asistenciasService.obtenerHistorialAsistencias(id, filtros);
  }

  /**
   * Actualizar una asistencia individual
   * PATCH /api/admin/asistencias/:id
   * Rol: Admin
   */
  @Patch('asistencias/:id')
  @ApiOperation({
    summary: 'Actualizar asistencia',
    description: 'Actualiza el estado u observaciones de una asistencia',
  })
  async actualizarAsistencia(
    @Param('id') id: string,
    @Body() dto: ActualizarAsistenciaDto,
  ) {
    return this.asistenciasService.actualizarAsistencia(id, dto);
  }

  /**
   * Obtener estadísticas de asistencia de un estudiante
   * GET /api/admin/clase-grupos/:id/estudiantes/:estudianteId/estadisticas
   * Rol: Admin
   */
  @Get('clase-grupos/:id/estudiantes/:estudianteId/estadisticas')
  @ApiOperation({
    summary: 'Estadísticas de asistencia de estudiante',
    description:
      'Obtiene las estadísticas de asistencia de un estudiante en un ClaseGrupo',
  })
  async obtenerEstadisticasEstudiante(
    @Param('id') id: string,
    @Param('estudianteId') estudianteId: string,
  ) {
    return this.asistenciasService.obtenerEstadisticasEstudiante(
      id,
      estudianteId,
    );
  }
}
