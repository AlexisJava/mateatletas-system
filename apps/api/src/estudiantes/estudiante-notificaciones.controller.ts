import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ParseIdPipe } from '../common/pipes';

/**
 * Controller para notificaciones de ESTUDIANTES
 * Endpoints bajo /estudiantes/notificaciones
 */
@ApiTags('Estudiantes - Notificaciones')
@ApiBearerAuth()
@Controller('estudiantes/notificaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ESTUDIANTE)
export class EstudianteNotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  /**
   * GET /estudiantes/notificaciones
   * Listar notificaciones del estudiante autenticado
   */
  @Get()
  @ApiOperation({ summary: 'Listar notificaciones del estudiante' })
  @ApiQuery({ name: 'soloNoLeidas', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Notificaciones obtenidas' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async findAll(
    @GetUser('id') estudianteId: string,
    @Query('soloNoLeidas') soloNoLeidas?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    const filtrarNoLeidas = soloNoLeidas === 'true';
    return this.notificacionesService.findAllEstudiante(
      estudianteId,
      filtrarNoLeidas,
      page,
      limit,
    );
  }

  /**
   * GET /estudiantes/notificaciones/count
   * Contador de notificaciones no leídas
   */
  @Get('count')
  @ApiOperation({ summary: 'Contar notificaciones no leídas' })
  @ApiResponse({ status: 200, description: 'Contador obtenido' })
  async countNoLeidas(@GetUser('id') estudianteId: string) {
    const count =
      await this.notificacionesService.countNoLeidasEstudiante(estudianteId);
    return { count };
  }

  /**
   * PATCH /estudiantes/notificaciones/:id/leer
   * Marcar una notificación como leída
   */
  @Patch(':id/leer')
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  @ApiResponse({ status: 200, description: 'Notificación marcada como leída' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  async marcarComoLeida(
    @Param('id', ParseIdPipe) id: string,
    @GetUser('id') estudianteId: string,
  ) {
    return this.notificacionesService.marcarComoLeida(
      id,
      'estudiante' as const,
      estudianteId,
    );
  }

  /**
   * PATCH /estudiantes/notificaciones/leer-todas
   * Marcar todas las notificaciones como leídas
   */
  @Patch('leer-todas')
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  @ApiResponse({ status: 200, description: 'Notificaciones marcadas' })
  async marcarTodasComoLeidas(@GetUser('id') estudianteId: string) {
    const result = await this.notificacionesService.marcarTodasComoLeidas(
      'estudiante' as const,
      estudianteId,
    );
    return {
      message: 'Todas las notificaciones marcadas como leídas',
      count: result.count,
    };
  }

  /**
   * DELETE /estudiantes/notificaciones/:id
   * Eliminar una notificación
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una notificación' })
  @ApiResponse({ status: 200, description: 'Notificación eliminada' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  async remove(
    @Param('id', ParseIdPipe) id: string,
    @GetUser('id') estudianteId: string,
  ) {
    await this.notificacionesService.remove(
      id,
      'estudiante' as const,
      estudianteId,
    );
    return { message: 'Notificación eliminada correctamente' };
  }
}
