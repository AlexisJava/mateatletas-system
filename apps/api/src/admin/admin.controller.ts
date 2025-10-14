import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { RutasCurricularesService } from './rutas-curriculares.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { CrearRutaDto } from './dto/crear-ruta.dto';
import { ActualizarRutaDto } from './dto/actualizar-ruta.dto';
import { CrearAlertaDto } from './dto/crear-alerta.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly rutasService: RutasCurricularesService,
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
   * Cambiar rol de un usuario (placeholder MVP)
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
}
