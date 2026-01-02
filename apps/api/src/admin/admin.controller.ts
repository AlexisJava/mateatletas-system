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
import { ParseIdPipe } from '../common/pipes';
import { AdminService } from './admin.service';
import { SectoresRutasService } from './services/sectores-rutas.service';
import { ClaseGruposService } from './clase-grupos.service';
import { AsistenciasService } from './asistencias.service';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { CrearAlertaDto } from './dto/crear-alerta.dto';
import { CreateSectorDto, UpdateSectorDto } from './dto/sector.dto';
import {
  CreateRutaEspecialidadDto,
  UpdateRutaEspecialidadDto,
  AsignarRutasDocenteDto,
} from './dto/ruta-especialidad.dto';
import { CrearEstudianteRapidoDto } from './dto/crear-estudiante-rapido.dto';
import { CrearEstudianteDto } from './dto/crear-estudiante.dto';
import { CrearClaseGrupoDto } from './dto/crear-clase-grupo.dto';
import { ActualizarClaseGrupoDto } from './dto/actualizar-clase-grupo.dto';
import {
  RegistrarAsistenciasDto,
  ActualizarAsistenciaDto,
  FiltrosHistorialAsistenciasDto,
} from './dto/asistencias.dto';
import { FiltrosClaseGruposDto } from './dto/filtros-clase-grupos.dto';
import {
  AdminResetPasswordDto,
  ResetPasswordMasivoDto,
} from './dto/reset-password.dto';
import {
  CreateComisionDto,
  UpdateComisionDto,
  FiltrosComisionDto,
  InscribirEstudiantesDto,
  ActualizarInscripcionDto,
} from './dto/comision.dto';
import { ComisionesService } from './comisiones.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly sectoresRutasService: SectoresRutasService,
    private readonly claseGruposService: ClaseGruposService,
    private readonly asistenciasService: AsistenciasService,
    private readonly comisionesService: ComisionesService,
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
   * Obtener datos históricos de retención de estudiantes
   * GET /api/admin/analytics/retencion
   * Rol: Admin
   * Query params: meses (opcional, default 6)
   */
  @Get('analytics/retencion')
  @ApiOperation({ summary: 'Obtener histórico de retención de estudiantes' })
  async getRetentionStats(@Query('meses') meses?: string) {
    const numMeses = meses ? parseInt(meses, 10) : 6;
    return this.adminService.getRetentionStats(numMeses);
  }

  /**
   * Obtener pagos/transacciones recientes con paginación
   * GET /api/admin/pagos/recientes
   * Rol: Admin
   * Query params: page (default 1), limit (default 20, max 100)
   */
  @Get('pagos/recientes')
  @ApiOperation({ summary: 'Obtener transacciones recientes paginadas' })
  async getPagosRecientes(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const numPage = page ? parseInt(page, 10) : 1;
    const numLimit = limit ? parseInt(limit, 10) : 20;
    return this.adminService.getPagosRecientes(numPage, numLimit);
  }

  /**
   * Obtener histórico mensual de ingresos y pendientes
   * GET /api/admin/pagos/historico-mensual
   * Rol: Admin
   * Query params: meses (opcional, default 6)
   */
  @Get('pagos/historico-mensual')
  @ApiOperation({ summary: 'Obtener histórico mensual de ingresos' })
  async getHistoricoMensual(@Query('meses') meses?: string) {
    const numMeses = meses ? parseInt(meses, 10) : 6;
    return this.adminService.getHistoricoMensual(numMeses);
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
  async resolverAlerta(@Param('id', ParseIdPipe) id: string) {
    return this.adminService.resolverAlerta(id);
  }

  /**
   * Obtener sugerencia para resolver una alerta
   * GET /api/admin/alertas/:id/sugerencia
   * Rol: Admin
   */
  @Get('alertas/:id/sugerencia')
  async sugerirSolucion(@Param('id', ParseIdPipe) id: string) {
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
   * Obtener listado de todos los usuarios
   * GET /api/admin/credenciales
   * Rol: Admin
   * Retorna todos los usuarios del sistema
   */
  @Get('credenciales')
  async obtenerCredenciales() {
    return this.adminService.obtenerListadoUsuarios();
  }

  /**
   * Resetear contraseña de un usuario específico
   * POST /api/admin/credenciales/:usuarioId/reset
   * Rol: Admin
   *
   * Genera una nueva contraseña temporal para el usuario
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
    @Param('usuarioId', ParseIdPipe) usuarioId: string,
    @Body() dto: AdminResetPasswordDto,
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
   * Crear estudiante con generación de credenciales
   * POST /api/admin/estudiantes/con-credenciales
   * Rol: Admin
   *
   * Genera credenciales automáticas para estudiante (username + PIN)
   * y opcionalmente para tutor si no existe (username + password)
   *
   * Retorna credenciales en texto plano para que admin las copie
   * y las envíe al tutor por WhatsApp
   */
  @Post('estudiantes/con-credenciales')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear estudiante con credenciales',
    description: `
      Crea un estudiante nuevo con generación automática de credenciales.

      - Estudiante: username (nombre.apellido) + PIN de 4 dígitos
      - Tutor (si es nuevo): username + password temporal

      Las credenciales se retornan en texto plano para que el admin
      las copie y envíe al tutor por WhatsApp.
    `,
  })
  async crearEstudianteConCredenciales(@Body() dto: CrearEstudianteDto) {
    return this.adminService.crearEstudianteConCredenciales(dto);
  }

  /**
   * Cambiar rol de un usuario (agregar un rol)
   * POST /api/admin/usuarios/:id/role
   * Rol: Admin
   */
  @Post('usuarios/:id/role')
  async cambiarRolUsuario(
    @Param('id', ParseIdPipe) id: string,
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
    @Param('id', ParseIdPipe) id: string,
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
  async eliminarUsuario(@Param('id', ParseIdPipe) id: string) {
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
  async obtenerSector(@Param('id', ParseIdPipe) id: string) {
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
    @Param('id', ParseIdPipe) id: string,
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
  async eliminarSector(@Param('id', ParseIdPipe) id: string) {
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
  async obtenerRutaEspecialidad(@Param('id', ParseIdPipe) id: string) {
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
    @Param('id', ParseIdPipe) id: string,
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
  async eliminarRutaEspecialidad(@Param('id', ParseIdPipe) id: string) {
    return this.sectoresRutasService.eliminarRuta(id);
  }

  /**
   * Obtener las rutas asignadas a un docente
   * GET /api/admin/docentes/:docenteId/rutas
   * Rol: Admin
   */
  @Get('docentes/:docenteId/rutas')
  async obtenerRutasDocente(
    @Param('docenteId', ParseIdPipe) docenteId: string,
  ) {
    return this.sectoresRutasService.obtenerRutasDocente(docenteId);
  }

  /**
   * Asignar rutas a un docente (reemplaza las anteriores)
   * PUT /api/admin/docentes/:docenteId/rutas
   * Rol: Admin
   */
  @Put('docentes/:docenteId/rutas')
  async asignarRutasDocente(
    @Param('docenteId', ParseIdPipe) docenteId: string,
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
    @Param('docenteId', ParseIdPipe) docenteId: string,
    @Param('rutaId', ParseIdPipe) rutaId: string,
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
    @Param('docenteId', ParseIdPipe) docenteId: string,
    @Param('rutaId', ParseIdPipe) rutaId: string,
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
  getCircuitMetrics() {
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
  async obtenerClaseGrupo(@Param('id', ParseIdPipe) id: string) {
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
    @Param('id', ParseIdPipe) id: string,
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
    @Param('id', ParseIdPipe) id: string,
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
    @Param('id', ParseIdPipe) id: string,
    @Param('estudianteId', ParseIdPipe) estudianteId: string,
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
  async eliminarClaseGrupo(@Param('id', ParseIdPipe) id: string) {
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
    @Param('id', ParseIdPipe) id: string,
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
    @Param('id', ParseIdPipe) id: string,
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
    @Param('id', ParseIdPipe) id: string,
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
    @Param('id', ParseIdPipe) id: string,
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
    @Param('id', ParseIdPipe) id: string,
    @Param('estudianteId', ParseIdPipe) estudianteId: string,
  ) {
    return this.asistenciasService.obtenerEstadisticasEstudiante(
      id,
      estudianteId,
    );
  }

  // ============================================================================
  // COMISIONES DE PRODUCTOS
  // ============================================================================

  /**
   * Listar todas las comisiones
   * GET /api/admin/comisiones
   * Rol: Admin
   *
   * Query params opcionales:
   * - producto_id: Filtrar por producto
   * - casa_id: Filtrar por casa
   * - docente_id: Filtrar por docente
   * - activo: Filtrar por estado activo/inactivo
   */
  @Get('comisiones')
  @ApiOperation({
    summary: 'Listar comisiones',
    description:
      'Lista todas las comisiones de productos con filtros opcionales',
  })
  async listarComisiones(@Query() filtros: FiltrosComisionDto) {
    return this.comisionesService.findAll(filtros);
  }

  /**
   * Obtener una comisión por ID
   * GET /api/admin/comisiones/:id
   * Rol: Admin
   */
  @Get('comisiones/:id')
  @ApiOperation({
    summary: 'Obtener detalle de comisión',
    description: 'Obtiene una comisión con todos sus detalles e inscripciones',
  })
  async obtenerComision(@Param('id', ParseIdPipe) id: string) {
    return this.comisionesService.findOne(id);
  }

  /**
   * Crear una nueva comisión
   * POST /api/admin/comisiones
   * Rol: Admin
   */
  @Post('comisiones')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear comisión',
    description: `
      Crea una nueva comisión para un producto de tipo Curso.

      Ejemplo: Para "Colonia de Verano 2026" crear comisiones:
      - "QUANTUM Mañana" (casa QUANTUM, turno mañana)
      - "VERTEX Tarde" (casa VERTEX, turno tarde)
    `,
  })
  async crearComision(@Body() dto: CreateComisionDto) {
    return this.comisionesService.create(dto);
  }

  /**
   * Actualizar una comisión
   * PUT /api/admin/comisiones/:id
   * Rol: Admin
   */
  @Put('comisiones/:id')
  @ApiOperation({
    summary: 'Actualizar comisión',
    description: 'Actualiza los datos de una comisión existente',
  })
  async actualizarComision(
    @Param('id', ParseIdPipe) id: string,
    @Body() dto: UpdateComisionDto,
  ) {
    return this.comisionesService.update(id, dto);
  }

  /**
   * Eliminar una comisión (soft delete)
   * DELETE /api/admin/comisiones/:id
   * Rol: Admin
   */
  @Delete('comisiones/:id')
  @ApiOperation({
    summary: 'Eliminar comisión',
    description: 'Desactiva una comisión (soft delete)',
  })
  async eliminarComision(@Param('id', ParseIdPipe) id: string) {
    return this.comisionesService.remove(id);
  }

  /**
   * Inscribir estudiantes a una comisión
   * POST /api/admin/comisiones/:id/estudiantes
   * Rol: Admin
   */
  @Post('comisiones/:id/estudiantes')
  @ApiOperation({
    summary: 'Inscribir estudiantes',
    description: 'Inscribe uno o más estudiantes en una comisión',
  })
  async inscribirEstudiantesComision(
    @Param('id', ParseIdPipe) id: string,
    @Body() dto: InscribirEstudiantesDto,
  ) {
    return this.comisionesService.inscribirEstudiantes(id, dto);
  }

  /**
   * Crear estudiante nuevo e inscribirlo a una comisión
   * POST /api/admin/comisiones/:id/estudiantes/nuevo
   * Rol: Admin
   *
   * Crea un estudiante nuevo con credenciales y lo inscribe
   * automáticamente a la comisión especificada.
   * Retorna el estudiante, tutor, credenciales e inscripción.
   */
  @Post('comisiones/:id/estudiantes/nuevo')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear estudiante e inscribir',
    description: `
      Crea un estudiante nuevo con credenciales y lo inscribe a la comisión.

      - Valida cupo disponible antes de crear
      - Genera credenciales (username + PIN para estudiante)
      - Crea tutor si no existe (con username + password temporal)
      - Inscribe automáticamente a la comisión con estado Confirmada

      Retorna las credenciales en texto plano para enviar por WhatsApp.
    `,
  })
  async crearEstudianteEInscribir(
    @Param('id', ParseIdPipe) id: string,
    @Body() dto: CrearEstudianteDto,
  ) {
    return this.comisionesService.crearEstudianteEInscribir(id, dto);
  }

  /**
   * Actualizar estado de inscripción de un estudiante
   * PATCH /api/admin/comisiones/:id/estudiantes/:estudianteId
   * Rol: Admin
   */
  @Patch('comisiones/:id/estudiantes/:estudianteId')
  @ApiOperation({
    summary: 'Actualizar inscripción',
    description:
      'Actualiza el estado de inscripción de un estudiante en una comisión',
  })
  async actualizarInscripcionComision(
    @Param('id', ParseIdPipe) id: string,
    @Param('estudianteId', ParseIdPipe) estudianteId: string,
    @Body() dto: ActualizarInscripcionDto,
  ) {
    return this.comisionesService.actualizarInscripcion(id, estudianteId, dto);
  }

  /**
   * Remover un estudiante de una comisión
   * DELETE /api/admin/comisiones/:id/estudiantes/:estudianteId
   * Rol: Admin
   */
  @Delete('comisiones/:id/estudiantes/:estudianteId')
  @ApiOperation({
    summary: 'Remover estudiante',
    description: 'Elimina la inscripción de un estudiante en una comisión',
  })
  async removerEstudianteComision(
    @Param('id', ParseIdPipe) id: string,
    @Param('estudianteId', ParseIdPipe) estudianteId: string,
  ) {
    return this.comisionesService.removerEstudiante(id, estudianteId);
  }
}
