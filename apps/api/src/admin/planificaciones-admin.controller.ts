import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthUser } from '../auth/interfaces';
import { AdminPlanificacionesService } from './services/admin-planificaciones.service';
import {
  CrearPlanificacionDto,
  ActualizarPlanificacionDto,
  ActualizarClasePlanificacionDto,
  AgregarTareaDto,
} from './dto/planificacion.dto';

/**
 * Controller para gestión de Planificaciones desde Admin
 *
 * Endpoints:
 * - POST /admin/planificaciones - Crear planificación
 * - GET /admin/planificaciones - Listar planificaciones
 * - GET /admin/planificaciones/:id - Obtener planificación
 * - PATCH /admin/planificaciones/:id - Actualizar planificación
 * - DELETE /admin/planificaciones/:id - Eliminar planificación (borrador)
 * - PATCH /admin/planificaciones/clases/:claseId - Actualizar clase
 * - POST /admin/planificaciones/clases/:claseId/tareas - Agregar tarea
 * - DELETE /admin/planificaciones/clases/:claseId/tareas/:tareaId - Eliminar tarea
 * - POST /admin/planificaciones/:id/publicar - Publicar planificación
 */
@ApiTags('Admin - Planificaciones')
@Controller('admin/planificaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class PlanificacionesAdminController {
  constructor(
    private readonly planificacionesService: AdminPlanificacionesService,
  ) {}

  /**
   * Crear nueva planificación con clases vacías
   * POST /api/admin/planificaciones
   */
  @Post()
  @ApiOperation({ summary: 'Crear planificación con clases vacías' })
  async crear(@GetUser() user: AuthUser, @Body() dto: CrearPlanificacionDto) {
    return this.planificacionesService.crear(dto, user.id);
  }

  /**
   * Listar planificaciones con filtros
   * GET /api/admin/planificaciones
   */
  @Get()
  @ApiOperation({ summary: 'Listar planificaciones con paginación y filtros' })
  async listar(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('estado') estado?: 'BORRADOR' | 'PUBLICADO' | 'ARCHIVADO',
    @Query('casa_tipo') casa_tipo?: 'QUANTUM' | 'VERTEX' | 'PULSAR',
    @Query('mundo_tipo')
    mundo_tipo?: 'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS',
  ) {
    return this.planificacionesService.listar({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      estado,
      casa_tipo,
      mundo_tipo,
    });
  }

  /**
   * Obtener planificación por ID
   * GET /api/admin/planificaciones/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener planificación por ID con todas sus clases',
  })
  async obtener(@Param('id', ParseIdPipe) id: string) {
    return this.planificacionesService.obtenerPorId(id);
  }

  /**
   * Actualizar planificación
   * PATCH /api/admin/planificaciones/:id
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar metadata de planificación' })
  async actualizar(
    @Param('id', ParseIdPipe) id: string,
    @Body() dto: ActualizarPlanificacionDto,
  ) {
    return this.planificacionesService.actualizar(id, dto);
  }

  /**
   * Eliminar planificación (solo borradores sin asignaciones)
   * DELETE /api/admin/planificaciones/:id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar planificación en borrador' })
  async eliminar(@Param('id', ParseIdPipe) id: string) {
    return this.planificacionesService.eliminar(id);
  }

  /**
   * Actualizar una clase de planificación
   * PATCH /api/admin/planificaciones/clases/:claseId
   */
  @Patch('clases/:claseId')
  @ApiOperation({ summary: 'Actualizar clase (título, contenidos)' })
  async actualizarClase(
    @Param('claseId', ParseIdPipe) claseId: string,
    @Body() dto: ActualizarClasePlanificacionDto,
  ) {
    return this.planificacionesService.actualizarClase(claseId, dto);
  }

  /**
   * Agregar tarea a una clase
   * POST /api/admin/planificaciones/clases/:claseId/tareas
   */
  @Post('clases/:claseId/tareas')
  @ApiOperation({ summary: 'Agregar contenido como tarea a una clase' })
  async agregarTarea(
    @Param('claseId', ParseIdPipe) claseId: string,
    @Body() dto: AgregarTareaDto,
  ) {
    return this.planificacionesService.agregarTarea(claseId, dto);
  }

  /**
   * Eliminar tarea de una clase
   * DELETE /api/admin/planificaciones/clases/:claseId/tareas/:tareaId
   */
  @Delete('clases/:claseId/tareas/:tareaId')
  @ApiOperation({ summary: 'Eliminar tarea de una clase' })
  async eliminarTarea(
    @Param('claseId', ParseIdPipe) claseId: string,
    @Param('tareaId', ParseIdPipe) tareaId: string,
  ) {
    return this.planificacionesService.eliminarTarea(claseId, tareaId);
  }

  /**
   * Publicar planificación
   * POST /api/admin/planificaciones/:id/publicar
   */
  @Post(':id/publicar')
  @ApiOperation({
    summary: 'Publicar planificación (valida que todo esté completo)',
  })
  async publicar(@Param('id', ParseIdPipe) id: string) {
    return this.planificacionesService.publicar(id);
  }
}
