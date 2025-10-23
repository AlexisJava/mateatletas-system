import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { CrearRutaDto } from './dto/crear-ruta.dto';
import { ActualizarRutaDto } from './dto/actualizar-ruta.dto';
import { CrearAlertaDto } from './dto/crear-alerta.dto';
import { CreateSectorDto, UpdateSectorDto } from './dto/sector.dto';
import { CreateRutaEspecialidadDto, UpdateRutaEspecialidadDto, AsignarRutasDocenteDto } from './dto/ruta-especialidad.dto';
import { CrearEstudianteRapidoDto } from './dto/crear-estudiante-rapido.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly rutasService: RutasCurricularesService,
    private readonly sectoresRutasService: SectoresRutasService,
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
   */
  @Get('estudiantes')
  async listarEstudiantes() {
    return this.adminService.listarEstudiantes();
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
  async actualizarSector(@Param('id') id: string, @Body() data: UpdateSectorDto) {
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
}
